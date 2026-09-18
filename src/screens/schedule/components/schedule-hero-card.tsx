import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily, TodayStats } from "../constants";
import { LiveBeepDot } from "./live-beep-indicator";

interface ScheduleHeroCardProps {
  stats: TodayStats;
}

export const ScheduleHeroCard = React.memo(function ScheduleHeroCard({
  stats,
}: ScheduleHeroCardProps) {
  const { weekday, dateFormatted, totalClassesToday, liveClass, nextClass } = stats;

  return (
    <View style={styles.card}>
      {/* Top Meta Line: Today Badge & Date */}
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>TODAY</Text>
        </View>
        <Text style={styles.dateText}>{dateFormatted}</Text>
      </View>

      {/* Weekday Title */}
      <Text style={styles.weekdayText}>{weekday.toUpperCase()}</Text>

      {/* Status Footer */}
      <View style={styles.footer}>
        {liveClass ? (
          <View style={styles.liveChip}>
            <LiveBeepDot size={5.5} style={{ marginRight: 3 }} />
            <Text style={styles.liveChipText} numberOfLines={1}>
              Live: {liveClass.courseCode} ({liveClass.room ? `Room ${liveClass.room}` : "TBA"})
            </Text>
          </View>
        ) : nextClass ? (
          <View style={styles.nextChip}>
            <Feather
              name="clock"
              size={12}
              color="#93c5fd"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.nextChipText} numberOfLines={1}>
              Next: {nextClass.startTime} · {nextClass.courseCode} ({nextClass.room ? `Room ${nextClass.room}` : "TBA"})
            </Text>
          </View>
        ) : (
          <View style={styles.summaryRow}>
            <Feather
              name={totalClassesToday === 0 ? "coffee" : "book-open"}
              size={14}
              color="#c1dcff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.summaryText}>
              {totalClassesToday === 0
                ? "No classes scheduled today · Free Day"
                : totalClassesToday === 1
                  ? "1 class scheduled today"
                  : `${totalClassesToday} classes scheduled today`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: BENTO_COLORS.deepNavy,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#a5b4fc",
    letterSpacing: 0.8,
  },
  dateText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: "#94a3b8",
  },
  weekdayText: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    paddingTop: 10,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: "#c1dcff",
  },
  liveChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.4)",
  },

  liveChipText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#fca5a5",
  },
  nextChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.18)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.35)",
  },
  nextChipText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#bfdbfe",
  },
});
