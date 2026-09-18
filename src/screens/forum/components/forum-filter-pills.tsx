import React, { memo, useMemo } from "react";
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
  const options = useMemo<FilterOption[]>(
    () => [
      { key: "ALL", label: "All Posts", count: counts.total },
      { key: "UNRESOLVED", label: "Needs Help", count: counts.open },
      { key: "RESOLVED", label: "Resolved", count: counts.resolved },
      { key: "MY_POSTS", label: "My Posts", count: counts.myPosts },
    ],
    [counts.total, counts.open, counts.resolved, counts.myPosts],
  );

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
            accessibilityState={{ selected: isActive }}
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
    marginBottom: 16,
    paddingRight: 24,
    paddingBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  filterPillActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
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
