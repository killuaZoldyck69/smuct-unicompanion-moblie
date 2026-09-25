import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
    >
      <TouchableWithoutFeedback onPress={isSubmitting ? undefined : onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 24 },
              ]}
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
                <TouchableOpacity
                  style={[styles.btn, styles.cancelBtn]}
                  onPress={onClose}
                  disabled={isSubmitting}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel marking as sold"
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.btn,
                    styles.confirmBtn,
                    isSubmitting && styles.confirmBtnDisabled,
                  ]}
                  onPress={onConfirm}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={confirmBtnText}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <View style={styles.btnContentRow}>
                      <Feather
                        name="check"
                        size={16}
                        color="#ffffff"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.confirmBtnText}>{confirmBtnText}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 15, 29, 0.65)",
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
    borderColor: "rgba(19, 27, 46, 0.06)",
  },
  iconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  title: {
    fontFamily,
    fontSize: 19,
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
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
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
    height: 46,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: "#f1f5f9",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
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
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
