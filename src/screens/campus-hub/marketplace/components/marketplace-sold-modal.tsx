import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";

interface MarketplaceSoldModalProps {
  visible: boolean;
  isSubmitting: boolean;
  itemTitle?: string;
  itemPrice?: number | null;
  isSelling?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const MarketplaceSoldModal = React.memo(function MarketplaceSoldModal({
  visible,
  isSubmitting,
  itemTitle,
  itemPrice,
  isSelling = true,
  onConfirm,
  onClose,
}: MarketplaceSoldModalProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const titleText = isSelling ? "Mark as Sold?" : "Mark as Fulfilled?";
  const descriptionText = isSelling
    ? "This listing will be marked with a SOLD badge. Students will see that the item has found a buyer."
    : "This request will be marked as fulfilled. Students will know you are no longer looking for this item.";
  const confirmBtnText = isSelling ? "Confirm Sold" : "Confirm Fulfilled";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isSubmitting ? undefined : onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <Pressable
        style={styles.backdrop}
        onPress={isSubmitting ? undefined : onClose}
        accessibilityViewIsModal={true}
      >
        <Pressable
          style={[
            styles.modalCard,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 24 },
          ]}
          onPress={() => {}}
        >
          {/* Success / Status Icon Circle */}
          <View style={styles.iconCircle}>
            <Feather
              name="check-circle"
              size={28}
              color={CAMPUS_HUB_COLORS.marketplaceAccentText}
            />
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>{titleText}</Text>
          <Text style={styles.description}>{descriptionText}</Text>

          {/* Mini Item Preview Snippet */}
          {itemTitle ? (
            <View style={styles.itemPreviewBox}>
              <Text style={styles.itemPreviewTitle} numberOfLines={1}>
                {itemTitle}
              </Text>
              {itemPrice != null ? (
                <Text style={styles.itemPreviewPrice}>
                  ৳{itemPrice.toLocaleString()}
                </Text>
              ) : (
                <Text style={styles.itemPreviewNegotiable}>
                  {isSelling ? "Price negotiable" : "Budget open"}
                </Text>
              )}
            </View>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.cancelBtn,
                pressed && !isSubmitting && { opacity: 0.78 },
              ]}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
              onPress={onClose}
              disabled={isSubmitting}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel marking as sold"
              accessibilityState={{ disabled: isSubmitting }}
            >
              <Text style={styles.cancelBtnText} maxFontSizeMultiplier={1.2}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.confirmBtn,
                isSubmitting && styles.confirmBtnDisabled,
                pressed && !isSubmitting && { opacity: 0.85 },
              ]}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
              onPress={onConfirm}
              disabled={isSubmitting}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={confirmBtnText}
              accessibilityState={{
                disabled: isSubmitting,
                busy: isSubmitting,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator
                  size="small"
                  color={CAMPUS_HUB_COLORS.white}
                />
              ) : (
                <View style={styles.btnContentRow}>
                  <Feather
                    name="check"
                    size={16}
                    color={CAMPUS_HUB_COLORS.white}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={styles.confirmBtnText}
                    maxFontSizeMultiplier={1.2}
                  >
                    {confirmBtnText}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrimDark,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
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
  iconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: CAMPUS_HUB_COLORS.resolvedGreenBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.semantic.emerald.mintBorder,
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
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  itemPreviewBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.slate50,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  itemPreviewTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    flex: 1,
    marginRight: 10,
  },
  itemPreviewPrice: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
    fontVariant: ["tabular-nums"],
  },
  itemPreviewNegotiable: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
    fontStyle: "italic",
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
  confirmBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccent,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  confirmBtnDisabled: {
    opacity: 0.65,
  },
  btnContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.white,
    includeFontPadding: false,
  },
});
