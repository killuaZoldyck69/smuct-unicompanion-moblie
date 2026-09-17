import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { PROFILE_COLORS, fontFamily } from "../../constants";

interface LogoutModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut: boolean;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  isLoggingOut,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View
        style={[
          styles.backdrop,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={isLoggingOut ? undefined : onClose}
          accessible={false}
        />
        <View style={styles.cardContainer}>
          <View style={styles.iconCircle}>
            <Feather name="log-out" size={22} color="#dc2626" />
          </View>

          <Text style={styles.titleText}>Log Out?</Text>

          <Text style={styles.descriptionText}>
            Are you sure you want to log out?
          </Text>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isLoggingOut}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel log out"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                isLoggingOut && styles.confirmButtonDisabled,
              ]}
              onPress={onConfirm}
              disabled={isLoggingOut}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Confirm log out"
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.confirmButtonText}>Log Out</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  cardContainer: {
    width: Platform.OS === "web" ? 340 : "100%",
    maxWidth: 320,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.08)",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    alignItems: "center",
    ...Platform.select({
      web: {
        boxShadow: "0 20px 40px -10px rgba(15, 23, 42, 0.25)",
      } as any,
      default: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  titleText: {
    fontFamily,
    fontSize: 17,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  descriptionText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "500",
    color: PROFILE_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    backgroundColor: "#f1f5f9",
    borderRadius: PROFILE_COLORS.pillRadius,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  confirmButton: {
    flex: 1,
    height: 44,
    backgroundColor: "#dc2626",
    borderRadius: PROFILE_COLORS.pillRadius,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#f87171",
  },
  confirmButtonText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
});
