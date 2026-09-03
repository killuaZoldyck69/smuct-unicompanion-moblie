import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily, TodayStats } from "../constants";

interface ScheduleHeroCardProps {
  stats: TodayStats;
}

export const ScheduleHeroCard = React.memo(function ScheduleHeroCard({
  stats,
}: ScheduleHeroCardProps) {
  const { weekday, dateFormatted, totalClassesToday, liveClass, nextClass } = stats;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>TODAY</Text>
        </View>
        <Text style={styles.dateText}>{dateFormatted}</Text>
      </View>

      <Text style={styles.weekdayText}>{weekday.toUpperCase()}</Text>

      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Feather
            name="book-open"
            size={16}
            color="#c1dcff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.summaryText}>
            {totalClassesToday === 0
              ? "No classes scheduled today"
              : totalClassesToday === 1
                ? "1 class scheduled today"
                : `${totalClassesToday} classes scheduled today`}
          </Text>
        </View>

        {liveClass ? (
          <View style={styles.liveChip}>
            <View style={styles.liveDot} />
            <Text style={styles.liveChipText} numberOfLines={1}>
              Now: {liveClass.courseCode} ({liveClass.room})
            </Text>
          </View>
        ) : nextClass ? (
          <View style={styles.nextChip}>
            <Text style={styles.nextChipText} numberOfLines={1}>
              Next at {nextClass.startTime} ({nextClass.courseCode})
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 24,
    marginBottom: 18,
    ...BENTO_COLORS.heroShadow,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  badgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#a5b4fc",
    letterSpacing: 1,
  },
  dateText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
  },
  weekdayText: {
    fontFamily,
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: 14,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: "#c1dcff",
  },
  liveChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BENTO_COLORS.pillRadius,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.4)",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ef4444",
    marginRight: 6,
  },
  liveChipText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#fca5a5",
  },
  nextChip: {
    backgroundColor: "rgba(59, 130, 246, 0.18)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BENTO_COLORS.pillRadius,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.35)",
  },
  nextChipText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#93c5fd",
  },
});
