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

interface MarketplaceDeleteModalProps {
  visible: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const MarketplaceDeleteModal = React.memo(function MarketplaceDeleteModal({
  visible,
  isDeleting,
  onConfirm,
  onClose,
}: MarketplaceDeleteModalProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isDeleting ? undefined : onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={isDeleting ? undefined : onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 24 },
              ]}
            >
              {/* Warning Icon Circle */}
              <View style={styles.iconCircle}>
                <Feather name="trash-2" size={24} color="#e11d48" />
              </View>

              {/* Title & Description */}
              <Text style={styles.title}>Delete Listing?</Text>
              <Text style={styles.description}>
                This listing will be permanently removed from the Campus Marketplace. This action cannot be undone.
              </Text>

              {/* Actions */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.cancelBtn]}
                  onPress={onClose}
                  disabled={isDeleting}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel listing deletion"
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.deleteBtn, isDeleting && styles.deleteBtnDisabled]}
                  onPress={onConfirm}
                  disabled={isDeleting}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Confirm delete listing"
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <View style={styles.btnContentRow}>
                      <Feather name="trash-2" size={15} color="#ffffff" />
                      <Text style={styles.deleteBtnText}>Delete</Text>
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
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#ffe4e6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
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
    marginBottom: 22,
    paddingHorizontal: 10,
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
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  deleteBtn: {
    backgroundColor: "#e11d48",
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
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
});
