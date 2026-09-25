import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
  Keyboard,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { useUpdateLostFoundPost } from "@/features/campus-hub/useLostFound";
import {
  uploadMultipleImages,
  CLOUDINARY_FOLDERS,
} from "@/services/cloudinary-service";
import type {
  LostFoundType,
  LostFoundCategory,
  LostFoundPost,
  CreateLostFoundInput,
} from "@/services/lost-found-service";
import { CAMPUS_HUB_COLORS, fontFamily } from "../shared/design-tokens";
import { ImagePickerRow } from "../shared/image-picker-row";

interface EditLostFoundModalProps {
  visible: boolean;
  onClose: () => void;
  post: LostFoundPost;
}

const CATEGORIES: { key: LostFoundCategory; label: string }[] = [
  { key: "BOOKS", label: "Books" },
  { key: "ELECTRONICS", label: "Electronics" },
  { key: "ID_CARD", label: "ID Card" },
  { key: "KEYS", label: "Keys" },
  { key: "CLOTHING", label: "Clothing" },
  { key: "OTHER", label: "Other" },
];

const ACCENT = CAMPUS_HUB_COLORS.lostFoundAccent;

interface FormState {
  type: LostFoundType;
  title: string;
  description: string;
  category: LostFoundCategory;
  location: string;
  images: string[];
  verificationQuestion: string;
  verificationAnswer: string;
}

export const EditLostFoundModal = React.memo(function EditLostFoundModal({
  visible,
  onClose,
  post,
}: EditLostFoundModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const defaultHeight = Math.round(windowHeight * 0.88);
  const maxAllowedWithKeyboard =
    windowHeight - keyboardHeight - Math.max(insets.top, 24) - 12;
  const sheetHeight =
    keyboardHeight > 0
      ? Math.max(280, Math.min(defaultHeight, maxAllowedWithKeyboard))
      : Math.min(defaultHeight, windowHeight - Math.max(insets.top, 24) - 16);

  const [form, setForm] = useState<FormState>({
    type: post.type,
    title: post.title,
    description: post.description,
    category: post.category,
    location: post.location,
    images: post.images || [],
    verificationQuestion: post.verificationQuestion || "",
    verificationAnswer: post.verificationAnswer || "",
  });

  useEffect(() => {
    if (visible && post) {
      setForm({
        type: post.type,
        title: post.title,
        description: post.description,
        category: post.category,
        location: post.location,
        images: post.images || [],
        verificationQuestion: post.verificationQuestion || "",
        verificationAnswer: post.verificationAnswer || "",
      });
    }
  }, [visible, post]);

  const [isUploading, setIsUploading] = useState(false);
  const updateMutation = useUpdateLostFoundPost();
  const isSubmitting = isUploading || updateMutation.isPending;

  const update = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  const canSubmit =
    form.title.trim().length > 0 &&
    form.description.trim().length > 0 &&
    form.location.trim().length > 0 &&
    !isSubmitting;

  const handleSubmit = useCallback(async () => {
    if (!form.title.trim()) {
      return Toast.show({ type: "error", text1: "Title is required." });
    }
    if (!form.description.trim()) {
      return Toast.show({ type: "error", text1: "Description is required." });
    }
    if (!form.location.trim()) {
      return Toast.show({ type: "error", text1: "Location is required." });
    }

    let finalImages: string[] = [];
    const existingRemote = form.images.filter((img) => img.startsWith("http"));
    const newlyAdded = form.images.filter((img) => !img.startsWith("http"));

    finalImages = [...existingRemote];

    if (newlyAdded.length > 0) {
      setIsUploading(true);
      try {
        const results = await uploadMultipleImages(
          newlyAdded,
          CLOUDINARY_FOLDERS.CAMPUS_HUB.LOST_FOUND,
        );
        finalImages = [...finalImages, ...results.map((r) => r.secureUrl)];
      } catch {
        setIsUploading(false);
        return Toast.show({
          type: "error",
          text1: "Image upload failed",
          text2: "Check your connection or Cloudinary configuration.",
        });
      }
      setIsUploading(false);
    }

    const payload: Partial<CreateLostFoundInput> = {
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      location: form.location.trim(),
      images: finalImages,
      verificationQuestion:
        form.type === "FOUND" && form.verificationQuestion.trim()
          ? form.verificationQuestion.trim()
          : null,
      verificationAnswer:
        form.type === "FOUND" && form.verificationAnswer.trim()
          ? form.verificationAnswer.trim()
          : null,
    };

    updateMutation.mutate(
      { id: post.id, data: payload },
      {
        onSuccess: () => {
          Toast.show({ type: "success", text1: "Post updated successfully!" });
          handleClose();
        },
        onError: (err: any) =>
          Toast.show({
            type: "error",
            text1: "Failed to update",
            text2: err.message ?? "Please try again.",
          }),
      },
    );
  }, [form, post.id, updateMutation, handleClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.overlay}>
        {/* Tap outside backdrop to dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
          accessible={false}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoid}
        >
          <View style={[styles.sheet, { height: sheetHeight }]}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeBtn}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Close edit modal"
                activeOpacity={0.7}
              >
                <Feather
                  name="x"
                  size={20}
                  color={CAMPUS_HUB_COLORS.deepNavy}
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Edit Lost & Found Post</Text>
              <View style={styles.headerPlaceholder} />
            </View>

            {/* Scrollable Form Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Type Toggle: I Lost Something vs I Found Something */}
              <View style={styles.typeSegment}>
                <TouchableOpacity
                  style={[
                    styles.typeSegmentBtn,
                    form.type === "LOST" && styles.typeSegmentBtnLostActive,
                  ]}
                  onPress={() => update("type", "LOST")}
                  activeOpacity={0.8}
                  accessible
                  accessibilityRole="radio"
                  accessibilityState={{ checked: form.type === "LOST" }}
                  accessibilityLabel="I Lost Something"
                >
                  <Feather
                    name="search"
                    size={14}
                    color={
                      form.type === "LOST"
                        ? CAMPUS_HUB_COLORS.dangerText
                        : CAMPUS_HUB_COLORS.subtleText
                    }
                    style={styles.btnIconSpacing}
                  />
                  <Text
                    style={[
                      styles.typeSegmentText,
                      form.type === "LOST" && styles.typeSegmentTextLostActive,
                    ]}
                  >
                    I Lost Something
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeSegmentBtn,
                    form.type === "FOUND" && styles.typeSegmentBtnFoundActive,
                  ]}
                  onPress={() => update("type", "FOUND")}
                  activeOpacity={0.8}
                  accessible
                  accessibilityRole="radio"
                  accessibilityState={{ checked: form.type === "FOUND" }}
                  accessibilityLabel="I Found Something"
                >
                  <Feather
                    name="gift"
                    size={14}
                    color={
                      form.type === "FOUND"
                        ? CAMPUS_HUB_COLORS.marketplaceAccentText
                        : CAMPUS_HUB_COLORS.subtleText
                    }
                    style={styles.btnIconSpacing}
                  />
                  <Text
                    style={[
                      styles.typeSegmentText,
                      form.type === "FOUND" &&
                        styles.typeSegmentTextFoundActive,
                    ]}
                  >
                    I Found Something
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Title Input */}
              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>TITLE</Text>
                  <Text style={styles.counterText}>
                    {form.title.length}/100
                  </Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="What did you lose or find?"
                  placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                  value={form.title}
                  onChangeText={(v) => update("title", v)}
                  maxLength={100}
                  accessible
                  accessibilityLabel="Post title"
                  returnKeyType="next"
                />
              </View>

              {/* Description Input */}
              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>DESCRIPTION</Text>
                  <Text style={styles.counterText}>
                    {form.description.length}/1000
                  </Text>
                </View>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the item in detail (color, brand, distinguishing marks)..."
                  placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                  value={form.description}
                  onChangeText={(v) => update("description", v)}
                  maxLength={1000}
                  multiline
                  textAlignVertical="top"
                  accessible
                  accessibilityLabel="Post description"
                />
              </View>

              {/* Category Pills */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>CATEGORY</Text>
                <View style={styles.chipRow}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = form.category === cat.key;
                    return (
                      <TouchableOpacity
                        key={cat.key}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onPress={() => update("category", cat.key)}
                        activeOpacity={0.8}
                        accessible
                        accessibilityRole="radio"
                        accessibilityState={{ checked: isSelected }}
                        accessibilityLabel={cat.label}
                      >
                        {isSelected && (
                          <Feather
                            name="check"
                            size={12}
                            color="#ffffff"
                            style={styles.chipCheckIcon}
                          />
                        )}
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextSelected,
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Location Input */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>LOCATION</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Where was it lost or found? (e.g. Library 2nd Floor, Room 302)"
                  placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                  value={form.location}
                  onChangeText={(v) => update("location", v)}
                  maxLength={100}
                  accessible
                  accessibilityLabel="Location"
                />
              </View>

              {/* Ownership Verification (Only when Found) */}
              {form.type === "FOUND" && (
                <View style={styles.verificationCard}>
                  <View style={styles.verificationTitleRow}>
                    <Feather name="shield" size={15} color="#0284c7" />
                    <Text style={styles.verificationTitle}>
                      OWNERSHIP VERIFICATION (RECOMMENDED)
                    </Text>
                  </View>
                  <Text style={styles.verificationHint}>
                    Ask a secret question only the genuine owner can answer
                    (e.g. "What sticker is on the back?" or "What is in the
                    pocket?").
                  </Text>

                  <TextInput
                    style={styles.input}
                    placeholder="Verification question for claimant..."
                    placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                    value={form.verificationQuestion}
                    onChangeText={(v) => update("verificationQuestion", v)}
                    maxLength={200}
                    accessible
                    accessibilityLabel="Verification question"
                  />

                  <TextInput
                    style={[styles.input, styles.secretInputMargin]}
                    placeholder="Expected answer (private, only visible to you)..."
                    placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                    value={form.verificationAnswer}
                    onChangeText={(v) => update("verificationAnswer", v)}
                    maxLength={200}
                    accessible
                    accessibilityLabel="Secret expected answer"
                  />
                </View>
              )}

              {/* Photo Upload Section */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>PHOTOS (MAX 4)</Text>
                <ImagePickerRow
                  images={form.images}
                  onImagesChange={(imgs) => update("images", imgs)}
                  maxImages={4}
                  accent={ACCENT}
                />
              </View>
            </ScrollView>

            {/* Bottom Docked Action Footer with Safe Area */}
            <View
              style={[
                styles.modalFooter,
                {
                  paddingBottom:
                    keyboardHeight > 0 ? 14 : Math.max(insets.bottom, 16),
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!canSubmit || isSubmitting) && styles.submitBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                activeOpacity={0.8}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Save post changes"
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Feather
                      name="check"
                      size={16}
                      color="#ffffff"
                      style={styles.submitIconSpacing}
                    />
                    <Text style={styles.submitBtnText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 15, 29, 0.65)",
    justifyContent: "flex-end",
  },
  keyboardAvoid: {
    width: "100%",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  scrollView: {
    flex: 1,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  headerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerPlaceholder: {
    width: 36,
  },
  btnIconSpacing: {
    marginRight: 6,
  },
  chipCheckIcon: {
    marginRight: 4,
  },
  secretInputMargin: {
    marginTop: 8,
  },
  submitIconSpacing: {
    marginRight: 8,
  },
  scroll: {
    padding: 20,
    gap: 18,
    paddingBottom: 24,
  },
  typeSegment: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  typeSegmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 11,
  },
  typeSegmentBtnLostActive: {
    backgroundColor: CAMPUS_HUB_COLORS.dangerBg,
  },
  typeSegmentBtnFoundActive: {
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight,
  },
  typeSegmentText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  typeSegmentTextLostActive: {
    color: CAMPUS_HUB_COLORS.dangerText,
    fontWeight: "800",
  },
  typeSegmentTextFoundActive: {
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
    fontWeight: "800",
  },
  formGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.6,
  },
  counterText: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  input: {
    fontFamily,
    fontSize: 14,
    color: CAMPUS_HUB_COLORS.deepNavy,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  textArea: {
    minHeight: 90,
    paddingTop: 11,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipSelected: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  chipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  chipTextSelected: {
    color: "#ffffff",
    fontWeight: "800",
  },
  verificationCard: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  verificationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verificationTitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#0284c7",
    letterSpacing: 0.5,
  },
  verificationHint: {
    fontFamily,
    fontSize: 12,
    color: "#0369a1",
    lineHeight: 17,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 14,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
});
