import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Share } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";

import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, rounded, shadows } from "../../theme/layout";

interface HubHeaderProps {
  hubDetails: any;
  onOptionsPress: () => void; // Changed from onEditPress
}

export default function HubHeader({
  hubDetails,
  onOptionsPress,
}: HubHeaderProps) {
  const router = useRouter();

  const handleCopyCode = async () => {
    if (hubDetails?.joinCode) {
      await Clipboard.setStringAsync(hubDetails.joinCode);
      Toast.show({ type: "success", text1: "Copied to Clipboard!" });
    }
  };

  const handleShareCode = async () => {
    if (hubDetails?.joinCode) {
      try {
        await Share.share({
          message: `Join my class "${hubDetails.courseName}" on UniCompanion using the invite code: ${hubDetails.joinCode}`,
        });
      } catch (error: any) {
        Toast.show({ type: "error", text1: "Error sharing code" });
      }
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.onPrimary} />
        </TouchableOpacity>

        {/* Gear Icon Always Visible for Options */}
        <TouchableOpacity style={styles.optionsBtn} onPress={onOptionsPress}>
          <Feather name="more-vertical" size={20} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.courseNameBig}>{hubDetails?.courseName}</Text>

      <View style={styles.metaBox}>
        <Text style={styles.courseMetaBig}>
          {hubDetails?.courseCode} • {hubDetails?.credit} Credits
        </Text>
        <Text style={styles.courseMetaBig}>
          {hubDetails?.department} • Batch {hubDetails?.batch} • Semester{" "}
          {hubDetails?.semesterNumber}
        </Text>
        <Text style={styles.courseMetaBig}>{hubDetails?.termOffer}</Text>
      </View>

      <View style={styles.codeDisplayRow}>
        <Text style={styles.codeLabel}>Invite Code:</Text>
        <View style={styles.codeBadge}>
          <Text style={styles.codeBadgeText}>{hubDetails?.joinCode}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={handleCopyCode}>
          <Feather name="copy" size={16} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={handleShareCode}>
          <Feather name="share-2" size={16} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingTop: 12,
    paddingBottom: spacing.stackLg,
    paddingHorizontal: spacing.marginMobile,
    borderBottomLeftRadius: rounded.xl,
    borderBottomRightRadius: rounded.xl,
    ...shadows.level1,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.stackMd,
  },
  backButton: { padding: spacing.stackSm, marginLeft: -8 },
  optionsBtn: { padding: spacing.stackSm, marginRight: -8 },
  courseNameBig: {
    ...typography.headlineMd,
    color: colors.onPrimary,
    fontWeight: "800",
    marginBottom: 8,
  },
  metaBox: { gap: 2 },
  courseMetaBig: { ...typography.labelMd, color: "rgba(255,255,255,0.8)" },
  codeDisplayRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  codeLabel: {
    ...typography.labelMd,
    color: "rgba(255,255,255,0.8)",
    marginRight: 8,
  },
  codeBadge: {
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: rounded.md,
    marginRight: 8,
  },
  codeBadgeText: {
    ...typography.labelMd,
    fontSize: 16,
    color: colors.primary,
    fontWeight: "800",
    letterSpacing: 2,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: rounded.md,
    marginRight: 6,
  },
});
