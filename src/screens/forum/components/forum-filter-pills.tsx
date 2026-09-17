import React, { memo } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { BENTO_COLORS, fontFamily } from "../constants";
import type { FilterType, ForumCounts, FilterOption } from "../types";

interface ForumFilterPillsProps {
  activeFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
  counts: ForumCounts;
}

export const ForumFilterPills = memo(function ForumFilterPills({
  activeFilter,
  onSelectFilter,
  counts,
}: ForumFilterPillsProps) {
  const options: FilterOption[] = [
    { key: "ALL", label: "All Posts", count: counts.total },
    { key: "UNRESOLVED", label: "Needs Help", count: counts.open },
    { key: "RESOLVED", label: "Resolved", count: counts.resolved },
    { key: "MY_POSTS", label: "My Posts", count: counts.myPosts },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterPillsRow}
    >
      {options.map((item) => {
        const isActive = activeFilter === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.filterPill, isActive && styles.filterPillActive]}
            onPress={() => onSelectFilter(item.key)}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel={`${item.label}, ${item.count} items`}
          >
            <Text
              style={[
                styles.filterPillText,
                isActive && styles.filterPillTextActive,
              ]}
            >
              {item.label} ({item.count})
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  filterPillsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
    paddingRight: 10,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    ...BENTO_COLORS.shadow,
  },
  filterPillActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
  },
  filterPillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
  },
  filterPillTextActive: {
    color: "#ffffff",
  },
});
