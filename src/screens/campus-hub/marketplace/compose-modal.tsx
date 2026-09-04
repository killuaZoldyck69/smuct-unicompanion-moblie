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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { useCreateMarketplacePost } from "@/features/campus-hub/useMarketplace";
import { uploadMultipleImages } from "@/services/cloudinary-service";
import type {
  ListingType,
  MarketplaceCategory,
  ItemCondition,
  CreateMarketplaceInput,
} from "@/services/marketplace-service";
import type { User } from "@/types/auth";
import { CAMPUS_HUB_COLORS, fontFamily } from "../shared/design-tokens";
import { ImagePickerRow } from "../shared/image-picker-row";

interface ComposeMarketplaceModalProps {
  visible: boolean;
  onClose: () => void;
  currentUser: User | null;
}

const CATEGORIES: { key: MarketplaceCategory; label: string }[] = [
  { key: "TEXTBOOKS", label: "Textbooks" },
  { key: "ELECTRONICS", label: "Electronics" },
  { key: "STATIONERY", label: "Stationery" },
  { key: "CLOTHING", label: "Clothing" },
  { key: "OTHER", label: "Other" },
];

const CONDITIONS: { key: ItemCondition; label: string }[] = [
  { key: "NEW", label: "New" },
  { key: "LIKE_NEW", label: "Like New" },
  { key: "GOOD", label: "Good" },
  { key: "FAIR", label: "Fair" },
];

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
  category: "OTHER",
  condition: "GOOD",
  contactPhone: "",
  localImages: [],
};

export const ComposeMarketplaceModal = React.memo(function ComposeMarketplaceModal({
  visible,
  onClose,
  currentUser,
}: ComposeMarketplaceModalProps) {
  const [form, setForm] = useState<FormState>({
    ...INITIAL_FORM,
    contactPhone: currentUser?.phoneNumber ?? "",
  });
  const [isUploading, setIsUploading] = useState(false);

  const createMutation = useCreateMarketplacePost();
  const isSubmitting = isUploading || createMutation.isPending;

  const update = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    []
  );

  const handleClose = useCallback(() => {
    setForm({ ...INITIAL_FORM, contactPhone: currentUser?.phoneNumber ?? "" });
    onClose();
  }, [onClose, currentUser]);

  const handleSubmit = useCallback(async () => {
    if (!form.title.trim()) {
      return Toast.show({ type: "error", text1: "Title is required." });
    }
    if (!form.description.trim()) {
      return Toast.show({ type: "error", text1: "Description is required." });
    }

    let imageUrls: string[] = [];
    if (form.localImages.length > 0) {
      setIsUploading(true);
      try {
        const results = await uploadMultipleImages(form.localImages, "marketplace");
        imageUrls = results.map((r) => r.secureUrl);
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

    const priceNum = form.price.trim() ? parseFloat(form.price) : null;

    const payload: CreateMarketplaceInput = {
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim(),
      price: priceNum,
      category: form.category,
      condition: form.type === "SELLING" ? form.condition : null,
      images: imageUrls,
      contactPhone: form.contactPhone.trim() || null,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        Toast.show({ type: "success", text1: "Listing published!" });
        handleClose();
      },
      onError: (err: any) =>
        Toast.show({
          type: "error",
          text1: "Failed to publish",
          text2: err.message ?? "Please try again.",
        }),
    });
  }, [form, createMutation, handleClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Feather name="x" size={20} color={CAMPUS_HUB_COLORS.deepNavy} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Listing</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.typeRow}>
              {(["SELLING", "BUYING"] as ListingType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeBtn,
                    form.type === t && {
                      backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight,
                      borderColor: ACCENT,
                    },
                  ]}
                  onPress={() => update("type", t)}
                  accessible
                  accessibilityRole="radio"
                  accessibilityState={{ checked: form.type === t }}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      form.type === t && { color: CAMPUS_HUB_COLORS.marketplaceAccentText },
                    ]}
                  >
                    {t === "SELLING" ? "I'm Selling" : "I'm Looking to Buy"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>TITLE</Text>
              <TextInput
                style={styles.input}
                placeholder="Item name or short description"
                placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                value={form.title}
                onChangeText={(v) => update("title", v)}
                maxLength={100}
                accessible
                accessibilityLabel="Listing title"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>DESCRIPTION</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the item, specifications, etc."
                placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                value={form.description}
                onChangeText={(v) => update("description", v)}
                multiline
                textAlignVertical="top"
                accessible
                accessibilityLabel="Listing description"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>PRICE (BDT) — Optional</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 350"
                placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                value={form.price}
                onChangeText={(v) => update("price", v.replace(/[^0-9.]/g, ""))}
                keyboardType="numeric"
                accessible
                accessibilityLabel="Price in BDT"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>CATEGORY</Text>
              <View style={styles.chipRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.chip,
                      form.category === cat.key && {
                        backgroundColor: ACCENT,
                        borderColor: ACCENT,
                      },
                    ]}
                    onPress={() => update("category", cat.key)}
                    accessible
                    accessibilityRole="radio"
                    accessibilityState={{ checked: form.category === cat.key }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        form.category === cat.key && { color: "#ffffff" },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {form.type === "SELLING" && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>CONDITION</Text>
                <View style={styles.chipRow}>
                  {CONDITIONS.map((cond) => (
                    <TouchableOpacity
                      key={cond.key}
                      style={[
                        styles.chip,
                        form.condition === cond.key && {
                          backgroundColor: ACCENT,
                          borderColor: ACCENT,
                        },
                      ]}
                      onPress={() => update("condition", cond.key)}
                      accessible
                      accessibilityRole="radio"
                      accessibilityState={{ checked: form.condition === cond.key }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          form.condition === cond.key && { color: "#ffffff" },
                        ]}
                      >
                        {cond.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>CONTACT PHONE — Optional</Text>
              <TextInput
                style={styles.input}
                placeholder="Your phone or WhatsApp number"
                placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                value={form.contactPhone}
                onChangeText={(v) => update("contactPhone", v)}
                keyboardType="phone-pad"
                accessible
                accessibilityLabel="Contact phone"
              />
            </View>

            <ImagePickerRow
              images={form.localImages}
              onImagesChange={(imgs) => update("localImages", imgs)}
              maxImages={6}
              accent={ACCENT}
            />

            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Publish listing"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather name="send" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Publish Listing</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  headerTitle: {
    fontFamily,
    fontSize: 16,
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
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    alignItems: "center",
  },
  typeBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.neutralText,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  chipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    marginTop: 10,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
