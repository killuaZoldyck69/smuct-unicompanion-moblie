import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";

interface EventSkeletonProps {
  count?: number;
}

export const EventSkeleton = React.memo(function EventSkeleton({
  count = 3,
}: EventSkeletonProps) {
  return (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonDateBlock}>
            <View style={styles.skeletonMonth} />
            <View style={styles.skeletonDateNumber} />
            <View style={styles.skeletonWeekday} />
          </View>
          <View style={styles.skeletonContent}>
            <View
              style={[
                styles.skeletonTitleBar,
                index % 2 === 0 && styles.skeletonTitleBarShort,
              ]}
            />
            <View style={styles.skeletonMetaRow}>
              <View style={styles.skeletonMetaItem} />
              <View style={styles.skeletonMetaItemShort} />
            </View>
          </View>
        </View>
      ))}
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
  category?: string;
  activeTab: string;
  onReset: () => void;
}

export const EventEmpty = React.memo(function EventEmpty({
  searchQuery,
  category,
  activeTab,
  onReset,
}: EventEmptyProps) {
  const hasFilter =
    activeTab !== "all" ||
    searchQuery.trim().length > 0 ||
    (category && category.toUpperCase() !== "ALL");

  return (
    <View style={styles.card}>
      <View style={styles.emptyIconCircle}>
        <Feather name="calendar" size={36} color={BENTO_COLORS.subtleText} />
      </View>
      <Text style={styles.title}>
        {searchQuery.trim()
          ? "No matching events"
          : category && category.toUpperCase() !== "ALL"
            ? `No ${category} Events`
            : activeTab === "today"
              ? "No Events Today"
              : activeTab === "upcoming"
                ? "No Upcoming Events"
                : "No Events Found"}
      </Text>
      <Text style={styles.desc}>
        {searchQuery.trim()
          ? `No events matched "${searchQuery}". Try a different keyword.`
          : category && category.toUpperCase() !== "ALL"
            ? `There are currently no events under the ${category} category.`
            : "Check back later for new programs, seminars, and campus activities."}
      </Text>
      {hasFilter && (
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={onReset}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Reset all filters and view all events"
        >
          <Text style={styles.resetBtnText}>Reset Filters & View All</Text>
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
    paddingTop: 4,
  },
  skeletonCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  skeletonDateBlock: {
    width: 60,
    height: 68,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  skeletonMonth: {
    width: 24,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
  },
  skeletonDateNumber: {
    width: 20,
    height: 18,
    borderRadius: 5,
    backgroundColor: "#e2e8f0",
  },
  skeletonWeekday: {
    width: 30,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 14,
    paddingTop: 3,
  },
  skeletonTitleBar: {
    width: "90%",
    height: 16,
    backgroundColor: "#e2e8f0",
    borderRadius: 6,
  },
  skeletonTitleBarShort: {
    width: "70%",
  },
  skeletonMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  skeletonMetaItem: {
    width: 72,
    height: 9,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
  },
  skeletonMetaItemShort: {
    width: 88,
    height: 9,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
  },
});
