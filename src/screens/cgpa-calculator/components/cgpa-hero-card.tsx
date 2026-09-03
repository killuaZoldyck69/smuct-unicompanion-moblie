import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BENTO_COLORS, fontFamily } from "../constants";
import { CGPAResult } from "../utils";

interface CGPAHeroCardProps {
  result: CGPAResult;
  totalCoursesCount: number;
}

export const CGPAHeroCard = React.memo(function CGPAHeroCard({
  result,
  totalCoursesCount,
}: CGPAHeroCardProps) {
  const { calculatedCGPA, standingInfo, totalCredits, coursesCount } = result;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>SEMESTER ESTIMATE</Text>
        </View>
        <View style={[styles.standingPill, { borderColor: standingInfo.color }]}>
          <Text style={[styles.standingPillText, { color: standingInfo.color }]}>
            {standingInfo.text}
          </Text>
        </View>
      </View>

      <View style={styles.cgpaRow}>
        <Text style={styles.cgpaValueBig}>{calculatedCGPA}</Text>
        <Text style={styles.cgpaMaxScale}>/ 4.00</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalCredits}</Text>
          <Text style={styles.statLabel}>Total Credits</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{coursesCount}</Text>
          <Text style={styles.statLabel}>Graded Courses</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalCoursesCount}</Text>
          <Text style={styles.statLabel}>Total Listed</Text>
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
  standingPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  standingPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
  },
  cgpaRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  cgpaValueBig: {
    fontFamily,
    fontSize: 52,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -1,
  },
  cgpaMaxScale: {
    fontFamily,
    fontSize: 18,
    fontWeight: "600",
    color: "#94a3b8",
    marginLeft: 8,
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
