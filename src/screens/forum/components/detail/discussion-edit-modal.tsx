import React, { memo } from "react";
import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import {
  BENTO_COLORS,
  fontFamily,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} from "../../constants";

interface DiscussionEditModalProps {
  visible: boolean;
  form: { title: string; description: string };
  onChangeTitle: (title: string) => void;
  onChangeDescription: (description: string) => void;
  onSave: () => void;
  onClose: () => void;
  isSaving: boolean;
}

export const DiscussionEditModal = memo(function DiscussionEditModal({
  visible,
  form,
  onChangeTitle,
  onChangeDescription,
  onSave,
  onClose,
  isSaving,
}: DiscussionEditModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent={true}
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.editModalContainer} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flexOne}
        >
          <View style={styles.editModalHeader}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel editing"
            >
              <Feather name="x" size={20} color={BENTO_COLORS.deepNavy} />
            </TouchableOpacity>
            <Text style={styles.editModalTitle}>Edit Question</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={styles.editModalContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.formLabel}>QUESTION TITLE</Text>
                <Text style={styles.counterText}>
                  {form.title.length}/{MAX_TITLE_LENGTH}
                </Text>
              </View>
              <TextInput
                style={styles.formInput}
                value={form.title}
                onChangeText={onChangeTitle}
                maxLength={MAX_TITLE_LENGTH}
                accessible={true}
                accessibilityLabel="Edit question title"
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.formLabel}>DETAILS & CONTEXT</Text>
                <Text style={styles.counterText}>
                  {form.description.length}/{MAX_DESCRIPTION_LENGTH}
                </Text>
              </View>
              <TextInput
                style={[styles.formInput, styles.formInputArea]}
                value={form.description}
                onChangeText={onChangeDescription}
                multiline={true}
                textAlignVertical="top"
                maxLength={MAX_DESCRIPTION_LENGTH}
                accessible={true}
                accessibilityLabel="Edit question details"
              />
            </View>

            <TouchableOpacity
              style={styles.saveEditBtn}
              onPress={onSave}
              disabled={isSaving}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Save question changes"
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveEditBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  editModalContainer: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  editModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: BENTO_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BENTO_COLORS.slateBg,
    justifyContent: "center",
    alignItems: "center",
  },
  editModalTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  headerSpacer: {
    width: 36,
  },
  editModalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  formLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 0.6,
  },
  counterText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  formInput: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily,
    fontSize: 14,
    color: BENTO_COLORS.neutralText,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
  },
  formInputArea: {
    minHeight: 120,
  },
  saveEditBtn: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: BENTO_COLORS.pillRadius,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveEditBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
