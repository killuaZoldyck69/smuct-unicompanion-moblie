import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { AdminUser } from "../../types";

interface RestrictConfirmationModalProps {
  visible: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const RestrictConfirmationModal: React.FC<
  RestrictConfirmationModalProps
> = React.memo(({ visible, user, onClose, onConfirm, isLoading = false }) => {
  const insets = useSafeAreaInsets();

  if (!user) return null;

  const isCurrentlyRestricted = Boolean(user.isRestricted);
  const willRestrict = !isCurrentlyRestricted;

  const title = willRestrict ? "Restrict Account?" : "Restore Access?";
  const actionText = willRestrict ? "Restrict Account" : "Restore Access";

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={isLoading ? undefined : onClose}
    >
      <View
        style={[
          styles.backdrop,
          {
            paddingTop: Math.max(insets.top, 20) + 16,
            paddingBottom: Math.max(insets.bottom, 20) + 16,
          },
        ]}
      >
        {/* Background tap to dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={isLoading ? undefined : onClose}
          accessible={false}
        />

        <View style={styles.cardContainer}>
          {/* Header Icon Circle */}
          <View
            style={[
              styles.iconCircle,
              willRestrict
                ? styles.iconCircleRose
                : styles.iconCircleEmerald,
            ]}
          >
            <Feather
              name={willRestrict ? "slash" : "check-circle"}
              size={26}
              color={willRestrict ? "#E11D48" : "#059669"}
            />
          </View>

          {/* Title */}
          <Text style={styles.titleText}>{title}</Text>

          {/* User Capsule */}
          <View style={styles.userCapsule}>
            <Text style={styles.userNameText} numberOfLines={1}>
              {user.name}
            </Text>
            <Text style={styles.userEmailText} numberOfLines={1}>
              {user.email}
            </Text>
          </View>

          {/* Detailed Explanation */}
          <Text style={styles.descriptionText}>
            {willRestrict
              ? `Are you sure you want to restrict this account? They will be logged out immediately and blocked from logging in. Account data is preserved to prevent spam re-registration.`
              : `Are you sure you want to restore access for this account? The restriction will be lifted and the user will be able to log in normally.`}
          </Text>

          {/* Actions Button Group */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isLoading}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel restriction dialog"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                willRestrict
                  ? styles.confirmButtonRose
                  : styles.confirmButtonEmerald,
                isLoading && styles.confirmButtonDisabled,
              ]}
              onPress={onConfirm}
              disabled={isLoading}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Confirm ${actionText}`}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmButtonText}>{actionText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 330,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  iconCircleRose: {
    backgroundColor: "#FFE4E6",
    borderWidth: 1.5,
    borderColor: "#FECDD3",
  },
  iconCircleEmerald: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: "center",
  },
  userCapsule: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 14,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  userNameText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#1E293B",
  },
  userEmailText: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  descriptionText: {
    fontSize: 12.5,
    color: "#475569",
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#475569",
  },
  confirmButton: {
    flex: 1.2,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmButtonRose: {
    backgroundColor: "#E11D48",
  },
  confirmButtonEmerald: {
    backgroundColor: "#059669",
  },
  confirmButtonDisabled: {
    opacity: 0.65,
  },
  confirmButtonText: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
