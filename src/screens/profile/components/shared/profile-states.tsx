import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { PROFILE_COLORS, fontFamily } from "../../constants";
import { ProfileLogoutButton } from "./profile-logout-button";

interface ProfileErrorStateProps {
  title?: string;
  subtitle?: string;
  isOffline?: boolean;
  onRetry?: () => void;
}

export const ProfileErrorState = React.memo(function ProfileErrorState({
  title = "Failed to load profile",
  subtitle,
  isOffline = false,
  onRetry,
}: ProfileErrorStateProps) {
  return (
    <View style={styles.centerContainer}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View
        style={[
          styles.errorIconContainer,
          isOffline ? styles.offlineIconContainer : undefined,
        ]}
      >
        <Feather
          name={isOffline ? "wifi-off" : "alert-circle"}
          size={36}
          color={isOffline ? colors.semantic.amber.accent : colors.semantic.red.accent}
        />
      </View>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorDesc}>
        {subtitle ||
          (isOffline
            ? "You appear to be offline. Reconnect to the internet and try again."
            : "We could not retrieve your account information. Please check your connection and try again.")}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={onRetry}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Retry loading profile"
        >
          <Feather
            name="refresh-cw"
            size={15}
            color={PROFILE_COLORS.white}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      )}
      <View style={styles.logoutWrap}>
        <ProfileLogoutButton />
      </View>
    </View>
  );
});

interface ProfileOfflineBannerProps {
  visible: boolean;
}

export const ProfileOfflineBanner = React.memo(function ProfileOfflineBanner({
  visible,
}: ProfileOfflineBannerProps) {
  if (!visible) return null;

  return (
    <View style={styles.offlineBanner}>
      <Feather name="wifi-off" size={14} color={colors.semantic.amber.darkText} />
      <Text style={styles.offlineBannerText}>
        Offline mode — showing saved profile data. Editing and uploads require internet.
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  errorIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.semantic.red.tint,
    borderWidth: 1,
    borderColor: colors.semantic.red.softBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  offlineIconContainer: {
    backgroundColor: colors.semantic.amber.tint,
    borderColor: colors.semantic.amber.border,
  },
  errorTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "700",
    color: PROFILE_COLORS.neutralText,
    marginBottom: 6,
    textAlign: "center",
  },
  errorDesc: {
    fontFamily,
    fontSize: 13,
    color: PROFILE_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PROFILE_COLORS.deepNavy,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: PROFILE_COLORS.white,
  },
  logoutWrap: {
    width: "100%",
    maxWidth: 280,
    marginTop: 16,
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.semantic.amber.tint,
    borderWidth: 1,
    borderColor: colors.semantic.amber.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
  },
  offlineBannerText: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: colors.semantic.amber.darkText,
    lineHeight: 16,
  },
});
