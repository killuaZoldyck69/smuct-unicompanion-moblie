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
  Switch,
} from "react-native"; // 👈 Notice SafeAreaView is REMOVED from here
import { SafeAreaView } from "react-native-safe-area-context"; // 👈 ADDED HERE
import { Feather } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, rounded } from "../../theme/layout";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    driveUrl: string;
    isStudentNote: boolean;
  }) => void;
  isPending: boolean;
  canManage: boolean;
}

export default function UploadResourceModal({
  isVisible,
  onClose,
  onSubmit,
  isPending,
  canManage,
}: Props) {
  const [title, setTitle] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  // If they can manage (Teacher/CR), default to false (Lecture Material). If student, force true (Student Note).
  const [isStudentNote, setIsStudentNote] = useState(!canManage);

  const handleSubmit = () => {
    let formattedUrl = driveUrl.trim();

    // Automatically append https:// if the user forgets it
    if (
      formattedUrl &&
      !formattedUrl.startsWith("http://") &&
      !formattedUrl.startsWith("https://")
    ) {
      formattedUrl = "https://" + formattedUrl;
    }

    onSubmit({ title: title.trim(), driveUrl: formattedUrl, isStudentNote });

    setTitle("");
    setDriveUrl("");
    setIsStudentNote(!canManage);
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <SafeAreaView style={styles.bottomSheet} edges={["top"]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Upload Material</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Chapter 1 Slides / Midterm Notes"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Google Drive / Document Link</Text>
          <TextInput
            style={styles.input}
            placeholder="https://drive.google.com/..."
            value={driveUrl}
            onChangeText={setDriveUrl}
            autoCapitalize="none"
          />

          {canManage && (
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Mark as Student Note</Text>
              <Switch
                value={isStudentNote}
                onValueChange={setIsStudentNote}
                trackColor={{
                  false: colors.outline,
                  true: colors.primaryContainer,
                }}
              />
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitBlockBtn,
              (!title || !driveUrl || isPending) && { opacity: 0.7 },
            ]}
            onPress={handleSubmit}
            disabled={!title || !driveUrl || isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBlockText}>Upload</Text>
            )}
          </TouchableOpacity>
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
    padding: spacing.marginMobile,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.stackLg,
  },
  sheetTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontWeight: "700",
  },
  label: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
    marginTop: spacing.stackSm,
  },
  input: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.stackLg,
    backgroundColor: colors.surfaceContainerHigh,
    padding: 16,
    borderRadius: rounded.md,
  },
  switchLabel: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "600",
  },
  submitBlockBtn: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 16,
    borderRadius: rounded.md,
    alignItems: "center",
    marginTop: spacing.stackLg,
  },
  submitBlockText: { ...typography.labelMd, color: "#FFF", fontWeight: "700" },
});
