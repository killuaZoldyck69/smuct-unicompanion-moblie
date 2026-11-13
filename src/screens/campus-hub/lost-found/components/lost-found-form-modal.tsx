import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
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
import { useCurrentUser } from "@/hooks/use-current-user";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { extractApiErrorInfo } from "@/features/forum/forum-logic";
import {
  LOST_FOUND_CATEGORY_OPTIONS,
  LOST_FOUND_LIMITS,
  validateLostFoundForm,
} from "@/features/campus-hub/lost-found-logic";
import {
  useCreateLostFoundPost,
  useUpdateLostFoundPost,
} from "@/features/campus-hub/useLostFound";
import {
  deleteRemovedCloudinaryUploads,
  useUgcTermsRetry,
  validateLocalImageSizes,
} from "@/features/campus-hub/useLostFoundUpload";
import { UgcGuidelinesModal } from "@/screens/forum/components/ugc/ugc-guidelines-modal";
import {
  CLOUDINARY_FOLDERS,
  deleteFileFromCloudinaryApi,
  uploadMultipleImages,
} from "@/services/cloudinary-service";
import type {
  CreateLostFoundInput,
  LostFoundCategory,
  LostFoundPost,
  LostFoundType,
} from "@/services/lost-found-service";
import type { User } from "@/features/auth/types";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  titleFontFamily,
} from "../../shared/design-tokens";
import { ImagePickerRow } from "../../shared/image-picker-row";

export interface LostFoundFormModalProps {
  mode: "create" | "edit";
  visible: boolean;
  onClose: () => void;
  post?: LostFoundPost;
  isAuthor?: boolean;
  currentUser?: User | null;
  onSuccess?: (updatedPost?: LostFoundPost) => void;
}

const ACCENT = CAMPUS_HUB_COLORS.lostFoundAccent;
const ACCENT_FILL = CAMPUS_HUB_COLORS.lostFoundAccentFill;

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

const EMPTY_FORM: FormState = {
  type: "LOST",
  title: "",
  description: "",
  category: "OTHER",
  location: "",
  images: [],
  verificationQuestion: "",
  verificationAnswer: "",
};

function buildFormFromPost(post?: LostFoundPost): FormState {
  if (!post) return EMPTY_FORM;
  return {
    type: post.type,
    title: post.title,
    description: post.description ?? "",
    category: post.category,
    location: post.location ?? "",
    images: [...post.images],
    verificationQuestion: post.verificationQuestion ?? "",
    verificationAnswer: post.verificationAnswer ?? "",
  };
}

function areStringArraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((val, idx) => val === b[idx]);
}

export const LostFoundFormModal = React.memo(function LostFoundFormModal({
  mode,
  visible,
  onClose,
  post,
  isAuthor = true,
  currentUser: currentUserProp,
  onSuccess,
}: LostFoundFormModalProps) {
  const isEdit = mode === "edit";
  const canEditVerification = !isEdit || isAuthor;

  const insets = useSafeAreaInsets();
  const isKeyboardOpen = useSoftKeyboardOpen(visible);
  const { user: fetchedUser } = useCurrentUser();
  const currentUser = currentUserProp ?? fetchedUser;
  const { isOffline } = useNetworkStatus();

  const [form, setForm] = useState<FormState>(() => buildFormFromPost(post));
  const [isUploading, setIsUploading] = useState(false);
  // Track localUri -> Cloudinary URL across validation/UGC retries to avoid double-uploading.
  const [uploadedImageMap, setUploadedImageMap] = useState<
    Record<string, string>
  >({});

  const initialFormRef = useRef<FormState>(buildFormFromPost(post));
  const prevVisibleRef = useRef(false);
  const descriptionInputRef = useRef<TextInput>(null);
  const verificationQuestionRef = useRef<TextInput>(null);
  const verificationAnswerRef = useRef<TextInput>(null);

  const createMutation = useCreateLostFoundPost();
  const updateMutation = useUpdateLostFoundPost();
  const isSubmitting =
    isUploading || createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (visible && !prevVisibleRef.current) {
      const initial = isEdit ? buildFormFromPost(post) : EMPTY_FORM;
      setForm(initial);
      initialFormRef.current = initial;
      setUploadedImageMap({});
    }
    prevVisibleRef.current = visible;
  }, [visible, isEdit, post]);

  const updateField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const cleanupSessionUploads = useCallback(() => {
    Object.values(uploadedImageMap).forEach((url) => {
      deleteFileFromCloudinaryApi(url, "image").catch((err) => {
        console.warn("[Cloudinary] Failed to remove discarded image:", err);
      });
    });
    setUploadedImageMap({});
  }, [uploadedImageMap]);

  const executeCreate = useCallback(
    (payload: CreateLostFoundInput) => {
      ugcRetry.queuePayload(payload);
      createMutation.mutate(payload, {
        onSuccess: () => {
          ugcRetry.clearQueuedPayload();
          Keyboard.dismiss();
          setUploadedImageMap({});
          setForm(EMPTY_FORM);
          onClose();
          setTimeout(() => {
            Toast.show({
              type: "success",
              text1: "Post Published!",
              text2: "Your Lost & Found post is now live.",
            });
          }, 350);
        },
        onError: (err) => {
          if (ugcRetry.handleUgcError(err)) return;
          const info = extractApiErrorInfo(
            err,
            "Please check your input and try again.",
          );
          Toast.show({
            type: "error",
            text1: "Failed to publish",
            text2: info.message,
          });
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [createMutation, onClose],
  );

  const ugcRetry = useUgcTermsRetry<CreateLostFoundInput>(
    currentUser?.id,
    executeCreate,
  );

  const isDirty = isEdit
    ? form.type !== initialFormRef.current.type ||
      form.title !== initialFormRef.current.title ||
      form.description !== initialFormRef.current.description ||
      form.category !== initialFormRef.current.category ||
      form.location !== initialFormRef.current.location ||
      !areStringArraysEqual(form.images, initialFormRef.current.images) ||
      form.verificationQuestion !==
        initialFormRef.current.verificationQuestion ||
      form.verificationAnswer !== initialFormRef.current.verificationAnswer
    : form.title.trim().length > 0 ||
      form.description.trim().length > 0 ||
      form.location.trim().length > 0 ||
      form.images.length > 0 ||
      form.verificationQuestion.trim().length > 0;

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    Keyboard.dismiss();

    const discard = () => {
      cleanupSessionUploads();
      if (!isEdit) setForm(EMPTY_FORM);
      onClose();
    };

    if (!isDirty) {
      discard();
      return;
    }

    Alert.alert(
      isEdit ? "Discard Changes?" : "Discard Post?",
      isEdit
        ? "You have unsaved changes to this post. Are you sure you want to discard them?"
        : "You have unsaved details in your post. Are you sure you want to discard them?",
      [
        { text: "Keep Editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: discard },
      ],
    );
  }, [isSubmitting, isDirty, isEdit, cleanupSessionUploads, onClose]);

  const canSubmit = form.title.trim().length >= LOST_FOUND_LIMITS.MIN_TITLE;

  const handleSubmit = useCallback(async () => {
    if (isOffline) {
      return Toast.show({
        type: "error",
        text1: "You're Offline",
        text2: isEdit
          ? "Reconnect to the internet before saving changes."
          : "Reconnect to the internet before publishing.",
      });
    }

    const validation = validateLostFoundForm({
      type: form.type,
      title: form.title,
      description: form.description,
      category: form.category,
      location: form.location,
      verificationQuestion: form.verificationQuestion,
      verificationAnswer: form.verificationAnswer,
      includeVerificationFields: canEditVerification,
    });
    if (validation.error || !validation.payload) {
      return Toast.show({
        type: "error",
        text1: "Check Your Input",
        text2: validation.error || "Please complete the required fields.",
      });
    }

    if (form.images.length > LOST_FOUND_LIMITS.MAX_IMAGES) {
      return Toast.show({
        type: "error",
        text1: "Photo Limit Exceeded",
        text2: `Maximum ${LOST_FOUND_LIMITS.MAX_IMAGES} photos can be attached.`,
      });
    }

    const currentMap = { ...uploadedImageMap };
    const pendingLocalUris = form.images.filter(
      (uri) =>
        !uri.startsWith("http://") &&
        !uri.startsWith("https://") &&
        !currentMap[uri],
    );

    if (pendingLocalUris.length > 0) {
      const sizeError = await validateLocalImageSizes(pendingLocalUris);
      if (sizeError) {
        return Toast.show({
          type: "error",
          text1: "Photo Exceeds 5MB",
          text2: sizeError,
        });
      }

      setIsUploading(true);
      try {
        const results = await uploadMultipleImages(
          pendingLocalUris,
          CLOUDINARY_FOLDERS.CAMPUS_HUB.LOST_FOUND,
        );
        results.forEach((result, idx) => {
          currentMap[pendingLocalUris[idx]] = result.secureUrl;
        });
        setUploadedImageMap(currentMap);
      } catch (err) {
        setIsUploading(false);
        const info = extractApiErrorInfo(
          err,
          "Check your connection or try again.",
        );
        return Toast.show({
          type: "error",
          text1: "Image Upload Failed",
          text2: info.message,
        });
      }
      setIsUploading(false);
    }

    const resolvedImages = form.images
      .map((uri) =>
        uri.startsWith("http://") || uri.startsWith("https://")
          ? uri
          : currentMap[uri],
      )
      .filter((uri): uri is string => Boolean(uri));

    if (!isEdit) {
      executeCreate({
        type: validation.payload.type,
        title: validation.payload.title,
        description: validation.payload.description ?? undefined,
        category: validation.payload.category,
        location: validation.payload.location ?? undefined,
        images: resolvedImages,
        verificationQuestion: validation.payload.verificationQuestion,
        verificationAnswer: validation.payload.verificationAnswer,
      });
      return;
    }

    if (!post) return;

    updateMutation.mutate(
      {
        id: post.id,
        data: {
          type: validation.payload.type,
          title: validation.payload.title,
          description: validation.payload.description,
          category: validation.payload.category,
          location: validation.payload.location,
          images: resolvedImages,
          ...(canEditVerification
            ? {
                verificationQuestion: validation.payload.verificationQuestion,
                verificationAnswer: validation.payload.verificationAnswer,
              }
            : {}),
        },
      },
      {
        onSuccess: (updatedPost) => {
          Keyboard.dismiss();
          setUploadedImageMap({});
          onSuccess?.(updatedPost);
          onClose();
          setTimeout(() => {
            Toast.show({
              type: "success",
              text1: "Post Updated",
              text2: "Your changes have been saved successfully.",
            });
          }, 350);
        },
        onError: (err) => {
          const info = extractApiErrorInfo(
            err,
            "Please check your input and try again.",
          );
          Toast.show({
            type: "error",
            text1: "Failed to update",
            text2: info.message,
          });
        },
      },
    );
  }, [
    isOffline,
    isEdit,
    form,
    canEditVerification,
    uploadedImageMap,
    executeCreate,
    post,
    updateMutation,
    onSuccess,
    onClose,
  ]);

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
        backgroundColor={CAMPUS_HUB_COLORS.white}
        translucent={true}
      />
      <SafeAreaView style={styles.fullScreenContainer} edges={["top"]}>
        <View style={styles.topHeader}>
          <View style={styles.topHeaderInner}>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.headerTitle}>
                {isEdit ? "Edit Listing" : "Lost & Found Post"}
              </Text>
              <View style={styles.hubBadge}>
                <Text style={styles.hubBadgeText} maxFontSizeMultiplier={1.25}>
                  CAMPUS HUB
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleClose}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.circleBtn,
                isSubmitting && { opacity: 0.45 },
                pressed && !isSubmitting && { opacity: 0.75 },
              ]}
              android_ripple={{
                color: CAMPUS_HUB_COLORS.androidRipple,
                borderless: true,
              }}
              accessible
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting }}
              accessibilityLabel={
                isEdit ? "Close edit modal" : "Close compose modal"
              }
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={18} color={CAMPUS_HUB_COLORS.deepNavy} />
            </Pressable>
          </View>
        </View>

        <ModalKeyboardAvoidingView
          enabled={visible}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.typeSegment}>
              <Pressable
                style={({ pressed }) => [
                  styles.typeSegmentBtn,
                  form.type === "LOST" && styles.typeSegmentBtnLostActive,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => updateField("type", "LOST")}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
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
                      : CAMPUS_HUB_COLORS.mutedInk
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
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.typeSegmentBtn,
                  form.type === "FOUND" && styles.typeSegmentBtnFoundActive,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => updateField("type", "FOUND")}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
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
                      ? CAMPUS_HUB_COLORS.foundTealText
                      : CAMPUS_HUB_COLORS.mutedInk
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
              </Pressable>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>TITLE</Text>
                <Text style={styles.counterText} maxFontSizeMultiplier={1.25}>
                  {form.title.length}/{LOST_FOUND_LIMITS.MAX_TITLE}
                </Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="What did you lose or find?"
                placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                value={form.title}
                onChangeText={(v) => updateField("title", v)}
                maxLength={LOST_FOUND_LIMITS.MAX_TITLE}
                accessible
                accessibilityLabel="Post title"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => descriptionInputRef.current?.focus()}
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>DESCRIPTION (OPTIONAL)</Text>
                <Text style={styles.counterText} maxFontSizeMultiplier={1.25}>
                  {form.description.length}/{LOST_FOUND_LIMITS.MAX_DESCRIPTION}
                </Text>
              </View>
              <TextInput
                ref={descriptionInputRef}
                style={[styles.input, styles.textArea]}
                placeholder="Describe the item in detail (color, brand, distinguishing marks)..."
                placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                value={form.description}
                onChangeText={(v) => updateField("description", v)}
                maxLength={LOST_FOUND_LIMITS.MAX_DESCRIPTION}
                multiline
                textAlignVertical="top"
                accessible
                accessibilityLabel="Post description"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>CATEGORY</Text>
              <View style={styles.chipRow}>
                {LOST_FOUND_CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = form.category === cat.key;
                  return (
                    <Pressable
                      key={cat.key}
                      style={({ pressed }) => [
                        styles.chip,
                        isSelected && styles.chipSelected,
                        pressed && { opacity: 0.85 },
                      ]}
                      onPress={() => updateField("category", cat.key)}
                      android_ripple={{
                        color: isSelected
                          ? CAMPUS_HUB_COLORS.androidRippleLight
                          : CAMPUS_HUB_COLORS.androidRipple,
                      }}
                      accessible
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      accessibilityLabel={cat.label}
                    >
                      {isSelected && (
                        <Feather
                          name="check"
                          size={12}
                          color={CAMPUS_HUB_COLORS.white}
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
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>LOCATION (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="Where was it lost or found?"
                placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                value={form.location}
                onChangeText={(v) => updateField("location", v)}
                maxLength={LOST_FOUND_LIMITS.MAX_LOCATION}
                returnKeyType={
                  canEditVerification && form.type === "FOUND" ? "next" : "done"
                }
                blurOnSubmit={!(canEditVerification && form.type === "FOUND")}
                onSubmitEditing={() => {
                  if (canEditVerification && form.type === "FOUND") {
                    verificationQuestionRef.current?.focus();
                  } else {
                    Keyboard.dismiss();
                  }
                }}
                accessible
                accessibilityLabel="Location"
              />
            </View>

            {canEditVerification && form.type === "FOUND" && (
              <View style={styles.verificationCard}>
                <View style={styles.verificationTitleRow}>
                  <Feather
                    name="shield"
                    size={15}
                    color={CAMPUS_HUB_COLORS.skyAccentInk}
                  />
                  <Text style={styles.verificationTitle}>
                    OWNERSHIP VERIFICATION (RECOMMENDED)
                  </Text>
                </View>
                <Text style={styles.verificationHint}>
                  Ask a secret question only the genuine owner can answer (e.g.
                  &quot;What sticker is on the back?&quot; or &quot;What is in
                  the pocket?&quot;).
                </Text>

                <TextInput
                  ref={verificationQuestionRef}
                  style={styles.input}
                  placeholder="Verification question for claimant..."
                  placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                  value={form.verificationQuestion}
                  onChangeText={(v) => updateField("verificationQuestion", v)}
                  maxLength={LOST_FOUND_LIMITS.MAX_QUESTION}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => verificationAnswerRef.current?.focus()}
                  accessible
                  accessibilityLabel="Verification question"
                />

                <TextInput
                  ref={verificationAnswerRef}
                  style={[styles.input, { marginTop: 8 }]}
                  placeholder="Expected answer (private, only visible to you)..."
                  placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                  value={form.verificationAnswer}
                  onChangeText={(v) => updateField("verificationAnswer", v)}
                  maxLength={LOST_FOUND_LIMITS.MAX_ANSWER}
                  returnKeyType="done"
                  accessible
                  accessibilityLabel="Secret expected answer"
                />
              </View>
            )}

            <View style={styles.formGroup}>
              <ImagePickerRow
                images={form.images}
                onImagesChange={(imgs) => {
                  deleteRemovedCloudinaryUploads(
                    imgs,
                    uploadedImageMap,
                    setUploadedImageMap,
                  );
                  updateField("images", imgs);
                }}
                maxImages={LOST_FOUND_LIMITS.MAX_IMAGES}
                maxSizeBytes={LOST_FOUND_LIMITS.MAX_IMAGE_BYTES}
                accent={ACCENT}
              />
            </View>
          </ScrollView>

          <View
            style={[
              styles.modalFooter,
              { paddingBottom: isKeyboardOpen ? 12 : Math.max(insets.bottom, 16) },
            ]}
          >
            <View style={styles.modalFooterInner}>
              <Pressable
                style={({ pressed }) => [
                  styles.submitBtn,
                  (!canSubmit || isSubmitting) && styles.submitBtnDisabled,
                  pressed &&
                    canSubmit &&
                    !isSubmitting && { opacity: 0.88 },
                ]}
                onPress={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
                accessible
                accessibilityRole="button"
                accessibilityState={{
                  disabled: !canSubmit || isSubmitting,
                  busy: isSubmitting,
                }}
                accessibilityLabel={
                  isEdit ? "Save post changes" : "Publish post"
                }
              >
                {isSubmitting ? (
                  <ActivityIndicator
                    size="small"
                    color={CAMPUS_HUB_COLORS.white}
                  />
                ) : (
                  <>
                    <Feather
                      name={isEdit ? "check" : "send"}
                      size={16}
                      color={CAMPUS_HUB_COLORS.white}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.submitBtnText}>
                      {isEdit ? "Save Changes" : "Publish Post"}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </ModalKeyboardAvoidingView>

        {!isEdit && (
          <UgcGuidelinesModal
            visible={ugcRetry.showGuidelines}
            renderInline={true}
            isOffline={isOffline}
            isSubmitting={ugcRetry.isAcceptingGuidelines}
            onClose={() => ugcRetry.setShowGuidelines(false)}
            onAccept={ugcRetry.acceptGuidelines}
          />
        )}

        <Toast config={toastConfig} topOffset={Math.max(insets.top + 8, 44)} />
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.white,
  },
  topHeader: {
    borderBottomWidth: 1,
    borderBottomColor: CAMPUS_HUB_COLORS.cardBorder,
    backgroundColor: CAMPUS_HUB_COLORS.white,
  },
  topHeaderInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  headerTitleGroup: {
    flex: 1,
    alignItems: "flex-start",
    marginRight: 12,
  },
  headerTitle: {
    fontFamily: titleFontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  hubBadge: {
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  hubBadgeText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.lostFoundAccentText,
    letterSpacing: 0.6,
    includeFontPadding: false,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.slate100,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 28,
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  typeSegment: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  typeSegmentBtn: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    overflow: "hidden",
  },
  typeSegmentBtnLostActive: {
    backgroundColor: CAMPUS_HUB_COLORS.dangerBg,
    borderColor: CAMPUS_HUB_COLORS.dangerText,
  },
  typeSegmentBtnFoundActive: {
    backgroundColor: CAMPUS_HUB_COLORS.foundTealBg,
    borderColor: CAMPUS_HUB_COLORS.foundTealBorder,
  },
  typeSegmentText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.mutedInk,
  },
  typeSegmentTextLostActive: {
    color: CAMPUS_HUB_COLORS.dangerText,
  },
  typeSegmentTextFoundActive: {
    color: CAMPUS_HUB_COLORS.foundTealText,
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
    color: CAMPUS_HUB_COLORS.mutedInk,
    letterSpacing: 0.5,
  },
  counterText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.mutedInk,
    fontVariant: ["tabular-nums"],
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
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
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
    minHeight: 38,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderWidth: 1,
    borderColor: colors.slate200,
    overflow: "hidden",
  },
  chipSelected: {
    backgroundColor: ACCENT_FILL,
    borderColor: ACCENT_FILL,
  },
  chipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  chipTextSelected: {
    color: CAMPUS_HUB_COLORS.white,
  },
  verificationCard: {
    backgroundColor: CAMPUS_HUB_COLORS.skyTint,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.skyBorder,
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
    color: CAMPUS_HUB_COLORS.skyAccentInk,
    letterSpacing: 0.4,
  },
  verificationHint: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.skyAccentInk,
    lineHeight: 16,
    marginBottom: 4,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.cardBorder,
    ...CAMPUS_HUB_COLORS.footerShadow,
  },
  modalFooterInner: {
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT_FILL,
    height: 50,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    overflow: "hidden",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  submitBtnDisabled: {
    backgroundColor: colors.slate300,
    opacity: 0.65,
    elevation: 0,
    shadowOpacity: 0,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.white,
  },
});
