import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { PROFILE_COLORS, fontFamily } from "../constants";
import { ProfileLogoutButton } from "./shared/profile-logout-button";

interface AdminProfileProps {
  sessionUser: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

export default function AdminProfile({ sessionUser }: AdminProfileProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.heroCard}>
        <View style={styles.avatarCircle}>
          <Feather name="shield" size={36} color="#ffffff" />
        </View>
        <Text style={styles.nameText}>
          {sessionUser?.name || "Administrator"}
        </Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>SYSTEM ADMIN</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>ACCOUNT DETAILS</Text>
        <View style={styles.infoRow}>
          <View style={styles.iconCircle}>
            <Feather name="mail" size={18} color={PROFILE_COLORS.deepNavy} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Admin Email</Text>
            <Text style={styles.infoValue}>{sessionUser?.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.logoutWrapper}>
        <ProfileLogoutButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
    paddingHorizontal: 20,
  },
  heroCard: {
    backgroundColor: PROFILE_COLORS.deepNavy,
    borderRadius: PROFILE_COLORS.cardRadius,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    ...PROFILE_COLORS.heroShadow,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  nameText: {
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 6,
  },
  roleBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: PROFILE_COLORS.pillRadius,
  },
  roleBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#a5b4fc",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: PROFILE_COLORS.cardRadius,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.subtleBorder,
    ...PROFILE_COLORS.shadow,
  },
  cardHeader: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: PROFILE_COLORS.subtleText,
    letterSpacing: 1,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: PROFILE_COLORS.subtleText,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: PROFILE_COLORS.neutralText,
  },
  logoutWrapper: {
    marginTop: "auto",
    marginBottom: 24,
  },
});
