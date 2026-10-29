import React, { useState, useCallback, useMemo, useEffect } from "react";
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

import { useCreateMarketplacePost } from "@/features/campus-hub/useMarketplace";
import {
  uploadMultipleImages,
  CLOUDINARY_FOLDERS,
} from "@/services/cloudinary-service";
import type {
  ListingType,
  MarketplaceCategory,
  ItemCondition,
  CreateMarketplaceInput,
} from "@/services/marketplace-service";
import type { User } from "@/types/auth";
import { CAMPUS_HUB_COLORS, fontFamily } from "../shared/design-tokens";
import { ImagePickerRow } from "../shared/image-picker-row";
import {
  CONDITIONS,
  formatBangladeshiPhone,
  isValidBangladeshiPhone,
} from "./marketplace-constants";
import { MarketplaceCategoryPicker } from "./components/marketplace-category-picker";
import { MarketplaceRichEditor } from "./components/marketplace-rich-editor";

interface ComposeMarketplaceModalProps {
  visible: boolean;
  onClose: () => void;
  currentUser: User | null;
}

const ACCENT = CAMPUS_HUB_COLORS.marketplaceAccent;

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

const INITIAL_FORM: FormState = {
  type: "SELLING",
  title: "",
  description: "",
  price: "",
  category: "TEXTBOOKS",
  condition: "GOOD",
  contactPhone: "+880",
  localImages: [],
};

export const ComposeMarketplaceModal = React.memo(
  function ComposeMarketplaceModal({
    visible,
    onClose,
    currentUser,
  }: ComposeMarketplaceModalProps) {
    const insets = useSafeAreaInsets();

    const initialPhone = useMemo(() => {
      if (currentUser?.phoneNumber) {
        return formatBangladeshiPhone(currentUser.phoneNumber);
      }
      return "+880";
    }, [currentUser?.phoneNumber]);

    const [form, setForm] = useState<FormState>({
      ...INITIAL_FORM,
      contactPhone: initialPhone,
    });
    const [descriptionLength, setDescriptionLength] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
      if (visible && currentUser?.phoneNumber) {
        const formatted = formatBangladeshiPhone(currentUser.phoneNumber);
        if (isValidBangladeshiPhone(formatted)) {
          setForm((prev) => {
            if (!prev.contactPhone || prev.contactPhone === "+880") {
              return { ...prev, contactPhone: formatted };
            }
            return prev;
          });
        }
      }
    }, [visible, currentUser?.phoneNumber]);

    const createMutation = useCreateMarketplacePost();
    const isSubmitting = isUploading || createMutation.isPending;

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

    const isPriceValid = useMemo(() => {
      if (!form.price.trim()) return true;
      const num = parseInt(form.price, 10);
      return !isNaN(num) && num >= 0 && num <= 10000000;
    }, [form.price]);

    const formattedPricePreview = useMemo(() => {
      if (!form.price.trim()) return "";
      const num = parseInt(form.price, 10);
      if (isNaN(num)) return "";
      return `৳ ${num.toLocaleString("en-US")}`;
    }, [form.price]);

    const hasContent =
      form.title.trim().length > 0 ||
      form.description.trim().length > 0 ||
      form.price.trim().length > 0 ||
      form.localImages.length > 0 ||
      (form.contactPhone !== "+880" && form.contactPhone.length > 4);

    const handleClose = useCallback(() => {
      Keyboard.dismiss();
      if (hasContent) {
        Alert.alert(
          "Discard Listing?",
          "You have unsaved changes. Are you sure you want to discard them?",
          [
            { text: "Keep Editing", style: "cancel" },
            {
              text: "Discard",
              style: "destructive",
              onPress: () => {
                setForm({ ...INITIAL_FORM, contactPhone: initialPhone });
                setDescriptionLength(0);
                onClose();
              },
            },
          ],
        );
      } else {
        setForm({ ...INITIAL_FORM, contactPhone: initialPhone });
        setDescriptionLength(0);
        onClose();
      }
    }, [hasContent, initialPhone, onClose]);

    const canSubmit =
      form.title.trim().length >= 2 &&
      form.description.trim().length >= 5 &&
      isPriceValid &&
      isPhoneValid &&
      !isSubmitting;

    const handleSubmit = useCallback(async () => {
      if (isSubmitting) return;

      if (!form.title.trim()) {
        return Toast.show({
          type: "error",
          text1: "Title Required",
          text2: "Please enter an item title.",
        });
      }

      if (form.title.trim().length < 2) {
        return Toast.show({
          type: "error",
          text1: "Title Too Short",
          text2: "Title must be at least 2 characters.",
        });
      }

      let priceNum = 0;
      if (form.price.trim()) {
        priceNum = parseInt(form.price, 10);
        if (isNaN(priceNum) || priceNum < 0) {
          return Toast.show({
            type: "error",
            text1: "Invalid Price",
            text2: "Price must be a valid number in Bangladeshi Taka (৳).",
          });
        }
      }

      if (!form.description.trim() || form.description.trim().length < 5) {
        return Toast.show({
          type: "error",
          text1: "Description Required",
          text2: "Please provide a description (at least 5 characters).",
        });
      }

      if (!isValidBangladeshiPhone(form.contactPhone)) {
        return Toast.show({
          type: "error",
          text1: "Contact Phone Required",
          text2:
            "Please enter a valid 11-digit mobile number (e.g. 01956014045).",
        });
      }

      if (form.localImages.length > 4) {
        return Toast.show({
          type: "error",
          text1: "Photo Limit Exceeded",
          text2: "Maximum 4 photos allowed for a marketplace listing.",
        });
      }

      // Check photo file sizes (max 5MB each)
      if (form.localImages.length > 0) {
        for (let i = 0; i < form.localImages.length; i++) {
          const uri = form.localImages[i];
          try {
            const info = await FileSystem.getInfoAsync(uri);
            if (
              info.exists &&
              typeof (info as any).size === "number" &&
              (info as any).size > 5 * 1024 * 1024
            ) {
              const sizeMb = ((info as any).size / (1024 * 1024)).toFixed(1);
              return Toast.show({
                type: "error",
                text1: "Photo Exceeds 5MB",
                text2: `Photo ${i + 1} is ${sizeMb}MB. Please choose an image under 5MB.`,
              });
            }
          } catch {}
        }
      }

      let imageUrls: string[] = [];
      if (form.localImages.length > 0) {
        setIsUploading(true);
        try {
          const results = await uploadMultipleImages(
            form.localImages,
            CLOUDINARY_FOLDERS.CAMPUS_HUB.MARKETPLACE,
          );
          imageUrls = results.map((r) => r.secureUrl);
        } catch (err: any) {
          setIsUploading(false);
          const errMsg =
            err?.response?.data?.message ||
            err?.message ||
            "Please check your internet connection and try again.";
          return Toast.show({
            type: "error",
            text1: "Image Upload Failed",
            text2: errMsg,
          });
        }
        setIsUploading(false);
      }

      const payload: CreateMarketplaceInput = {
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim(),
        price: priceNum,
        category: form.category,
        condition: form.type === "SELLING" ? form.condition : null,
        images: imageUrls,
        contactPhone: form.contactPhone.trim(),
      };

      createMutation.mutate(payload, {
        onSuccess: () => {
          Keyboard.dismiss();
          setForm({ ...INITIAL_FORM, contactPhone: initialPhone });
          setDescriptionLength(0);
          onClose();
          setTimeout(() => {
            Toast.show({
              type: "success",
              text1: "Listing Published!",
              text2: "Your campus listing is now live.",
            });
          }, 350);
        },
        onError: (err: any) => {
          const errMsg =
            err?.response?.data?.message ||
            err?.message ||
            "Please check your input and try again.";
          Toast.show({
            type: "error",
            text1: "Failed to Publish",
            text2: errMsg,
          });
        },
      });
    }, [form, createMutation, initialPhone, isSubmitting, onClose]);

    const isSelling = form.type === "SELLING";

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
          {/* Top Header */}
          <View style={styles.topHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>New Listing</Text>
              <View style={styles.hubBadge}>
                <Text style={styles.hubBadgeText}>CAMPUS HUB</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close create listing"
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
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Modern Segmented Control */}
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
                    {form.title.length}/100
                  </Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Calculus 8th Edition, Casio FX-991EX"
                  placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                  value={form.title}
                  onChangeText={(v) => update("title", v)}
                  maxLength={100}
                />
              </View>

              {/* Category Picker (Modal Drawer) */}
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
                    placeholder="0"
                    placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                    value={form.price}
                    onChangeText={(v) =>
                      update("price", v.replace(/[^0-9]/g, ""))
                    }
                    keyboardType="numeric"
                    maxLength={8}
                  />
                </View>
              </View>

              {/* Description & Rich Text Formatter */}
              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.fieldLabel}>
                    DESCRIPTION <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <Text style={styles.charCountText}>
                    {descriptionLength}/3000
                  </Text>
                </View>
                <MarketplaceRichEditor
                  value={form.description}
                  onChangeText={(val) => update("description", val)}
                  onLengthChange={setDescriptionLength}
                  placeholder="Mention item condition, edition, included accessories, or campus meetup point..."
                  maxLength={3000}
                  minHeight={130}
                />
              </View>

              {/* Contact Phone (Mandatory 14 Chars) */}
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
                    onChangeText={(digits) => handlePhoneChange(digits)}
                    keyboardType="phone-pad"
                    maxLength={11}
                  />
                </View>
              </View>

              {/* Photos (Max 4, Optional) */}
              <View style={styles.formGroup}>
                <ImagePickerRow
                  images={form.localImages}
                  onImagesChange={(imgs) =>
                    update("localImages", imgs.slice(0, 4))
                  }
                  maxImages={4}
                  accent={ACCENT}
                  label={`PHOTOS (OPTIONAL) • ${form.localImages.length}/4`}
                  hint="max up to 5 MB for each"
                />
              </View>
            </ScrollView>

            {/* Bottom Docked Action Footer */}
            <View
              style={[
                styles.footerBar,
                { paddingBottom: Math.max(insets.bottom, 16) },
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
                      color="#ffffff"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.publishBtnText}>
                      {isUploading
                        ? "Uploading photos..."
                        : "Publishing listing..."}
                    </Text>
                  </View>
                ) : (
                  <>
                    <Feather
                      name="check"
                      size={17}
                      color="#ffffff"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.publishBtnText}>
                      {isSelling
                        ? "Publish For Sale"
                        : "Publish Buying Request"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>

          {/* Embedded Toast Overlay for Modal Viewport */}
          <Toast
            config={toastConfig}
            topOffset={Math.max(insets.top + 8, 44)}
          />
        </SafeAreaView>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(19, 27, 46, 0.06)",
    backgroundColor: "#ffffff",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
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
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 16,
  },

  // Segmented Control
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
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
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentBtnWantedActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
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

  // Form Fields
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
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily,
    color: CAMPUS_HUB_COLORS.neutralText,
  },

  // Condition Pills
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
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.08)",
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
  charCountText: {
    fontSize: 12,
    fontFamily,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
  },

  // Price Input
  priceFormattedText: {
    fontSize: 12,
    fontFamily,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
  },
  priceInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.12)",
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

  // Phone Input
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
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.12)",
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
    borderRightColor: "rgba(19, 27, 46, 0.08)",
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

  // Footer
  footerBar: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "rgba(19, 27, 46, 0.06)",
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
    backgroundColor: "#a7f3d0",
    shadowOpacity: 0,
    elevation: 0,
  },
  publishBtnText: {
    fontSize: 14.5,
    fontFamily,
    fontWeight: "800",
    color: "#ffffff",
  },
  submittingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
