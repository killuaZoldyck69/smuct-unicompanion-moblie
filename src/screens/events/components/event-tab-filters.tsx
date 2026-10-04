import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
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
  const tabs: {
    key: EventTabType;
    label: string;
    count: number;
    icon: keyof typeof Feather.glyphMap;
  }[] = [
    { key: "upcoming", label: "Upcoming", count: counts.upcoming, icon: "calendar" },
    { key: "today", label: "Today", count: counts.today, icon: "calendar" },
    { key: "past", label: "Past", count: counts.past, icon: "clock" },
    { key: "all", label: "All", count: counts.all, icon: "grid" },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          // In the reference screenshot, active tab shows clean text without icon
          const showIcon = !isActive;

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
              {showIcon && (
                <Feather
                  name={tab.icon}
                  size={14}
                  color={BENTO_COLORS.subtleText}
                  style={styles.pillIcon}
                />
              )}
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: -20,
    marginBottom: 10,
    overflow: "visible",
  },
  scrollView: {
    overflow: "visible",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 2,
    paddingBottom: 8,
    gap: 8,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 9.5,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
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
    paddingHorizontal: 16,
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
  pillIcon: {
    marginRight: 6,
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
