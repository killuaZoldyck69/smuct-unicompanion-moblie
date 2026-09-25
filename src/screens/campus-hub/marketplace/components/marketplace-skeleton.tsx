import React from "react";
import { View, StyleSheet } from "react-native";
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
          {/* Image Placeholder */}
          <View style={styles.imageSkeleton} />

          {/* Info Body */}
          <View style={styles.body}>
            <View style={styles.badgeSkeleton} />
            <View style={styles.titleSkeleton} />
            <View style={styles.titleSkeletonShort} />
            <View style={styles.priceSkeleton} />
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
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  imageSkeleton: {
    width: "100%",
    height: 126,
    backgroundColor: "#e2e8f0",
    opacity: 0.6,
  },
  body: {
    padding: 11,
    gap: 7,
  },
  badgeSkeleton: {
    width: 60,
    height: 18,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: "#f1f5f9",
  },
  titleSkeleton: {
    width: "90%",
    height: 14,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
  },
  titleSkeletonShort: {
    width: "60%",
    height: 14,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
  },
  priceSkeleton: {
    width: 70,
    height: 16,
    borderRadius: 6,
    backgroundColor: "#e2e8f0",
    opacity: 0.7,
  },
  footerSkeleton: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.04)",
    paddingTop: 7,
    marginTop: 2,
  },
  footerItem: {
    width: 32,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
  },
  footerItemRight: {
    width: 44,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
  },
});
