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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { spacing, rounded } from "../../../theme/layout";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (payload: { title: string; content: string }) => void;
  isPending: boolean;
}

export default function AskQuestionModal({
  isVisible,
  onClose,
  onSubmit,
  isPending,
}: Props) {
  const [form, setForm] = useState({ title: "", content: "" });

  const handleSubmit = () => {
    onSubmit(form);
    setForm({ title: "", content: "" }); // Reset after submit
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer} edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ask the Class</Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isPending || !form.title}
            >
              {isPending ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text style={styles.postTextBtn}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(t) => setForm({ ...form, title: t })}
              placeholder="Question Subject..."
              autoFocus
            />
            <TextInput
              style={[styles.textArea, { marginTop: spacing.stackLg }]}
              value={form.content}
              onChangeText={(t) => setForm({ ...form, content: t })}
              placeholder="Elaborate your question here..."
              multiline
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: colors.surfaceContainerLowest },
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
  input: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: "600",
  },
  textArea: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    padding: 16,
    ...typography.bodyMd,
    color: colors.onSurface,
    textAlignVertical: "top",
  },
});
