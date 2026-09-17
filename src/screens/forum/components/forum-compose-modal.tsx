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
} from "../constants";
import { useComposePostForm } from "../hooks/use-compose-post-form";

interface ForumComposeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ForumComposeModal = memo(function ForumComposeModal({
  visible,
  onClose,
  onSuccess,
}: ForumComposeModalProps) {
  const {
    title,
    setTitle,
    description,
    setDescription,
    isSubmitting,
    handleSubmit,
  } = useComposePostForm({
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flexOne}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close compose modal"
              activeOpacity={0.7}
            >
              <Feather name="x" size={20} color={BENTO_COLORS.deepNavy} />
            </TouchableOpacity>

            <Text style={styles.modalHeaderTitle}>Ask a Question</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.formLabel}>QUESTION TITLE</Text>
                <Text style={styles.counterText}>
                  {title.length}/{MAX_TITLE_LENGTH}
                </Text>
              </View>
              <TextInput
                style={styles.formInput}
                placeholder="What do you need help with?"
                placeholderTextColor={BENTO_COLORS.subtleText}
                value={title}
                onChangeText={setTitle}
                maxLength={MAX_TITLE_LENGTH}
                accessible={true}
                accessibilityLabel="Question Title"
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.formLabel}>DETAILS & CONTEXT</Text>
                <Text style={styles.counterText}>
                  {description.length}/{MAX_DESCRIPTION_LENGTH}
                </Text>
              </View>
              <TextInput
                style={[styles.formInput, styles.formInputArea]}
                placeholder="Describe your question, course details, or issue with specifics..."
                placeholderTextColor={BENTO_COLORS.subtleText}
                value={description}
                onChangeText={setDescription}
                maxLength={MAX_DESCRIPTION_LENGTH}
                multiline={true}
                textAlignVertical="top"
                accessible={true}
                accessibilityLabel="Question Description"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitPostBtn,
                isSubmitting && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Publish Question"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather
                    name="send"
                    size={16}
                    color="#ffffff"
                    style={styles.submitIcon}
                  />
                  <Text style={styles.submitPostBtnText}>Publish Question</Text>
                </>
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
  modalContainer: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: BENTO_COLORS.white,
    ...BENTO_COLORS.shadow,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeaderTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  headerSpacer: {
    width: 36,
  },
  modalScrollContent: {
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
    letterSpacing: 0.4,
  },
  counterText: {
    fontFamily,
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
    fontWeight: "600",
  },
  formInput: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: BENTO_COLORS.neutralText,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  formInputArea: {
    minHeight: 140,
    paddingTop: 14,
  },
  submitPostBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 16,
    borderRadius: BENTO_COLORS.pillRadius,
    marginTop: 10,
    ...BENTO_COLORS.heroShadow,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitPostBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
