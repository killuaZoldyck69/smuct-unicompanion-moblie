import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { CAMPUS_HUB_COLORS, fontFamily, timeAgo } from "./design-tokens";

interface CommentAuthor {
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

interface CommentSheetProps {
  visible: boolean;
  onClose: () => void;
  comments: Comment[];
  currentUserId?: string;
  accent?: string;
  isSubmitting: boolean;
  onSubmit: (content: string, parentId?: string | null) => void;
  onDelete: (commentId: string) => void;
}

export const CommentSheet = React.memo(function CommentSheet({
  visible,
  onClose,
  comments,
  currentUserId,
  accent = CAMPUS_HUB_COLORS.deepNavy,
  isSubmitting,
  onSubmit,
  onDelete,
}: CommentSheetProps) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const [replyTarget, setReplyTarget] = useState<{
    id: string;
    authorName: string;
  } | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed, replyTarget?.id ?? null);
    setText("");
    setReplyTarget(null);
  }, [text, replyTarget, onSubmit]);

  const handleStartReply = useCallback(
    (targetId: string, authorName: string) => {
      setReplyTarget({ id: targetId, authorName });
      inputRef.current?.focus();
    },
    []
  );

  const handleDelete = useCallback(
    (comment: Comment) => {
      Alert.alert("Delete Comment", "Remove this comment permanently?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(comment.id),
        },
      ]);
    },
    [onDelete]
  );

  const renderComment = useCallback(
    ({ item }: { item: Comment }) => {
      const isOwn = item.author.id === currentUserId;
      const initial = (item.author.name ?? "U").charAt(0).toUpperCase();

      return (
        <View style={styles.commentThread}>
          {/* Main Comment Row */}
          <View style={styles.commentRow}>
            {item.author.image ? (
              <Image source={{ uri: item.author.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>{initial}</Text>
              </View>
            )}

            <View style={styles.bubbleCol}>
              <View style={styles.commentBubble}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthorName} numberOfLines={1}>
                    {item.author.name}
                  </Text>
                  <Text style={styles.commentTime}>{timeAgo(item.createdAt)}</Text>
                </View>
                <Text style={styles.commentContent}>{item.content}</Text>
              </View>

              <View style={styles.commentActions}>
                <TouchableOpacity
                  onPress={() => handleStartReply(item.id, item.author.name)}
                  style={styles.replyAction}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Reply to ${item.author.name}`}
                >
                  <Feather name="corner-down-right" size={12} color={accent} />
                  <Text style={[styles.replyActionText, { color: accent }]}>Reply</Text>
                </TouchableOpacity>

                {isOwn && (
                  <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    style={styles.deleteAction}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Delete comment"
                  >
                    <Feather name="trash-2" size={12} color={CAMPUS_HUB_COLORS.dangerText} />
                    <Text style={styles.deleteActionText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Threaded Nested Replies */}
          {item.replies && item.replies.length > 0 && (
            <View style={styles.repliesThread}>
              {item.replies.map((reply) => {
                const isReplyOwn = reply.author.id === currentUserId;
                const replyInitial = (reply.author.name ?? "U").charAt(0).toUpperCase();

                return (
                  <View key={reply.id} style={styles.replyRow}>
                    {reply.author.image ? (
                      <Image source={{ uri: reply.author.image }} style={styles.replyAvatar} />
                    ) : (
                      <View style={styles.replyAvatarFallback}>
                        <Text style={styles.replyAvatarFallbackText}>{replyInitial}</Text>
                      </View>
                    )}

                    <View style={styles.bubbleCol}>
                      <View style={[styles.commentBubble, styles.replyBubble]}>
                        <View style={styles.commentHeader}>
                          <Text style={styles.replyAuthorName} numberOfLines={1}>
                            {reply.author.name}
                          </Text>
                          <Text style={styles.commentTime}>{timeAgo(reply.createdAt)}</Text>
                        </View>
                        <Text style={styles.commentContent}>{reply.content}</Text>
                      </View>

                      <View style={styles.commentActions}>
                        <TouchableOpacity
                          onPress={() => handleStartReply(item.id, reply.author.name)}
                          style={styles.replyAction}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={`Reply to ${reply.author.name}`}
                        >
                          <Feather name="corner-down-right" size={11} color={accent} />
                          <Text style={[styles.replyActionText, { color: accent }]}>Reply</Text>
                        </TouchableOpacity>

                        {isReplyOwn && (
                          <TouchableOpacity
                            onPress={() => handleDelete(reply)}
                            style={styles.deleteAction}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel="Delete reply"
                          >
                            <Feather name="trash-2" size={11} color={CAMPUS_HUB_COLORS.dangerText} />
                            <Text style={styles.deleteActionText}>Delete</Text>
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
    },
    [currentUserId, handleDelete, handleStartReply, accent]
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.modalOverlay}>
        {/* Semi-transparent Dimmed Backdrop */}
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Bottom Sheet Card with Rounded Top Corners */}
        <View style={styles.sheetContent}>
          {/* Drag Indicator Pill */}
          <View style={styles.dragPillContainer}>
            <View style={styles.dragPill} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Comments ({comments.length})
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close comments"
            >
              <Feather name="x" size={18} color={CAMPUS_HUB_COLORS.deepNavy} />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
          >
            {/* Comments List */}
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={renderComment}
              contentContainerStyle={[
                styles.list,
                comments.length === 0 && styles.emptyList,
              ]}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Feather
                    name="message-circle"
                    size={36}
                    color={CAMPUS_HUB_COLORS.subtleText}
                  />
                  <Text style={styles.emptyText}>No comments yet</Text>
                  <Text style={styles.emptySubtext}>
                    Ask a question or leave helpful information!
                  </Text>
                </View>
              }
            />

            {/* Input Container */}
            <View
              style={[
                styles.inputContainer,
                { paddingBottom: Math.max(insets.bottom, 12) },
              ]}
            >
              {replyTarget && (
                <View style={styles.replyBanner}>
                  <Feather name="corner-down-right" size={13} color={accent} />
                  <Text style={styles.replyBannerText} numberOfLines={1}>
                    Replying to{" "}
                    <Text style={{ fontWeight: "700", color: accent }}>
                      @{replyTarget.authorName}
                    </Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => setReplyTarget(null)}
                    style={styles.cancelReplyBtn}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel reply"
                  >
                    <Feather name="x" size={14} color={CAMPUS_HUB_COLORS.subtleText} />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.inputBar}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder={
                    replyTarget
                      ? `Reply to @${replyTarget.authorName}...`
                      : "Write a comment..."
                  }
                  placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                  value={text}
                  onChangeText={setText}
                  multiline
                  maxLength={500}
                  accessible={true}
                  accessibilityLabel="Comment input"
                />
                <TouchableOpacity
                  style={[
                    styles.sendBtn,
                    { backgroundColor: accent },
                    (!text.trim() || isSubmitting) && styles.sendBtnDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!text.trim() || isSubmitting}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Send comment"
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Feather name="send" size={15} color="#ffffff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
  },
  sheetContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: "78%",
    overflow: "hidden",
    ...CAMPUS_HUB_COLORS.shadow,
    elevation: 24,
  },
  dragPillContainer: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  dragPill: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  keyboardView: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 16,
  },
  emptyList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  emptySubtext: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  commentThread: {
    gap: 10,
  },
  commentRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  avatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
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
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  replyBubble: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  commentAuthorName: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    flex: 1,
  },
  replyAuthorName: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    flex: 1,
  },
  commentTime: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
    marginLeft: 6,
  },
  commentContent: {
    fontFamily,
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 6,
    marginTop: 4,
  },
  replyAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 2,
  },
  replyActionText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
  },
  deleteAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 2,
  },
  deleteActionText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.dangerText,
  },
  repliesThread: {
    marginLeft: 26,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#e2e8f0",
    gap: 12,
  },
  replyRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  replyAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  replyAvatarFallback: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  replyAvatarFallbackText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  inputContainer: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  replyBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 8,
    gap: 6,
  },
  replyBannerText: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
    flex: 1,
  },
  cancelReplyBtn: {
    padding: 2,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily,
    fontSize: 14,
    color: CAMPUS_HUB_COLORS.deepNavy,
    maxHeight: 90,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
