// src/screens/notices/components/notice-category-filters.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NOTICE_COLORS, fontFamily } from "../constants";
import { NoticeCategoryKey } from "../types";

interface Props {
  selectedCategory: NoticeCategoryKey;
  onSelectCategory: (category: NoticeCategoryKey) => void;
  categoryCounts: Record<string, number>;
  categories: Array<{ key: NoticeCategoryKey; label: string }>;
}

export const NoticeCategoryFilters = React.memo(function NoticeCategoryFilters({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  categories,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.wrapGrid}>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          const count = categoryCounts[cat.key] ?? 0;

          return (
            <TouchableOpacity
              key={cat.key}
              onPress={() => onSelectCategory(cat.key)}
              style={[styles.pill, isSelected && styles.pillActive]}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${cat.label}, ${count} notices`}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                {cat.label}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  isSelected && styles.countBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    isSelected && styles.countTextActive,
                  ]}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  wrapGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: NOTICE_COLORS.white,
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 8,
    borderRadius: NOTICE_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: NOTICE_COLORS.mutedBorder,
    ...NOTICE_COLORS.shadow,
  },
  pillActive: {
    backgroundColor: NOTICE_COLORS.deepNavy,
    borderColor: NOTICE_COLORS.deepNavy,
  },
  pillText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: NOTICE_COLORS.deepNavy,
    marginRight: 8,
  },
  pillTextActive: {
    color: NOTICE_COLORS.white,
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.22)",
  },
  countText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: NOTICE_COLORS.subtleText,
  },
  countTextActive: {
    color: NOTICE_COLORS.white,
  },
});
