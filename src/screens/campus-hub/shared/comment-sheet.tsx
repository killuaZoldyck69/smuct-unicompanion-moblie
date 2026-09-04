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
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { AvatarChip } from "./avatar-chip";
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
}

interface CommentSheetProps {
  visible: boolean;
  onClose: () => void;
  comments: Comment[];
  currentUserId?: string;
  accent?: string;
  isSubmitting: boolean;
  onSubmit: (content: string) => void;
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
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText("");
  }, [text, onSubmit]);

  const handleDelete = useCallback(
    (comment: Comment) => {
      Alert.alert("Delete Comment", "Remove this comment?", [
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
      return (
        <View style={styles.commentCard}>
          <AvatarChip name={item.author.name} image={item.author.image} size={32} />
          <View style={styles.commentBody}>
            <View style={styles.commentMeta}>
              <Text style={styles.commentTime}>{timeAgo(item.createdAt)}</Text>
              {isOwn && (
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Delete comment"
                >
                  <Feather name="trash-2" size={13} color={CAMPUS_HUB_COLORS.dangerText} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.commentContent}>{item.content}</Text>
          </View>
        </View>
      );
    },
    [currentUserId, handleDelete]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {comments.length} Comment{comments.length !== 1 ? "s" : ""}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close comments"
            >
              <Feather name="x" size={20} color={CAMPUS_HUB_COLORS.deepNavy} />
            </TouchableOpacity>
          </View>

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
                  size={32}
                  color={CAMPUS_HUB_COLORS.subtleText}
                />
                <Text style={styles.emptyText}>No comments yet</Text>
                <Text style={styles.emptySubtext}>Be the first to comment!</Text>
              </View>
            }
          />

          <View
            style={[
              styles.inputBar,
              { paddingBottom: Math.max(insets.bottom, 14) },
            ]}
          >
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Write a comment..."
              placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={400}
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
                <Feather name="send" size={16} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  headerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    padding: 16,
    gap: 12,
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
    fontSize: 16,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  emptySubtext: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  commentCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 16,
    padding: 14,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  commentBody: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 4,
  },
  commentTime: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  commentContent: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 19,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: "#f1f5f9",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
