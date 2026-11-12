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
  isEditing?: boolean;
  isUpdating?: boolean;
  onEdit: () => void;
  onCancel?: () => void;
  onSave?: () => void;
}

export const ProfileEditButton = React.memo(function ProfileEditButton({
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
          style={[styles.actionBtn, styles.cancelBtn]}
          onPress={onCancel}
          activeOpacity={0.75}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Cancel editing profile"
        >
          <Feather name="x" size={15} color={colors.semantic.red.accent} />
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.saveBtn]}
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
            <Feather name="check" size={15} color={PROFILE_COLORS.white} />
          )}
          <Text style={styles.saveText}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onEdit}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Edit profile"
    >
      <Feather name="edit-3" size={15} color={PROFILE_COLORS.white} />
      <Text style={styles.text}>Edit Profile</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    backgroundColor: PROFILE_COLORS.deepNavy,
    paddingVertical: 13,
    paddingHorizontal: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.deepNavy,
    marginBottom: SPACING.cardGap,
    gap: 8,
    shadowColor: PROFILE_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  text: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    letterSpacing: 0.1,
    color: PROFILE_COLORS.white,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: SPACING.cardGap,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    paddingVertical: 13,
    paddingHorizontal: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  cancelBtn: {
    backgroundColor: colors.semantic.red.tint,
    borderColor: colors.semantic.red.border,
  },
  cancelText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    color: colors.semantic.red.accent,
  },
  saveBtn: {
    backgroundColor: PROFILE_COLORS.deepNavy,
    borderColor: PROFILE_COLORS.deepNavy,
    shadowColor: PROFILE_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  saveText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    color: PROFILE_COLORS.white,
  },
});
