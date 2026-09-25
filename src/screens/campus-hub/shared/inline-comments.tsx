import React, { memo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { CAMPUS_HUB_COLORS, fontFamily, timeAgo } from "./design-tokens";
import { AuthorProfileModalData } from "./author-modal";

export interface CommentAuthor extends AuthorProfileModalData {
  id: string;
  name: string;
  image?: string | null;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  author: CommentAuthor;
  parentId?: string | null;
  replies?: Comment[];
}

export interface ReplyTarget {
  id: string;
  authorName: string;
}

function getAuthorAcademicSubtitle(author?: CommentAuthor): string | null {
  if (!author) return null;
  if (author.studentProfile?.department) {
    return author.studentProfile.department;
  }
  if (author.teacherProfile?.department) {
    return author.teacherProfile.department;
  }
  return null;
}

function isCommentEdited(createdAt?: string, updatedAt?: string): boolean {
  if (!createdAt || !updatedAt) return false;
  return new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 1000;
}

// ---------------------------------------------------------------------------
// Single Comment Card Component
// ---------------------------------------------------------------------------
interface InlineCommentCardProps {
  comment: Comment;
  currentUserId?: string;
  listingAuthorId?: string;
  accent: string;
  onStartReply: (targetId: string, authorName: string) => void;
  onStartEdit?: (comment: Comment) => void;
  onDeleteComment: (comment: Comment) => void;
  onViewAuthorProfile?: (author: CommentAuthor) => void;
}

const InlineCommentCard = memo(function InlineCommentCard({
  comment,
  currentUserId,
  listingAuthorId,
  accent,
  onStartReply,
  onStartEdit,
  onDeleteComment,
  onViewAuthorProfile,
}: InlineCommentCardProps) {
  const [isRepliesExpanded, setIsRepliesExpanded] = useState(false);
  const replyCount = comment.replies?.length ?? 0;
  const isOwn = comment.author.id === currentUserId;
  const isListingAuthor = Boolean(listingAuthorId && comment.author.id === listingAuthorId);
  const authorInitial = (comment.author.name ?? "U").charAt(0).toUpperCase();
  const authorSubtitle = getAuthorAcademicSubtitle(comment.author);
  const edited = isCommentEdited(comment.createdAt, comment.updatedAt);

  return (
    <View style={styles.commentCard}>
      {/* Avatar on the left */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => onViewAuthorProfile?.(comment.author)}
        disabled={!onViewAuthorProfile}
      >
        {comment.author.image ? (
          <Image source={{ uri: comment.author.image }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>{authorInitial}</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.commentContent}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.authorMetaCol}>
            <View style={styles.nameRow}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => onViewAuthorProfile?.(comment.author)}
                disabled={!onViewAuthorProfile}
              >
                <Text style={styles.authorName} numberOfLines={1}>
                  {comment.author.name}
                </Text>
              </TouchableOpacity>
              {isListingAuthor && (
                <View style={[styles.sellerBadge, { backgroundColor: `${accent}14` }]}>
                  <Text style={[styles.sellerBadgeText, { color: accent }]}>Seller</Text>
                </View>
              )}
            </View>
            {authorSubtitle && (
              <Text style={styles.academicSubtitle} numberOfLines={1}>
                {authorSubtitle}
              </Text>
            )}
          </View>

          <Text style={styles.timeText}>{timeAgo(comment.createdAt)}</Text>
        </View>

        {/* Body Content */}
        <Text style={styles.commentBody}>{comment.content}</Text>

        {edited && <Text style={styles.editedLabel}>✎ Edited</Text>}

      {/* Actions Row */}
      <View style={styles.actionsRow}>
        <View style={styles.leftActions}>
          {/* 3. Reply with icon and text */}
          <TouchableOpacity
            style={[
              styles.actionReplyBtn,
              { backgroundColor: `${accent}10`, borderColor: `${accent}25` },
            ]}
            onPress={() => {
              setIsRepliesExpanded(true);
              onStartReply(comment.id, comment.author.name);
            }}
            activeOpacity={0.75}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Reply to ${comment.author.name}`}
          >
            <Feather name="corner-down-right" size={11.5} color={accent} />
            <Text style={[styles.actionReplyText, { color: accent }]}>Reply</Text>
          </TouchableOpacity>

          {/* 4. View replies with icon, text and count number */}
          {replyCount > 0 && (
            <TouchableOpacity
              style={styles.toggleRepliesBtn}
              onPress={() => setIsRepliesExpanded((v) => !v)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={
                isRepliesExpanded
                  ? `Hide ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
                  : `View ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
              }
            >
              <View style={[styles.toggleRepliesLine, { backgroundColor: `${accent}40` }]} />
              <Feather
                name={isRepliesExpanded ? 'chevron-up' : 'chevron-down'}
                size={11.5}
                color={accent}
              />
              <Text style={[styles.toggleRepliesText, { color: accent }]}>
                {isRepliesExpanded
                  ? `Hide ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
                  : `View ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isOwn && (
          <View style={styles.rightActions}>
            {/* 1. Edit (just icon) */}
            {onStartEdit && (
              <TouchableOpacity
                style={[
                  styles.actionIconBtn,
                  { backgroundColor: `${accent}12`, borderColor: `${accent}25` },
                ]}
                onPress={() => onStartEdit(comment)}
                activeOpacity={0.75}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Edit comment"
              >
                <Feather name="edit-2" size={12.5} color={accent} />
              </TouchableOpacity>
            )}

            {/* 2. Delete (just icon) */}
            <TouchableOpacity
              style={[styles.actionIconBtn, styles.actionIconBtnDanger]}
              onPress={() => onDeleteComment(comment)}
              activeOpacity={0.75}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Delete comment"
            >
              <Feather name="trash-2" size={12.5} color={CAMPUS_HUB_COLORS.dangerText} />
            </TouchableOpacity>
          </View>
        )}
      </View>

{/* Collapsable Nested Replies */}
      {replyCount > 0 && isRepliesExpanded && (
        <View style={styles.repliesBlock}>
          {(comment.replies || []).map((reply) => {
            const isReplyOwn = reply.author.id === currentUserId;
            const isReplySeller = Boolean(listingAuthorId && reply.author.id === listingAuthorId);
            const replyInitial = (reply.author.name ?? "U").charAt(0).toUpperCase();
            const replySubtitle = getAuthorAcademicSubtitle(reply.author);
            const replyEdited = isCommentEdited(reply.createdAt, reply.updatedAt);

            return (
              <View key={reply.id} style={[styles.replyRow, { borderLeftColor: `${accent}25` }]}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => onViewAuthorProfile?.(reply.author)}
                  disabled={!onViewAuthorProfile}
                >
                  {reply.author.image ? (
                    <Image source={{ uri: reply.author.image }} style={styles.replyAvatarSmall} />
                  ) : (
                    <View style={styles.replyAvatarFallbackSmall}>
                      <Text style={styles.replyAvatarTextSmall}>{replyInitial}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.replyContentSmall}>
                  <View style={styles.cardHeader}>
                    <View style={styles.authorMetaCol}>
                      <View style={styles.nameRow}>
                        <TouchableOpacity
                          activeOpacity={0.75}
                          onPress={() => onViewAuthorProfile?.(reply.author)}
                          disabled={!onViewAuthorProfile}
                        >
                          <Text style={styles.replyNameSmall} numberOfLines={1}>
                            {reply.author.name}
                          </Text>
                        </TouchableOpacity>
                        {isReplySeller && (
                          <View style={[styles.sellerBadge, { backgroundColor: `${accent}14` }]}>
                            <Text style={[styles.sellerBadgeText, { color: accent }]}>Seller</Text>
                          </View>
                        )}
                      </View>
                      {replySubtitle && (
                        <Text style={styles.academicSubtitle} numberOfLines={1}>
                          {replySubtitle}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.timeText}>{timeAgo(reply.createdAt)}</Text>
                  </View>

                  <Text style={styles.replyBodySmall}>{reply.content}</Text>

                  {replyEdited && <Text style={styles.editedLabel}>✎ Edited</Text>}

                  <View style={styles.actionsRow}>
                    <View style={styles.leftActions}>
                      {/* 3. Reply with icon and text */}
                      <TouchableOpacity
                        style={[
                          styles.actionReplyBtn,
                          { backgroundColor: `${accent}10`, borderColor: `${accent}25` },
                        ]}
                        onPress={() => onStartReply(comment.id, reply.author.name)}
                        activeOpacity={0.75}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Reply to ${reply.author.name}`}
                      >
                        <Feather name="corner-down-right" size={11} color={accent} />
                        <Text style={[styles.actionReplyText, { color: accent }]}>Reply</Text>
                      </TouchableOpacity>
                    </View>

                    {isReplyOwn && (
                      <View style={styles.rightActions}>
                        {/* 1. Edit (just icon) */}
                        {onStartEdit && (
                          <TouchableOpacity
                            style={[
                              styles.actionIconBtn,
                              { backgroundColor: `${accent}12`, borderColor: `${accent}25` },
                            ]}
                            onPress={() => onStartEdit(reply)}
                            activeOpacity={0.75}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel="Edit reply"
                          >
                            <Feather name="edit-2" size={12} color={accent} />
                          </TouchableOpacity>
                        )}

                        {/* 2. Delete (just icon) */}
                        <TouchableOpacity
                          style={[styles.actionIconBtn, styles.actionIconBtnDanger]}
                          onPress={() => onDeleteComment(reply)}
                          activeOpacity={0.75}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel="Delete reply"
                        >
                          <Feather name="trash-2" size={12} color={CAMPUS_HUB_COLORS.dangerText} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
      </View>
    </View>
  );
});

// ---------------------------------------------------------------------------
// Main Inline Comments Component
// ---------------------------------------------------------------------------
interface InlineCommentsProps {
  comments: Comment[];
  currentUserId?: string;
  listingAuthorId?: string;
  accent?: string;
  onStartReply: (targetId: string, authorName: string) => void;
  onStartEdit?: (comment: Comment) => void;
  onDeleteComment: (commentId: string) => void;
  onViewAuthorProfile?: (author: CommentAuthor) => void;
}

export const InlineComments = memo(function InlineComments({
  comments,
  currentUserId,
  listingAuthorId,
  accent = CAMPUS_HUB_COLORS.deepNavy,
  onStartReply,
  onStartEdit,
  onDeleteComment,
  onViewAuthorProfile,
}: InlineCommentsProps) {
  const handleDeletePrompt = (comment: Comment) => {
    Alert.alert("Delete Comment", "Remove this comment permanently?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDeleteComment(comment.id),
      },
    ]);
  };

  return (
    <View style={styles.outerContainer}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.sectionIconBadge, { backgroundColor: `${accent}18` }]}>
            <Feather name="message-circle" size={15} color={accent} />
          </View>
          <Text style={styles.sectionTitle}>Comments</Text>
          <View style={styles.counterPill}>
            <Text style={styles.counterPillText}>{comments.length}</Text>
          </View>
        </View>
      </View>

      {/* Empty State */}
      {comments.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <Feather
              name="message-square"
              size={18}
              color={CAMPUS_HUB_COLORS.subtleText}
            />
          </View>
          <Text style={styles.emptyTitle}>No comments yet</Text>
          <Text style={styles.emptySubtext}>
            Be the first to ask or share about this listing.
          </Text>
        </View>
      ) : (
        <View style={styles.cardsList}>
          {comments.map((comment) => (
            <InlineCommentCard
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              listingAuthorId={listingAuthorId}
              accent={accent}
              onStartReply={onStartReply}
              onStartEdit={onStartEdit}
              onDeleteComment={handleDeletePrompt}
              onViewAuthorProfile={onViewAuthorProfile}
            />
          ))}
        </View>
      )}
    </View>
  );
});

// ---------------------------------------------------------------------------
// Comment Input Bar Component
// ---------------------------------------------------------------------------
interface CommentInputBarProps {
  replyTarget: ReplyTarget | null;
  onCancelReply: () => void;
  isEditMode?: boolean;
  onCancelEdit?: () => void;
  text: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  accent?: string;
  inputRef?: React.RefObject<TextInput | null>;
}

export const CommentInputBar = memo(function CommentInputBar({
  replyTarget,
  onCancelReply,
  isEditMode = false,
  onCancelEdit,
  text,
  onChangeText,
  onSubmit,
  isSubmitting,
  accent = CAMPUS_HUB_COLORS.deepNavy,
  inputRef,
}: CommentInputBarProps) {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (isEditMode || replyTarget) {
      setTimeout(() => inputRef?.current?.focus(), 100);
    }
  }, [isEditMode, replyTarget, inputRef]);

  const canSend = Boolean(text.trim()) && !isSubmitting;
  const bottomPadding = isKeyboardVisible ? 6 : Math.max(insets.bottom, 8);

  const placeholderText = isEditMode
    ? "Edit your comment..."
    : replyTarget
    ? `Reply to @${replyTarget.authorName}...`
    : "Write a comment...";

  return (
    <View
      style={[
        styles.inputBarWrapper,
        { paddingBottom: bottomPadding },
      ]}
    >
      {/* Editing banner */}
      {isEditMode && (
        <View style={styles.editBanner}>
          <View style={styles.bannerLeft}>
            <Feather
              name="edit-2"
              size={12}
              color="#92400e"
              style={styles.bannerIcon}
            />
            <Text style={styles.editBannerText}>Editing comment</Text>
          </View>
          <TouchableOpacity
            onPress={onCancelEdit}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cancel edit"
          >
            <Text style={styles.editCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Replying banner */}
      {!isEditMode && replyTarget && (
        <View
          style={[
            styles.replyingBanner,
            { borderColor: `${accent}30`, backgroundColor: `${accent}0c` },
          ]}
        >
          <View style={styles.bannerLeft}>
            <Feather
              name="corner-down-right"
              size={13}
              color={accent}
              style={styles.bannerIcon}
            />
            <Text style={[styles.replyingText, { color: accent }]}>
              Replying to{" "}
              <Text style={{ fontWeight: "800", color: accent }}>
                @{replyTarget.authorName}
              </Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={onCancelReply}
            style={styles.cancelReplyBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cancel reply"
          >
            <Feather name="x" size={14} color={CAMPUS_HUB_COLORS.subtleText} />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Row */}
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholderText}
          placeholderTextColor="#94a3b8"
          value={text}
          onChangeText={onChangeText}
          multiline={true}
          maxLength={1000}
          editable={!isSubmitting}
        />

        <TouchableOpacity
          style={[
            styles.sendBtn,
            canSend ? { backgroundColor: accent } : styles.sendBtnDisabled,
          ]}
          onPress={onSubmit}
          disabled={!canSend}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={isEditMode ? "Save edit" : "Send comment"}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Feather
              name={isEditMode ? "check" : "send"}
              size={16}
              color={canSend ? "#ffffff" : "#94a3b8"}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ---------------------------------------------------------------------------
// Stylesheet
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  counterPill: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  counterPillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    marginBottom: 4,
  },
  emptySubtext: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
  },
  cardsList: {
    gap: 10,
  },
  commentCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  commentContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    marginRight: 10,
  },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarFallbackText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  authorMetaCol: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorName: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  sellerBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  sellerBadgeText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "700",
  },
  academicSubtitle: {
    fontFamily,
    fontSize: 10,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 1,
  },
  timeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "400",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  commentBody: {
    fontFamily,
    fontSize: 13,
    fontWeight: "400",
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 19,
  },
  editedLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "500",
    color: "#92400e",
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    marginLeft: 6,
  },
  actionReplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    borderWidth: 1,
  },
  actionReplyText: {
    fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionIconBtnDanger: {
    backgroundColor: CAMPUS_HUB_COLORS.dangerBg,
    borderColor: 'rgba(190, 18, 60, 0.15)',
  },
  toggleRepliesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    paddingHorizontal: 4,
    gap: 4.5,
  },
  toggleRepliesLine: {
    width: 12,
    height: 1.5,
    borderRadius: 1,
  },
  toggleRepliesText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: '700',
  },
  repliesBlock: {
    marginTop: 10,
    paddingTop: 2,
  },
  replyRow: {
    flexDirection: "row",
    marginTop: 8,
    paddingLeft: 10,
    borderLeftWidth: 2,
  },
  replyAvatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    marginRight: 8,
  },
  replyAvatarFallbackSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  replyAvatarTextSmall: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  replyContentSmall: {
    flex: 1,
  },
  replyNameSmall: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  replyBodySmall: {
    fontFamily,
    fontSize: 12,
    fontWeight: "400",
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 18,
  },
  inputBarWrapper: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.06)",
    paddingHorizontal: 16,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  editBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
  },
  bannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  bannerIcon: {
    marginRight: 2,
  },
  editBannerText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#92400e",
    flex: 1,
  },
  editCancelText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.dangerText,
  },
  replyingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
    borderWidth: 1,
  },
  replyingText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  cancelReplyBtn: {
    padding: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily,
    fontSize: 14,
    color: CAMPUS_HUB_COLORS.neutralText,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 10 : 12,
    paddingBottom: Platform.OS === "android" ? 10 : 12,
    minHeight: 44,
    maxHeight: 120,
    textAlignVertical: "center",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
});
