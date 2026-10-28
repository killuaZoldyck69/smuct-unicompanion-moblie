// src/screens/forum/components/detail/discussion-edit-modal.tsx
import React, { memo, useState, useEffect, useRef, useCallback } from "react";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ui/toast-config";

import {
  BENTO_COLORS,
  fontFamily,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} from "../../constants";
import { ForumWysiwygEditor } from "../forum-wysiwyg-editor";

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
  const insets = useSafeAreaInsets();

  const [plainText, setPlainText] = useState(() =>
    (form.description || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );

  const initialTitleRef = useRef(form.title);
  const initialDescRef = useRef(form.description);

  useEffect(() => {
    if (visible) {
      initialTitleRef.current = form.title;
      initialDescRef.current = form.description;
    }
  }, [visible]);

  useEffect(() => {
    const extracted = (form.description || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    setPlainText(extracted);
  }, [form.description]);

  const handleChangeDescription = useCallback(
    (html: string, plain: string) => {
      setPlainText(plain);
      onChangeDescription(html);
    },
    [onChangeDescription],
  );

  const isDirty =
    form.title !== initialTitleRef.current ||
    form.description !== initialDescRef.current;

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    if (isDirty) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved edits to this question. Are you sure you want to discard them?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: onClose,
          },
        ],
      );
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const canSave =
    form.title.trim().length >= 5 &&
    plainText.trim().length >= 10 &&
    !isSaving;

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
            <Text style={styles.headerTitle}>Edit Question</Text>
            <View style={styles.forumBadge}>
              <Text style={styles.forumBadgeText}>CAMPUS FORUM</Text>
            </View>
          </View>

          {/* Close / Dismiss Button on Right */}
          <TouchableOpacity
            onPress={handleClose}
            style={styles.circleBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close edit question"
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
                    form.title.length > MAX_TITLE_LENGTH * 0.9 &&
                      styles.counterWarning,
                  ]}
                >
                  {form.title.length}/{MAX_TITLE_LENGTH}
                </Text>
              </View>
              <TextInput
                style={styles.titleInput}
                placeholder="What do you need help with? (e.g., CSE 311 Assignment 2)"
                placeholderTextColor={BENTO_COLORS.subtleText}
                value={form.title}
                onChangeText={onChangeTitle}
                maxLength={MAX_TITLE_LENGTH}
                accessible={true}
                accessibilityLabel="Edit Question Title"
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
                      onPress={() => handleChangeDescription("", "")}
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
                initialValue={form.description}
                onChange={handleChangeDescription}
                minHeight={260}
                placeholder="Describe your question, course details, or issue with specifics... Select any text to apply Bold, Italic, Underline, Bullet Lists, or Justify alignment."
              />
            </View>
          </ScrollView>

          {/* ── Bottom Docked Action Footer ── */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={[
                styles.saveEditBtn,
                (!canSave || isSaving) && styles.saveBtnDisabled,
              ]}
              onPress={onSave}
              disabled={!canSave || isSaving}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Save question changes"
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather
                    name="check-circle"
                    size={16}
                    color="#ffffff"
                    style={styles.submitIcon}
                  />
                  <Text style={styles.saveEditBtnText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* ── Toast Overlay Inside Modal ── */}
        <Toast
          config={toastConfig}
          topOffset={Math.max(insets.top + 8, 44)}
        />
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
  saveEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 14,
    borderRadius: 14,
    ...BENTO_COLORS.heroShadow,
  },
  saveBtnDisabled: {
    backgroundColor: "#94a3b8",
    opacity: 0.65,
    elevation: 0,
    shadowOpacity: 0,
  },
  submitIcon: {
    marginRight: 8,
  },
  saveEditBtnText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
});
