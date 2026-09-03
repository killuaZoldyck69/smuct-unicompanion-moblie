import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CampusEventItem } from "@/services/event-service";
import { BENTO_COLORS, EventTabCounts, fontFamily } from "../constants";
import { formatEventDate } from "../utils";

interface EventHeroCardProps {
  counts: EventTabCounts;
  nextEvent: CampusEventItem | null;
}

export const EventHeroCard = React.memo(function EventHeroCard({
  counts,
  nextEvent,
}: EventHeroCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>CAMPUS ACTIVITIES</Text>
        </View>
        {nextEvent && (
          <View style={styles.nextPill}>
            <View style={styles.pulseDot} />
            <Text style={styles.nextText} numberOfLines={1}>
              Next: {nextEvent.title}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>
        {counts.upcoming > 0
          ? `${counts.upcoming} Upcoming Events`
          : "Campus Events Hub"}
      </Text>

      <Text style={styles.subtitle}>
        {nextEvent
          ? `Upcoming on ${formatEventDate(
              nextEvent.eventDate || nextEvent.date || nextEvent.createdAt,
              { month: "short", day: "numeric" }
            )} • ${nextEvent.location || "Permanent Campus"}.`
          : "Discover workshops, department fests, seminars, and university programs."}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{counts.upcoming}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{counts.today}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{counts.all}</Text>
          <Text style={styles.statLabel}>Total Events</Text>
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
    flexWrap: "wrap",
    gap: 8,
  },
  tagPill: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  tagText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#a5b4fc",
    letterSpacing: 1,
  },
  nextPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
    maxWidth: "55%",
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34d399",
    marginRight: 6,
  },
  nextText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#e0e7ff",
  },
  title: {
    fontFamily,
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily,
    fontSize: 13,
    color: "#94a3b8",
    lineHeight: 18,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  statLabel: {
    fontFamily,
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 2,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});
