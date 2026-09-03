import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BENTO_COLORS, BusScheduleCounts, DirectionFilter, fontFamily } from "../constants";

interface BusFilterPillsProps {
  directionFilter: DirectionFilter;
  onSelectFilter: (filter: DirectionFilter) => void;
  counts: BusScheduleCounts;
}

export const BusFilterPills = React.memo(function BusFilterPills({
  directionFilter,
  onSelectFilter,
  counts,
}: BusFilterPillsProps) {
  const filters: { key: DirectionFilter; label: string; count: number }[] = [
    { key: "ALL", label: "All Routes", count: counts.total },
    { key: "FROM_CAMPUS", label: "From Campus", count: counts.fromCampus },
    { key: "TO_CAMPUS", label: "To Campus", count: counts.toCampus },
  ];

  return (
    <View style={styles.container}>
      {filters.map((f) => {
        const isActive = directionFilter === f.key;
        return (
          <TouchableOpacity
            key={f.key}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onSelectFilter(f.key)}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel={`${f.label}, ${f.count} routes available`}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {f.label} ({f.count})
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
