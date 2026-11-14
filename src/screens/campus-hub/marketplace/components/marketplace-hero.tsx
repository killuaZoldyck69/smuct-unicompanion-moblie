import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  titleFontFamily,
} from "../../shared/design-tokens";

const ACCENT = CAMPUS_HUB_COLORS.marketplaceAccentText;

interface MarketplaceStats {
  total: number;
  selling: number;
  buying: number;
}

interface MarketplaceHeroProps {
  stats: MarketplaceStats;
  isLoading?: boolean;
}

export const MarketplaceHero = React.memo(function MarketplaceHero({
  stats,
  isLoading = false,
}: MarketplaceHeroProps) {
  const formatCount = (count: number) => (isLoading ? "—" : count);

  return (
    <View style={styles.statsBar}>
      {/* Minimal Header */}
      <View style={styles.statsBarHeader}>
        <View style={styles.statsBarTag}>
          <Feather name="shopping-bag" size={12} color={ACCENT} />
          <Text style={styles.statsBarTagText} maxFontSizeMultiplier={1.2}>
            CAMPUS HUB BUY & SELL
          </Text>
        </View>
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
          <Text style={styles.statCount} maxFontSizeMultiplier={1.2}>
            {formatCount(stats.total)}
          </Text>
          <Text style={styles.statTitle} maxFontSizeMultiplier={1.2}>
            Listings
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statCell}>
          <View
            style={[
              styles.statDot,
              { backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccent },
            ]}
          />
          <Text
            style={[
              styles.statCount,
              { color: CAMPUS_HUB_COLORS.marketplaceAccentText },
            ]}
            maxFontSizeMultiplier={1.2}
          >
            {formatCount(stats.selling)}
          </Text>
          <Text style={styles.statTitle} maxFontSizeMultiplier={1.2}>
            For Sale
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statCell}>
          <View
            style={[
              styles.statDot,
              { backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccent },
            ]}
          />
          <Text
            style={[
              styles.statCount,
              { color: CAMPUS_HUB_COLORS.lostFoundAccentText },
            ]}
            maxFontSizeMultiplier={1.2}
          >
            {formatCount(stats.buying)}
          </Text>
          <Text style={styles.statTitle} maxFontSizeMultiplier={1.2}>
            Wanted
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  statsBar: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
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
    lineHeight: 13,
    fontWeight: "800",
    color: ACCENT,
    letterSpacing: 0.6,
    includeFontPadding: false,
  },
  statsBarRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderRadius: 14,
    paddingVertical: 10,
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
    fontFamily: titleFontFamily,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  statTitle: {
    fontFamily,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.mutedInk,
    marginTop: 2,
    includeFontPadding: false,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
});
