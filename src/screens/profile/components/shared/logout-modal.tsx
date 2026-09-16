import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
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
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={isLoggingOut ? undefined : onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.cardContainer}>
              {/* 1. Bento Icon Circle */}
              <View style={styles.iconCircle}>
                <Feather name="log-out" size={26} color="#e11d48" />
              </View>

              {/* 2. Modal Title */}
              <Text style={styles.titleText}>Log Out of UniCompanion?</Text>

              {/* 3. Description */}
              <Text style={styles.descriptionText}>
                You will be signed out of this session. You will need your
                university credentials to sign back in.
              </Text>

              {/* 4. Bento Security Note */}
              <View style={styles.securityNoteBadge}>
                <Feather
                  name="shield"
                  size={13}
                  color="#64748b"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.securityNoteText}>
                  Your session data will be safely cleared
                </Text>
              </View>

              {/* 5. Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                {/* Confirm Logout Button */}
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
                    <>
                      <Feather
                        name="log-out"
                        size={16}
                        color="#ffffff"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.confirmButtonText}>Yes, Log Out</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  disabled={isLoggingOut}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Stay signed in and cancel log out"
                >
                  <Text style={styles.cancelButtonText}>Stay Signed In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(19, 27, 46, 0.62)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cardContainer: {
    width: Platform.OS === "web" ? 380 : "92%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(19, 27, 46, 0.08)",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: "center",
    ...Platform.select({
      web: {
        boxShadow: "0 20px 40px -10px rgba(19, 27, 46, 0.25)",
      } as any,
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 28,
        elevation: 8,
      },
    }),
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff1f2",
    borderWidth: 1.5,
    borderColor: "#fecdd3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  titleText: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: PROFILE_COLORS.deepNavy,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  descriptionText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "500",
    color: PROFILE_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  securityNoteBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 22,
  },
  securityNoteText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748b",
  },
  actionButtonsContainer: {
    width: "100%",
    gap: 10,
  },
  confirmButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#dc2626",
    borderRadius: PROFILE_COLORS.pillRadius,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      web: {
        boxShadow: "0 4px 12px rgba(220, 38, 38, 0.25)",
      } as any,
      default: {
        shadowColor: "#dc2626",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  confirmButtonDisabled: {
    backgroundColor: "#f87171",
  },
  confirmButtonText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    color: "#ffffff",
  },
  cancelButton: {
    width: "100%",
    height: 46,
    backgroundColor: "#f1f5f9",
    borderRadius: PROFILE_COLORS.pillRadius,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
});
