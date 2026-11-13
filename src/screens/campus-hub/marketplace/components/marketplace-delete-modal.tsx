import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";
import type { ListingType } from "@/services/marketplace-service";

interface MarketplaceDeleteModalProps {
  visible: boolean;
  isDeleting: boolean;
  postTitle?: string;
  postPrice?: number | null;
  postType?: ListingType;
  postImage?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const MarketplaceDeleteModal = React.memo(
  function MarketplaceDeleteModal({
    visible,
    isDeleting,
    postTitle,
    postPrice,
    postType = "SELLING",
    postImage,
    onConfirm,
    onClose,
  }: MarketplaceDeleteModalProps) {
    const insets = useSafeAreaInsets();
    const isSelling = postType === "SELLING";
    const [failedThumb, setFailedThumb] = useState(false);

    useEffect(() => {
      setFailedThumb(false);
    }, [postImage]);

    if (!visible) return null;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={isDeleting ? undefined : onClose}
        statusBarTranslucent
        navigationBarTranslucent
      >
        <Pressable
          style={styles.backdrop}
          onPress={isDeleting ? undefined : onClose}
          accessibilityViewIsModal={true}
        >
          <Pressable
            style={[
              styles.modalCard,
              { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 24 },
            ]}
            onPress={() => {}}
          >
            {/* Warning Halo Circle */}
            <View style={styles.haloOuter}>
              <View style={styles.haloInner}>
                <Feather
                  name="trash-2"
                  size={22}
                  color={CAMPUS_HUB_COLORS.dangerText}
                />
              </View>
            </View>

            {/* Title & Description */}
            <Text style={styles.title}>Delete Listing?</Text>
            <Text style={styles.description}>
              This listing will be permanently removed from the Campus
              Marketplace. This action cannot be undone.
            </Text>

            {/* Optional Post Preview Card */}
            {!!postTitle && (
              <View style={styles.previewCard}>
                <View style={styles.previewThumbContainer}>
                  {postImage && !failedThumb ? (
                    <Image
                      source={{ uri: postImage }}
                      style={styles.previewThumb}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      onError={() => setFailedThumb(true)}
                    />
                  ) : (
                    <View style={styles.previewPlaceholder}>
                      <Feather
                        name="shopping-bag"
                        size={18}
                        color={CAMPUS_HUB_COLORS.subtleText}
                      />
                    </View>
                  )}
                </View>

                <View style={styles.previewMeta}>
                  <Text style={styles.previewTitle} numberOfLines={1}>
                    {postTitle}
                  </Text>
                  <View style={styles.previewBadgeRow}>
                    <View
                      style={[
                        styles.typeBadge,
                        isSelling
                          ? styles.typeBadgeSelling
                          : styles.typeBadgeWanted,
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeBadgeText,
                          isSelling
                            ? styles.typeBadgeTextSelling
                            : styles.typeBadgeTextWanted,
                        ]}
                        maxFontSizeMultiplier={1.2}
                      >
                        {isSelling ? "SELLING" : "BUYING"}
                      </Text>
                    </View>

                    {postPrice != null ? (
                      <Text style={styles.priceText}>
                        ৳{postPrice.toLocaleString()}
                      </Text>
                    ) : (
                      <Text style={styles.priceNegotiableText}>
                        {isSelling ? "Negotiable" : "Open"}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  styles.cancelBtn,
                  pressed && !isDeleting && { opacity: 0.78 },
                ]}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                onPress={onClose}
                disabled={isDeleting}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cancel listing deletion"
                accessibilityState={{ disabled: isDeleting }}
              >
                <Text style={styles.cancelBtnText} maxFontSizeMultiplier={1.2}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  styles.deleteBtn,
                  isDeleting && styles.deleteBtnDisabled,
                  pressed && !isDeleting && { opacity: 0.85 },
                ]}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
                onPress={onConfirm}
                disabled={isDeleting}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Confirm delete listing"
                accessibilityState={{ disabled: isDeleting, busy: isDeleting }}
              >
                {isDeleting ? (
                  <ActivityIndicator
                    size="small"
                    color={CAMPUS_HUB_COLORS.white}
                  />
                ) : (
                  <View style={styles.btnContentRow}>
                    <Feather
                      name="trash-2"
                      size={15}
                      color={CAMPUS_HUB_COLORS.white}
                    />
                    <Text
                      style={styles.deleteBtnText}
                      maxFontSizeMultiplier={1.2}
                    >
                      Delete
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrimDark,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    alignItems: "center",
    ...CAMPUS_HUB_COLORS.heroShadow,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  haloOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.semantic.rose.tint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.semantic.rose.border,
  },
  haloInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: CAMPUS_HUB_COLORS.dangerBg,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 18,
    paddingHorizontal: 6,
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    borderRadius: 14,
    padding: 10,
    gap: 12,
    width: "100%",
    marginBottom: 20,
  },
  previewThumbContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: "hidden",
  },
  previewThumb: {
    width: "100%",
    height: "100%",
  },
  previewPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: CAMPUS_HUB_COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  previewMeta: {
    flex: 1,
    gap: 4,
  },
  previewTitle: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  previewBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeBadgeSelling: {
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight,
    borderColor: colors.semantic.emerald.mintBorder,
  },
  typeBadgeWanted: {
    backgroundColor: CAMPUS_HUB_COLORS.forumAccentLight,
    borderColor: colors.semantic.blue.border,
  },
  typeBadgeText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  typeBadgeTextSelling: {
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
  },
  typeBadgeTextWanted: {
    color: CAMPUS_HUB_COLORS.forumAccent,
  },
  priceText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    fontVariant: ["tabular-nums"],
  },
  priceNegotiableText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cancelBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
    includeFontPadding: false,
  },
  deleteBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.dangerText,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  deleteBtnDisabled: {
    opacity: 0.6,
  },
  btnContentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deleteBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.white,
    includeFontPadding: false,
  },
});
