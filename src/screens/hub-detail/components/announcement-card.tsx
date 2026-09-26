import React, { memo, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Linking,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { formatDateTime12h } from "@/utils/date-formatter";

const BENTO_COLORS = {
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  cardRadius: 24,
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
  onCommentPress?: (item: any) => void;
  onAddComment?: (announcementId: string, content: string) => void;
  isAddingComment?: boolean;
  onEditPress?: (item: any) => void;
  onDeletePress?: (item: any) => void;
}

const AnnouncementCard = ({
  item,
  currentUserId,
  canManage,
  onCommentPress,
  onAddComment,
  isAddingComment,
  onEditPress,
  onDeletePress,
}: Props) => {
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<TextInput>(null);

  const handleOpenCommentInput = () => {
    setIsCommentsExpanded(true);
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 120);
  };

  const isAuthor = currentUserId && (item.creatorId === currentUserId || item.creator?.id === currentUserId);
  const canModify = isAuthor || canManage;

  const handleDelete = () => {
    Alert.alert(
      "Delete Announcement",
      "Are you sure you want to delete this announcement? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDeletePress?.(item),
        },
      ],
    );
  };

  const authorRole = item.creator?.role || (item.creator?.studentProfile?.isCR ? "CR" : null);

  // Parse attachments
  const attachments: any[] = Array.isArray(item.attachments) ? item.attachments : [];
  // Parse links
  const links: any[] = Array.isArray(item.links) ? item.links : [];
  // Parse comments
  const comments: any[] = Array.isArray(item.comments) ? item.comments : [];

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    const text = commentText.trim();
    setCommentText("");
    if (onAddComment) {
      onAddComment(item.id, text);
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.userName}>{item.creator?.name || "Faculty"}</Text>
              {authorRole && (
                <View style={styles.rolePill}>
                  <Text style={styles.rolePillText}>{authorRole}</Text>
                </View>
              )}
            </View>
            <View style={styles.dateRow}>
              <Feather
                name="clock"
                size={11}
                color={BENTO_COLORS.subtleText}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.dateText}>
                {formatDateTime12h(item.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {canModify && (
          <View style={styles.actionMenuRow}>
            {onEditPress && isAuthor && (
              <TouchableOpacity
                onPress={() => onEditPress(item)}
                style={styles.actionIconBtn}
                accessible={true}
                accessibilityLabel="Edit announcement"
              >
                <Feather name="edit-2" size={14} color="#64748b" />
              </TouchableOpacity>
            )}
            {onDeletePress && (
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.actionIconBtn}
                accessible={true}
                accessibilityLabel="Delete announcement"
              >
                <Feather name="trash-2" size={14} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* 2. Announcement Content */}
      <Text style={styles.contentBody}>{item.content}</Text>

      {/* 3. Multi-file Attachments Preview */}
      {attachments.length > 0 && (
        <View style={styles.attachmentsContainer}>
          {attachments.map((att: any, idx: number) => {
            const isImg = att.type?.includes("image") || att.url?.match(/\.(jpg|jpeg|png|webp|gif)/i);
            const isPdf = att.type?.includes("pdf") || att.url?.match(/\.pdf/i);

            return (
              <TouchableOpacity
                key={idx}
                style={styles.attachmentFilePill}
                onPress={() => Linking.openURL(att.url)}
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
                <Feather name="external-link" size={12} color="#94a3b8" style={{ marginLeft: 6 }} />
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
              onPress={() => Linking.openURL(item.attachedLinkUrl)}
              activeOpacity={0.7}
            >
              <Feather name="link-2" size={14} color="#2563eb" style={{ marginRight: 8 }} />
              <Text style={styles.linkText} numberOfLines={1}>
                {item.attachedLinkTitle || item.attachedLinkUrl}
              </Text>
            </TouchableOpacity>
          )}
          {links.map((link: any, idx: number) => (
            <TouchableOpacity
              key={idx}
              style={styles.linkPill}
              onPress={() => Linking.openURL(link.url)}
              activeOpacity={0.7}
            >
              <Feather name="link-2" size={14} color="#2563eb" style={{ marginRight: 8 }} />
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
              {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
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
          {/* Inline Comment Composer at TOP */}
          <View style={styles.commentComposerRow}>
            <TextInput
              ref={commentInputRef}
              style={styles.commentInput}
              placeholder="Add a class comment..."
              placeholderTextColor="#94a3b8"
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
              accessible={true}
              accessibilityLabel="Add a class comment"
            />
            <TouchableOpacity
              style={[
                styles.commentSendBtn,
                (!commentText.trim() || isAddingComment) && styles.commentSendBtnDisabled,
              ]}
              onPress={handleSendComment}
              disabled={!commentText.trim() || isAddingComment}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Post comment"
            >
              {isAddingComment ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Feather
                  name="send"
                  size={13}
                  color={commentText.trim() ? "#ffffff" : "#94a3b8"}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Comments List Below Composer */}
          {comments.length === 0 ? (
            <View style={styles.emptyCommentsBox}>
              <Feather name="message-square" size={15} color="#94a3b8" style={{ marginRight: 6 }} />
              <Text style={styles.emptyCommentsText}>
                No comments yet. Be the first to reply!
              </Text>
            </View>
          ) : (
            <View style={styles.commentsList}>
              {comments.map((c: any, index: number) => {
                const commentAuthorRole =
                  c.author?.role || (c.author?.studentProfile?.isCR ? "CR" : null);
                return (
                  <View key={c.id || index} style={styles.commentRow}>
                    {c.author?.image ? (
                      <Image source={{ uri: c.author.image }} style={styles.commentAvatar} />
                    ) : (
                      <View style={styles.commentAvatarFallback}>
                        <Text style={styles.commentAvatarText}>
                          {c.author?.name?.charAt(0)?.toUpperCase() || "U"}
                        </Text>
                      </View>
                    )}
                    <View style={styles.commentBubble}>
                      <View style={styles.commentMetaRow}>
                        <Text style={styles.commentAuthorName} numberOfLines={1}>
                          {c.author?.name || "Student"}
                        </Text>
                        {commentAuthorRole && (
                          <View style={styles.commentRoleBadge}>
                            <Text style={styles.commentRoleText}>{commentAuthorRole}</Text>
                          </View>
                        )}
                        <Text style={styles.commentTimestamp}>
                          {formatDateTime12h(c.createdAt)}
                        </Text>
                      </View>
                      <Text style={styles.commentTextContent}>{c.content}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}
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
  rolePill: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  rolePillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
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
    gap: 8,
    marginBottom: 10,
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
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.04)",
  },
  commentMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  commentAuthorName: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    maxWidth: 120,
  },
  commentRoleBadge: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 9999,
  },
  commentRoleText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "700",
    color: "#0369a1",
  },
  commentTimestamp: {
    fontFamily,
    fontSize: 10,
    color: BENTO_COLORS.subtleText,
    marginLeft: "auto",
  },
  commentTextContent: {
    fontFamily,
    fontSize: 12,
    color: "#334155",
    lineHeight: 18,
  },

  // Inline Comment Composer
  commentComposerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.08)",
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 4,
    marginBottom: 10,
  },
  commentInput: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    color: BENTO_COLORS.deepNavy,
    maxHeight: 70,
    padding: 0,
    minHeight: 32,
  },
  commentSendBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: BENTO_COLORS.deepNavy,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  commentSendBtnDisabled: {
    backgroundColor: "#e2e8f0",
  },
});
