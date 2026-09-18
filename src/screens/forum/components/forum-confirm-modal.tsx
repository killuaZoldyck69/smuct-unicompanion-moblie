import React, { memo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";

interface ForumConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  type?: "danger" | "success" | "info";
  iconName?: React.ComponentProps<typeof Feather>["name"];
  isLoading?: boolean;
}

export const ForumConfirmModal = memo(function ForumConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  type = "danger",
  iconName,
  isLoading = false,
}: ForumConfirmModalProps) {
  const isDanger = type === "danger";
  const isSuccess = type === "success";

  const defaultIcon: React.ComponentProps<typeof Feather>["name"] = isDanger
    ? "trash-2"
    : isSuccess
      ? "check-circle"
      : "help-circle";

  const resolvedIconName = iconName || defaultIcon;

  const haloBg = isDanger
    ? BENTO_COLORS.dangerBg
    : isSuccess
      ? BENTO_COLORS.emeraldBg
      : BENTO_COLORS.skyBg;

  const iconColor = isDanger
    ? BENTO_COLORS.danger
    : isSuccess
      ? BENTO_COLORS.emerald
      : BENTO_COLORS.sky;

  const confirmBtnBg = isDanger
    ? BENTO_COLORS.danger
    : isSuccess
      ? BENTO_COLORS.emerald
      : BENTO_COLORS.deepNavy;

  return (
    <Modal
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      animationType="fade"
      onRequestClose={() => !isLoading && onClose()}
    >
      <View style={styles.overlay}>
        {/* Backdrop dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => !isLoading && onClose()}
          accessible={false}
        />

        {/* Centered Modal Card */}
        <View style={styles.cardContainer}>
          {/* Top Halo Icon */}
          <View style={[styles.haloOuter, { backgroundColor: haloBg }]}>
            <View style={styles.haloInner}>
              <Feather name={resolvedIconName} size={24} color={iconColor} />
            </View>
          </View>

          {/* Title & Message */}
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.messageText}>{message}</Text>

          {/* Action Buttons Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isLoading}
              activeOpacity={0.75}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
            >
              <Text style={styles.cancelBtnText}>{cancelLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: confirmBtnBg },
                isLoading && styles.confirmBtnDisabled,
              ]}
              onPress={onConfirm}
              disabled={isLoading}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.confirmBtnText}>{confirmLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 26,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.heroShadow,
  },
  haloOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  haloInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BENTO_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  titleText: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    textAlign: "center",
    marginBottom: 8,
  },
  messageText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "400",
    color: BENTO_COLORS.neutralText,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 22,
    paddingHorizontal: 6,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: BENTO_COLORS.slateBg,
    borderRadius: BENTO_COLORS.pillRadius,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  confirmBtn: {
    flex: 1.25,
    borderRadius: BENTO_COLORS.pillRadius,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnDisabled: {
    opacity: 0.7,
  },
  confirmBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
