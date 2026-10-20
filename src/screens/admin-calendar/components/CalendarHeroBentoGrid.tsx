import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AcademicCalendarItem } from "@/services/calendar-service";
import { BENTO_COLORS } from "../constants";

interface CalendarHeroBentoGridProps {
  calendar: AcademicCalendarItem;
  totalWeeks?: number;
  currentWeek?: number;
  daysRemaining?: number;
  onManageCohorts: () => void;
}

export const CalendarHeroBentoGrid: React.FC<CalendarHeroBentoGridProps> = ({
  calendar,
  onManageCohorts,
}) => {
  // Extract target cohorts pills
  const cohortPills = React.useMemo(() => {
    const isGlobalAudience =
      calendar.isGlobal ??
      (!calendar.targetPrograms?.length && !calendar.targetFaculties?.length);

    if (isGlobalAudience) {
      return [
        { label: "All Faculties", color: "#0284c7", bg: "#e0f2fe" },
        { label: "All Programs", color: "#7c3aed", bg: "#f3e8ff" },
      ];
    }

    const pills: Array<{ label: string; color: string; bg: string }> = [];
    const progs = calendar.targetPrograms || [];

    const hasEng = progs.some((p) => p.includes("CSE") || p.includes("CSIT"));
    const hasDes = progs.some((p) => p.includes("FDT") || p.includes("Arch") || p.includes("GDM") || p.includes("AMMT"));
    const hasBus = progs.some((p) => p.includes("BBA") || p.includes("LL.B") || p.includes("English"));

    if (hasEng) {
      pills.push({ label: "CSE & CSIT", color: "#0284c7", bg: "#e0f2fe" });
    }
    if (hasDes) {
      pills.push({ label: "FDT & Arch", color: "#9333ea", bg: "#f3e8ff" });
    }
    if (hasBus) {
      pills.push({ label: "BBA & Law", color: "#e11d48", bg: "#ffe4e6" });
    }

    if (pills.length === 0) {
      pills.push({ label: "Selected Cohorts", color: "#0284c7", bg: "#e0f2fe" });
    }

    return pills;
  }, [calendar.isGlobal, calendar.targetPrograms, calendar.targetFaculties]);

  const durationLabel = calendar.semesterDuration || "6-Month";

  return (
    <View style={styles.container}>
      {/* Full Width Academic Calendar Overview Bento Card */}
      <View style={styles.card}>
        {/* Top Chips Row */}
        <View style={styles.topChipsRow}>
          <View style={styles.ayChip}>
            <Feather name="calendar" size={11} color="#0284c7" />
            <Text style={styles.ayChipText}>{calendar.semester}</Text>
          </View>

          <View style={styles.durationChip}>
            <Text style={styles.durationChipText}>{durationLabel}</Text>
          </View>
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.mainTitle}>{calendar.title || "Academic Calendar"}</Text>
        <Text style={styles.subtitle}>
          Summer term timeline, assessments, and key milestones.
        </Text>

        {/* Target Cohorts Section */}
        <View style={styles.cohortsSection}>
          <View style={styles.cohortsHeader}>
            <Text style={styles.cohortsLabel}>TARGET COHORTS</Text>
            <TouchableOpacity
              onPress={onManageCohorts}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.manageLink}
            >
              <Text style={styles.manageText}>Manage ↗</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cohortPillsRow}>
            {cohortPills.map((pill, idx) => (
              <View
                key={idx}
                style={[styles.cohortPill, { backgroundColor: pill.bg }]}
              >
                <View
                  style={[styles.cohortDot, { backgroundColor: pill.color }]}
                />
                <Text style={[styles.cohortText, { color: pill.color }]}>
                  {pill.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...BENTO_COLORS.shadow,
  },
  topChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  ayChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ayChipText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0369a1",
  },
  durationChip: {
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationChipText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#7e22ce",
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 17,
    marginBottom: 14,
  },
  cohortsSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  cohortsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cohortsLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 0.5,
  },
  manageLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  manageText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6366f1",
  },
  cohortPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  cohortPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cohortDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cohortText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
