import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";

export const BloodSkeleton = React.memo(function BloodSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonPill} />
          <View style={[styles.skeletonPill, { width: 70 }]} />
        </View>
        <View style={styles.skeletonTitleBar} />
        <View style={[styles.skeletonTitleBar, { width: "60%" }]} />
        <View style={styles.skeletonFooterBar} />
      </View>
      <View style={[styles.skeletonCard, { marginTop: 14 }]}>
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonPill} />
          <View style={[styles.skeletonPill, { width: 70 }]} />
        </View>
        <View style={styles.skeletonTitleBar} />
        <View style={[styles.skeletonTitleBar, { width: "50%" }]} />
        <View style={styles.skeletonFooterBar} />
      </View>
    </View>
  );
});

interface BloodErrorProps {
  onRetry: () => void;
}

export const BloodError = React.memo(function BloodError({
  onRetry,
}: BloodErrorProps) {
  return (
    <View style={styles.card}>
      <View style={styles.errorIconCircle}>
        <Feather name="alert-circle" size={32} color="#dc2626" />
      </View>
      <Text style={styles.title}>Failed to Load Blood Feed</Text>
      <Text style={styles.desc}>
        An error occurred while fetching emergency requests. Please check your connection and try again.
      </Text>
      <TouchableOpacity
        style={styles.retryBtn}
        onPress={onRetry}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Retry loading blood requests"
      >
        <Feather
          name="refresh-cw"
          size={14}
          color="#ffffff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.retryBtnText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
});

interface BloodEmptyProps {
  searchQuery: string;
  activeFilter: string;
  onReset: () => void;
}

export const BloodEmpty = React.memo(function BloodEmpty({
  searchQuery,
  activeFilter,
  onReset,
}: BloodEmptyProps) {
  return (
    <View style={styles.card}>
      <View style={styles.emptyIconCircle}>
        <Feather name="heart" size={36} color={BENTO_COLORS.crimson} />
      </View>
      <Text style={styles.title}>
        {searchQuery.trim()
          ? "No matching requests"
          : activeFilter === "URGENT"
            ? "No Urgent Requests"
            : "No Requests Found"}
      </Text>
      <Text style={styles.desc}>
        {searchQuery.trim()
          ? `No blood requests matched "${searchQuery}".`
          : "There are currently no active blood donor requests in this category."}
      </Text>
      {activeFilter !== "ALL" && (
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={onReset}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="View all active blood requests"
        >
          <Text style={styles.resetBtnText}>View All Requests</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff1f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.neutralText,
    marginBottom: 8,
    textAlign: "center",
  },
  desc: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  retryBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  resetBtn: {
    backgroundColor: BENTO_COLORS.crimson,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  resetBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  skeletonContainer: {
    paddingVertical: 4,
  },
  skeletonCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
  },
  skeletonRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  skeletonPill: {
    width: 80,
    height: 22,
    backgroundColor: "#f1f5f9",
    borderRadius: 11,
  },
  skeletonTitleBar: {
    height: 18,
    backgroundColor: "#e2e8f0",
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonFooterBar: {
    width: "40%",
    height: 16,
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    marginTop: 10,
  },
});
