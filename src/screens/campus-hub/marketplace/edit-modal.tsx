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

import { useUpdateMarketplacePost } from "@/features/campus-hub/useMarketplace";
import {
  uploadMultipleImages,
  CLOUDINARY_FOLDERS,
} from "@/services/cloudinary-service";
import type {
  ListingType,
  MarketplaceCategory,
  ItemCondition,
  MarketplacePost,
} from "@/services/marketplace-service";
import { CAMPUS_HUB_COLORS, fontFamily } from "../shared/design-tokens";
import { ImagePickerRow } from "../shared/image-picker-row";

interface EditMarketplaceModalProps {
  visible: boolean;
  onClose: () => void;
  post: MarketplacePost;
}

const CATEGORIES: { key: MarketplaceCategory; label: string }[] = [
  { key: "TEXTBOOKS", label: "Textbooks" },
  { key: "ELECTRONICS", label: "Electronics" },
  { key: "STATIONERY", label: "Stationery" },
  { key: "CLOTHING", label: "Clothing" },
  { key: "OTHER", label: "Other" },
];

const CONDITIONS: { key: ItemCondition; label: string }[] = [
  { key: "NEW", label: "Brand New" },
  { key: "LIKE_NEW", label: "Like New" },
  { key: "GOOD", label: "Good" },
  { key: "FAIR", label: "Fair" },
];

const ACCENT = CAMPUS_HUB_COLORS.marketplaceAccent;

export const EditMarketplaceModal = React.memo(function EditMarketplaceModal({
  visible,
  onClose,
  post,
}: EditMarketplaceModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

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

  const defaultHeight = Math.round(windowHeight * 0.90);
  const maxAllowedWithKeyboard = windowHeight - keyboardHeight - Math.max(insets.top, 24) - 12;
  const sheetHeight =
    keyboardHeight > 0
      ? Math.max(280, Math.min(defaultHeight, maxAllowedWithKeyboard))
      : Math.min(defaultHeight, windowHeight - Math.max(insets.top, 24) - 16);

  const [form, setForm] = useState({
    type: post.type,
    title: post.title,
    description: post.description,
    price: post.price != null ? String(post.price) : "",
    category: post.category,
    condition: post.condition || "GOOD",
    contactPhone: post.contactPhone || "",
    images: post.images || [],
  });

  // Re-sync form when post changes or modal opens
  useEffect(() => {
    if (visible) {
      setForm({
        type: post.type,
        title: post.title,
        description: post.description,
        price: post.price != null ? String(post.price) : "",
        category: post.category,
        condition: post.condition || "GOOD",
        contactPhone: post.contactPhone || "",
        images: post.images || [],
      });
    }
  }, [visible, post]);

  const [isUploading, setIsUploading] = useState(false);
  const updateMutation = useUpdateMarketplacePost();
  const isSubmitting = isUploading || updateMutation.isPending;

  const update = useCallback(
    <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    []
  );

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  const canSubmit =
    form.title.trim().length > 0 &&
    form.description.trim().length > 0 &&
    !isSubmitting;

  const handleSubmit = useCallback(async () => {
    if (!form.title.trim()) {
      return Toast.show({ type: "error", text1: "Title is required." });
    }
    if (!form.description.trim()) {
      return Toast.show({ type: "error", text1: "Description is required." });
    }

    let finalImages: string[] = [];

    // Separate existing remote URLs from newly selected local file URIs
    const existingRemote = form.images.filter((img) => img.startsWith("http"));
    const newlyAdded = form.images.filter((img) => !img.startsWith("http"));

    finalImages = [...existingRemote];

    if (newlyAdded.length > 0) {
      setIsUploading(true);
      try {
        const results = await uploadMultipleImages(
          newlyAdded,
          CLOUDINARY_FOLDERS.CAMPUS_HUB.MARKETPLACE
        );
        finalImages = [...finalImages, ...results.map((r) => r.secureUrl)];
      } catch {
        setIsUploading(false);
        return Toast.show({
          type: "error",
          text1: "Image upload failed",
          text2: "Check your internet connection and try again.",
        });
      }
      setIsUploading(false);
    }

    const priceNum = form.price.trim() ? parseFloat(form.price) : null;

    updateMutation.mutate(
      {
        id: post.id,
        data: {
          type: form.type,
          title: form.title.trim(),
          description: form.description.trim(),
          price: priceNum,
          category: form.category,
          condition: form.type === "SELLING" ? form.condition : null,
          images: finalImages,
          contactPhone: form.contactPhone.trim() || null,
        },
      },
      {
        onSuccess: () => {
          Toast.show({ type: "success", text1: "Listing updated successfully!" });
          handleClose();
        },
        onError: (err: any) =>
          Toast.show({
            type: "error",
            text1: "Failed to update listing",
            text2: err.message ?? "Please try again.",
          }),
      }
    );
  }, [form, post.id, updateMutation, handleClose]);

  const isSelling = form.type === "SELLING";

  if (!visible) return null;

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
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close edit modal"
                activeOpacity={0.7}
              >
                <Feather name="x" size={20} color={CAMPUS_HUB_COLORS.deepNavy} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Edit Listing</Text>
              <View style={{ width: 36 }} />
            </View>

            {/* Scrollable Form Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Type Switcher */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeader}>LISTING TYPE</Text>
                <View style={styles.typeRow}>
                  <TouchableOpacity
                    style={[
                      styles.typeBtn,
                      isSelling && styles.typeBtnSellingActive,
                    ]}
                    onPress={() => update("type", "SELLING")}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.typeIndicator,
                        isSelling && styles.typeIndicatorSelling,
                      ]}
                    >
                      <Feather
                        name="tag"
                        size={14}
                        color={
                          isSelling
                            ? CAMPUS_HUB_COLORS.marketplaceAccentText
                            : CAMPUS_HUB_COLORS.subtleText
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.typeBtnTitle,
                          isSelling && { color: CAMPUS_HUB_COLORS.marketplaceAccentText },
                        ]}
                      >
                        I'm Selling
                      </Text>
                      <Text style={styles.typeBtnSub}>Offer item for sale</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeBtn,
                      !isSelling && styles.typeBtnWantedActive,
                    ]}
                    onPress={() => update("type", "BUYING")}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.typeIndicator,
                        !isSelling && styles.typeIndicatorWanted,
                      ]}
                    >
                      <Feather
                        name="search"
                        size={14}
                        color={
                          !isSelling
                            ? CAMPUS_HUB_COLORS.lostFoundAccentText
                            : CAMPUS_HUB_COLORS.subtleText
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.typeBtnTitle,
                          !isSelling && { color: CAMPUS_HUB_COLORS.lostFoundAccentText },
                        ]}
                      >
                        Looking to Buy
                      </Text>
                      <Text style={styles.typeBtnSub}>Request an item</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Item Details */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeader}>ITEM DETAILS</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    TITLE <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Item title"
                    placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                    value={form.title}
                    onChangeText={(v) => update("title", v)}
                    maxLength={100}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>CATEGORY</Text>
                  <View style={styles.chipRow}>
                    {CATEGORIES.map((cat) => {
                      const isSelected = form.category === cat.key;
                      return (
                        <TouchableOpacity
                          key={cat.key}
                          style={[styles.chip, isSelected && styles.chipActive]}
                          onPress={() => update("category", cat.key)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              isSelected && styles.chipTextActive,
                            ]}
                          >
                            {cat.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {isSelling && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>CONDITION</Text>
                    <View style={styles.chipRow}>
                      {CONDITIONS.map((cond) => {
                        const isSelected = form.condition === cond.key;
                        return (
                          <TouchableOpacity
                            key={cond.key}
                            style={[styles.chip, isSelected && styles.chipActive]}
                            onPress={() => update("condition", cond.key)}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                isSelected && styles.chipTextActive,
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
              </View>

              {/* Price & Description */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeader}>PRICE & DESCRIPTION</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>PRICE (BDT) — Optional</Text>
                  <View style={styles.priceInputWrapper}>
                    <View style={styles.currencyPrefix}>
                      <Text style={styles.currencySymbol}>৳</Text>
                    </View>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="e.g. 1500 (leave empty for negotiable)"
                      placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                      value={form.price}
                      onChangeText={(v) => update("price", v.replace(/[^0-9.]/g, ""))}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    DESCRIPTION <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Item details..."
                    placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                    value={form.description}
                    onChangeText={(v) => update("description", v)}
                    multiline={true}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Contact & Photos */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeader}>CONTACT & PHOTOS</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>CONTACT PHONE / WHATSAPP</Text>
                  <View style={styles.phoneInputWrapper}>
                    <Feather
                      name="phone"
                      size={16}
                      color={CAMPUS_HUB_COLORS.subtleText}
                      style={{ marginLeft: 14 }}
                    />
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="Phone or WhatsApp"
                      placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                      value={form.contactPhone}
                      onChangeText={(v) => update("contactPhone", v)}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <ImagePickerRow
                  images={form.images}
                  onImagesChange={(imgs) => update("images", imgs)}
                  maxImages={6}
                  accent={ACCENT}
                />
              </View>
            </ScrollView>

            {/* Bottom Docked Footer */}
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
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <View style={styles.submittingRow}>
                    <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.submitBtnText}>Saving changes...</Text>
                  </View>
                ) : (
                  <>
                    <Feather name="check" size={16} color="#ffffff" style={{ marginRight: 8 }} />
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
    marginBottom: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 14,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  headerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  scroll: {
    padding: 16,
    paddingBottom: 24,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  sectionHeader: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  typeRow: {
    gap: 10,
  },
  typeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(0, 0, 0, 0.06)",
    backgroundColor: "#f8fafc",
  },
  typeBtnSellingActive: {
    backgroundColor: "#f0fdf4",
    borderColor: ACCENT,
  },
  typeBtnWantedActive: {
    backgroundColor: "#fffbeb",
    borderColor: CAMPUS_HUB_COLORS.lostFoundAccent,
  },
  typeIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  typeIndicatorSelling: {
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight,
  },
  typeIndicatorWanted: {
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentLight,
  },
  typeBtnTitle: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  typeBtnSub: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 2,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  required: {
    color: CAMPUS_HUB_COLORS.dangerText,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily,
    fontSize: 13.5,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.neutralText,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  textArea: {
    minHeight: 90,
    paddingTop: 11,
    lineHeight: 20,
  },
  priceInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
  },
  currencyPrefix: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: "#f1f5f9",
    borderRightWidth: 1,
    borderRightColor: "rgba(0, 0, 0, 0.06)",
  },
  currencySymbol: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: ACCENT,
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily,
    fontSize: 13.5,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  chipActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  chipText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  chipTextActive: {
    color: "#ffffff",
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT,
    height: 50,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submittingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
});
