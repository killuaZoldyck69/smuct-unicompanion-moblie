import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";
import { PROFILE_COLORS, fontFamily } from "../../constants";
import { ProfileLogoutButton } from "./profile-logout-button";

interface ProfileErrorStateProps {
  title?: string;
  onRetry?: () => void;
}

export const ProfileErrorState = React.memo(function ProfileErrorState({
  title = "Failed to load profile",
  onRetry,
}: ProfileErrorStateProps) {
  return (
    <View style={styles.centerContainer}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.iconCircle}>
        <Feather name="alert-circle" size={36} color="#dc2626" />
      </View>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorDesc}>
        We could not retrieve your account information. Please check your connection and try again.
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
      <View style={{ width: "100%", maxWidth: 280, marginTop: 16 }}>
        <ProfileLogoutButton />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: PROFILE_COLORS.neutralText,
    marginBottom: 8,
  },
  errorDesc: {
    fontFamily,
    fontSize: 13,
    color: PROFILE_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PROFILE_COLORS.deepNavy,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: PROFILE_COLORS.pillRadius,
  },
  retryBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: PROFILE_COLORS.white,
  },
});
