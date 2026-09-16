import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { PROFILE_COLORS, SPACING, fontFamily } from "../../constants";

interface StudentHeaderProps {
  insetsTop: number;
  isEditing: boolean;
  isUpdating: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export const StudentHeader = React.memo(function StudentHeader({
  insetsTop,
  isEditing,
  isUpdating,
  onEdit,
  onCancel,
  onSave,
}: StudentHeaderProps) {
  return (
    <View style={[styles.topActions, { paddingTop: insetsTop + 12 }]}>
      <Text style={styles.screenTitle}>My Profile</Text>

      <View style={styles.actionButtonsRow}>
        {isEditing && (
          <TouchableOpacity
            onPress={onCancel}
            style={[styles.topBtn, styles.cancelBtn]}
            activeOpacity={0.75}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cancel editing profile"
          >
            <Feather name="x" size={15} color="#dc2626" />
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => (isEditing ? onSave() : onEdit())}
          style={[styles.topBtn, isEditing && styles.saveBtnActive]}
          activeOpacity={0.75}
          disabled={isUpdating}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={isEditing ? "Save profile changes" : "Edit profile"}
        >
          <Feather
            name={isEditing ? "check" : "edit-2"}
            size={15}
            color={isEditing ? "#ffffff" : PROFILE_COLORS.deepNavy}
          />
          <Text style={[styles.topBtnText, isEditing && styles.saveBtnTextActive]}>
            {isUpdating ? "Saving..." : isEditing ? "Save" : "Edit Profile"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: PROFILE_COLORS.background,
  },
  screenTitle: {
    fontFamily,
    fontSize: 26,
    fontWeight: "800",
    color: PROFILE_COLORS.deepNavy,
    letterSpacing: -0.4,
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  topBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PROFILE_COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: PROFILE_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.border,
    gap: 6,
  },
  topBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
  },
  cancelBtn: {
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },
  cancelText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#dc2626",
  },
  saveBtnActive: {
    backgroundColor: PROFILE_COLORS.deepNavy,
    borderColor: PROFILE_COLORS.deepNavy,
  },
  saveBtnTextActive: {
    color: PROFILE_COLORS.white,
  },
});
