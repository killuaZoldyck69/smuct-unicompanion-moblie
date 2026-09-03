import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";

export const BusSkeleton = React.memo(function BusSkeleton() {
  return (
    <View style={styles.stateContainer}>
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonTopRow}>
          <View style={styles.skeletonIcon} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.skeletonTitleBar} />
            <View style={styles.skeletonSubBar} />
          </View>
          <View style={styles.skeletonTimeBadge} />
        </View>
        <View style={styles.skeletonToggleBar} />
      </View>
      <View style={[styles.skeletonCard, { marginTop: 14 }]}>
        <View style={styles.skeletonTopRow}>
          <View style={styles.skeletonIcon} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.skeletonTitleBar} />
            <View style={styles.skeletonSubBar} />
          </View>
          <View style={styles.skeletonTimeBadge} />
        </View>
        <View style={styles.skeletonToggleBar} />
      </View>
    </View>
  );
});

interface BusErrorProps {
  onRetry: () => void;
}

export const BusError = React.memo(function BusError({ onRetry }: BusErrorProps) {
  return (
    <View style={styles.card}>
      <View style={styles.errorIconCircle}>
        <Feather name="alert-circle" size={32} color="#dc2626" />
      </View>
      <Text style={styles.title}>Failed to Load Schedules</Text>
      <Text style={styles.desc}>
        Unable to load transport schedules. Please check your connection and try again.
      </Text>
      <TouchableOpacity
        style={styles.retryBtn}
        onPress={onRetry}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Retry loading bus schedules"
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

interface BusEmptyProps {
  searchQuery: string;
  directionFilter: string;
  onReset: () => void;
}

export const BusEmpty = React.memo(function BusEmpty({
  searchQuery,
  directionFilter,
  onReset,
}: BusEmptyProps) {
  return (
    <View style={styles.card}>
      <View style={styles.emptyIconCircle}>
        <Feather name="truck" size={36} color={BENTO_COLORS.subtleText} />
      </View>
      <Text style={styles.title}>
        {searchQuery.trim()
          ? "No matching routes or stops"
          : "No Bus Schedules Found"}
      </Text>
      <Text style={styles.desc}>
        {searchQuery.trim()
          ? `No bus routes matched "${searchQuery}". Try searching for another stop name.`
          : "There are currently no active bus routes published for this semester."}
      </Text>
      {(directionFilter !== "ALL" || searchQuery.trim().length > 0) && (
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={onReset}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="View all bus routes"
        >
          <Text style={styles.resetBtnText}>View All Routes</Text>
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
    backgroundColor: "#f1f5f9",
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
    backgroundColor: BENTO_COLORS.deepNavy,
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
  stateContainer: {
    paddingVertical: 4,
  },
  skeletonCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
  },
  skeletonTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
  },
  skeletonTitleBar: {
    height: 16,
    width: "70%",
    backgroundColor: "#e2e8f0",
    borderRadius: 6,
    marginBottom: 6,
  },
  skeletonSubBar: {
    height: 12,
    width: "40%",
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
  },
  skeletonTimeBadge: {
    width: 60,
    height: 24,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
  },
  skeletonToggleBar: {
    height: 32,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    marginTop: 14,
  },
});
