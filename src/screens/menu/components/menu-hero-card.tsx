import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BENTO_COLORS, SPACING, fontFamily } from "../constants";

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
    <View
      style={styles.card}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`University Services Directory: ${totalCount} active services across Academic, Campus Life, and Support.`}
    >
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
    borderRadius: BENTO_COLORS.heroRadius,
    padding: SPACING.xl, // 20px
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    ...BENTO_COLORS.heroShadow,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md, // 12px
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
    letterSpacing: 0.8,
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
    fontSize: 23,
    fontWeight: "800",
    color: BENTO_COLORS.white,
    letterSpacing: -0.4,
    marginBottom: SPACING.sm, // 8px
  },
  subtitle: {
    fontFamily,
    fontSize: 12.5,
    color: "#94a3b8",
    lineHeight: 18,
    marginBottom: SPACING.lg, // 16px
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 16,
    paddingVertical: SPACING.md, // 12px
    paddingHorizontal: SPACING.lg, // 16px
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
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
    height: 18,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
});
