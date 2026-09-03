import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BENTO_COLORS, EventTabCounts, EventTabType, fontFamily } from "../constants";

interface EventTabFiltersProps {
  activeTab: EventTabType;
  onSelectTab: (tab: EventTabType) => void;
  counts: EventTabCounts;
}

export const EventTabFilters = React.memo(function EventTabFilters({
  activeTab,
  onSelectTab,
  counts,
}: EventTabFiltersProps) {
  const tabs: { key: EventTabType; label: string; count: number }[] = [
    { key: "upcoming", label: "Upcoming", count: counts.upcoming },
    { key: "today", label: "Today", count: counts.today },
    { key: "past", label: "Past", count: counts.past },
    { key: "all", label: "All", count: counts.all },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel={`${tab.label} events, ${tab.count} available`}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {tab.label} ({tab.count})
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
