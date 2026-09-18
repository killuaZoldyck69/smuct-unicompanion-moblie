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
  MAX_RESPONSE_LENGTH,
} from "../../constants";

interface DiscussionEditResponseModalProps {
  visible: boolean;
  content: string;
  onChangeContent: (text: string) => void;
  onSave: () => void;
  onClose: () => void;
  isSaving: boolean;
}

export const DiscussionEditResponseModal = memo(
  function DiscussionEditResponseModal({
    visible,
    content,
    onChangeContent,
    onSave,
    onClose,
    isSaving,
  }: DiscussionEditResponseModalProps) {
    const canSave = content.trim().length > 0 && !isSaving;

    return (
      <Modal
        visible={visible}
        animationType="slide"
        statusBarTranslucent={true}
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <SafeAreaView
          style={styles.modalContainer}
          edges={["top", "bottom"]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.flexOne}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cancel editing"
              >
                <Feather name="x" size={20} color={BENTO_COLORS.deepNavy} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Response</Text>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.formLabel}>YOUR RESPONSE</Text>
                  <Text style={styles.counterText}>
                    {content.length}/{MAX_RESPONSE_LENGTH}
                  </Text>
                </View>
                <TextInput
                  style={styles.formInputArea}
                  value={content}
                  onChangeText={onChangeContent}
                  multiline={true}
                  textAlignVertical="top"
                  maxLength={MAX_RESPONSE_LENGTH}
                  placeholder="Update your response..."
                  placeholderTextColor={BENTO_COLORS.subtleText}
                  accessible={true}
                  accessibilityLabel="Edit response content"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  !canSave && styles.saveBtnDisabled,
                ]}
                onPress={onSave}
                disabled={!canSave}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Update response"
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.saveBtnText}>Update Response</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: BENTO_COLORS.white,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BENTO_COLORS.subtleBorder,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BENTO_COLORS.slateBg,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  headerSpacer: {
    width: 36,
  },
  modalContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  formLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: BENTO_COLORS.subtleText,
  },
  counterText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
  },
  formInputArea: {
    fontFamily,
    fontSize: 15,
    fontWeight: "400",
    color: BENTO_COLORS.neutralText,
    backgroundColor: BENTO_COLORS.slateBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    minHeight: 140,
    lineHeight: 22,
  },
  saveBtn: {
    height: 48,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.deepNavy,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    ...BENTO_COLORS.shadow,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
});
