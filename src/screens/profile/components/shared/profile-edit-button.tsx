import React from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { PROFILE_COLORS, SPACING, fontFamily } from "../../constants";

interface ProfileEditButtonProps {
  variant?: "student" | "teacher";
  isEditing?: boolean;
  isUpdating?: boolean;
  onEdit: () => void;
  onCancel?: () => void;
  onSave?: () => void;
}

export const ProfileEditButton = React.memo(function ProfileEditButton({
  variant = "teacher",
  isEditing = false,
  isUpdating = false,
  onEdit,
  onCancel,
  onSave,
}: ProfileEditButtonProps) {
  if (isEditing) {
    if (!onCancel || !onSave) return null;

    return (
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.cancelBtn, variant === "student" && styles.studentActionBtn]}
          onPress={onCancel}
          activeOpacity={0.75}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Cancel editing profile"
        >
          <Feather name="x" size={14} color={colors.semantic.red.accent} />
          <Text style={[styles.cancelText, variant === "student" && styles.studentActionText]}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.saveBtn, variant === "student" && styles.studentActionBtn]}
          onPress={onSave}
          disabled={isUpdating}
          activeOpacity={0.75}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Save profile changes"
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color={PROFILE_COLORS.white} />
          ) : (
            <Feather name="check" size={14} color={PROFILE_COLORS.white} />
          )}
          <Text style={[styles.saveText, variant === "student" && styles.studentActionText]}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, variant === "student" && styles.studentButton]}
      onPress={onEdit}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Edit profile"
    >
      <Feather
        name="edit-3"
        size={15}
        color={PROFILE_COLORS.white}
        style={{ marginRight: 6 }}
      />
      <Text style={[styles.text, variant === "student" && styles.studentText]}>
        Edit Profile
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PROFILE_COLORS.deepNavy,
    paddingVertical: 13,
    borderRadius: PROFILE_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.deepNavy,
    marginTop: SPACING.md,
    marginBottom: 6,
    gap: 4,
    shadowColor: PROFILE_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  text: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: PROFILE_COLORS.white,
  },
  studentButton: {
    borderRadius: 18,
    paddingVertical: 16,
    marginTop: SPACING.lg,
    marginBottom: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },
  studentText: {
    fontSize: 15,
    letterSpacing: 0.2,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: SPACING.md,
    marginBottom: 6,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: PROFILE_COLORS.pillRadius,
    borderWidth: 1,
    gap: 6,
  },
  studentActionBtn: {
    borderRadius: 16,
    paddingVertical: 14,
  },
  cancelBtn: {
    backgroundColor: colors.semantic.red.tint,
    borderColor: colors.semantic.red.border,
  },
  cancelText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: colors.semantic.red.accent,
  },
  saveBtn: {
    backgroundColor: PROFILE_COLORS.deepNavy,
    borderColor: PROFILE_COLORS.deepNavy,
    shadowColor: PROFILE_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  saveText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: PROFILE_COLORS.white,
  },
  studentActionText: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
});

