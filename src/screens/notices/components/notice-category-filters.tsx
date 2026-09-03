import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import {
  BENTO_COLORS,
  CATEGORY_FILTERS,
  CATEGORY_THEMES,
  CategoryFilterKey,
  fontFamily,
} from "../constants";

interface NoticeCategoryFiltersProps {
  selectedCategory: CategoryFilterKey;
  onSelectCategory: (category: CategoryFilterKey) => void;
  categoryCounts: Record<string, number>;
}

export const NoticeCategoryFilters = React.memo(
  function NoticeCategoryFilters({
    selectedCategory,
    onSelectCategory,
    categoryCounts,
  }: NoticeCategoryFiltersProps) {
    return (
      <View style={styles.wrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {CATEGORY_FILTERS.map((catKey) => {
            const isSelected = selectedCategory === catKey;
            const count = categoryCounts[catKey] ?? 0;
            const theme =
              catKey !== "ALL" ? CATEGORY_THEMES[catKey] : null;
            const label =
              catKey === "ALL" ? "All Notices" : theme ? theme.label : catKey;

            return (
              <TouchableOpacity
                key={catKey}
                onPress={() => onSelectCategory(catKey)}
                style={[
                  styles.pill,
                  isSelected && styles.pillActive,
                ]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${label}, ${count} notices`}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.text,
                    isSelected && styles.textActive,
                  ]}
                >
                  {label}
                </Text>
                <View
                  style={[
                    styles.badge,
                    isSelected && styles.badgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      isSelected && styles.badgeTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  pillActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  text: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
    marginRight: 6,
  },
  textActive: {
    color: BENTO_COLORS.white,
  },
  badge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  badgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  badgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
  },
  badgeTextActive: {
    color: BENTO_COLORS.white,
  },
});
