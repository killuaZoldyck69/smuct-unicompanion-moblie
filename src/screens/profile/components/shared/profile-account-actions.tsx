import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { PROFILE_COLORS, SPACING, fontFamily } from "../../constants";

interface ProfileAccountActionsProps {
  onPressDeleteAccount: () => void;
  isOffline?: boolean;
}

export const ProfileAccountActions: React.FC<ProfileAccountActionsProps> = ({
  onPressDeleteAccount,
  isOffline = false,
}) => {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionIconBadge}>
          <Feather name="shield" size={15} color={colors.semantic.indigo.solid} />
        </View>
        <Text style={styles.sectionLabel}>ACCOUNT & PRIVACY</Text>
      </View>

      <TouchableOpacity
        style={styles.actionRow}
        onPress={() => router.push("/(tabs)/privacy-policy")}
        activeOpacity={0.75}
      >
        <View style={[styles.iconBadge, styles.privacyBadge]}>
          <Feather name="shield" size={16} color={colors.semantic.indigo.solid} />
        </View>
        <View style={styles.rowTextWrap}>
          <Text style={styles.rowTitle}>Privacy Policy</Text>
          <Text style={styles.rowSubtitle}>How your campus data and deletions are handled</Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.slate400} />
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.actionRow}
        onPress={onPressDeleteAccount}
        activeOpacity={0.75}
      >
        <View style={[styles.iconBadge, styles.dangerBadge]}>
          <Feather name="trash-2" size={16} color={colors.semantic.red.accent} />
        </View>
        <View style={styles.rowTextWrap}>
          <Text style={styles.dangerTitle}>Delete Account</Text>
          <Text style={styles.rowSubtitle}>
            {isOffline
              ? "Requires an internet connection"
              : "Permanently remove your account and profile data"}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.semantic.red.light} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: PROFILE_COLORS.cardRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.cardGap,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.subtleBorder,
    ...PROFILE_COLORS.shadow,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: SPACING.md,
  },
  sectionIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.semantic.indigo.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: colors.semantic.indigo.solid,
    letterSpacing: 0.8,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  privacyBadge: {
    backgroundColor: colors.semantic.indigo.tint,
  },
  dangerBadge: {
    backgroundColor: colors.semantic.red.tint,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
  },
  dangerTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: colors.semantic.red.accent,
  },
  rowSubtitle: {
    fontFamily,
    fontSize: 12,
    color: colors.slate500,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.dividerSubtle,
    marginVertical: 4,
  },
});
