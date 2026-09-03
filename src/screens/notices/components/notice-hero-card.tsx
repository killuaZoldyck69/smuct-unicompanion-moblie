import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BENTO_COLORS, fontFamily } from "../constants";

interface NoticeHeroCardProps {
  totalCount: number;
  newNoticeCount: number;
  categoryCounts: Record<string, number>;
}

export const NoticeHeroCard = React.memo(function NoticeHeroCard({
  totalCount,
  newNoticeCount,
  categoryCounts,
}: NoticeHeroCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>NOTICEBOARD</Text>
        </View>
        {newNoticeCount > 0 && (
          <View style={styles.newBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.newBadgeText}>
              {newNoticeCount} new this week
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.countText}>
        {totalCount} Official {totalCount === 1 ? "Notice" : "Notices"}
      </Text>

      <Text style={styles.descText}>
        Stay updated with official academic circulars, exam schedules, and institutional announcements.
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{categoryCounts.ACADEMIC || 0}</Text>
          <Text style={styles.statLabel}>Academic</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{categoryCounts.EXAM || 0}</Text>
          <Text style={styles.statLabel}>Exams</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{categoryCounts.HOLIDAY || 0}</Text>
          <Text style={styles.statLabel}>Holidays</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{categoryCounts.TRANSPORT || 0}</Text>
          <Text style={styles.statLabel}>Transport</Text>
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
    marginBottom: 16,
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  badgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#a5b4fc",
    letterSpacing: 1,
  },
  newBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34d399",
    marginRight: 6,
  },
  newBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#6ee7b7",
  },
  countText: {
    fontFamily,
    fontSize: 26,
    fontWeight: "800",
    color: BENTO_COLORS.white,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  descText: {
    fontFamily,
    fontSize: 13,
    color: "#94a3b8",
    lineHeight: 19,
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
  statNumber: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO_COLORS.white,
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
