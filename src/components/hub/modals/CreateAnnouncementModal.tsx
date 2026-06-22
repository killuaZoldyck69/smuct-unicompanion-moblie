import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { spacing, rounded } from "../../../theme/layout";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  isPending: boolean;
}

export default function CreateAnnouncementModal({
  isVisible,
  onClose,
  onSubmit,
  isPending,
}: Props) {
  const [content, setContent] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");

  const handleSubmit = () => {
    onSubmit({
      content: content.trim(),
      attachedLinkUrl: linkUrl.trim() || undefined,
      attachedLinkTitle: linkTitle.trim() || undefined,
    });
    setContent("");
    setLinkUrl("");
    setLinkTitle("");
    setShowLinkInput(false);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Post Announcement</Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isPending || !content.trim()}
            >
              {isPending ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text
                  style={[
                    styles.postTextBtn,
                    !content.trim() && { color: colors.outline },
                  ]}
                >
                  Post
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.editorContainer}>
              <TextInput
                style={styles.textArea}
                value={content}
                onChangeText={setContent}
                placeholder="Announce something to your class..."
                placeholderTextColor={colors.outlineVariant}
                multiline
                autoFocus
              />

              {showLinkInput && (
                <View style={styles.attachmentBox}>
                  <Text style={styles.attachmentLabel}>
                    Attach Link / Drive URL
                  </Text>
                  <TextInput
                    style={styles.linkInput}
                    placeholder="https://..."
                    value={linkUrl}
                    onChangeText={setLinkUrl}
                    autoCapitalize="none"
                  />
                  <TextInput
                    style={[styles.linkInput, { marginTop: 8 }]}
                    placeholder="Link Title (e.g., Week 1 SRS)"
                    value={linkTitle}
                    onChangeText={setLinkTitle}
                  />
                </View>
              )}

              <View style={styles.toolbar}>
                <View style={styles.toolsLeft}>
                  <TouchableOpacity
                    style={styles.toolBtn}
                    onPress={() => setShowLinkInput(!showLinkInput)}
                  >
                    <Feather
                      name="link"
                      size={18}
                      color={colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.toolBtn}
                    onPress={() => setShowLinkInput(!showLinkInput)}
                  >
                    <Feather
                      name="file-text"
                      size={18}
                      color={colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  cancelText: { ...typography.bodyLg, fontSize: 16, color: colors.outline },
  modalTitle: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "700",
  },
  postTextBtn: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.primaryContainer,
    fontWeight: "700",
  },
  modalContent: { flex: 1, padding: spacing.marginMobile },
  editorContainer: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.lg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    overflow: "hidden",
  },
  textArea: {
    flex: 1,
    padding: 16,
    ...typography.bodyLg,
    color: colors.onSurface,
    textAlignVertical: "top",
  },
  attachmentBox: {
    backgroundColor: colors.surfaceContainerHigh,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
  },
  attachmentLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },
  linkInput: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderRadius: rounded.md,
    padding: 10,
    ...typography.bodyMd,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
    backgroundColor: colors.surfaceContainerLowest,
  },
  toolsLeft: { flexDirection: "row", gap: 16 },
  toolBtn: {
    padding: 8,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 20,
  },
});
