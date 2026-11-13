import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  TextInput,
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
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ui/toast-config";
import {
  ModalKeyboardAvoidingView,
  useSoftKeyboardOpen,
} from "@/components/ui/modal-keyboard-avoider";
import { useNetworkStatus } from "@/hooks/use-network-status";
import {
  useCreateMarketplacePost,
  useUpdateMarketplacePost,
} from "@/features/campus-hub/useMarketplace";
import {
  requireOnline,
  scheduleSuccessToast,
  showApiErrorToast,
  uploadPendingImages,
  deleteRemovedCloudinaryUploads,
  useUgcTermsRetry,
  type UploadedUrlMapUpdater,
} from "@/features/campus-hub/campus-hub-upload";
import {
  MARKETPLACE_LIMITS,
  extractMarketplacePlainText,
  formatBangladeshiPhone,
  isValidBangladeshiPhone,
  validateMarketplaceForm,
  type SanitizedMarketplaceForm,
} from "@/features/campus-hub/marketplace-logic";
import {
  CLOUDINARY_FOLDERS,
  deleteFileFromCloudinaryApi,
} from "@/services/cloudinary-service";
import type {
  ItemCondition,
  ListingType,
  MarketplaceCategory,
  MarketplacePost,
} from "@/services/marketplace-service";
import type { User } from "@/features/auth/types";
import { useUgcTermsStatus } from "@/features/ugc/useUgcModeration";
import { UgcGuidelinesModal } from "@/screens/forum/components/ugc/ugc-guidelines-modal";
import { colors } from "@/theme/colors";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  titleFontFamily,
} from "../../shared/design-tokens";
import { ImagePickerRow } from "../../shared/image-picker-row";
import { CONDITIONS } from "../marketplace-constants";
import { MarketplaceCategoryPicker } from "./marketplace-category-picker";
import { MarketplaceRichEditor } from "./marketplace-rich-editor";

interface MarketplaceFormModalBaseProps {
  visible: boolean;
  onClose: () => void;
  currentUser?: User | null;
}

export type MarketplaceFormModalProps =
  | (MarketplaceFormModalBaseProps & { mode: "create"; post?: undefined })
  | (MarketplaceFormModalBaseProps & { mode: "edit"; post: MarketplacePost });

interface FormState {
  type: ListingType;
  title: string;
  description: string;
  price: string;
  category: MarketplaceCategory;
  condition: ItemCondition;
  contactPhone: string;
  localImages: string[];
}

const ACCENT = CAMPUS_HUB_COLORS.marketplaceAccentText;

function isRemoteUrl(uri: string): boolean {
  return /^https?:\/\//i.test(uri);
}

function buildInitialState(
  mode: "create" | "edit",
  post: MarketplacePost | undefined,
  initialPhone: string,
): FormState {
  if (mode === "edit" && post) {
    return {
      type: post.type,
      title: post.title,
      description: post.description || "",
      price: post.price != null ? String(post.price) : "",
      category: post.category,
      condition: post.condition ?? "GOOD",
      contactPhone: post.contactPhone
        ? formatBangladeshiPhone(post.contactPhone)
        : "+880",
      localImages: post.images ?? [],
    };
  }
  return {
    type: "SELLING",
    title: "",
    description: "",
    price: "",
    category: "TEXTBOOKS",
    condition: "GOOD",
    contactPhone: initialPhone,
    localImages: [],
  };
}

export const MarketplaceFormModal = React.memo(function MarketplaceFormModal({
  mode,
  visible,
  onClose,
  currentUser,
  post,
}: MarketplaceFormModalProps) {
  const isEdit = mode === "edit";
  const insets = useSafeAreaInsets();
  const isKeyboardOpen = useSoftKeyboardOpen(visible);
  const { isOffline } = useNetworkStatus();

  const initialPhone = useMemo(() => {
    if (currentUser?.phoneNumber) {
      return formatBangladeshiPhone(currentUser.phoneNumber);
    }
    return "+880";
  }, [currentUser?.phoneNumber]);

  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(mode, post, initialPhone),
  );
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const uploadedMapRef = useRef<Record<string, string>>({});
  const initializedKeyRef = useRef<string | null>(null);
  const draftIdempotencyKeyRef = useRef<string | null>(null);
  const submitLockRef = useRef(false);
  const titleInputRef = useRef<TextInput>(null);
  const priceInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);

  const ugcUserId = currentUser?.id ?? post?.author?.id;
  const ugcTermsQuery = useUgcTermsStatus(ugcUserId, visible);

  const createMutation = useCreateMarketplacePost();
  const updateMutation = useUpdateMarketplacePost();
  const isSubmitting =
    isUploading || createMutation.isPending || updateMutation.isPending;

  const {
    showGuidelines,
    setShowGuidelines,
    isAcceptingGuidelines,
    queuePayload,
    clearQueuedPayload,
    handleUgcError,
    acceptGuidelines,
  } = useUgcTermsRetry<SanitizedMarketplaceForm>(ugcUserId);

  const syncUploadedMap = useCallback((updater: UploadedUrlMapUpdater) => {
    uploadedMapRef.current =
      typeof updater === "function" ? updater(uploadedMapRef.current) : updater;
  }, []);

  // Initialize form state once per open session / listing ID so background refetches
  // never overwrite active user edits or clear session upload tracking.
  useEffect(() => {
    if (!visible) {
      initializedKeyRef.current = null;
      draftIdempotencyKeyRef.current = null;
      return;
    }

    const targetKey = isEdit && post ? `edit:${post.id}` : "create";
    if (initializedKeyRef.current !== targetKey) {
      initializedKeyRef.current = targetKey;
      draftIdempotencyKeyRef.current = null;
      if (isEdit && post) {
        const next = buildInitialState("edit", post, initialPhone);
        setForm(next);
        setDescriptionLength(
          extractMarketplacePlainText(post.description).length,
        );
        syncUploadedMap({});
      } else {
        setForm(buildInitialState("create", undefined, initialPhone));
        setDescriptionLength(0);
        syncUploadedMap({});
      }
    } else if (!isEdit && currentUser?.phoneNumber) {
      const formatted = formatBangladeshiPhone(currentUser.phoneNumber);
      if (isValidBangladeshiPhone(formatted)) {
        setForm((prev) =>
          !prev.contactPhone || prev.contactPhone === "+880"
            ? { ...prev, contactPhone: formatted }
            : prev,
        );
      }
    }
  }, [
    visible,
    isEdit,
    post,
    initialPhone,
    currentUser?.phoneNumber,
    syncUploadedMap,
  ]);

  const update = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handlePhoneChange = useCallback((raw: string) => {
    const formatted = formatBangladeshiPhone(raw);
    setForm((prev) => ({ ...prev, contactPhone: formatted }));
  }, []);

  const isPhoneValid = useMemo(
    () => isValidBangladeshiPhone(form.contactPhone),
    [form.contactPhone],
  );

  const handlePriceChange = useCallback((raw: string) => {
    let sanitized = raw.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    if (parts.length > 2) {
      sanitized = `${parts[0]}.${parts.slice(1).join("")}`;
    }
    if (parts.length === 2 && parts[1].length > 2) {
      sanitized = `${parts[0]}.${parts[1].slice(0, 2)}`;
    }
    setForm((prev) => ({ ...prev, price: sanitized }));
  }, []);

  const formattedPricePreview = useMemo(() => {
    if (!form.price.trim()) return "";
    const num = parseFloat(form.price);
    if (isNaN(num)) return "";
    return `৳ ${num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }, [form.price]);

  const hasUnsavedContent = isEdit
    ? Boolean(
        post &&
        (form.title !== post.title ||
          form.description !== (post.description || "") ||
          form.category !== post.category ||
          form.type !== post.type ||
          Object.keys(uploadedMapRef.current).length > 0),
      )
    : form.title.trim().length > 0 ||
      form.description.trim().length > 0 ||
      form.price.trim().length > 0 ||
      form.localImages.length > 0 ||
      (form.contactPhone !== "+880" && form.contactPhone.length > 4);

  const cleanupSessionUploadsOnly = useCallback(() => {
    const urls = Object.values(uploadedMapRef.current);
    urls.forEach((url) => {
      deleteFileFromCloudinaryApi(url, "image").catch(() => {});
    });
    uploadedMapRef.current = {};
  }, []);

  const closeAfterSave = useCallback(() => {
    Keyboard.dismiss();
    clearQueuedPayload();
    // Clear tracking WITHOUT deleting saved images from Cloudinary
    uploadedMapRef.current = {};
    draftIdempotencyKeyRef.current = null;
    initializedKeyRef.current = null;
    if (!isEdit) {
      setForm(buildInitialState("create", undefined, initialPhone));
      setDescriptionLength(0);
    }
    onClose();
  }, [clearQueuedPayload, isEdit, initialPhone, onClose]);

  const performDiscardAndClose = useCallback(() => {
    Keyboard.dismiss();
    clearQueuedPayload();
    cleanupSessionUploadsOnly();
    draftIdempotencyKeyRef.current = null;
    initializedKeyRef.current = null;
    if (!isEdit) {
      setForm(buildInitialState("create", undefined, initialPhone));
      setDescriptionLength(0);
    }
    onClose();
  }, [
    clearQueuedPayload,
    cleanupSessionUploadsOnly,
    isEdit,
    initialPhone,
    onClose,
  ]);

  const handleDiscardOrClose = useCallback(() => {
    if (isSubmitting) return;
    Keyboard.dismiss();
    if (hasUnsavedContent) {
      Alert.alert(
        isEdit ? "Discard Changes?" : "Discard Listing?",
        "You have unsaved changes. Are you sure you want to discard them?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: performDiscardAndClose,
          },
        ],
      );
      return;
    }
    performDiscardAndClose();
  }, [isSubmitting, hasUnsavedContent, isEdit, performDiscardAndClose]);

  const submitListingPayload = useCallback(
    (payload: SanitizedMarketplaceForm) => {
      if (isEdit && post) {
        updateMutation.mutate(
          {
            id: post.id,
            data: payload,
          },
          {
            onSuccess: () => {
              closeAfterSave();
              scheduleSuccessToast(
                "Listing Updated!",
                "Your changes have been saved successfully.",
              );
            },
            onError: (err: unknown) => {
              if (handleUgcError(err)) return;
              showApiErrorToast(
                err,
                "Failed to Update",
                "Please check your input and try again.",
              );
            },
          },
        );
        return;
      }

      if (!draftIdempotencyKeyRef.current) {
        draftIdempotencyKeyRef.current = `mp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      }

      createMutation.mutate(
        { ...payload, idempotencyKey: draftIdempotencyKeyRef.current },
        {
          onSuccess: () => {
            closeAfterSave();
            scheduleSuccessToast(
              "Listing Published!",
              "Your campus listing is now live.",
            );
          },
          onError: (err: unknown) => {
            if (handleUgcError(err)) return;
            showApiErrorToast(
              err,
              "Failed to Publish",
              "Please check your input and try again.",
            );
          },
        },
      );
    },
    [
      isEdit,
      post,
      updateMutation,
      createMutation,
      closeAfterSave,
      handleUgcError,
    ],
  );

  const runUploadAndSubmit = useCallback(
    async (validatedPayload: SanitizedMarketplaceForm) => {
      // Upload only newly picked local URIs, keeping existing remote URLs untouched
      const localOnlyUris = form.localImages.filter((uri) => !isRemoteUrl(uri));
      let currentMap = { ...uploadedMapRef.current };

      if (localOnlyUris.length > 0) {
        const updatedMap = await uploadPendingImages({
          uris: localOnlyUris,
          uploadedMap: currentMap,
          folder: CLOUDINARY_FOLDERS.CAMPUS_HUB.MARKETPLACE,
          maxBytes: MARKETPLACE_LIMITS.MAX_IMAGE_BYTES,
          logTag: "Marketplace",
          singlePhotoLabel: isEdit ? "A newly added photo" : "A photo",
          uploadErrorTitle: "Photo Upload Failed",
          uploadErrorFallback:
            "Please check your internet connection and try again.",
          setIsUploading,
          setUploadedMap: syncUploadedMap,
        });
        if (!updatedMap) return;
        currentMap = updatedMap;
      }

      const finalImageUrls = form.localImages
        .map((uri) => (isRemoteUrl(uri) ? uri : currentMap[uri]))
        .filter((url): url is string => Boolean(url));

      const finalPayload: SanitizedMarketplaceForm = {
        ...validatedPayload,
        images: finalImageUrls,
      };

      queuePayload(finalPayload, submitListingPayload);
      submitListingPayload(finalPayload);
    },
    [
      form.localImages,
      isEdit,
      syncUploadedMap,
      queuePayload,
      submitListingPayload,
    ],
  );

  const handleSubmit = useCallback(async () => {
    if (submitLockRef.current || isSubmitting) return;
    if (
      !requireOnline(
        isOffline,
        "Reconnect to the internet to save your listing.",
      )
    ) {
      return;
    }

    const validation = validateMarketplaceForm({
      type: form.type,
      title: form.title,
      description: form.description,
      price: form.price,
      category: form.category,
      condition: form.condition,
      contactPhone: form.contactPhone,
      images: form.localImages,
    });

    if (validation.error || !validation.payload) {
      Toast.show({
        type: "error",
        text1: "Check Listing Details",
        text2: validation.error || "Please review the required fields.",
      });
      return;
    }

    const hasPendingLocalImages = form.localImages.some(
      (uri) => !isRemoteUrl(uri),
    );
    submitLockRef.current = true;
    try {
      if (hasPendingLocalImages) {
        let ugcAccepted = ugcTermsQuery.data?.accepted;
        if (ugcAccepted === undefined) {
          const refreshed = await ugcTermsQuery.refetch();
          ugcAccepted = refreshed.data?.accepted;
        }
        if (ugcTermsQuery.data?.accepted === false || ugcAccepted === false) {
          queuePayload(validation.payload, (queued) => {
            void runUploadAndSubmit(queued);
          });
          setShowGuidelines(true);
          return;
        }
        if (ugcAccepted !== true) {
          Toast.show({
            type: "error",
            text1: "Unable to Verify Guidelines",
            text2: "Please check your connection and try again.",
          });
          return;
        }
      }

      await runUploadAndSubmit(validation.payload);
    } finally {
      submitLockRef.current = false;
    }
  }, [
    isSubmitting,
    isOffline,
    form,
    ugcTermsQuery,
    queuePayload,
    runUploadAndSubmit,
    setShowGuidelines,
  ]);

  const handleAcceptGuidelines = useCallback(() => {
    if (
      !requireOnline(isOffline, "Reconnect to accept community guidelines.")
    ) {
      return;
    }
    acceptGuidelines();
  }, [acceptGuidelines, isOffline]);

  const isSelling = form.type === "SELLING";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
      onRequestClose={handleDiscardOrClose}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={CAMPUS_HUB_COLORS.white}
        translucent={true}
      />
      <SafeAreaView
        style={styles.fullScreenContainer}
        edges={["top", "bottom"]}
      >
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.topHeaderInner}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>
                {isEdit ? "Edit Listing" : "New Listing"}
              </Text>
              <View style={styles.hubBadge}>
                <Text style={styles.hubBadgeText} maxFontSizeMultiplier={1.2}>
                  CAMPUS HUB
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleDiscardOrClose}
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && { opacity: 0.72 },
              ]}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
              disabled={isSubmitting}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={
                isEdit ? "Close edit listing" : "Close create listing"
              }
              accessibilityState={{ disabled: isSubmitting }}
              hitSlop={6}
            >
              <Feather name="x" size={18} color={CAMPUS_HUB_COLORS.deepNavy} />
            </Pressable>
          </View>
        </View>

        {isOffline && (
          <View style={styles.offlineBanner}>
            <View style={styles.offlineBannerInner}>
              <Feather
                name="wifi-off"
                size={13}
                color={CAMPUS_HUB_COLORS.lostFoundAccentInk}
              />
              <Text style={styles.offlineBannerText}>
                You're offline. Reconnect before publishing changes.
              </Text>
            </View>
          </View>
        )}

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
            {/* Segmented Control */}
            <View style={styles.segmentContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.segmentBtn,
                  isSelling && styles.segmentBtnSellingActive,
                  pressed && { opacity: 0.85 },
                ]}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                onPress={() => update("type", "SELLING")}
                accessible={true}
                accessibilityRole="tab"
                accessibilityLabel="I'm Selling"
                accessibilityState={{ selected: isSelling }}
              >
                <Feather
                  name="tag"
                  size={14}
                  color={
                    isSelling
                      ? CAMPUS_HUB_COLORS.marketplaceAccentText
                      : CAMPUS_HUB_COLORS.subtleText
                  }
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.segmentText,
                    isSelling && styles.segmentTextSellingActive,
                  ]}
                  maxFontSizeMultiplier={1.2}
                >
                  I'm Selling
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.segmentBtn,
                  !isSelling && styles.segmentBtnWantedActive,
                  pressed && { opacity: 0.85 },
                ]}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                onPress={() => update("type", "BUYING")}
                accessible={true}
                accessibilityRole="tab"
                accessibilityLabel="Looking to Buy"
                accessibilityState={{ selected: !isSelling }}
              >
                <Feather
                  name="search"
                  size={14}
                  color={
                    !isSelling
                      ? CAMPUS_HUB_COLORS.lostFoundAccentText
                      : CAMPUS_HUB_COLORS.subtleText
                  }
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.segmentText,
                    !isSelling && styles.segmentTextWantedActive,
                  ]}
                  maxFontSizeMultiplier={1.2}
                >
                  Looking to Buy
                </Text>
              </Pressable>
            </View>

            {/* Title */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>
                  TITLE <Text style={styles.requiredStar}>*</Text>
                </Text>
                <Text style={styles.counterText} maxFontSizeMultiplier={1.2}>
                  {form.title.length}/{MARKETPLACE_LIMITS.MAX_TITLE}
                </Text>
              </View>
              <TextInput
                ref={titleInputRef}
                style={styles.textInput}
                placeholder="e.g. Calculus 8th Edition, Casio FX-991EX"
                placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                value={form.title}
                onChangeText={(v) => update("title", v)}
                maxLength={MARKETPLACE_LIMITS.MAX_TITLE}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => priceInputRef.current?.focus()}
                accessibilityLabel="Listing title"
              />
            </View>

            {/* Category Picker */}
            <View style={styles.formGroup}>
              <MarketplaceCategoryPicker
                value={form.category}
                onChange={(cat) => update("category", cat)}
                label="CATEGORY"
                required={true}
              />
            </View>

            {/* Condition (Horizontal Pills when Selling) */}
            {isSelling && (
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>CONDITION</Text>
                <View style={styles.conditionRow}>
                  {CONDITIONS.map((cond) => {
                    const isSelected = form.condition === cond.key;
                    return (
                      <Pressable
                        key={cond.key}
                        style={({ pressed }) => [
                          styles.conditionChip,
                          isSelected && styles.conditionChipActive,
                          pressed && { opacity: 0.8 },
                        ]}
                        android_ripple={{
                          color: CAMPUS_HUB_COLORS.androidRipple,
                        }}
                        onPress={() => update("condition", cond.key)}
                        accessible={true}
                        accessibilityRole="radio"
                        accessibilityLabel={cond.label}
                        accessibilityState={{ selected: isSelected }}
                      >
                        <Text
                          style={[
                            styles.conditionChipText,
                            isSelected && styles.conditionChipTextActive,
                          ]}
                          maxFontSizeMultiplier={1.2}
                        >
                          {cond.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Price in BDT */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>PRICE (BDT)</Text>
                {Boolean(formattedPricePreview) && (
                  <Text
                    style={styles.priceFormattedText}
                    maxFontSizeMultiplier={1.2}
                  >
                    {formattedPricePreview}
                  </Text>
                )}
              </View>

              <View style={styles.priceInputBox}>
                <Text style={styles.takaSymbol}>৳</Text>
                <TextInput
                  ref={priceInputRef}
                  style={styles.priceInput}
                  placeholder="0.00"
                  placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                  value={form.price}
                  onChangeText={handlePriceChange}
                  keyboardType="decimal-pad"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => phoneInputRef.current?.focus()}
                  maxLength={10}
                  accessibilityLabel="Price in Bangladeshi Taka"
                />
              </View>
            </View>

            {/* Description & Rich Text Formatter */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>
                  DESCRIPTION <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.charCountRow}>
                  {Boolean(form.description && form.description.trim()) && (
                    <Pressable
                      onPress={() => {
                        update("description", "");
                        setDescriptionLength(0);
                      }}
                      hitSlop={12}
                      style={({ pressed }) => [
                        styles.clearHeaderBtn,
                        pressed && { opacity: 0.72 },
                      ]}
                      android_ripple={{
                        color: CAMPUS_HUB_COLORS.androidRipple,
                      }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Clear description"
                    >
                      <Feather
                        name="trash-2"
                        size={11}
                        color={CAMPUS_HUB_COLORS.dangerText}
                        style={{ marginRight: 3 }}
                      />
                      <Text style={styles.clearHeaderBtnText}>Clear</Text>
                    </Pressable>
                  )}
                  <Text
                    style={[
                      styles.charCountText,
                      descriptionLength >
                        MARKETPLACE_LIMITS.MAX_DESCRIPTION_PLAIN &&
                        styles.charCountTextOver,
                    ]}
                    maxFontSizeMultiplier={1.2}
                  >
                    {descriptionLength}/
                    {MARKETPLACE_LIMITS.MAX_DESCRIPTION_PLAIN}
                  </Text>
                </View>
              </View>
              {visible && (
                <MarketplaceRichEditor
                  key={`${mode}-editor-${post?.id ?? "new"}-${visible}`}
                  value={form.description}
                  onChangeText={(val) => update("description", val)}
                  onLengthChange={setDescriptionLength}
                  placeholder="Mention item condition, edition, included accessories, or campus meetup point..."
                  maxLength={MARKETPLACE_LIMITS.MAX_DESCRIPTION_PLAIN}
                  minHeight={200}
                />
              )}
            </View>

            {/* Contact Phone */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>
                  CONTACT PHONE <Text style={styles.requiredStar}>*</Text>
                </Text>
                {isPhoneValid && (
                  <View style={styles.validPhoneRow}>
                    <Feather
                      name="check-circle"
                      size={12}
                      color={CAMPUS_HUB_COLORS.marketplaceAccentText}
                    />
                    <Text style={styles.validPhoneText}>Valid Number</Text>
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.phoneInputBox,
                  isPhoneValid && styles.phoneInputBoxValid,
                ]}
              >
                <View style={styles.phonePrefix}>
                  <Text style={styles.flagEmoji}>🇧🇩</Text>
                  <Text style={styles.prefixText}>+880</Text>
                </View>
                <TextInput
                  ref={phoneInputRef}
                  style={styles.phoneInput}
                  placeholder="1XXXXXXXXX"
                  placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                  value={
                    form.contactPhone.startsWith("+880")
                      ? form.contactPhone.slice(4)
                      : form.contactPhone
                  }
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  returnKeyType="done"
                  maxLength={11}
                  accessibilityLabel="Contact phone number"
                />
              </View>
            </View>

            {/* Photos */}
            <View style={styles.formGroup}>
              <ImagePickerRow
                images={form.localImages}
                onImagesChange={(imgs) => {
                  const sliced = imgs.slice(0, MARKETPLACE_LIMITS.MAX_IMAGES);
                  deleteRemovedCloudinaryUploads(
                    sliced,
                    uploadedMapRef.current,
                    (next) => syncUploadedMap(next),
                  );
                  update("localImages", sliced);
                }}
                maxImages={MARKETPLACE_LIMITS.MAX_IMAGES}
                accent={ACCENT}
                label={`PHOTOS (OPTIONAL) • ${form.localImages.length}/${MARKETPLACE_LIMITS.MAX_IMAGES}`}
                hint="max up to 5 MB for each"
              />
            </View>
          </ScrollView>

          {/* Bottom Docked Action Footer */}
          <View
            style={[
              styles.footerBar,
              {
                paddingBottom: isKeyboardOpen
                  ? 12
                  : Math.max(insets.bottom, 16),
              },
            ]}
          >
            <Pressable
              style={({ pressed }) => [
                styles.publishBtn,
                isSubmitting && styles.publishBtnDisabled,
                pressed && !isSubmitting && { opacity: 0.9 },
              ]}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
              onPress={handleSubmit}
              disabled={isSubmitting}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={
                isEdit
                  ? "Save Changes"
                  : isSelling
                    ? "Publish For Sale"
                    : "Publish Buying Request"
              }
              accessibilityState={{
                disabled: isSubmitting,
                busy: isSubmitting,
              }}
            >
              {isSubmitting ? (
                <View style={styles.submittingRow}>
                  <ActivityIndicator
                    size="small"
                    color={CAMPUS_HUB_COLORS.white}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.publishBtnText}>
                    {isUploading
                      ? "Uploading photos..."
                      : isEdit
                        ? "Saving changes..."
                        : "Publishing listing..."}
                  </Text>
                </View>
              ) : (
                <>
                  <Feather
                    name="check"
                    size={17}
                    color={CAMPUS_HUB_COLORS.white}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.publishBtnText}>
                    {isEdit
                      ? "Save Changes"
                      : isSelling
                        ? "Publish For Sale"
                        : "Publish Buying Request"}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </ModalKeyboardAvoidingView>

        <UgcGuidelinesModal
          visible={showGuidelines}
          onClose={() => {
            clearQueuedPayload();
            setShowGuidelines(false);
          }}
          onAccept={handleAcceptGuidelines}
          isSubmitting={isAcceptingGuidelines}
          isOffline={isOffline}
          renderInline={true}
        />

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
    borderBottomColor: CAMPUS_HUB_COLORS.subtleBorder,
    backgroundColor: CAMPUS_HUB_COLORS.white,
  },
  topHeaderInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: titleFontFamily,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  hubBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight,
  },
  hubBadgeText: {
    fontSize: 9.5,
    fontFamily,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  offlineBanner: {
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.semantic.amber.border,
  },
  offlineBannerInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  offlineBannerText: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.lostFoundAccentInk,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.white,
  },
  scrollContent: {
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 16,
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderRadius: 12,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  segmentBtnSellingActive: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentBtnWantedActive: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
    includeFontPadding: false,
  },
  segmentTextSellingActive: {
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
    fontWeight: "700",
  },
  segmentTextWantedActive: {
    color: CAMPUS_HUB_COLORS.lostFoundAccentText,
    fontWeight: "700",
  },
  formGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldLabel: {
    fontSize: 11.5,
    fontFamily,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: 0.4,
  },
  requiredStar: {
    color: CAMPUS_HUB_COLORS.dangerText,
    fontWeight: "800",
  },
  counterText: {
    fontSize: 11,
    fontFamily,
    color: CAMPUS_HUB_COLORS.subtleText,
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  textInput: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
    fontSize: 14,
    fontFamily,
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  conditionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  conditionChip: {
    flex: 1,
    flexGrow: 1,
    minWidth: "47%",
    minHeight: 48,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  conditionChipActive: {
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight,
    borderColor: CAMPUS_HUB_COLORS.marketplaceAccent,
  },
  conditionChipText: {
    fontSize: 12.5,
    fontFamily,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
    lineHeight: 16,
  },
  conditionChipTextActive: {
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
    fontWeight: "700",
  },
  charCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clearHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.semantic.red.softBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  clearHeaderBtnText: {
    fontSize: 11,
    fontFamily,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.dangerText,
    includeFontPadding: false,
  },
  charCountText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  charCountTextOver: {
    color: CAMPUS_HUB_COLORS.dangerText,
    fontWeight: "700",
  },
  priceFormattedText: {
    fontSize: 12,
    fontFamily,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  priceInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    paddingHorizontal: 12,
  },
  takaSymbol: {
    fontSize: 17,
    fontFamily,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
    marginRight: 6,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.deepNavy,
    fontVariant: ["tabular-nums"],
  },
  validPhoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  validPhoneText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
    includeFontPadding: false,
  },
  phoneInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    paddingHorizontal: 10,
  },
  phoneInputBoxValid: {
    borderColor: CAMPUS_HUB_COLORS.marketplaceAccent,
  },
  phonePrefix: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: CAMPUS_HUB_COLORS.cardBorder,
    gap: 4,
  },
  flagEmoji: {
    fontSize: 13,
  },
  prefixText: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 14,
    fontFamily,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: 0.5,
    fontVariant: ["tabular-nums"],
  },
  footerBar: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  publishBtn: {
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentText,
    paddingVertical: 13,
    borderRadius: 12,
    elevation: 2,
    overflow: "hidden",
  },
  publishBtnDisabled: {
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentText,
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  publishBtnText: {
    fontSize: 14.5,
    fontFamily,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.white,
    includeFontPadding: false,
  },
  submittingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
