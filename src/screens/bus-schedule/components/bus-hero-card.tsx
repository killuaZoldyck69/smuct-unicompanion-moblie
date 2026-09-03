import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BENTO_COLORS, BusScheduleCounts, fontFamily } from "../constants";

interface BusHeroCardProps {
  counts: BusScheduleCounts;
}

export const BusHeroCard = React.memo(function BusHeroCard({
  counts,
}: BusHeroCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>CAMPUS TRANSIT</Text>
        </View>
        <View style={styles.liveServicePill}>
          <View style={styles.pulseDot} />
          <Text style={styles.liveServiceText}>MON - THU</Text>
        </View>
      </View>

      <Text style={styles.title}>
        {counts.total > 0
          ? `${counts.total} Active Bus Routes`
          : "University Transport Hub"}
      </Text>

      <Text style={styles.subtitle}>
        Reliable scheduled transportation connecting the permanent campus with major transit stops across Dhaka.
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{counts.total}</Text>
          <Text style={styles.statLabel}>Routes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{counts.totalStops}</Text>
          <Text style={styles.statLabel}>Stops</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>Daily</Text>
          <Text style={styles.statLabel}>Service</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
    ...BENTO_COLORS.heroShadow,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tagPill: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  tagText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.8,
  },
  liveServicePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(96, 165, 250, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#60a5fa",
  },
  liveServiceText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#93c5fd",
    letterSpacing: 0.5,
  },
  title: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.4,
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
