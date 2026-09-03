import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { BENTO_COLORS, fontFamily } from "../constants";

export interface CalendarFilterItem {
  key: string;
  label: string;
  count: number;
}

interface CalendarFilterPillsProps {
  filters: CalendarFilterItem[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CalendarFilterPills = React.memo(function CalendarFilterPills({
  filters,
  selectedCategory,
  onSelectCategory,
}: CalendarFilterPillsProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {filters.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          if (cat.key !== "ALL" && cat.count === 0) return null;

          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.pill, isSelected && styles.pillActive]}
              onPress={() => onSelectCategory(cat.key)}
              activeOpacity={0.75}
              accessible={true}
              accessibilityRole="tab"
              accessibilityLabel={`${cat.label}, ${cat.count} events`}
            >
              <Text
                style={[
                  styles.pillLabel,
                  isSelected && styles.pillLabelActive,
                ]}
              >
                {cat.label}
              </Text>
              <View
                style={[
                  styles.pillCount,
                  isSelected && styles.pillCountActive,
                ]}
              >
                <Text
                  style={[
                    styles.pillCountText,
                    isSelected && styles.pillCountTextActive,
                  ]}
                >
                  {cat.count}
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
    marginHorizontal: -20,
  },
  content: {
    paddingHorizontal: 20,
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    paddingLeft: 14,
    paddingRight: 10,
    paddingVertical: 9,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    gap: 8,
    ...BENTO_COLORS.shadow,
  },
  pillActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  pillLabel: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
  },
  pillLabelActive: {
    color: "#ffffff",
  },
  pillCount: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  pillCountActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  pillCountText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
  },
  pillCountTextActive: {
    color: "#ffffff",
  },
});
