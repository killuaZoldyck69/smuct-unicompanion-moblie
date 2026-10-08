import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import { BENTO } from "../constants";

export const BookingSkeletonCard = React.memo(function BookingSkeletonCard() {
  return (
    <View style={styles.card}>
      {/* Header row: date skeleton + status badge skeleton */}
      <View style={styles.headerRow}>
        <View style={styles.dateSkeleton} />
        <View style={styles.statusBadgeSkeleton} />
      </View>

      {/* Title skeleton */}
      <View style={styles.titleSkeleton} />

      {/* Sport type skeleton */}
      <View style={styles.sportSkeleton} />

      {/* Time & duration skeleton */}
      <View style={styles.timeRow}>
        <View style={styles.timePillSkeleton} />
        <View style={styles.durationPillSkeleton} />
      </View>

      {/* Requested footer skeleton */}
      <View style={styles.footerSkeleton} />
    </View>
  );
});

export const BookingSkeletonList = React.memo(function BookingSkeletonList() {
  return (
    <View style={styles.list}>
      <BookingSkeletonCard />
      <BookingSkeletonCard />
      <BookingSkeletonCard />
    </View>
  );
});

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  card: {
    backgroundColor: BENTO.card,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    marginBottom: 12,
    borderLeftWidth: 3.5,
    borderLeftColor: "#cbd5e1",
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateSkeleton: {
    width: 120,
    height: 14,
    borderRadius: 6,
    backgroundColor: "#e2e8f0",
  },
  statusBadgeSkeleton: {
    width: 80,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
  },
  titleSkeleton: {
    width: "70%",
    height: 18,
    borderRadius: 6,
    backgroundColor: "#e2e8f0",
    marginBottom: 8,
  },
  sportSkeleton: {
    width: 90,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
    marginBottom: 14,
  },
  timeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  timePillSkeleton: {
    width: 140,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  durationPillSkeleton: {
    width: 50,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  footerSkeleton: {
    width: 130,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
  },
});
