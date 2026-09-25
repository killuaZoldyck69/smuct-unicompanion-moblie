import React from "react";
import { ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { ListingType } from "@/services/marketplace-service";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";

export type FilterTab = "ALL" | ListingType | "SOLD";

interface FilterOption {
  key: FilterTab;
  label: string;
}

const FILTERS: FilterOption[] = [
  { key: "ALL", label: "All Listings" },
  { key: "SELLING", label: "For Sale" },
  { key: "BUYING", label: "Wanted" },
  { key: "SOLD", label: "Sold" },
];

interface MarketplaceFilterRailProps {
  activeFilter: FilterTab;
  onSelectFilter: (filter: FilterTab) => void;
}

export const MarketplaceFilterRail = React.memo(function MarketplaceFilterRail({
  activeFilter,
  onSelectFilter,
}: MarketplaceFilterRailProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((f) => {
        const isActive = activeFilter === f.key;
        return (
          <TouchableOpacity
            key={f.key}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onSelectFilter(f.key)}
            activeOpacity={0.75}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Filter by ${f.label}`}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    paddingRight: 10,
  },
  pill: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  pillActive: {
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccent,
    borderColor: CAMPUS_HUB_COLORS.marketplaceAccent,
  },
  pillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  pillTextActive: {
    color: "#ffffff",
  },
});
