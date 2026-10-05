import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BENTO_COLORS, fontFamily } from "../constants";

export type HubTab = "ACTIVE" | "ARCHIVED";

interface CourseTabsProps {
  activeTab: HubTab;
  activeCount: number;
  archivedCount: number;
  onSelectTab: (tab: HubTab) => void;
}

export const CourseTabs = React.memo(function CourseTabs({
  activeTab,
  activeCount,
  archivedCount,
  onSelectTab,
}: CourseTabsProps) {
  const tabs: { key: HubTab; label: string; count: number }[] = [
    { key: "ACTIVE", label: "Active Classes", count: activeCount },
    { key: "ARCHIVED", label: "Archived", count: archivedCount },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => onSelectTab(tab.key)}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tab.label} tab, ${tab.count} classes`}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
              <View style={[styles.badge, isActive && styles.badgeActive]}>
                <Text
                  style={[styles.badgeText, isActive && styles.badgeTextActive]}
                >
                  {tab.count}
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
  wrapper: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  container: {
    flexDirection: "row",
    backgroundColor: "#e8edf2",
    borderRadius: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tabText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "600",
    color: "#64748b",
  },
  tabTextActive: {
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  badge: {
    paddingHorizontal: 7.5,
    paddingVertical: 2.5,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: "rgba(100, 116, 139, 0.12)",
    minWidth: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
  },
  badgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  badgeTextActive: {
    color: "#ffffff",
  },
});
