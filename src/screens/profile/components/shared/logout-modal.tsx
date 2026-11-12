import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { PROFILE_COLORS, SPACING, fontFamily } from "../../constants";
import { ProfileModalFrame } from "./profile-modal-frame";

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
    <ProfileModalFrame
      visible={isVisible}
      onClose={onClose}
      dismissDisabled={isLoggingOut}
      horizontalPadding={SPACING.xxl}
      cardStyle={styles.cardContainer}
      backdropAccessibilityLabel="Cancel log out"
    >
      <View style={styles.iconCircle}>
        <Feather name="log-out" size={22} color={colors.semantic.red.accent} />
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
            <ActivityIndicator size="small" color={PROFILE_COLORS.white} />
          ) : (
            <Text style={styles.confirmButtonText}>Log Out</Text>
          )}
        </TouchableOpacity>
      </View>
    </ProfileModalFrame>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: Platform.OS === "web" ? 340 : "100%",
    maxWidth: 320,
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.navyAlpha08,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    alignItems: "center",
    ...Platform.select({
      web: {
        boxShadow: `0 20px 40px -10px ${colors.inkAlpha25}`,
      } as any,
      default: {
        shadowColor: colors.navyInk,
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
    backgroundColor: colors.semantic.red.tint,
    borderWidth: 1,
    borderColor: colors.semantic.red.softBorder,
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
    backgroundColor: colors.slate100,
    borderRadius: PROFILE_COLORS.pillRadius,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: colors.slate600,
  },
  confirmButton: {
    flex: 1,
    height: 44,
    backgroundColor: colors.semantic.red.accent,
    borderRadius: PROFILE_COLORS.pillRadius,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: colors.semantic.red.light,
  },
  confirmButtonText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: PROFILE_COLORS.white,
  },
});
