import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { THEME } from "../constants";
import { RoleStatusTag } from "../types";

interface ActiveFiltersBarProps {
  selectedDepartment: string | null;
  filterRoleTag: RoleStatusTag;
  isStudentTab: boolean;
  primaryThemeColor: string;
  onClearDepartment: () => void;
  onClearRoleTag: () => void;
  onClearAll: () => void;
}

export const ActiveFiltersBar = React.memo(
  ({
    selectedDepartment,
    filterRoleTag,
    isStudentTab,
    primaryThemeColor,
    onClearDepartment,
    onClearRoleTag,
    onClearAll,
  }: ActiveFiltersBarProps) => {
    const hasDeptFilter = Boolean(selectedDepartment);
    const hasRoleFilter = isStudentTab && filterRoleTag !== "ALL";

    if (!hasDeptFilter && !hasRoleFilter) {
      return null;
    }

    return (
      <View style={styles.activeFilterRow}>
        {hasDeptFilter && (
          <View style={styles.activeFilterPill}>
            <Feather
              name="filter"
              size={12}
              color={primaryThemeColor}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.activeFilterText}>
              Dept: {selectedDepartment}
            </Text>
            <TouchableOpacity
              onPress={onClearDepartment}
              style={styles.activeFilterRemoveBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Clear department filter"
            >
              <Feather name="x" size={13} color={THEME.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {hasRoleFilter && (
          <View style={styles.activeFilterPill}>
            <Feather
              name="user-check"
              size={12}
              color={primaryThemeColor}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.activeFilterText}>
              Class Reps
            </Text>
            <TouchableOpacity
              onPress={onClearRoleTag}
              style={styles.activeFilterRemoveBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Clear role filter"
            >
              <Feather name="x" size={13} color={THEME.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          onPress={onClearAll}
          style={styles.clearAllFiltersBtn}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Clear all filters"
        >
          <Text
            style={[
              styles.clearAllFiltersText,
              { color: primaryThemeColor },
            ]}
          >
            Clear all
          </Text>
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  activeFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexWrap: "wrap",
    gap: 8,
  },
  activeFilterPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.textPrimary,
    marginRight: 6,
  },
  activeFilterRemoveBtn: {
    padding: 2,
  },
  clearAllFiltersBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearAllFiltersText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
