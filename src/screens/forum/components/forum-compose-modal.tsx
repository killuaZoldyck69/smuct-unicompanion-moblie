// src/screens/forum/components/forum-compose-modal.tsx
import React, { memo, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
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
  ModalKeyboardAvoidingView,
  useSoftKeyboardOpen,
} from "@/components/ui/modal-keyboard-avoider";
import { colors } from "@/theme/colors";

import {
  BENTO_COLORS,
  fontFamily,
  titleFontFamily,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} from "../constants";
import { useComposePostForm } from "../hooks/use-compose-post-form";
import { ForumWysiwygEditor } from "./forum-wysiwyg-editor";
import { UgcGuidelinesModal } from "./ugc/ugc-guidelines-modal";

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
  const isKeyboardOpen = useSoftKeyboardOpen(visible);

  const {
    title,
    setTitle,
    description,
    setDescription,
    plainText,
    isOffline,
    isSubmitting,
    isGuidelinesModalVisible,
    setIsGuidelinesModalVisible,
    isAcceptingGuidelines,
    handleAcceptGuidelines,
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
        backgroundColor={BENTO_COLORS.white}
        translucent={true}
      />
      <SafeAreaView
        style={styles.fullScreenContainer}
        edges={["top"]}
      >
        {/* ── Top Header Navigation Bar ── */}
        <View style={styles.topHeaderBar}>
          <View style={styles.topHeaderInner}>
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
        </View>

        {/* ── Form Scrollable Content ── */}
        <ModalKeyboardAvoidingView
          enabled={visible}
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
                        color={BENTO_COLORS.subtleText}
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
          <View
            style={[
              styles.footerContainer,
              { paddingBottom: isKeyboardOpen ? 12 : Math.max(insets.bottom, 16) },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.submitPostBtn,
                styles.centeredContent,
                (!canSubmit || isSubmitting) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSubmit || isSubmitting }}
              accessibilityLabel="Publish Question"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Feather
                    name="send"
                    size={16}
                    color={!canSubmit ? colors.slate600 : colors.white}
                    style={styles.submitIcon}
                  />
                  <Text
                    style={[
                      styles.submitPostBtnText,
                      !canSubmit && styles.submitPostBtnTextDisabled,
                    ]}
                  >
                    Publish Question
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ModalKeyboardAvoidingView>

        {/* ── Community Guidelines Consent Gate (inline overlay avoids stacked RN Modals on iOS) ── */}
        <UgcGuidelinesModal
          visible={isGuidelinesModalVisible}
          onClose={() => setIsGuidelinesModalVisible(false)}
          onAccept={handleAcceptGuidelines}
          isSubmitting={isAcceptingGuidelines}
          isOffline={isOffline}
          renderInline={true}
        />

        {/* ── Toast Overlay Inside Modal (Ensures error toasts are visible in full-screen) ── */}
        <Toast config={toastConfig} topOffset={Math.max(insets.top + 8, 44)} />
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: BENTO_COLORS.white,
  },
  topHeaderBar: {
    borderBottomWidth: 1,
    borderBottomColor: BENTO_COLORS.cardBorder,
    backgroundColor: BENTO_COLORS.white,
  },
  topHeaderInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: "100%",
    maxWidth: BENTO_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  centeredContent: {
    width: "100%",
    maxWidth: BENTO_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  headerTitleGroup: {
    alignItems: "flex-start",
  },
  headerTitle: {
    fontFamily: titleFontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  forumBadge: {
    backgroundColor: BENTO_COLORS.skyBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
    alignSelf: "flex-start",
  },
  forumBadgeText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: BENTO_COLORS.sky,
    letterSpacing: 0.6,
    includeFontPadding: false,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.slate100,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    width: "100%",
    maxWidth: BENTO_COLORS.contentMaxWidth,
    alignSelf: "center",
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
    color: colors.semantic.red.accent,
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
    backgroundColor: colors.slate200,
  },
  clearBtnText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: colors.slate600,
    includeFontPadding: false,
  },
  counterText: {
    fontFamily,
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
    fontWeight: "600",
    includeFontPadding: false,
    fontVariant: ["tabular-nums"],
  },
  counterWarning: {
    color: colors.semantic.amber.deep,
    fontWeight: "700",
  },
  titleInput: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily,
    fontSize: 15,
    fontWeight: "600",
    color: BENTO_COLORS.neutralText,
    borderWidth: 1,
    borderColor: BENTO_COLORS.cardBorder,
  },
  footerContainer: {
    backgroundColor: BENTO_COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: BENTO_COLORS.cardBorder,
    ...BENTO_COLORS.footerShadow,
  },
  submitPostBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 12,
    borderRadius: BENTO_COLORS.pillRadius,
    ...BENTO_COLORS.shadow,
  },
  submitBtnDisabled: {
    backgroundColor: colors.slate200,
    borderWidth: 1,
    borderColor: colors.slate300,
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
    color: colors.white,
    includeFontPadding: false,
  },
  submitPostBtnTextDisabled: {
    color: colors.slate600,
  },
});
