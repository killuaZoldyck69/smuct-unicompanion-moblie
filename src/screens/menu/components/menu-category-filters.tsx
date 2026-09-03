import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import {
  BENTO_COLORS,
  CATEGORY_LABELS,
  MenuCategoryKey,
  fontFamily,
} from "../constants";

interface MenuCategoryFiltersProps {
  categories: MenuCategoryKey[];
  selectedCategory: MenuCategoryKey;
  onSelectCategory: (category: MenuCategoryKey) => void;
  categoryCounts: Record<string, number>;
}

export const MenuCategoryFilters = React.memo(function MenuCategoryFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}: MenuCategoryFiltersProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((catKey) => {
          const isSelected = selectedCategory === catKey;
          const count = categoryCounts[catKey] ?? 0;
          const label = CATEGORY_LABELS[catKey] || catKey;

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
              accessibilityLabel={`Filter by ${label}, ${count} services available`}
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
                  styles.countChip,
                  isSelected && styles.countChipActive,
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
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
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
    borderColor: "rgba(0, 0, 0, 0.04)",
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
  countChip: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  countChipActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  countText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
  },
  countTextActive: {
    color: BENTO_COLORS.white,
  },
});
