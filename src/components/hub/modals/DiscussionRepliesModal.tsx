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
  discussion: any;
  onSubmit: (content: string) => void;
  isPending: boolean;
}

export default function DiscussionRepliesModal({
  isVisible,
  onClose,
  discussion,
  onSubmit,
  isPending,
}: Props) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content.trim());
    setContent("");
  };

  const renderReply = ({ item }: { item: any }) => (
    <View style={styles.replyRow}>
      {item.author?.image ? (
        <Image source={{ uri: item.author.image }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarText}>
            {item.author?.name?.charAt(0)?.toUpperCase() || "U"}
          </Text>
        </View>
      )}

      <View style={styles.replyBubble}>
        <View style={styles.replyHeader}>
          <Text style={styles.replyAuthor}>{item.author?.name}</Text>
          <Text style={styles.replyTime}>
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
        <Text style={styles.replyContent}>{item.content}</Text>
      </View>
    </View>
  );

  const renderOriginalQuestion = () => {
    if (!discussion) return null;
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionTitle}>{discussion.title}</Text>
        <Text style={styles.questionBody}>{discussion.content}</Text>
        <View style={styles.divider} />
      </View>
    );
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <SafeAreaView style={styles.bottomSheet} edges={["bottom"]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Q&A Replies</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={discussion?.replies || []}
            keyExtractor={(item) => item.id}
            renderItem={renderReply}
            ListHeaderComponent={renderOriginalQuestion}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No replies yet. Help your classmate out!
              </Text>
            }
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Write a reply..."
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
    maxHeight: "90%",
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

  questionContainer: { marginBottom: spacing.stackLg },
  questionTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontWeight: "800",
    marginBottom: 8,
  },
  questionBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceContainerHighest,
    marginTop: spacing.stackLg,
  },

  replyRow: { flexDirection: "row", marginBottom: spacing.stackMd },
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

  replyBubble: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    padding: 12,
    borderRadius: rounded.lg,
    borderTopLeftRadius: 4,
  },
  replyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  replyAuthor: {
    ...typography.labelSm,
    color: colors.onSurface,
    fontWeight: "700",
  },
  replyTime: { ...typography.labelSm, color: colors.outline, fontSize: 10 },
  replyContent: { ...typography.bodyMd, color: colors.onSurfaceVariant },

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
