import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
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
  author: CommentAuthor;
  parentId?: string | null;
  replies?: Comment[];
}

export interface ReplyTarget {
  id: string;
  authorName: string;
}

interface InlineCommentsProps {
  comments: Comment[];
  currentUserId?: string;
  accent?: string;
  onStartReply: (targetId: string, authorName: string) => void;
  onDeleteComment: (commentId: string) => void;
  onViewAuthorProfile?: (author: CommentAuthor) => void;
}

export const InlineComments = React.memo(function InlineComments({
  comments,
  currentUserId,
  accent = CAMPUS_HUB_COLORS.deepNavy,
  onStartReply,
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
    <View style={styles.sectionContainer}>
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
              size={24}
              color={CAMPUS_HUB_COLORS.subtleText}
            />
          </View>
          <Text style={styles.emptyTitle}>No comments yet</Text>
          <Text style={styles.emptySubtext}>
            Be the first to share details or help out.
          </Text>
        </View>
      ) : (
        <View style={styles.commentsList}>
          {comments.map((comment) => {
            const isOwn = comment.author.id === currentUserId;
            const initial = (comment.author.name ?? "U").charAt(0).toUpperCase();

            return (
              <View key={comment.id} style={styles.threadContainer}>
                {/* Main Comment */}
                <View style={styles.commentRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onViewAuthorProfile?.(comment.author)}
                    disabled={!onViewAuthorProfile}
                  >
                    {comment.author.image ? (
                      <Image
                        source={{ uri: comment.author.image }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarFallbackText}>{initial}</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={styles.bubbleCol}>
                    <View style={styles.commentBubble}>
                      <View style={styles.bubbleHeader}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => onViewAuthorProfile?.(comment.author)}
                          disabled={!onViewAuthorProfile}
                        >
                          <Text style={styles.authorName} numberOfLines={1}>
                            {comment.author.name}
                          </Text>
                        </TouchableOpacity>
                        <Text style={styles.timeText}>
                          {timeAgo(comment.createdAt)}
                        </Text>
                      </View>
                      <Text style={styles.content}>{comment.content}</Text>
                    </View>

                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        onPress={() =>
                          onStartReply(comment.id, comment.author.name)
                        }
                        style={styles.actionBtn}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Reply to ${comment.author.name}`}
                      >
                        <Feather
                          name="corner-down-right"
                          size={13}
                          color={accent}
                        />
                        <Text style={[styles.actionBtnText, { color: accent }]}>
                          Reply
                        </Text>
                      </TouchableOpacity>

                      {isOwn && (
                        <TouchableOpacity
                          onPress={() => handleDeletePrompt(comment)}
                          style={styles.actionBtn}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel="Delete comment"
                        >
                          <Feather
                            name="trash-2"
                            size={13}
                            color={CAMPUS_HUB_COLORS.dangerText}
                          />
                          <Text
                            style={[
                              styles.actionBtnText,
                              { color: CAMPUS_HUB_COLORS.dangerText },
                            ]}
                          >
                            Delete
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <View style={styles.repliesBlock}>
                    {comment.replies.map((reply) => {
                      const isReplyOwn = reply.author.id === currentUserId;
                      const replyInitial = (reply.author.name ?? "U")
                        .charAt(0)
                        .toUpperCase();

                      return (
                        <View key={reply.id} style={styles.replyRow}>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => onViewAuthorProfile?.(reply.author)}
                            disabled={!onViewAuthorProfile}
                          >
                            {reply.author.image ? (
                              <Image
                                source={{ uri: reply.author.image }}
                                style={styles.replyAvatar}
                              />
                            ) : (
                              <View style={styles.replyAvatarFallback}>
                                <Text style={styles.replyAvatarFallbackText}>
                                  {replyInitial}
                                </Text>
                              </View>
                            )}
                          </TouchableOpacity>

                          <View style={styles.bubbleCol}>
                            <View
                              style={[
                                styles.commentBubble,
                                styles.replyBubble,
                              ]}
                            >
                              <View style={styles.bubbleHeader}>
                                <TouchableOpacity
                                  activeOpacity={0.7}
                                  onPress={() =>
                                    onViewAuthorProfile?.(reply.author)
                                  }
                                  disabled={!onViewAuthorProfile}
                                >
                                  <Text
                                    style={styles.replyAuthorName}
                                    numberOfLines={1}
                                  >
                                    {reply.author.name}
                                  </Text>
                                </TouchableOpacity>
                                <Text style={styles.timeText}>
                                  {timeAgo(reply.createdAt)}
                                </Text>
                              </View>
                              <Text style={styles.content}>
                                {reply.content}
                              </Text>
                            </View>

                            <View style={styles.actionsRow}>
                              <TouchableOpacity
                                onPress={() =>
                                  onStartReply(
                                    comment.id,
                                    reply.author.name
                                  )
                                }
                                style={styles.actionBtn}
                                accessible={true}
                                accessibilityRole="button"
                                accessibilityLabel={`Reply to ${reply.author.name}`}
                              >
                                <Feather
                                  name="corner-down-right"
                                  size={13}
                                  color={accent}
                                />
                                <Text
                                  style={[
                                    styles.actionBtnText,
                                    { color: accent },
                                  ]}
                                >
                                  Reply
                                </Text>
                              </TouchableOpacity>

                              {isReplyOwn && (
                                <TouchableOpacity
                                  onPress={() => handleDeletePrompt(reply)}
                                  style={styles.actionBtn}
                                  accessible={true}
                                  accessibilityRole="button"
                                  accessibilityLabel="Delete reply"
                                >
                                  <Feather
                                    name="trash-2"
                                    size={13}
                                    color={CAMPUS_HUB_COLORS.dangerText}
                                  />
                                  <Text
                                    style={[
                                      styles.actionBtnText,
                                      { color: CAMPUS_HUB_COLORS.dangerText },
                                    ]}
                                  >
                                    Delete
                                  </Text>
                                </TouchableOpacity>
                              )}
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
  );
});

interface CommentInputBarProps {
  replyTarget: ReplyTarget | null;
  onCancelReply: () => void;
  text: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  accent?: string;
  inputRef?: React.RefObject<TextInput | null>;
}

export const CommentInputBar = React.memo(function CommentInputBar({
  replyTarget,
  onCancelReply,
  text,
  onChangeText,
  onSubmit,
  isSubmitting,
  accent = CAMPUS_HUB_COLORS.deepNavy,
  inputRef,
}: CommentInputBarProps) {
  const insets = useSafeAreaInsets();
  const canSend = Boolean(text.trim()) && !isSubmitting;

  // Accurately calculate system navigation bar padding:
  // On devices with 3-button navigation, insets.bottom is typically 0, so we apply 20px padding.
  // On devices with gesture navigation, insets.bottom is ~20-34px, so we add 8px extra breathing room.
  const bottomPadding = insets.bottom > 0 ? insets.bottom + 8 : 20;

  return (
    <View
      style={[
        styles.inputBarWrapper,
        { paddingBottom: bottomPadding },
      ]}
    >
      {/* Replying banner */}
      {replyTarget && (
        <View style={styles.replyingBanner}>
          <View style={styles.replyingLeft}>
            <Feather name="corner-down-right" size={13} color={accent} />
            <Text style={styles.replyingText}>
              Replying to{" "}
              <Text style={{ fontWeight: "800", color: accent }}>
                @{replyTarget.authorName}
              </Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={onCancelReply}
            style={styles.cancelReplyBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cancel reply"
          >
            <Feather name="x" size={15} color={CAMPUS_HUB_COLORS.subtleText} />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Row */}
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={
            replyTarget
              ? `Reply to @${replyTarget.authorName}...`
              : "Write a comment..."
          }
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
          accessibilityLabel="Send comment"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Feather
              name="send"
              size={16}
              color={canSend ? "#ffffff" : "#94a3b8"}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  sectionContainer: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 20,
    backgroundColor: "#ffffff",
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 18,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  counterPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f1f5f9",
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
    lineHeight: 17,
  },
  commentsList: {
    gap: 16,
  },
  threadContainer: {
    gap: 12,
  },
  commentRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginTop: 2,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  avatarFallbackText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  bubbleCol: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  replyBubble: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  bubbleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  authorName: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  replyAuthorName: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  timeText: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  content: {
    fontFamily,
    fontSize: 13,
    lineHeight: 19,
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginTop: 6,
    marginLeft: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 3,
  },
  actionBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
  },
  repliesBlock: {
    marginLeft: 22,
    paddingLeft: 14,
    borderLeftWidth: 2,
    borderLeftColor: "#cbd5e1",
    gap: 12,
    marginTop: 2,
  },
  replyRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginTop: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  replyAvatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  replyAvatarFallbackText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  inputBarWrapper: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
  },
  replyingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  replyingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  replyingText: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  cancelReplyBtn: {
    padding: 3,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.deepNavy,
    backgroundColor: "#f8fafc",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  sendBtnDisabled: {
    backgroundColor: "#f1f5f9",
    shadowOpacity: 0,
    elevation: 0,
  },
});
