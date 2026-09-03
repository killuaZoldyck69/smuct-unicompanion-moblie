import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BENTO_COLORS, BloodFeedCounts, BloodFilterType, fontFamily } from "../constants";

interface BloodFilterPillsProps {
  activeFilter: BloodFilterType;
  onSelectFilter: (filter: BloodFilterType) => void;
  counts: BloodFeedCounts;
}

export const BloodFilterPills = React.memo(function BloodFilterPills({
  activeFilter,
  onSelectFilter,
  counts,
}: BloodFilterPillsProps) {
  const filters: { key: BloodFilterType; label: string; count: number }[] = [
    { key: "URGENT", label: "Urgent", count: counts.urgent },
    { key: "ALL", label: "All Active", count: counts.active },
    { key: "FULFILLED", label: "Fulfilled", count: counts.fulfilled },
  ];

  return (
    <View style={styles.container}>
      {filters.map((filter) => {
        const isActive = activeFilter === filter.key;
        return (
          <TouchableOpacity
            key={filter.key}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onSelectFilter(filter.key)}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel={`${filter.label} requests, ${filter.count} available`}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {filter.label} ({filter.count})
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  pill: {
    backgroundColor: BENTO_COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  pillActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  pillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
  },
  pillTextActive: {
    color: "#ffffff",
  },
});
