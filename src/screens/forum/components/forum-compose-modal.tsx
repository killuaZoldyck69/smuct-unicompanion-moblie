// src/screens/forum/components/forum-compose-modal.tsx
import React, { memo, useCallback } from "react";
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
  StatusBar,
  Keyboard,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ui/toast-config";

import {
  BENTO_COLORS,
  fontFamily,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} from "../constants";
import { useComposePostForm } from "../hooks/use-compose-post-form";
import { ForumWysiwygEditor } from "./forum-wysiwyg-editor";

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
  const insets = useSafeAreaInsets();

  const {
    title,
    setTitle,
    description,
    setDescription,
    plainText,
    isSubmitting,
    handleSubmit,
    resetForm,
  } = useComposePostForm({
    onSuccess: () => {
      Keyboard.dismiss();
      onSuccess?.();
      onClose();
    },
  });

  const hasContent =
    title.trim().length > 0 || (plainText && plainText.trim().length > 0);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    if (hasContent) {
      Alert.alert(
        "Discard Question?",
        "You have unsaved text in your question. Are you sure you want to discard it?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              resetForm();
              onClose();
            },
          },
        ],
      );
    } else {
      resetForm();
      onClose();
    }
  }, [hasContent, resetForm, onClose]);

  const canSubmit =
    title.trim().length >= 5 && plainText.trim().length >= 10 && !isSubmitting;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={true}
      />
      <SafeAreaView
        style={styles.fullScreenContainer}
        edges={["top", "bottom"]}
      >
        {/* ── Top Header Navigation Bar ── */}
        <View style={styles.topHeader}>
          {/* Title & Forum Badge - Left Aligned */}
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>Ask a Question</Text>
            <View style={styles.forumBadge}>
              <Text style={styles.forumBadgeText}>CAMPUS FORUM</Text>
            </View>
          </View>

          {/* Close / Dismiss Button on Right (replaces top Post button) */}
          <TouchableOpacity
            onPress={handleClose}
            style={styles.circleBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close compose question"
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x" size={20} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>

        {/* ── Form Scrollable Content ── */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Question Title Field */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <View style={styles.labelWithRequired}>
                  <Text style={styles.formLabel}>QUESTION TITLE</Text>
                  <Text style={styles.requiredAsterisk}>*</Text>
                </View>
                <Text
                  style={[
                    styles.counterText,
                    title.length > MAX_TITLE_LENGTH * 0.9 &&
                      styles.counterWarning,
                  ]}
                >
                  {title.length}/{MAX_TITLE_LENGTH}
                </Text>
              </View>
              <TextInput
                style={styles.titleInput}
                placeholder="What do you need help with?"
                placeholderTextColor={BENTO_COLORS.subtleText}
                value={title}
                onChangeText={setTitle}
                maxLength={MAX_TITLE_LENGTH}
                accessible={true}
                accessibilityLabel="Question Title"
                returnKeyType="next"
              />
            </View>

            {/* Details & Context Field (WYSIWYG Rich Formatter) */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <View style={styles.labelWithRequired}>
                  <Text style={styles.formLabel}>DETAILS & CONTEXT</Text>
                  <Text style={styles.requiredAsterisk}>*</Text>
                </View>
                <View style={styles.labelRightGroup}>
                  {plainText.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setDescription("", "")}
                      style={styles.clearBtn}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Clear description text"
                    >
                      <Feather
                        name="x-circle"
                        size={12}
                        color="#64748b"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.clearBtnText}>Clear</Text>
                    </TouchableOpacity>
                  )}
                  <Text
                    style={[
                      styles.counterText,
                      plainText.length > MAX_DESCRIPTION_LENGTH * 0.9 &&
                        styles.counterWarning,
                    ]}
                  >
                    {plainText.length}/{MAX_DESCRIPTION_LENGTH}
                  </Text>
                </View>
              </View>

              {/* Rich Text WYSIWYG Formatter */}
              <ForumWysiwygEditor
                initialValue={description}
                onChange={(html, plain) => setDescription(html, plain)}
                minHeight={260}
                placeholder="Describe your question, course details, or issue with specifics... Select any text to apply Bold, Italic, Underline, Bullet Lists, or Justify alignment."
              />
            </View>
          </ScrollView>

          {/* ── Bottom Docked Action Footer ── */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={[
                styles.submitPostBtn,
                (!canSubmit || isSubmitting) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit || isSubmitting}
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
          </View>
        </KeyboardAvoidingView>

        {/* ── Toast Overlay Inside Modal (Ensures error toasts are visible in full-screen) ── */}
        <Toast config={toastConfig} topOffset={Math.max(insets.top + 8, 44)} />
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#ffffff",
  },
  headerTitleGroup: {
    alignItems: "flex-start",
  },
  headerTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  forumBadge: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
    alignSelf: "flex-start",
  },
  forumBadgeText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#0369a1",
    letterSpacing: 0.6,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
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
  labelWithRequired: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  formLabel: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: 0.5,
  },
  requiredAsterisk: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ef4444",
  },
  labelRightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },
  clearBtnText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  counterText: {
    fontFamily,
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
    fontWeight: "600",
  },
  counterWarning: {
    color: "#f59e0b",
    fontWeight: "700",
  },
  titleInput: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily,
    fontSize: 15,
    fontWeight: "600",
    color: BENTO_COLORS.neutralText,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
  },
  footerContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 14 : 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    ...BENTO_COLORS.shadow,
  },
  submitPostBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 14,
    borderRadius: 14,
    ...BENTO_COLORS.heroShadow,
  },
  submitBtnDisabled: {
    backgroundColor: "#94a3b8",
    opacity: 0.65,
    elevation: 0,
    shadowOpacity: 0,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitPostBtnText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
});
