import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS } from "../constants";

export type ConfirmModalVariant = "archive" | "delete" | "publish" | "revert" | "warning";

export interface AdminConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  variant?: ConfirmModalVariant;
  title: string;
  message: string;
  targetBadge?: string;
  targetBadgeIcon?: React.ComponentProps<typeof Feather>["name"];
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

const VARIANT_CONFIGS: Record<
  ConfirmModalVariant,
  {
    icon: React.ComponentProps<typeof Feather>["name"];
    iconColor: string;
    haloBg: string;
    haloBorder: string;
    innerBg: string;
    btnBg: string;
    defaultConfirmLabel: string;
  }
> = {
  archive: {
    icon: "archive",
    iconColor: "#d97706",
    haloBg: "#fffbeb",
    haloBorder: "#fde68a",
    innerBg: "#fef3c7",
    btnBg: "#d97706",
    defaultConfirmLabel: "Archive Calendar",
  },
  delete: {
    icon: "trash-2",
    iconColor: "#dc2626",
    haloBg: "#fef2f2",
    haloBorder: "#fecaca",
    innerBg: "#fee2e2",
    btnBg: "#dc2626",
    defaultConfirmLabel: "Delete Permanently",
  },
  publish: {
    icon: "send",
    iconColor: "#059669",
    haloBg: "#ecfdf5",
    haloBorder: "#a7f3d0",
    innerBg: "#d1fae5",
    btnBg: "#059669",
    defaultConfirmLabel: "Publish Live",
  },
  revert: {
    icon: "corner-up-left",
    iconColor: "#b45309",
    haloBg: "#fffbeb",
    haloBorder: "#fde68a",
    innerBg: "#fef3c7",
    btnBg: BENTO_COLORS.deepNavy,
    defaultConfirmLabel: "Revert to Draft",
  },
  warning: {
    icon: "alert-triangle",
    iconColor: "#0284c7",
    haloBg: "#f0f9ff",
    haloBorder: "#bae6fd",
    innerBg: "#e0f2fe",
    btnBg: "#0284c7",
    defaultConfirmLabel: "Confirm",
  },
};

export const AdminConfirmModal: React.FC<AdminConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  variant = "warning",
  title,
  message,
  targetBadge,
  targetBadgeIcon = "calendar",
  confirmLabel,
  cancelLabel = "Cancel",
  isLoading = false,
}) => {
  const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.warning;
  const effectiveConfirmLabel = confirmLabel || config.defaultConfirmLabel;

  return (
    <Modal
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      animationType="fade"
      onRequestClose={() => !isLoading && onClose()}
    >
      <View style={styles.overlay}>
        {/* Backdrop tap to dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => !isLoading && onClose()}
          accessible={false}
        />

        {/* Modal Card */}
        <View style={styles.cardContainer}>
          {/* Visual Hero Icon Halo */}
          <View
            style={[
              styles.haloOuter,
              { backgroundColor: config.haloBg, borderColor: config.haloBorder },
            ]}
          >
            <View style={[styles.haloInner, { backgroundColor: config.innerBg }]}>
              <Feather name={config.icon} size={24} color={config.iconColor} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.titleText}>{title}</Text>

          {/* Context Badge (e.g. "Summer 2026") */}
          {targetBadge ? (
            <View style={styles.targetBadge}>
              <Feather name={targetBadgeIcon} size={12} color="#0369a1" />
              <Text style={styles.targetBadgeText} numberOfLines={1}>
                {targetBadge}
              </Text>
            </View>
          ) : null}

          {/* Explanatory Message */}
          <Text style={styles.messageText}>{message}</Text>

          {/* Buttons Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isLoading}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
            >
              <Text style={styles.cancelBtnText}>{cancelLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: config.btnBg },
                isLoading && styles.confirmBtnDisabled,
              ]}
              onPress={onConfirm}
              disabled={isLoading}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={effectiveConfirmLabel}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.confirmBtnText}>{effectiveConfirmLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.62)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    shadowColor: "#0b1329",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 12,
  },
  haloOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  haloInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  targetBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 2,
    marginBottom: 10,
    maxWidth: "90%",
  },
  targetBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0369a1",
  },
  messageText: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#475569",
  },
  confirmBtn: {
    flex: 1.25,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnDisabled: {
    opacity: 0.7,
  },
  confirmBtnText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#ffffff",
  },
});
