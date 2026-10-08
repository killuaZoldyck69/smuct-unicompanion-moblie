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
    <View style={[styles.header, { paddingTop: insetsTop + 14 }]}>
      {/* Title + Subtitle */}
      <View style={styles.titleBlock}>
        <Text style={styles.screenTitle}>My Profile</Text>
        {!isEditing && (
          <Text style={styles.subtitle} numberOfLines={2}>
            Your academic identity, skills{"\n"}and connections — all in one
            place.
          </Text>
        )}
      </View>

      {/* Action Controls */}
      <View style={styles.controlsRow}>
        {isEditing ? (
          <>
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.pillBtn, styles.cancelBtn]}
              activeOpacity={0.75}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel editing profile"
            >
              <Feather name="x" size={13} color="#dc2626" />
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSave}
              style={[styles.pillBtn, styles.saveBtn]}
              activeOpacity={0.75}
              disabled={isUpdating}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Save profile changes"
            >
              <Feather name="check" size={13} color="#ffffff" />
              <Text style={styles.saveBtnText}>
                {isUpdating ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={onEdit}
            style={styles.circleBtn}
            activeOpacity={0.75}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Feather name="edit-2" size={16} color={PROFILE_COLORS.deepNavy} />
          </TouchableOpacity>
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
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: PROFILE_COLORS.deepNavy,
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: PROFILE_COLORS.subtleText,
    lineHeight: 18,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 4,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PROFILE_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: PROFILE_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.subtleBorder,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#dc2626",
    borderWidth: 1.5,
    borderColor: PROFILE_COLORS.white,
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
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#dc2626",
  },
  saveBtn: {
    backgroundColor: PROFILE_COLORS.deepNavy,
    borderColor: PROFILE_COLORS.deepNavy,
  },
  saveBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
});
