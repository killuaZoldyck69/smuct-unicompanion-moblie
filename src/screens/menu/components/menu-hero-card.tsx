import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BENTO_COLORS, fontFamily } from "../constants";

interface MenuHeroCardProps {
  totalCount: number;
  categoryCounts: Record<string, number>;
  isAdmin: boolean;
}

export const MenuHeroCard = React.memo(function MenuHeroCard({
  totalCount,
  categoryCounts,
  isAdmin,
}: MenuHeroCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>CAMPUS DIRECTORY</Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{totalCount} SERVICES</Text>
        </View>
      </View>

      <Text style={styles.title}>All University Services</Text>

      <Text style={styles.subtitle}>
        Instant access to class schedules, official announcements, exams,
        bus routes, and university portals.
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{categoryCounts.ACADEMIC || 0}</Text>
          <Text style={styles.statLabel}>Academic</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{categoryCounts.CAMPUS || 0}</Text>
          <Text style={styles.statLabel}>Campus</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{categoryCounts.SUPPORT || 0}</Text>
          <Text style={styles.statLabel}>Support</Text>
        </View>
        {isAdmin && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{categoryCounts.ADMIN || 0}</Text>
              <Text style={styles.statLabel}>Admin</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: 28,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    ...BENTO_COLORS.heroShadow,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
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
  countPill: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  countText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#e2e8f0",
  },
  title: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: BENTO_COLORS.white,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitle: {
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
  statValue: {
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
