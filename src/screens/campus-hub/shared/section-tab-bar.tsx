import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CAMPUS_HUB_COLORS, fontFamily } from "./design-tokens";

export type HubSection = "FORUM" | "LOST_FOUND" | "MARKETPLACE" | "COMPLAINTS";

interface Tab {
  key: HubSection;
  label: string;
  accent: string;
}

const TABS: Tab[] = [
  { key: "FORUM", label: "Forum", accent: CAMPUS_HUB_COLORS.forumAccent },
  {
    key: "LOST_FOUND",
    label: "Lost & Found",
    accent: CAMPUS_HUB_COLORS.lostFoundAccent,
  },
  {
    key: "MARKETPLACE",
    label: "Buy & Sell",
    accent: CAMPUS_HUB_COLORS.marketplaceAccent,
  },
  {
    key: "COMPLAINTS",
    label: "Complaints",
    accent: CAMPUS_HUB_COLORS.complaintAccent,
  },
];

interface SectionTabBarProps {
  activeSection: HubSection;
  onSelect: (section: HubSection) => void;
}

export const SectionTabBar = React.memo(function SectionTabBar({
  activeSection,
  onSelect,
}: SectionTabBarProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeSection === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              isActive && { backgroundColor: tab.accent },
            ]}
            onPress={() => onSelect(tab.key)}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${tab.label} section`}
          >
            <Text
              style={[
                styles.tabText,
                isActive && styles.tabTextActive,
              ]}
            >
              {tab.label}
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
    backgroundColor: CAMPUS_HUB_COLORS.white,
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    padding: 4,
    gap: 4,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  tabTextActive: {
    color: CAMPUS_HUB_COLORS.white,
  },
});
