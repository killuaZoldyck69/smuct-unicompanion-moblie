import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
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
        style={styles.scrollView}
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
        {/* Trailing Spacer to fix Android horizontal scroll padding clipping */}
        <View style={styles.scrollEndSpacer} />
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 6,
    overflow: "visible",
  },
  scrollView: {
    overflow: "visible",
  },
  content: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 3,
    paddingBottom: 8,
    gap: 8,
  },
  scrollEndSpacer: {
    width: 12,
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
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pillActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
    ...Platform.select({
      ios: {
        shadowColor: BENTO_COLORS.deepNavy,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.22,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
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
