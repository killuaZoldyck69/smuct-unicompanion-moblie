import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { PROFILE_COLORS, SPACING, fontFamily, titleFontFamily } from "../../constants";

interface ProfileRoleHeaderProps {
  insetsTop: number;
  isEditing: boolean;
  isUpdating: boolean;
  subtitle: string;
  cancelAccessibilityLabel: string;
  saveAccessibilityLabel: string;
  maxWidth?: number;
  onCancel: () => void;
  onSave: () => void;
}

export const ProfileRoleHeader = React.memo(function ProfileRoleHeader({
  insetsTop,
  isEditing,
  isUpdating,
  subtitle,
  cancelAccessibilityLabel,
  saveAccessibilityLabel,
  maxWidth,
  onCancel,
  onSave,
}: ProfileRoleHeaderProps) {
  return (
    <View
      style={[
        styles.header,
        { paddingTop: insetsTop + 14 },
        maxWidth ? { width: "100%", maxWidth, alignSelf: "center" as const } : undefined,
      ]}
    >
      <View style={styles.titleBlock}>
        <Text style={styles.screenTitle}>{isEditing ? "Edit Profile" : "My Profile"}</Text>
        {!isEditing && (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.controlsRow}>
        {isEditing && (
          <>
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.pillBtn, styles.cancelBtn]}
              activeOpacity={0.75}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={cancelAccessibilityLabel}
            >
              <Feather name="x" size={13} color={colors.semantic.red.accent} />
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSave}
              style={[styles.pillBtn, styles.saveBtn]}
              activeOpacity={0.75}
              disabled={isUpdating}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={saveAccessibilityLabel}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color={PROFILE_COLORS.white} />
              ) : (
                <>
                  <Feather name="check" size={13} color={PROFILE_COLORS.white} />
                  <Text style={styles.saveBtnText}>Save</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    backgroundColor: PROFILE_COLORS.background,
  },
  titleBlock: {
    flex: 1,
    marginRight: SPACING.md,
  },
  screenTitle: {
    fontFamily: titleFontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: PROFILE_COLORS.deepNavy,
    letterSpacing: -0.4,
    lineHeight: 30,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: PROFILE_COLORS.subtleText,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 4,
  },
  pillBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 32,
    borderRadius: PROFILE_COLORS.pillRadius,
    borderWidth: 1,
    gap: 4,
    paddingHorizontal: 12,
  },
  cancelBtn: {
    backgroundColor: colors.semantic.red.tint,
    borderColor: colors.semantic.red.border,
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: colors.semantic.red.accent,
  },
  saveBtn: {
    backgroundColor: PROFILE_COLORS.deepNavy,
    borderColor: PROFILE_COLORS.deepNavy,
  },
  saveBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: PROFILE_COLORS.white,
  },
});
