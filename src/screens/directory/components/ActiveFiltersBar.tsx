import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { THEME, fontFamily } from "../constants";

interface ActiveFiltersBarProps {
  selectedDepartment: string | null;
  onClearDepartment: () => void;
  onClearAll: () => void;
}

export const ActiveFiltersBar = React.memo(
  ({
    selectedDepartment,
    onClearDepartment,
    onClearAll,
  }: ActiveFiltersBarProps) => {
    if (!selectedDepartment || selectedDepartment === "All") {
      return null;
    }

    return (
      <View style={styles.activeFilterRow}>
        <View style={styles.activeFilterPill}>
          <Feather
            name="filter"
            size={12}
            color={THEME.primary}
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
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather name="x" size={13} color={THEME.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={onClearAll}
          style={styles.clearAllFiltersBtn}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Clear all filters"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text style={styles.clearAllFiltersText}>Clear all</Text>
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
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  activeFilterText: {
    fontFamily,
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
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: THEME.primary,
  },
});
