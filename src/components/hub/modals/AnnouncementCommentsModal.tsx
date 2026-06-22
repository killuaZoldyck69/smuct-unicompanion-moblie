import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { spacing, rounded } from "../../../theme/layout";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  announcement: any;
  onSubmit: (content: string) => void;
  isPending: boolean;
}

export default function AnnouncementCommentsModal({
  isVisible,
  onClose,
  announcement,
  onSubmit,
  isPending,
}: Props) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content.trim());
    setContent("");
  };

  const renderComment = ({ item }: { item: any }) => (
    <View style={styles.commentRow}>
      {/* 👈 FIX 1: Show Image if available, otherwise fallback */}
      {item.author?.image ? (
        <Image source={{ uri: item.author.image }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarText}>
            {item.author?.name?.charAt(0) || "U"}
          </Text>
        </View>
      )}

      <View style={styles.commentBubble}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>{item.author?.name}</Text>
          {/* 👈 FIX 2: Added Timestamps */}
          <Text style={styles.commentTime}>
            {new Date(item.createdAt).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            })}{" "}
            •{" "}
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <Text style={styles.commentContent}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      {/* 👈 FIX 3: Adjusted KeyboardAvoidingView for Modals */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <SafeAreaView style={styles.bottomSheet} edges={["bottom"]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Class Comments</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={announcement?.comments || []}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No comments yet. Be the first!
              </Text>
            }
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add class comment..."
              value={content}
              onChangeText={setContent}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!content.trim() || isPending) && { opacity: 0.5 },
              ]}
              onPress={handleSubmit}
              disabled={!content.trim() || isPending}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Feather name="send" size={18} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: rounded.xl,
    borderTopRightRadius: rounded.xl,
    maxHeight: "85%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  sheetTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontWeight: "700",
  },
  listContent: { padding: spacing.marginMobile, paddingBottom: 24 },
  emptyText: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: "center",
    marginTop: 20,
  },

  commentRow: { flexDirection: "row", marginBottom: spacing.stackMd },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: colors.surfaceContainerHigh,
  },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    ...typography.labelMd,
    color: colors.secondary,
    fontWeight: "700",
  },

  commentBubble: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    padding: 12,
    borderRadius: rounded.lg,
    borderTopLeftRadius: 4,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  commentAuthor: {
    ...typography.labelSm,
    color: colors.onSurface,
    fontWeight: "700",
  },
  commentTime: { ...typography.labelSm, color: colors.outline, fontSize: 10 },
  commentContent: { ...typography.bodyMd, color: colors.onSurfaceVariant },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.marginMobile,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
    backgroundColor: colors.surfaceContainerLowest,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    ...typography.bodyMd,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
});
