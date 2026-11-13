import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";
import { CAMPUS_HUB_COLORS } from "../../shared/design-tokens";

interface MarketplaceSkeletonProps {
  cardWidth?: number;
}

export const MarketplaceSkeleton = React.memo(function MarketplaceSkeleton({
  cardWidth,
}: MarketplaceSkeletonProps) {
  return (
    <View style={styles.grid}>
      {[1, 2, 3, 4].map((item) => (
        <View
          key={item}
          style={[styles.card, cardWidth ? { width: cardWidth } : null]}
        >
          {/* Image Placeholder matching 136dp ListingCard container */}
          <View style={styles.imageSkeleton} />

          {/* Info Body matching price-row -> title -> snippet -> footer */}
          <View style={styles.body}>
            <View style={styles.priceRowSkeleton}>
              <View style={styles.priceSkeleton} />
              <View style={styles.badgeSkeleton} />
            </View>
            <View style={styles.titleSkeleton} />
            <View style={styles.descSkeleton} />
            <View style={styles.descSkeletonShort} />
            <View style={styles.footerSkeleton}>
              <View style={styles.footerItem} />
              <View style={styles.footerItemRight} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  imageSkeleton: {
    width: "100%",
    height: 136,
    backgroundColor: colors.slate200,
    opacity: 0.6,
  },
  body: {
    padding: 10,
    gap: 6,
  },
  priceRowSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  priceSkeleton: {
    width: 64,
    height: 18,
    borderRadius: 6,
    backgroundColor: colors.slate200,
    opacity: 0.7,
  },
  badgeSkeleton: {
    width: 52,
    height: 16,
    borderRadius: 6,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
  },
  titleSkeleton: {
    width: "88%",
    height: 14,
    borderRadius: 6,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
  },
  descSkeleton: {
    width: "96%",
    height: 11,
    borderRadius: 4,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
  },
  descSkeletonShort: {
    width: "62%",
    height: 11,
    borderRadius: 4,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
  },
  footerSkeleton: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
    paddingTop: 6,
    marginTop: 2,
  },
  footerItem: {
    width: 48,
    height: 11,
    borderRadius: 4,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
  },
  footerItemRight: {
    width: 40,
    height: 11,
    borderRadius: 4,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
  },
});
