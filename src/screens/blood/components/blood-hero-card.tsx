import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BENTO_COLORS, BloodFeedCounts, fontFamily } from "../constants";

interface BloodHeroCardProps {
  counts: BloodFeedCounts;
}

export const BloodHeroCard = React.memo(function BloodHeroCard({
  counts,
}: BloodHeroCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>COMMUNITY LIFESAVER</Text>
        </View>
        {counts.urgent > 0 && (
          <View style={styles.urgentAlertPill}>
            <View style={styles.pulseDot} />
            <Text style={styles.urgentAlertText}>
              {counts.urgent} URGENT
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>
        {counts.urgent > 0
          ? `${counts.urgent} Urgent Blood Requests`
          : `${counts.active} Active Requests`}
      </Text>

      <Text style={styles.subtitle}>
        Connect students and faculty in real time to save lives during emergencies and scheduled surgeries.
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: "#fca5a5" }]}>
            {counts.urgent}
          </Text>
          <Text style={styles.statLabel}>Urgent</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{counts.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{counts.fulfilled}</Text>
          <Text style={styles.statLabel}>Fulfilled</Text>
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
  urgentAlertPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(225, 29, 72, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.5)",
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#f43f5e",
    marginRight: 6,
  },
  urgentAlertText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#fecdd3",
    letterSpacing: 0.5,
  },
  title: {
    fontFamily,
    fontSize: 24,
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
