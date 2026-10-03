import React, { memo, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { formatDateTime12h, formatCardDateTime } from "@/utils/date-formatter";
import { openDocumentOrLink } from "./materials/file-actions";

const BENTO_COLORS = {
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  cardRadius: 16,
  pillRadius: 9999,
  shadow: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface Props {
  item: any;
  currentUserId?: string;
  canManage?: boolean;
  myRole?: string;
  isTeacher?: boolean;
  isCR?: boolean;
  onCommentPress?: (item: any) => void;
  onAddComment?: (
    announcementId: string,
    content: string,
    parentId?: string | null,
  ) => void;
  onEditComment?: (
    announcementId: string,
    commentId: string,
    content: string,
  ) => void;
  onDeleteComment?: (
    announcementId: string,
    commentId: string,
  ) => void;
  isAddingComment?: boolean;
  onEditPress?: (item: any) => void;
  onDeletePress?: (item: any) => void;
}

const AnnouncementCard = ({
  item,
  currentUserId,
  canManage,
  myRole,
  isTeacher,
  isCR,
  onCommentPress,
  onAddComment,
  onEditComment,
  onDeleteComment,
  isAddingComment,
  onEditPress,
  onDeletePress,
}: Props) => {
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState<{
    commentId: string;
    authorName: string;
  } | null>(null);
  const [editingComment, setEditingComment] = useState<{
    id: string;
    originalContent: string;
  } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; right: number }>({
    top: 0,
    right: 16,
  });
  const commentInputRef = useRef<TextInput>(null);
  const moreBtnRef = useRef<View>(null);

  const normalizedRole = (myRole || "").toUpperCase();
  const effectiveIsTeacher = Boolean(
    isTeacher || normalizedRole === "TEACHER",
  );
  const effectiveIsCR = Boolean(
    isCR || normalizedRole === "CR",
  );
  const canReply = effectiveIsTeacher || effectiveIsCR;

  const handleOpenCommentInput = () => {
    setIsCommentsExpanded(true);
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 120);
  };

  const handleStartReply = (commentId: string, authorName: string) => {
    setEditingComment(null);
    setReplyTarget({ commentId, authorName });
    setIsCommentsExpanded(true);
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 120);
  };

  const handleCancelReply = () => {
    setReplyTarget(null);
  };

  const handleStartEditComment = (commentId: string, text: string) => {
    setReplyTarget(null);
    setEditingComment({ id: commentId, originalContent: text });
    setCommentText(text);
    setIsCommentsExpanded(true);
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 120);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setCommentText("");
  };

  const handleConfirmDeleteComment = (commentId: string) => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDeleteComment?.(item.id, commentId);
          },
        },
      ],
    );
  };

  const isAuthor = Boolean(
    currentUserId &&
      (item.creatorId === currentUserId || item.creator?.id === currentUserId),
  );

  // Teacher can edit and delete own notices and CR's notices.
  // CR can only edit and delete their own notices (not teacher notices).
  // Other students cannot edit or delete any notices.
  const canEditAnnouncement = effectiveIsTeacher || (effectiveIsCR && isAuthor);
  const canDeleteAnnouncement = effectiveIsTeacher || (effectiveIsCR && isAuthor);

  const isAnnouncementEdited = Boolean(
    item.updatedAt &&
      new Date(item.updatedAt).getTime() - new Date(item.createdAt).getTime() >
        2000,
  );

  const handleDelete = () => {
    onDeletePress?.(item);
  };

  const handleOpenMenu = () => {
    if (moreBtnRef.current) {
      moreBtnRef.current.measureInWindow((x, y, width, height) => {
        const windowWidth = Dimensions.get("window").width;
        const windowHeight = Dimensions.get("window").height;
        const menuHeight = 110;

        if (typeof y === "number" && !isNaN(y) && y > 0) {
          let top = y + height + 6;
          let right = Math.max(16, windowWidth - (x + width));
          if (top + menuHeight > windowHeight - 20) {
            top = Math.max(20, y - menuHeight - 6);
          }
          setMenuCoords({ top, right });
        } else {
          setMenuCoords({ top: 100, right: 16 });
        }
        setIsMenuOpen(true);
      });
    } else {
      setMenuCoords({ top: 100, right: 16 });
      setIsMenuOpen(true);
    }
  };

  // Parse attachments
  const attachments: any[] = Array.isArray(item.attachments)
    ? item.attachments
    : [];
  // Parse links
  const links: any[] = Array.isArray(item.links) ? item.links : [];
  // Parse comments
  const comments: any[] = Array.isArray(item.comments) ? item.comments : [];

  const totalCommentsCount = comments.reduce(
    (acc: number, c: any) =>
      acc + 1 + (Array.isArray(c.replies) ? c.replies.length : 0),
    0,
  );

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    const text = commentText.trim();

    if (editingComment) {
      if (onEditComment) {
        onEditComment(item.id, editingComment.id, text);
      }
      setEditingComment(null);
      setCommentText("");
      return;
    }

    const parentId = replyTarget?.commentId || null;
    setCommentText("");
    setReplyTarget(null);
    if (onAddComment) {
      onAddComment(item.id, text, parentId);
    } else if (onCommentPress) {
      onCommentPress(item);
    }
  };

  return (
    <View style={styles.card}>
      {/* 1. Author Header & Actions */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.userInfoRow}>
          {item.creator?.image ? (
            <Image
              source={{ uri: item.creator.image }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarFallbackSmall}>
              <Text style={styles.avatarTextSmall}>
                {item.creator?.name?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.userName}>
              {item.creator?.name || "Faculty"}
            </Text>
            <View style={styles.dateRow}>
              <Feather
                name="clock"
                size={11}
                color={BENTO_COLORS.subtleText}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.dateText}>
                {formatDateTime12h(item.createdAt)}
                {isAnnouncementEdited && (
                  <Text style={styles.editedLabelText}> (Edited)</Text>
                )}
              </Text>
            </View>
          </View>
        </View>

        {(canEditAnnouncement || canDeleteAnnouncement) && (
          <View collapsable={false} ref={moreBtnRef}>
            <TouchableOpacity
              onPress={handleOpenMenu}
              style={styles.moreOptionsBtn}
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Announcement options"
            >
              <Feather name="more-vertical" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 2. Announcement Content */}
      <Text style={styles.contentBody}>{item.content}</Text>

      {/* 3. Multi-file Attachments Preview */}
      {attachments.length > 0 && (
        <View style={styles.attachmentsContainer}>
          {attachments.map((att: any, idx: number) => {
            const isImg =
              att.type?.includes("image") ||
              att.url?.match(/\.(jpg|jpeg|png|webp|gif)/i);
            const isPdf = att.type?.includes("pdf") || att.url?.match(/\.pdf/i);

            return (
              <TouchableOpacity
                key={idx}
                style={styles.attachmentFilePill}
                onPress={() => openDocumentOrLink(att.url, att.name)}
                activeOpacity={0.75}
              >
                <Feather
                  name={isImg ? "image" : isPdf ? "file-text" : "paperclip"}
                  size={15}
                  color={isPdf ? "#ef4444" : "#0284c7"}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.attachmentFileName} numberOfLines={1}>
                  {att.name || `Attachment ${idx + 1}`}
                </Text>
                <Feather
                  name="external-link"
                  size={12}
                  color="#94a3b8"
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* 4. Single Legacy Link or Multi-links */}
      {(item.attachedLinkUrl || links.length > 0) && (
        <View style={styles.linksContainer}>
          {item.attachedLinkUrl && (
            <TouchableOpacity
              style={styles.linkPill}
              onPress={() =>
                openDocumentOrLink(
                  item.attachedLinkUrl,
                  item.attachedLinkTitle || undefined,
                  true,
                )
              }
              activeOpacity={0.7}
            >
              <Feather
                name="link-2"
                size={14}
                color="#2563eb"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.linkText} numberOfLines={1}>
                {item.attachedLinkTitle || item.attachedLinkUrl}
              </Text>
            </TouchableOpacity>
          )}
          {links.map((link: any, idx: number) => (
            <TouchableOpacity
              key={idx}
              style={styles.linkPill}
              onPress={() =>
                openDocumentOrLink(link.url, link.title || undefined, true)
              }
              activeOpacity={0.7}
            >
              <Feather
                name="link-2"
                size={14}
                color="#2563eb"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.linkText} numberOfLines={1}>
                {link.title || link.url}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 5. Footer Comments Collapsible Toggle */}
      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.commentToggleBtn}
          onPress={() => setIsCommentsExpanded((prev) => !prev)}
          activeOpacity={0.75}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${isCommentsExpanded ? "Hide" : "Show"} ${comments.length} comments`}
        >
          <View style={styles.commentPillLeft}>
            <Feather
              name="message-circle"
              size={14}
              color={BENTO_COLORS.deepNavy}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.commentPillText}>
              {totalCommentsCount} {totalCommentsCount === 1 ? "Comment" : "Comments"}
            </Text>
          </View>
          <View style={styles.commentRightActions}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleOpenCommentInput();
              }}
              style={styles.commentActionIconBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Add a comment"
            >
              <Feather name="edit-3" size={15} color="#64748b" />
            </TouchableOpacity>
            <Feather
              name={isCommentsExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color="#64748b"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* 6. Collapsible Inline Comments Section */}
      {isCommentsExpanded && (
        <View style={styles.collapsibleCommentsSection}>
          {/* Integrated Composer Card */}
          <View
            style={[
              styles.composerContainer,
              replyTarget && styles.composerContainerReplying,
              editingComment && styles.composerContainerEditing,
            ]}
          >
            {/* Replying Context Banner */}
            {replyTarget && (
              <View style={styles.replyingBanner}>
                <View style={styles.replyingLeft}>
                  <Feather
                    name="corner-down-right"
                    size={12}
                    color="#2563eb"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.replyingText} numberOfLines={1}>
                    Replying to{" "}
                    <Text style={styles.replyAuthorHighlight}>
                      @{replyTarget.authorName}
                    </Text>
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleCancelReply}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel reply"
                  style={styles.cancelReplyBtn}
                >
                  <Feather name="x" size={14} color="#64748b" />
                </TouchableOpacity>
              </View>
            )}

            {/* Editing Context Banner */}
            {editingComment && (
              <View style={styles.editingBanner}>
                <View style={styles.editingLeft}>
                  <Feather
                    name="edit-2"
                    size={12}
                    color="#d97706"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.editingText} numberOfLines={1}>
                    Editing comment
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleCancelEdit}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel editing"
                  style={styles.cancelReplyBtn}
                >
                  <Feather name="x" size={14} color="#64748b" />
                </TouchableOpacity>
              </View>
            )}

            {/* Input Row */}
            <View style={styles.commentComposerRow}>
              <TextInput
                ref={commentInputRef}
                style={styles.commentInput}
                placeholder={
                  editingComment
                    ? "Edit your comment..."
                    : replyTarget
                    ? `Reply to @${replyTarget.authorName}...`
                    : "Add a class comment..."
                }
                placeholderTextColor="#94a3b8"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
                accessible={true}
                accessibilityLabel={
                  editingComment
                    ? "Edit your comment"
                    : replyTarget
                    ? `Reply to ${replyTarget.authorName}`
                    : "Add a class comment"
                }
              />
              <TouchableOpacity
                style={[
                  styles.commentSendBtn,
                  (!commentText.trim() || isAddingComment) &&
                    styles.commentSendBtnDisabled,
                ]}
                onPress={handleSendComment}
                disabled={!commentText.trim() || isAddingComment}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={
                  editingComment ? "Save edited comment" : "Post comment"
                }
              >
                {isAddingComment ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Feather
                    name={editingComment ? "check" : "send"}
                    size={13}
                    color={commentText.trim() ? "#ffffff" : "#94a3b8"}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments List Below Composer */}
          {comments.length === 0 ? (
            <View style={styles.emptyCommentsBox}>
              <Feather
                name="message-square"
                size={15}
                color="#94a3b8"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.emptyCommentsText}>
                No comments yet. Be the first to reply!
              </Text>
            </View>
          ) : (
            <View style={styles.commentsList}>
              {comments.map((c: any, index: number) => {
                const authorRole =
                  c.author?.hubs?.[0]?.role || c.author?.role;
                const isTeacher = authorRole === "TEACHER";
                const isCr = authorRole === "CR";
                const isTa = authorRole === "TA";
                const replies = Array.isArray(c.replies) ? c.replies : [];
                const isCommentAuthor = Boolean(
                  currentUserId &&
                    (c.authorId === currentUserId ||
                      c.author?.id === currentUserId),
                );
                const canDeleteComment = isCommentAuthor || effectiveIsTeacher;
                const isCommentEdited = Boolean(
                  c.updatedAt &&
                    new Date(c.updatedAt).getTime() -
                      new Date(c.createdAt).getTime() >
                      2000,
                );

                return (
                  <View key={c.id || index} style={styles.commentContainer}>
                    {/* Top-level comment */}
                    <View style={styles.commentRow}>
                      {c.author?.image ? (
                        <Image
                          source={{ uri: c.author.image }}
                          style={styles.commentAvatar}
                        />
                      ) : (
                        <View style={styles.commentAvatarFallback}>
                          <Text style={styles.commentAvatarText}>
                            {c.author?.name?.charAt(0)?.toUpperCase() || "U"}
                          </Text>
                        </View>
                      )}
                      <View style={styles.commentBubble}>
                        {/* Top Header Row: Author Name on Left, Tag on Most Right */}
                        <View style={styles.commentHeaderRow}>
                          <Text
                            style={styles.commentAuthorName}
                            numberOfLines={1}
                          >
                            {c.author?.name || "Student"}
                          </Text>
                          {isTeacher && (
                            <View
                              style={[styles.roleBadge, styles.roleBadgeTeacher]}
                            >
                              <Text style={styles.roleBadgeTextTeacher}>
                                Teacher
                              </Text>
                            </View>
                          )}
                          {isCr && (
                            <View style={[styles.roleBadge, styles.roleBadgeCr]}>
                              <Text style={styles.roleBadgeTextCr}>CR</Text>
                            </View>
                          )}
                          {isTa && (
                            <View style={[styles.roleBadge, styles.roleBadgeTa]}>
                              <Text style={styles.roleBadgeTextTa}>TA</Text>
                            </View>
                          )}
                        </View>

                        {/* Content */}
                        <Text style={styles.commentTextContent}>{c.content}</Text>

                        {/* Bottom Row: Actions on left, Timestamp on bottom most right */}
                        <View style={styles.commentBottomRow}>
                          <View style={styles.commentBottomActions}>
                            {canReply && (
                              <TouchableOpacity
                                style={styles.replyActionBtn}
                                onPress={() =>
                                  handleStartReply(
                                    c.id,
                                    c.author?.name || "Member",
                                  )
                                }
                                activeOpacity={0.7}
                                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                accessible={true}
                                accessibilityRole="button"
                                accessibilityLabel={`Reply to ${c.author?.name || "comment"}`}
                              >
                                <Feather
                                  name="corner-down-right"
                                  size={11}
                                  color="#2563eb"
                                  style={{ marginRight: 4 }}
                                />
                                <Text style={styles.replyActionText}>Reply</Text>
                              </TouchableOpacity>
                            )}
                            {isCommentAuthor && (
                              <TouchableOpacity
                                style={styles.commentActionIconBtn}
                                onPress={() => handleStartEditComment(c.id, c.content)}
                                activeOpacity={0.7}
                                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                accessible={true}
                                accessibilityRole="button"
                                accessibilityLabel="Edit comment"
                              >
                                <Feather name="edit-2" size={12} color="#64748b" />
                              </TouchableOpacity>
                            )}
                            {canDeleteComment && (
                              <TouchableOpacity
                                style={styles.commentActionIconBtn}
                                onPress={() => handleConfirmDeleteComment(c.id)}
                                activeOpacity={0.7}
                                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                accessible={true}
                                accessibilityRole="button"
                                accessibilityLabel="Delete comment"
                              >
                                <Feather name="trash-2" size={12} color="#ef4444" />
                              </TouchableOpacity>
                            )}
                          </View>
                          <Text style={styles.commentBottomTimestamp}>
                            {formatCardDateTime(c.createdAt)}
                            {isCommentEdited && (
                              <Text style={styles.editedLabelText}> (Edited)</Text>
                            )}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Nested Replies Thread (Official Teacher / CR Responses) */}
                    {replies.length > 0 && (
                      <View style={styles.repliesThread}>
                        {replies.map((reply: any, rIdx: number) => {
                          const replyRole =
                            reply.author?.hubs?.[0]?.role || reply.author?.role;
                          const isReplyTeacher = replyRole === "TEACHER";
                          const isReplyCr = replyRole === "CR";
                          const isReplyTa = replyRole === "TA";
                          const isReplyAuthor = Boolean(
                            currentUserId &&
                              (reply.authorId === currentUserId ||
                                reply.author?.id === currentUserId),
                          );
                          const canDeleteReply = isReplyAuthor || effectiveIsTeacher;
                          const isReplyEdited = Boolean(
                            reply.updatedAt &&
                              new Date(reply.updatedAt).getTime() -
                                new Date(reply.createdAt).getTime() >
                                2000,
                          );

                          return (
                            <View
                              key={reply.id || rIdx}
                              style={styles.replyItemContainer}
                            >
                              <View
                                style={[
                                  styles.replyConnectorBar,
                                  isReplyTeacher && styles.replyConnectorBarTeacher,
                                  isReplyCr && styles.replyConnectorBarCr,
                                ]}
                              />
                              <View
                                style={[
                                  styles.replyBubble,
                                  isReplyTeacher && styles.replyBubbleTeacher,
                                  isReplyCr && styles.replyBubbleCr,
                                ]}
                              >
                                {/* Top Header: Avatar & Name on Left, Tag on Most Right */}
                                <View style={styles.replyHeaderRow}>
                                  <View style={styles.replyAuthorLeft}>
                                    {reply.author?.image ? (
                                      <Image
                                        source={{ uri: reply.author.image }}
                                        style={styles.replyAvatar}
                                      />
                                    ) : (
                                      <View
                                        style={[
                                          styles.replyAvatarFallback,
                                          isReplyTeacher &&
                                            styles.replyAvatarFallbackTeacher,
                                          isReplyCr && styles.replyAvatarFallbackCr,
                                        ]}
                                      >
                                        <Text style={styles.replyAvatarText}>
                                          {reply.author?.name
                                            ?.charAt(0)
                                            ?.toUpperCase() || "U"}
                                        </Text>
                                      </View>
                                    )}
                                    <Text
                                      style={styles.replyAuthorName}
                                      numberOfLines={1}
                                    >
                                      {reply.author?.name || "Faculty / CR"}
                                    </Text>
                                  </View>

                                  {isReplyTeacher && (
                                    <View
                                      style={[
                                        styles.roleBadge,
                                        styles.roleBadgeTeacher,
                                      ]}
                                    >
                                      <Text style={styles.roleBadgeTextTeacher}>
                                        Teacher
                                      </Text>
                                    </View>
                                  )}
                                  {isReplyCr && (
                                    <View
                                      style={[
                                        styles.roleBadge,
                                        styles.roleBadgeCr,
                                      ]}
                                    >
                                      <Text style={styles.roleBadgeTextCr}>
                                        CR
                                      </Text>
                                    </View>
                                  )}
                                  {isReplyTa && (
                                    <View
                                      style={[
                                        styles.roleBadge,
                                        styles.roleBadgeTa,
                                      ]}
                                    >
                                      <Text style={styles.roleBadgeTextTa}>
                                        TA
                                      </Text>
                                    </View>
                                  )}
                                </View>

                                {/* Content */}
                                <Text style={styles.replyTextContent}>
                                  {reply.content}
                                </Text>

                                {/* Bottom Row: Actions on Left, Time on Bottom Most Right */}
                                <View style={styles.replyBottomRow}>
                                  <View style={styles.replyBottomActions}>
                                    {isReplyAuthor && (
                                      <TouchableOpacity
                                        style={styles.commentActionIconBtn}
                                        onPress={() =>
                                          handleStartEditComment(
                                            reply.id,
                                            reply.content,
                                          )
                                        }
                                        activeOpacity={0.7}
                                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                        accessible={true}
                                        accessibilityRole="button"
                                        accessibilityLabel="Edit reply"
                                      >
                                        <Feather
                                          name="edit-2"
                                          size={11}
                                          color="#64748b"
                                        />
                                      </TouchableOpacity>
                                    )}
                                    {canDeleteReply && (
                                      <TouchableOpacity
                                        style={styles.commentActionIconBtn}
                                        onPress={() =>
                                          handleConfirmDeleteComment(reply.id)
                                        }
                                        activeOpacity={0.7}
                                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                        accessible={true}
                                        accessibilityRole="button"
                                        accessibilityLabel="Delete reply"
                                      >
                                        <Feather
                                          name="trash-2"
                                          size={11}
                                          color="#ef4444"
                                        />
                                      </TouchableOpacity>
                                    )}
                                  </View>
                                  <Text style={styles.replyBottomTimestamp}>
                                    {formatCardDateTime(reply.createdAt)}
                                    {isReplyEdited && (
                                      <Text style={styles.editedLabelText}> (Edited)</Text>
                                    )}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* 3-Dots Dropdown Menu Modal */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
        statusBarTranslucent={true}
      >
        <TouchableOpacity
          style={styles.menuBackdrop}
          activeOpacity={1}
          onPress={() => setIsMenuOpen(false)}
          accessible={false}
        >
          <View
            style={[
              styles.dropdownMenu,
              {
                top: menuCoords.top,
                right: menuCoords.right,
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            {canEditAnnouncement && onEditPress && (
              <TouchableOpacity
                style={styles.dropdownItem}
                activeOpacity={0.7}
                onPress={() => {
                  setIsMenuOpen(false);
                  onEditPress(item);
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Edit announcement"
              >
                <View style={[styles.dropdownIconBox, styles.dropdownIconBoxEdit]}>
                  <Feather name="edit-2" size={14} color="#2563eb" />
                </View>
                <Text style={styles.dropdownItemText}>Edit Announcement</Text>
              </TouchableOpacity>
            )}

            {canEditAnnouncement &&
              canDeleteAnnouncement &&
              onEditPress &&
              onDeletePress && <View style={styles.dropdownDivider} />}

            {canDeleteAnnouncement && onDeletePress && (
              <TouchableOpacity
                style={[styles.dropdownItem, styles.dropdownItemDelete]}
                activeOpacity={0.7}
                onPress={() => {
                  setIsMenuOpen(false);
                  handleDelete();
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Delete announcement"
              >
                <View
                  style={[styles.dropdownIconBox, styles.dropdownIconBoxDelete]}
                >
                  <Feather name="trash-2" size={14} color="#e11d48" />
                </View>
                <Text
                  style={[styles.dropdownItemText, styles.dropdownItemTextDelete]}
                >
                  Delete Announcement
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default memo(AnnouncementCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.06)",
    ...BENTO_COLORS.shadow,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: "#edf2f7",
  },
  avatarFallbackSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BENTO_COLORS.deepNavy,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarTextSmall: {
    fontFamily,
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "800",
  },
  userName: {
    fontFamily,
    fontSize: 14,
    color: BENTO_COLORS.deepNavy,
    fontWeight: "800",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  dateText: {
    fontFamily,
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
    fontWeight: "500",
  },
  moreOptionsBtn: {
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.12)",
  },
  dropdownMenu: {
    position: "absolute",
    minWidth: 195,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.08)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  dropdownItemDelete: {},
  dropdownIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  dropdownIconBoxEdit: {
    backgroundColor: "#eff6ff",
  },
  dropdownIconBoxDelete: {
    backgroundColor: "#fff1f2",
  },
  dropdownItemText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "600",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.1,
  },
  dropdownItemTextDelete: {
    color: "#e11d48",
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "rgba(19, 27, 46, 0.06)",
    marginVertical: 3,
    marginHorizontal: 4,
  },
  actionMenuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
  },
  contentBody: {
    fontFamily,
    fontSize: 14,
    color: "#334155",
    lineHeight: 22,
    marginBottom: 10,
  },
  attachmentsContainer: {
    gap: 6,
    marginBottom: 10,
  },
  attachmentFilePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  attachmentFileName: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0369a1",
  },
  linksContainer: {
    gap: 6,
    marginBottom: 10,
  },
  linkPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  linkText: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
  },
  cardFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(19, 27, 46, 0.05)",
  },
  commentToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  commentPillLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentPillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  commentRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  commentActionIconBtn: {
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },

  // Collapsible Comments Section
  collapsibleCommentsSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(19, 27, 46, 0.05)",
  },
  emptyCommentsBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  emptyCommentsText: {
    fontFamily,
    fontSize: 12,
    color: "#94a3b8",
    fontStyle: "italic",
  },
  commentsList: {
    gap: 12,
    marginBottom: 10,
  },
  commentContainer: {
    gap: 6,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e2e8f0",
    marginRight: 8,
    marginTop: 2,
  },
  commentAvatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BENTO_COLORS.deepNavy,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginTop: 2,
  },
  commentAvatarText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  commentBubble: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  commentHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 8,
  },
  commentAuthorName: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    flex: 1,
    marginRight: 6,
  },
  commentTextContent: {
    fontFamily,
    fontSize: 12.5,
    color: "#334155",
    lineHeight: 18,
  },
  commentBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  commentBottomActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentBottomTimestamp: {
    fontFamily,
    fontSize: 10,
    color: "#94a3b8",
    marginLeft: "auto",
  },

  // Composer Box
  composerContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
    overflow: "hidden",
  },
  composerContainerReplying: {
    borderColor: "#93c5fd",
  },
  composerContainerEditing: {
    borderColor: "#f59e0b",
  },
  editingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fffbeb",
    borderBottomWidth: 1,
    borderBottomColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  editingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  editingText: {
    fontFamily,
    fontSize: 11.5,
    color: "#b45309",
    fontWeight: "600",
  },
  commentComposerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 4,
    minHeight: 40,
  },
  commentInput: {
    flex: 1,
    fontFamily,
    fontSize: 12.5,
    color: BENTO_COLORS.deepNavy,
    maxHeight: 80,
    padding: 0,
    minHeight: 32,
  },
  commentSendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BENTO_COLORS.deepNavy,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  commentSendBtnDisabled: {
    backgroundColor: "#f1f5f9",
  },

  // Replying Banner
  replyingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#eff6ff",
    borderBottomWidth: 1,
    borderBottomColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  replyingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  replyingText: {
    fontFamily,
    fontSize: 11.5,
    color: "#1e40af",
  },
  replyAuthorHighlight: {
    fontWeight: "700",
    color: "#1d4ed8",
  },
  cancelReplyBtn: {
    padding: 2,
  },

  // Role Badges
  roleBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  roleBadgeTeacher: {
    backgroundColor: "#e0e7ff",
  },
  roleBadgeCr: {
    backgroundColor: "#cffafe",
  },
  roleBadgeTa: {
    backgroundColor: "#d1fae5",
  },
  roleBadgeTextTeacher: {
    fontFamily,
    fontSize: 9,
    fontWeight: "700",
    color: "#4338ca",
  },
  roleBadgeTextCr: {
    fontFamily,
    fontSize: 9,
    fontWeight: "700",
    color: "#0e7490",
  },
  roleBadgeTextTa: {
    fontFamily,
    fontSize: 9,
    fontWeight: "700",
    color: "#047857",
  },

  // Single Reply Actions (Teacher/CR only)
  replyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  replyActionText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#2563eb",
  },

  // Nested Replies Thread
  repliesThread: {
    marginTop: 4,
    marginLeft: 36,
    gap: 6,
  },
  replyItemContainer: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  replyConnectorBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
    marginRight: 8,
    marginVertical: 1,
  },
  replyConnectorBarTeacher: {
    backgroundColor: "#6366f1",
  },
  replyConnectorBarCr: {
    backgroundColor: "#06b6d4",
  },
  replyBubble: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  replyBubbleTeacher: {
    backgroundColor: "#f5f7ff",
    borderColor: "rgba(99, 102, 241, 0.2)",
  },
  replyBubbleCr: {
    backgroundColor: "#f0fdfa",
    borderColor: "rgba(14, 116, 144, 0.2)",
  },
  replyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 8,
  },
  replyAuthorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: 6,
  },
  replyAuthorName: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    flexShrink: 1,
  },
  replyAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
  },
  replyAvatarFallback: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BENTO_COLORS.deepNavy,
    justifyContent: "center",
    alignItems: "center",
  },
  replyAvatarFallbackTeacher: {
    backgroundColor: "#4f46e5",
  },
  replyAvatarFallbackCr: {
    backgroundColor: "#0891b2",
  },
  replyAvatarText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "700",
    color: "#ffffff",
  },
  replyTextContent: {
    fontFamily,
    fontSize: 12,
    color: "#334155",
    lineHeight: 18,
    marginTop: 1,
  },
  replyBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  replyBottomActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  replyBottomTimestamp: {
    fontFamily,
    fontSize: 9.5,
    color: "#94a3b8",
    marginLeft: "auto",
  },
  editedLabelText: {
    fontFamily,
    fontSize: 9.5,
    color: "#94a3b8",
    fontStyle: "italic",
  },
});
