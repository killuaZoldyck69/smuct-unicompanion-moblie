import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { BENTO_COLORS } from "../constants";

export const ForumSkeleton = memo(function ForumSkeleton() {
  return (
    <View style={styles.stateContainer}>
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonTopRow}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonTextCol}>
            <View style={styles.skeletonNameBar} />
            <View style={styles.skeletonTimeBar} />
          </View>
          <View style={styles.skeletonBadge} />
        </View>
        <View style={styles.skeletonTitleBar} />
        <View style={[styles.skeletonTitleBar, { width: "70%" }]} />
        <View style={styles.skeletonFooterBar} />
      </View>

      <View style={[styles.skeletonCard, { marginTop: 14 }]}>
        <View style={styles.skeletonTopRow}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonTextCol}>
            <View style={styles.skeletonNameBar} />
            <View style={styles.skeletonTimeBar} />
          </View>
          <View style={styles.skeletonBadge} />
        </View>
        <View style={styles.skeletonTitleBar} />
        <View style={[styles.skeletonTitleBar, { width: "60%" }]} />
        <View style={styles.skeletonFooterBar} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  stateContainer: {
    paddingVertical: 8,
  },
  skeletonCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    ...BENTO_COLORS.shadow,
  },
  skeletonTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  skeletonAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#edf2f7",
  },
  skeletonTextCol: {
    flex: 1,
    marginLeft: 10,
  },
  skeletonNameBar: {
    width: 120,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#edf2f7",
    marginBottom: 4,
  },
  skeletonTimeBar: {
    width: 60,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#edf2f7",
  },
  skeletonBadge: {
    width: 70,
    height: 20,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: "#edf2f7",
  },
  skeletonTitleBar: {
    width: "80%",
    height: 16,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
    marginBottom: 8,
  },
  skeletonFooterBar: {
    width: "30%",
    height: 20,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: "#edf2f7",
    marginTop: 8,
  },
});
