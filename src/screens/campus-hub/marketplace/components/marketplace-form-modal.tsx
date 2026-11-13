import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
  uploadPendingLostFoundImages,
  deleteRemovedCloudinaryUploads,
  useUgcTermsRetry,
} from "@/features/campus-hub/useLostFoundUpload";
import {
  MARKETPLACE_LIMITS,
  extractMarketplacePlainText,
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
import {
  CONDITIONS,
  formatBangladeshiPhone,
  isValidBangladeshiPhone,
} from "../marketplace-constants";
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

const ACCENT = CAMPUS_HUB_COLORS.marketplaceAccent;

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
  const [descriptionLength, setDescriptionLength] = useState(() =>
    isEdit && post?.description
      ? extractMarketplacePlainText(post.description).length
      : 0,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [, setUploadedMapVersion] = useState(0);
  const uploadedMapRef = useRef<Record<string, string>>({});
  const initializedKeyRef = useRef<string | null>(null);
  const draftIdempotencyKeyRef = useRef<string | null>(null);

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

  // Sync map helper so discard cleanup always sees synchronously tracked uploads
  const syncUploadedMap = useCallback(
    (updater: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => {
      if (typeof updater === "function") {
        uploadedMapRef.current = updater(uploadedMapRef.current);
      } else {
        uploadedMapRef.current = updater;
      }
      setUploadedMapVersion((prev) => prev + 1);
    },
    [],
  );

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
        setDescriptionLength(extractMarketplacePlainText(post.description).length);
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
  }, [visible, isEdit, post, initialPhone, currentUser?.phoneNumber, syncUploadedMap]);

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
    setUploadedMapVersion((prev) => prev + 1);
  }, []);

  const closeAfterSave = useCallback(() => {
    Keyboard.dismiss();
    clearQueuedPayload();
    // Clear tracking WITHOUT deleting saved images from Cloudinary
    uploadedMapRef.current = {};
    draftIdempotencyKeyRef.current = null;
    initializedKeyRef.current = null;
    setUploadedMapVersion((prev) => prev + 1);
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
  }, [clearQueuedPayload, cleanupSessionUploadsOnly, isEdit, initialPhone, onClose]);

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
    [isEdit, post, updateMutation, createMutation, closeAfterSave, handleUgcError],
  );

  const runUploadAndSubmit = useCallback(
    async (validatedPayload: SanitizedMarketplaceForm) => {
      // Upload only newly picked local URIs, keeping existing remote URLs untouched
      const localOnlyUris = form.localImages.filter((uri) => !isRemoteUrl(uri));
      let currentMap = { ...uploadedMapRef.current };

      if (localOnlyUris.length > 0) {
        const updatedMap = await uploadPendingLostFoundImages({
          uris: localOnlyUris,
          uploadedMap: currentMap,
          folder: CLOUDINARY_FOLDERS.CAMPUS_HUB.MARKETPLACE,
          singlePhotoLabel: isEdit ? "A newly added photo" : "A photo",
          uploadErrorTitle: "Photo Upload Failed",
          uploadErrorFallback: "Please check your internet connection and try again.",
          setIsUploading,
          setUploadedMap: (next) => {
            syncUploadedMap(next);
          },
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
    [form.localImages, isEdit, syncUploadedMap, queuePayload, submitListingPayload],
  );

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    if (!requireOnline(isOffline, "Reconnect to the internet to save your listing.")) {
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

    if (form.localImages.length > MARKETPLACE_LIMITS.MAX_IMAGES) {
      Toast.show({
        type: "error",
        text1: "Photo Limit Exceeded",
        text2: `Maximum ${MARKETPLACE_LIMITS.MAX_IMAGES} photos allowed for a marketplace listing.`,
      });
      return;
    }

    const hasPendingLocalImages = form.localImages.some((uri) => !isRemoteUrl(uri));
    if (hasPendingLocalImages && ugcTermsQuery.data?.accepted === false) {
      queuePayload(validation.payload, (queued) => {
        void runUploadAndSubmit(queued);
      });
      setShowGuidelines(true);
      return;
    }

    await runUploadAndSubmit(validation.payload);
  }, [
    isSubmitting,
    isOffline,
    form,
    ugcTermsQuery.data?.accepted,
    queuePayload,
    runUploadAndSubmit,
    setShowGuidelines,
  ]);

  const handleAcceptGuidelines = useCallback(() => {
    if (!requireOnline(isOffline, "Reconnect to accept community guidelines.")) {
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
      <SafeAreaView style={styles.fullScreenContainer} edges={["top", "bottom"]}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>
              {isEdit ? "Edit Listing" : "New Listing"}
            </Text>
            <View style={styles.hubBadge}>
              <Text style={styles.hubBadgeText}>CAMPUS HUB</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleDiscardOrClose}
            style={styles.closeBtn}
            disabled={isSubmitting}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isEdit ? "Close edit listing" : "Close create listing"}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={18} color={CAMPUS_HUB_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>

        {isOffline && (
          <View style={styles.offlineBanner}>
            <Feather name="wifi-off" size={13} color={CAMPUS_HUB_COLORS.lostFoundAccentInk} />
            <Text style={styles.offlineBannerText}>
              You're offline. Reconnect before publishing changes.
            </Text>
          </View>
        )}

        <ModalKeyboardAvoidingView enabled={visible} style={styles.keyboardAvoid}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Segmented Control */}
            <View style={styles.segmentContainer}>
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  isSelling && styles.segmentBtnSellingActive,
                ]}
                onPress={() => update("type", "SELLING")}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="tab"
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
                >
                  I'm Selling
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  !isSelling && styles.segmentBtnWantedActive,
                ]}
                onPress={() => update("type", "BUYING")}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="tab"
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
                >
                  Looking to Buy
                </Text>
              </TouchableOpacity>
            </View>

            {/* Title */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>
                  TITLE <Text style={styles.requiredStar}>*</Text>
                </Text>
                <Text style={styles.counterText}>
                  {form.title.length}/{MARKETPLACE_LIMITS.MAX_TITLE}
                </Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Calculus 8th Edition, Casio FX-991EX"
                placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                value={form.title}
                onChangeText={(v) => update("title", v)}
                maxLength={MARKETPLACE_LIMITS.MAX_TITLE}
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
                      <TouchableOpacity
                        key={cond.key}
                        style={[
                          styles.conditionChip,
                          isSelected && styles.conditionChipActive,
                        ]}
                        onPress={() => update("condition", cond.key)}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            styles.conditionChipText,
                            isSelected && styles.conditionChipTextActive,
                          ]}
                        >
                          {cond.label}
                        </Text>
                      </TouchableOpacity>
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
                  <Text style={styles.priceFormattedText}>
                    {formattedPricePreview}
                  </Text>
                )}
              </View>

              <View style={styles.priceInputBox}>
                <Text style={styles.takaSymbol}>৳</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0.00"
                  placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                  value={form.price}
                  onChangeText={handlePriceChange}
                  keyboardType="decimal-pad"
                  maxLength={10}
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
                    <TouchableOpacity
                      onPress={() => {
                        update("description", "");
                        setDescriptionLength(0);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.clearHeaderBtn}
                      activeOpacity={0.7}
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
                    </TouchableOpacity>
                  )}
                  <Text style={styles.charCountText}>
                    {descriptionLength}/{MARKETPLACE_LIMITS.MAX_DESCRIPTION_PLAIN}
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
                  maxLength={11}
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
            <TouchableOpacity
              style={[
                styles.publishBtn,
                isSubmitting && styles.publishBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
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
            </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CAMPUS_HUB_COLORS.subtleBorder,
    backgroundColor: CAMPUS_HUB_COLORS.white,
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
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.semantic.amber.border,
  },
  offlineBannerText: {
    fontFamily,
    fontSize: 12,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
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
    fontFamily,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
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
  },
  textInput: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily,
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  conditionRow: {
    flexDirection: "row",
    gap: 8,
  },
  conditionChip: {
    flex: 1,
    minHeight: 46,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  conditionChipActive: {
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight,
    borderColor: CAMPUS_HUB_COLORS.marketplaceAccent,
  },
  conditionChipText: {
    fontSize: 12,
    fontFamily,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    textAlignVertical: "center",
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
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  clearHeaderBtnText: {
    fontSize: 11,
    fontFamily,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.dangerText,
  },
  charCountText: {
    fontSize: 12,
    fontFamily,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  priceFormattedText: {
    fontSize: 12,
    fontFamily,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
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
  },
  validPhoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  validPhoneText: {
    fontSize: 11,
    fontFamily,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
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
    fontFamily,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
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
  },
  footerBar: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  publishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccent,
    paddingVertical: 13,
    borderRadius: 12,
    shadowColor: CAMPUS_HUB_COLORS.marketplaceAccent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  publishBtnDisabled: {
    backgroundColor: colors.semantic.emerald.mintBorderStrong,
    shadowOpacity: 0,
    elevation: 0,
  },
  publishBtnText: {
    fontSize: 14.5,
    fontFamily,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.white,
  },
  submittingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
