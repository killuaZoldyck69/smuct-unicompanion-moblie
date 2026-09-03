import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";

export const EventSkeleton = React.memo(function EventSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonPill} />
          <View style={[styles.skeletonPill, { width: 70 }]} />
        </View>
        <View style={styles.skeletonTitleBar} />
        <View style={[styles.skeletonTitleBar, { width: "70%" }]} />
        <View style={styles.skeletonPillsRow}>
          <View style={styles.skeletonMiniPill} />
          <View style={styles.skeletonMiniPill} />
        </View>
      </View>

      <View style={[styles.skeletonCard, { marginTop: 14 }]}>
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonPill} />
          <View style={[styles.skeletonPill, { width: 70 }]} />
        </View>
        <View style={styles.skeletonTitleBar} />
        <View style={[styles.skeletonTitleBar, { width: "60%" }]} />
        <View style={styles.skeletonPillsRow}>
          <View style={styles.skeletonMiniPill} />
          <View style={styles.skeletonMiniPill} />
        </View>
      </View>
    </View>
  );
});

interface EventErrorProps {
  onRetry: () => void;
}

export const EventError = React.memo(function EventError({
  onRetry,
}: EventErrorProps) {
  return (
    <View style={styles.card}>
      <View style={styles.errorIconCircle}>
        <Feather name="alert-circle" size={32} color="#dc2626" />
      </View>
      <Text style={styles.title}>Failed to Load Events</Text>
      <Text style={styles.desc}>
        An error occurred while fetching campus events. Please check your connection and try again.
      </Text>
      <TouchableOpacity
        style={styles.retryBtn}
        onPress={onRetry}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Retry loading events"
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

interface EventEmptyProps {
  searchQuery: string;
  activeTab: string;
  onReset: () => void;
}

export const EventEmpty = React.memo(function EventEmpty({
  searchQuery,
  activeTab,
  onReset,
}: EventEmptyProps) {
  return (
    <View style={styles.card}>
      <View style={styles.emptyIconCircle}>
        <Feather name="calendar" size={36} color={BENTO_COLORS.subtleText} />
      </View>
      <Text style={styles.title}>
        {searchQuery.trim()
          ? "No matching events"
          : activeTab === "today"
            ? "No Events Today"
            : activeTab === "upcoming"
              ? "No Upcoming Events"
              : "No Events Found"}
      </Text>
      <Text style={styles.desc}>
        {searchQuery.trim()
          ? `No events matched "${searchQuery}". Try a different keyword.`
          : "Check back later for new programs, seminars, and campus activities."}
      </Text>
      {(activeTab !== "all" || searchQuery.trim().length > 0) && (
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={onReset}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="View all events"
        >
          <Text style={styles.resetBtnText}>View All Events</Text>
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
  skeletonPillsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  skeletonMiniPill: {
    width: 70,
    height: 20,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
  },
});
