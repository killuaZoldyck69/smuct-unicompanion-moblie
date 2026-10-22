import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CAMPUS_HUB_COLORS, fontFamily } from "@/screens/campus-hub/shared/design-tokens";
import type { ComplaintStats } from "@/services/complaint-service";

export type ComplaintFilter =
  | "ALL"
  | "PENDING"
  | "ACCEPTED"
  | "RESOLVED"
  | "REJECTED";

interface ComplaintHeroStatsProps {
  stats: ComplaintStats;
  activeFilter: ComplaintFilter;
  onSelectFilter: (filter: ComplaintFilter) => void;
  horizontalScroll?: boolean;
}

interface StatTabConfig {
  key: ComplaintFilter;
  label: string;
  countKey: keyof ComplaintStats;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  bgColor: string;
  borderColor: string;
}

const STAT_TABS: StatTabConfig[] = [
  {
    key: "ALL",
    label: "All",
    countKey: "all",
    icon: "layers",
    color: CAMPUS_HUB_COLORS.deepNavy,
    bgColor: "#f1f5f9",
    borderColor: "#cbd5e1",
  },
  {
    key: "PENDING",
    label: "Pending",
    countKey: "pending",
    icon: "clock",
    color: "#b45309",
    bgColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  {
    key: "ACCEPTED",
    label: "Accepted",
    countKey: "accepted",
    icon: "check",
    color: "#0284c7",
    bgColor: "#f0f9ff",
    borderColor: "#bae6fd",
  },
  {
    key: "RESOLVED",
    label: "Resolved",
    countKey: "resolved",
    icon: "check-circle",
    color: "#047857",
    bgColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  {
    key: "REJECTED",
    label: "Rejected",
    countKey: "rejected",
    icon: "x-circle",
    color: "#b91c1c",
    bgColor: "#fef2f2",
    borderColor: "#fecaca",
  },
];

export const ComplaintHeroStats = React.memo(function ComplaintHeroStats({
  stats,
  activeFilter,
  onSelectFilter,
  horizontalScroll = true,
}: ComplaintHeroStatsProps) {
  const content = (
    <View style={styles.tabsRow}>
      {STAT_TABS.map((tab) => {
        const isActive = activeFilter === tab.key;
        const count = stats[tab.countKey] || 0;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabCard,
              isActive && {
                backgroundColor: tab.bgColor,
                borderColor: tab.color,
                borderWidth: 1.5,
                ...CAMPUS_HUB_COLORS.shadow,
              },
            ]}
            onPress={() => onSelectFilter(tab.key)}
            activeOpacity={0.75}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${tab.label} complaints: ${count}`}
          >
            <View style={styles.tabTopRow}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: isActive ? "#ffffff" : tab.bgColor },
                ]}
              >
                <Feather name={tab.icon} size={14} color={tab.color} />
              </View>
              <Text
                style={[
                  styles.countText,
                  { color: isActive ? tab.color : CAMPUS_HUB_COLORS.deepNavy },
                ]}
              >
                {count}
              </Text>
            </View>

            <Text
              style={[
                styles.labelText,
                isActive && { color: tab.color, fontWeight: "800" },
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>

            {isActive && (
              <View style={[styles.activeIndicator, { backgroundColor: tab.color }]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      {horizontalScroll ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 8,
  },
  tabCard: {
    minWidth: 84,
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    position: "relative",
    overflow: "hidden",
  },
  tabTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 6,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  labelText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 8,
    right: 8,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});
