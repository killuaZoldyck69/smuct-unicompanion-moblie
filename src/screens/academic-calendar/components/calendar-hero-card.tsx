import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";

interface CalendarHeroCardProps {
  currentWeekNumber: number;
  totalCount: number;
  title: string;
  semester: string;
  academicYear: string | number;
  currentWeekDateRange: string;
}

export const CalendarHeroCard = React.memo(function CalendarHeroCard({
  currentWeekNumber,
  totalCount,
  title,
  semester,
  academicYear,
  currentWeekDateRange,
}: CalendarHeroCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.weekBadge}>
          <Feather name="clock" size={12} color="#ffffff" />
          <Text style={styles.weekBadgeText}>
            WEEK {String(currentWeekNumber).padStart(2, "0")}
          </Text>
        </View>

        <Text style={styles.totalEventsText}>
          {totalCount} Total Events
        </Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.semester}>
        {semester} • Academic Year {academicYear}
      </Text>

      <View style={styles.footer}>
        <View style={styles.dateRangeBox}>
          <Feather name="calendar" size={14} color="#c1dcff" />
          <Text style={styles.dateRangeText}>
            {currentWeekDateRange}
          </Text>
        </View>

        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Active Term</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 24,
    marginBottom: 20,
    ...BENTO_COLORS.heroShadow,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  weekBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
    gap: 6,
  },
  weekBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 1,
  },
  totalEventsText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
  },
  title: {
    fontFamily,
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  semester: {
    fontFamily,
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 20,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: 14,
  },
  dateRangeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateRangeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#c1dcff",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34d399",
  },
  statusText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#34d399",
    letterSpacing: 0.5,
  },
});
