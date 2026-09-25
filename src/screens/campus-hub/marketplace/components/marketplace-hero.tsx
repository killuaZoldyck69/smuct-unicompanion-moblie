import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";

const ACCENT = CAMPUS_HUB_COLORS.marketplaceAccentText;

interface MarketplaceStats {
  total: number;
  selling: number;
  buying: number;
}

interface MarketplaceHeroProps {
  stats: MarketplaceStats;
}

export const MarketplaceHero = React.memo(function MarketplaceHero({
  stats,
}: MarketplaceHeroProps) {
  return (
    <View style={styles.statsBar}>
      {/* Minimal Header */}
      <View style={styles.statsBarHeader}>
        <View style={styles.statsBarTag}>
          <Feather name="shopping-bag" size={12} color={ACCENT} />
          <Text style={styles.statsBarTagText}>CAMPUS HUB BUY & SELL</Text>
        </View>
        <Text style={styles.statsBarSub}>Verified Student Trade</Text>
      </View>

      {/* Compact Modern Stats Row */}
      <View style={styles.statsBarRow}>
        <View style={styles.statCell}>
          <View
            style={[
              styles.statDot,
              { backgroundColor: CAMPUS_HUB_COLORS.subtleText },
            ]}
          />
          <Text style={styles.statCount}>{stats.total}</Text>
          <Text style={styles.statTitle}>Listings</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statCell}>
          <View
            style={[
              styles.statDot,
              { backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccent },
            ]}
          />
          <Text style={[styles.statCount, { color: CAMPUS_HUB_COLORS.marketplaceAccentText }]}>
            {stats.selling}
          </Text>
          <Text style={styles.statTitle}>For Sale</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statCell}>
          <View
            style={[
              styles.statDot,
              { backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccent },
            ]}
          />
          <Text style={[styles.statCount, { color: CAMPUS_HUB_COLORS.lostFoundAccentText }]}>
            {stats.buying}
          </Text>
          <Text style={styles.statTitle}>Wanted</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  statsBar: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  statsBarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statsBarTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statsBarTagText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: ACCENT,
    letterSpacing: 0.6,
  },
  statsBarSub: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
    fontWeight: "500",
  },
  statsBarRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  statCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  statCount: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  statTitle: {
    fontFamily,
    fontSize: 10,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
});
