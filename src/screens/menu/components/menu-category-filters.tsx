import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import {
  BENTO_COLORS,
  CATEGORY_LABELS,
  MenuCategoryKey,
  SPACING,
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
                isSelected ? styles.pillActive : styles.pillInactive,
              ]}
              accessible={true}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Category tab: ${label}, ${count} services available`}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.text,
                  isSelected ? styles.textActive : styles.textInactive,
                ]}
              >
                {label}
              </Text>
              <View
                style={[
                  styles.countChip,
                  isSelected ? styles.countChipActive : styles.countChipInactive,
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    isSelected ? styles.countTextActive : styles.countTextInactive,
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
    marginBottom: SPACING.lg, // 16px
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl, // 20px
    gap: SPACING.sm, // 8px
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
  },
  pillInactive: {
    backgroundColor: BENTO_COLORS.white,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  pillActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
    ...BENTO_COLORS.shadow,
  },
  text: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    marginRight: 6,
  },
  textInactive: {
    color: BENTO_COLORS.neutralText,
  },
  textActive: {
    color: BENTO_COLORS.white,
  },
  countChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  countChipInactive: {
    backgroundColor: "#f1f5f9",
  },
  countChipActive: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  countText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
  },
  countTextInactive: {
    color: BENTO_COLORS.subtleText,
  },
  countTextActive: {
    color: BENTO_COLORS.white,
  },
});
