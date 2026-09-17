import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { BENTO_COLORS, fontFamily } from "../constants";
import type { ForumCounts } from "../types";

interface ForumHeroCardProps {
  counts: ForumCounts;
}

export const ForumHeroCard = memo(function ForumHeroCard({
  counts,
}: ForumHeroCardProps) {
  return (
    <View style={styles.heroBentoCard}>
      <View style={styles.heroTopRow}>
        <View style={styles.heroTagPill}>
          <Text style={styles.heroTagText}>STUDENT COMMUNITY</Text>
        </View>
        {counts.open > 0 && (
          <View style={styles.openAlertPill}>
            <View style={styles.pulseDot} />
            <Text style={styles.openAlertText}>{counts.open} ACTIVE</Text>
          </View>
        )}
      </View>

      <Text style={styles.heroTitle}>
        {counts.open > 0
          ? `${counts.open} Open Discussions`
          : "Campus Discussion Hub"}
      </Text>

      <Text style={styles.heroSubtitle}>
        Ask questions, share course insights, and get answers from fellow
        students, faculty, and campus administrators.
      </Text>

      <View style={styles.heroStatsRow}>
        <View style={styles.heroStatItem}>
          <Text style={styles.heroStatValue}>{counts.open}</Text>
          <Text style={styles.heroStatLabel}>Needs Help</Text>
        </View>
        <View style={styles.heroStatDivider} />
        <View style={styles.heroStatItem}>
          <Text style={styles.heroStatValue}>{counts.resolved}</Text>
          <Text style={styles.heroStatLabel}>Resolved</Text>
        </View>
        <View style={styles.heroStatDivider} />
        <View style={styles.heroStatItem}>
          <Text style={styles.heroStatValue}>{counts.total}</Text>
          <Text style={styles.heroStatLabel}>Total Posts</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  heroBentoCard: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
    ...BENTO_COLORS.heroShadow,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  heroTagPill: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  heroTagText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.8,
  },
  openAlertPill: {
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
  openAlertText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#bfdbfe",
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.72)",
    lineHeight: 18,
    marginBottom: 18,
  },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
    paddingTop: 14,
  },
  heroStatItem: {
    alignItems: "center",
    flex: 1,
  },
  heroStatValue: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
  },
  heroStatLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#c1dcff",
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
});
