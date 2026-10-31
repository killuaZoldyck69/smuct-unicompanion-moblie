import React, { useState, useCallback } from "react";
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
  Keyboard,
  StatusBar,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ui/toast-config";

import { useCreateLostFoundPost } from "@/features/campus-hub/useLostFound";
import {
  uploadMultipleImages,
  deleteFileFromCloudinaryApi,
  CLOUDINARY_FOLDERS,
} from "@/services/cloudinary-service";
import type {
  LostFoundType,
  LostFoundCategory,
  CreateLostFoundInput,
} from "@/services/lost-found-service";
import type { User } from "@/types/auth";
import { CAMPUS_HUB_COLORS, fontFamily } from "../shared/design-tokens";
import { ImagePickerRow } from "../shared/image-picker-row";

interface ComposeLostFoundModalProps {
  visible: boolean;
  onClose: () => void;
  currentUser?: User | null;
}

const CATEGORIES: { key: LostFoundCategory; label: string }[] = [
  { key: "ID_CARD", label: "ID Card" },
  { key: "ELECTRONICS", label: "Electronics" },
  { key: "KEYS", label: "Keys" },
  { key: "WALLET", label: "Wallet" },
  { key: "BAGS", label: "Bags" },
  { key: "BOOKS", label: "Books" },
  { key: "DOCUMENTS", label: "Documents" },
  { key: "ACCESSORIES", label: "Accessories" },
  { key: "CLOTHING", label: "Clothing" },
  { key: "STATIONERY", label: "Stationery" },
  { key: "UMBRELLA", label: "Umbrella" },
  { key: "BOTTLE", label: "Bottle" },
  { key: "OTHER", label: "Other" },
];

const ACCENT = CAMPUS_HUB_COLORS.lostFoundAccent;

interface FormState {
  type: LostFoundType;
  title: string;
  description: string;
  category: LostFoundCategory;
  location: string;
  localImages: string[];
  verificationQuestion: string;
  verificationAnswer: string;
}

const INITIAL_FORM: FormState = {
  type: "LOST",
  title: "",
  description: "",
  category: "OTHER",
  location: "",
  localImages: [],
  verificationQuestion: "",
  verificationAnswer: "",
};

export const ComposeLostFoundModal = React.memo(function ComposeLostFoundModal({
  visible,
  onClose,
}: ComposeLostFoundModalProps) {
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isUploading, setIsUploading] = useState(false);
  // Maps localUri -> uploaded Cloudinary secureUrl to avoid re-uploading on retry
  const [uploadedImageMap, setUploadedImageMap] = useState<Record<string, string>>({});

  const createMutation = useCreateLostFoundPost();
  const isSubmitting = isUploading || createMutation.isPending;

  const update = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const hasContent =
    form.title.trim().length > 0 ||
    form.description.trim().length > 0 ||
    form.location.trim().length > 0 ||
    form.localImages.length > 0 ||
    form.verificationQuestion.trim().length > 0;

  const cleanupUploadedImages = useCallback(() => {
    const urls = Object.values(uploadedImageMap);
    if (urls.length > 0) {
      urls.forEach((url) => {
        deleteFileFromCloudinaryApi(url, "image").catch(() => {});
      });
    }
    setUploadedImageMap({});
  }, [uploadedImageMap]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    if (hasContent) {
      Alert.alert(
        "Discard Post?",
        "You have unsaved details in your post. Are you sure you want to discard them?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              cleanupUploadedImages();
              setForm(INITIAL_FORM);
              onClose();
            },
          },
        ],
      );
    } else {
      cleanupUploadedImages();
      setForm(INITIAL_FORM);
      onClose();
    }
  }, [hasContent, onClose, cleanupUploadedImages]);

  const canSubmit = form.title.trim().length > 0;

  const handleSubmit = useCallback(async () => {
    if (!form.title.trim()) {
      return Toast.show({
        type: "error",
        text1: "Title Required",
        text2: "Please enter an item title.",
      });
    }

    if (form.localImages.length > 2) {
      return Toast.show({
        type: "error",
        text1: "Photo Limit Exceeded",
        text2: "Maximum 2 photos can be attached to a Lost & Found post.",
      });
    }

    let imageUrls: string[] = [];

    if (form.localImages.length > 0) {
      // Validate file sizes on device before uploading
      for (let i = 0; i < form.localImages.length; i++) {
        const uri = form.localImages[i];
        try {
          const info = await FileSystem.getInfoAsync(uri);
          if (
            info.exists &&
            typeof (info as any).size === "number" &&
            (info as any).size > 5 * 1024 * 1024
          ) {
            return Toast.show({
              type: "error",
              text1: "Photo Exceeds 5MB",
              text2: `Photo ${i + 1} exceeds the 5MB size limit. Please choose a smaller photo.`,
            });
          }
        } catch {
          // File check fallback
        }
      }

      // Upload newly added images while reusing previously uploaded ones
      let currentMap = { ...uploadedImageMap };
      const pendingUris = form.localImages.filter((uri) => !currentMap[uri]);

      if (pendingUris.length > 0) {
        setIsUploading(true);
        try {
          const results = await uploadMultipleImages(
            pendingUris,
            CLOUDINARY_FOLDERS.CAMPUS_HUB.LOST_FOUND,
          );
          results.forEach((r, idx) => {
            currentMap[pendingUris[idx]] = r.secureUrl;
          });
          setUploadedImageMap(currentMap);
        } catch (err: any) {
          setIsUploading(false);
          const errMsg =
            err?.response?.data?.message ||
            err?.message ||
            "Check your connection or try again.";
          return Toast.show({
            type: "error",
            text1: "Image Upload Failed",
            text2: errMsg,
          });
        }
        setIsUploading(false);
      }

      imageUrls = form.localImages
        .map((uri) => currentMap[uri])
        .filter(Boolean);
    }

    const payload: CreateLostFoundInput = {
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      category: form.category,
      location: form.location.trim() || undefined,
      images: imageUrls,
      verificationQuestion:
        form.type === "FOUND" && form.verificationQuestion.trim()
          ? form.verificationQuestion.trim()
          : null,
      verificationAnswer:
        form.type === "FOUND" && form.verificationAnswer.trim()
          ? form.verificationAnswer.trim()
          : null,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        Keyboard.dismiss();
        setUploadedImageMap({});
        setForm(INITIAL_FORM);
        onClose();
        setTimeout(() => {
          Toast.show({
            type: "success",
            text1: "Post Published!",
            text2: "Your Lost & Found post is now live.",
          });
        }, 350);
      },
      onError: (err: any) => {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Please check your input and try again.";
        Toast.show({
          type: "error",
          text1: "Failed to publish",
          text2: message,
        });
      },
    });
  }, [form, createMutation, onClose, uploadedImageMap]);

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
          {/* Title & Hub Badge - Left Aligned */}
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>Lost & Found Post</Text>
            <View style={styles.hubBadge}>
              <Text style={styles.hubBadgeText}>CAMPUS HUB</Text>
            </View>
          </View>

          {/* Close Button on Right */}
          <TouchableOpacity
            onPress={handleClose}
            style={styles.circleBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close compose modal"
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x" size={18} color={CAMPUS_HUB_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoid}
        >
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
                  size={15}
                  color={
                    form.type === "LOST"
                      ? CAMPUS_HUB_COLORS.dangerText
                      : CAMPUS_HUB_COLORS.subtleText
                  }
                  style={{ marginRight: 6 }}
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
                  size={15}
                  color={
                    form.type === "FOUND"
                      ? CAMPUS_HUB_COLORS.marketplaceAccentText
                      : CAMPUS_HUB_COLORS.subtleText
                  }
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.typeSegmentText,
                    form.type === "FOUND" && styles.typeSegmentTextFoundActive,
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
                <Text style={styles.counterText}>{form.title.length}/100</Text>
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
                <Text style={styles.label}>DESCRIPTION (OPTIONAL)</Text>
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
                          style={{ marginRight: 4 }}
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
              <Text style={styles.label}>LOCATION (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="Where was it lost or found?"
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
                  Ask a secret question only the genuine owner can answer (e.g.
                  "What sticker is on the back?" or "What is in the pocket?").
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
                  style={[styles.input, { marginTop: 8 }]}
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
              <ImagePickerRow
                images={form.localImages}
                onImagesChange={(imgs) => {
                  const currentSet = new Set(imgs);
                  Object.entries(uploadedImageMap).forEach(([localUri, remoteUrl]) => {
                    if (!currentSet.has(localUri)) {
                      deleteFileFromCloudinaryApi(remoteUrl, "image").catch(() => {});
                      setUploadedImageMap((prev) => {
                        const next = { ...prev };
                        delete next[localUri];
                        return next;
                      });
                    }
                  });
                  update("localImages", imgs);
                }}
                maxImages={2}
                maxSizeBytes={5 * 1024 * 1024}
                accent={ACCENT}
              />
            </View>
          </ScrollView>

          {/* Bottom Docked Action Footer with Safe Area */}
          <View style={styles.modalFooter}>
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
              accessibilityLabel="Publish post"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather
                    name="send"
                    size={16}
                    color="#ffffff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.submitBtnText}>Publish Post</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Embedded Toast Overlay for Modal Viewport */}
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  hubBadge: {
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hubBadgeText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.lostFoundAccentText,
    letterSpacing: 0.5,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingBottom: 28,
  },
  typeSegment: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  typeSegmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    backgroundColor: CAMPUS_HUB_COLORS.white,
  },
  typeSegmentBtnLostActive: {
    backgroundColor: CAMPUS_HUB_COLORS.dangerBg,
    borderColor: CAMPUS_HUB_COLORS.dangerText,
  },
  typeSegmentBtnFoundActive: {
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight,
    borderColor: CAMPUS_HUB_COLORS.marketplaceAccent,
  },
  typeSegmentText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  typeSegmentTextLostActive: {
    color: CAMPUS_HUB_COLORS.dangerText,
  },
  typeSegmentTextFoundActive: {
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
  },
  formGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.5,
  },
  counterText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  input: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.neutralText,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chipSelected: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  chipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  chipTextSelected: {
    color: "#ffffff",
  },
  verificationCard: {
    backgroundColor: "#f0f9ff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#bae6fd",
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
    letterSpacing: 0.4,
  },
  verificationHint: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: "#0284c7",
    lineHeight: 16,
    marginBottom: 4,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 14 : 16,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT,
    height: 50,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  submitBtnDisabled: {
    backgroundColor: "#cbd5e1",
    opacity: 0.65,
    elevation: 0,
    shadowOpacity: 0,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
});
