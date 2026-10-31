import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";

export const CalendarLoadingState = React.memo(function CalendarLoadingState() {
  return (
    <View style={styles.timelineSkeleton} accessibilityLabel="Loading academic calendar">
      {[0, 1, 2].map((group) => (
        <View key={group} style={styles.skeletonGroup}>
          <View style={styles.dateSkeletonRow}>
            <View style={styles.dateSkeleton} />
            <View style={styles.countSkeleton} />
          </View>
          {[0, 1].map((event) => (
            <View key={event} style={styles.eventSkeletonCard}>
              <View style={styles.eventSkeletonRail} />
              <View style={styles.eventSkeletonContent}>
                <View style={styles.eventSkeletonMeta} />
                <View style={styles.eventSkeletonTitle} />
                <View style={styles.eventSkeletonDescription} />
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
});

export const CalendarHeaderLoadingSkeleton = React.memo(
  function CalendarHeaderLoadingSkeleton() {
    return (
      <View style={styles.headerSkeleton} accessibilityLabel="Loading calendar controls">
        <View style={styles.monthSkeletonRow}>
          <View style={styles.monthSkeleton} />
          <View style={styles.monthControlSkeleton} />
        </View>
        <View style={styles.daysSkeletonRow}>
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <View key={day} style={styles.daySkeleton} />
          ))}
        </View>
        <View style={styles.filtersSkeletonRow}>
          <View style={styles.filterSkeletonActive} />
          <View style={styles.filterSkeleton} />
          <View style={styles.filterSkeleton} />
        </View>
        <View style={styles.semesterSkeleton} />
      </View>
    );
  },
);

interface CalendarErrorStateProps {
  onRetry: () => void;
}

export const CalendarErrorState = React.memo(function CalendarErrorState({
  onRetry,
}: CalendarErrorStateProps) {
  return (
    <View style={styles.centerBox}>
      <View style={styles.errorIconCircle}>
        <Feather name="alert-circle" size={32} color="#dc2626" />
      </View>
      <Text style={styles.stateTitle}>Unable to Load Schedule</Text>
      <Text style={styles.stateDesc}>
        Please check your network connection and try again.
      </Text>
      <TouchableOpacity
        style={styles.retryPill}
        onPress={onRetry}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Retry loading calendar"
      >
        <Feather
          name="refresh-cw"
          size={14}
          color="#ffffff"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.retryPillText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
});

export const CalendarEmptyState = React.memo(function CalendarEmptyState() {
  return (
    <View style={styles.centerBox}>
      <View style={styles.emptyIconCircle}>
        <Feather name="calendar" size={36} color={BENTO_COLORS.subtleText} />
      </View>
      <Text style={styles.stateTitle}>No Active Calendar</Text>
      <Text style={styles.stateDesc}>
        There is currently no published academic calendar for your semester.
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  headerSkeleton: {
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.08)",
  },
  monthSkeletonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  monthSkeleton: {
    width: 145,
    height: 16,
    borderRadius: 5,
    backgroundColor: "#e2e8f0",
  },
  monthControlSkeleton: {
    width: 70,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e2e8f0",
  },
  daysSkeletonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  daySkeleton: {
    width: 36,
    height: 58,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
  },
  filtersSkeletonRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  filterSkeleton: {
    width: 94,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#e2e8f0",
  },
  filterSkeletonActive: {
    width: 106,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#cbd5e1",
  },
  semesterSkeleton: {
    height: 30,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
  },
  timelineSkeleton: {
    paddingTop: 4,
  },
  skeletonGroup: {
    marginBottom: 16,
  },
  dateSkeletonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dateSkeleton: {
    width: 150,
    height: 18,
    borderRadius: 5,
    backgroundColor: "#cbd5e1",
  },
  countSkeleton: {
    width: 52,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
  },
  eventSkeletonCard: {
    minHeight: 94,
    flexDirection: "row",
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    overflow: "hidden",
    marginBottom: 10,
  },
  eventSkeletonRail: {
    width: 4,
    backgroundColor: "#cbd5e1",
  },
  eventSkeletonContent: {
    flex: 1,
    padding: 14,
    justifyContent: "center",
  },
  eventSkeletonMeta: {
    width: "34%",
    height: 11,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
    marginBottom: 10,
  },
  eventSkeletonTitle: {
    width: "72%",
    height: 15,
    borderRadius: 4,
    backgroundColor: "#cbd5e1",
    marginBottom: 8,
  },
  eventSkeletonDescription: {
    width: "88%",
    height: 11,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
  },
  centerBox: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
    marginTop: 10,
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
  stateTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.neutralText,
    marginBottom: 8,
    textAlign: "center",
  },
  stateDesc: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  retryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  retryPillText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
