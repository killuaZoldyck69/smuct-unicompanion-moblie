import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { authClient } from "../../services/auth-client";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, rounded, shadows } from "../../theme/layout";

export default function AdminProfile({ sessionUser }: { sessionUser: any }) {
  const router = useRouter();

  const handleLogout = async () => {
    const performLogout = async () => {
      await authClient.signOut();
      if (Platform.OS !== "web")
        await SecureStore.deleteItemAsync("better-auth.session_token");
      router.replace("/(auth)/login");
    };
    if (Platform.OS === "web") {
      if (window.confirm("Log out?")) performLogout();
    } else {
      Alert.alert("Log Out", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: performLogout },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBackground} />

      <View style={styles.avatarSection}>
        <View style={styles.avatarPlaceholder}>
          <Feather name="shield" size={40} color={colors.onSurfaceVariant} />
        </View>
        <Text style={styles.nameText}>
          {sessionUser?.name || "Administrator"}
        </Text>
        <Text style={styles.roleText}>SYSTEM ADMIN</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>ACCOUNT DETAILS</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoIconWrapper}>
            <Feather name="mail" size={20} color={colors.onSurfaceVariant} />
          </View>
          <View>
            <Text style={styles.infoLabel}>Admin Email</Text>
            <Text style={styles.infoValue}>{sessionUser?.email}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Feather name="log-out" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

// Attach the same styles block used in TeacherProfile here to keep the UI consistent.
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  headerBackground: {
    height: 140,
    width: "100%",
    position: "absolute",
    top: 0,
    backgroundColor: colors.primaryContainer,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 80,
    marginBottom: spacing.stackLg,
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: rounded.full,
    backgroundColor: colors.surfaceContainerLowest,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.surfaceContainerLowest,
  },
  nameText: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginTop: spacing.stackMd,
  },
  roleText: {
    ...typography.labelMd,
    color: colors.outline,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    marginHorizontal: spacing.marginMobile,
    marginBottom: spacing.stackLg,
    padding: spacing.marginMobile,
    ...shadows.level1,
  },
  cardHeader: {
    ...typography.labelSm,
    color: colors.outline,
    letterSpacing: 1.5,
    marginBottom: spacing.stackLg,
  },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: rounded.full,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.stackMd,
  },
  infoLabel: { ...typography.labelSm, color: colors.outline, marginBottom: 2 },
  infoValue: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: spacing.marginMobile,
    marginTop: spacing.stackSm,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.errorContainer,
    borderRadius: rounded.lg,
    paddingVertical: spacing.marginMobile,
    ...shadows.level1,
  },
  logoutText: {
    ...typography.labelMd,
    color: colors.error,
    fontWeight: "700",
    marginLeft: spacing.stackSm,
  },
});
