import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { AcademicCalendarItem } from "@/services/calendar-service";
import { universityPrograms, getProgramShortName } from "@/data/programs";
import { BENTO_COLORS } from "../constants";

interface CalendarHeroBentoGridProps {
  calendar: AcademicCalendarItem;
  totalWeeks?: number;
  currentWeek?: number;
  daysRemaining?: number;
  onManageCohorts: () => void;
}

const COLLAPSED_LIMIT = 6;

function getFacultyPillTheme(facultyOrProgName?: string) {
  if (!facultyOrProgName) {
    return { color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" };
  }
  const upper = facultyOrProgName.toUpperCase();
  if (
    upper.includes("ENGINEERING") ||
    upper.includes("FET") ||
    upper.includes("CSE") ||
    upper.includes("CSIT") ||
    upper.includes("COMPUTER")
  ) {
    return { color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" };
  }
  if (
    upper.includes("DESIGN") ||
    upper.includes("FDT") ||
    upper.includes("ARCH") ||
    upper.includes("GDM") ||
    upper.includes("AMMT") ||
    upper.includes("IA") ||
    upper.includes("APPAREL") ||
    upper.includes("INTERIOR")
  ) {
    return { color: "#7c3aed", bg: "#faf5ff", border: "#e9d5ff" };
  }
  if (
    upper.includes("BUSINESS") ||
    upper.includes("FOB") ||
    upper.includes("BBA") ||
    upper.includes("MBA")
  ) {
    return { color: "#0d9488", bg: "#f0fdfa", border: "#99f6e4" };
  }
  if (
    upper.includes("HUMANITIES") ||
    upper.includes("SOCIAL") ||
    upper.includes("FHS") ||
    upper.includes("LAW") ||
    upper.includes("LL.B") ||
    upper.includes("LLM") ||
    upper.includes("ENGLISH") ||
    upper.includes("BANGLA") ||
    upper.includes("GOVERNMENT") ||
    upper.includes("ISLAMIC") ||
    upper.includes("SOCIOLOGY")
  ) {
    return { color: "#e11d48", bg: "#fff1f2", border: "#fecdd3" };
  }
  if (
    upper.includes("FINE") ||
    upper.includes("PERFORMING") ||
    upper.includes("FFA") ||
    upper.includes("FPA") ||
    upper.includes("BFA") ||
    upper.includes("MUSIC") ||
    upper.includes("DANCE")
  ) {
    return { color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
  }
  return { color: "#475569", bg: "#f8fafc", border: "#e2e8f0" };
}

export const CalendarHeroBentoGrid: React.FC<CalendarHeroBentoGridProps> = ({
  calendar,
  onManageCohorts,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if calendar audience is universal/global
  const isGlobalAudience =
    calendar.isGlobal ??
    (!calendar.targetPrograms?.length && !calendar.targetFaculties?.length);

  // Map targeted programs to their official short names and faculty theme
  const targetedProgramsList = React.useMemo(() => {
    if (isGlobalAudience) return [];

    const rawPrograms = calendar.targetPrograms || [];
    return rawPrograms.map((progName) => {
      const found = universityPrograms.find(
        (p) => p.name.toLowerCase() === progName.trim().toLowerCase(),
      );
      const shortName = found?.shortName || getProgramShortName(progName);
      const theme = getFacultyPillTheme(found?.faculty || progName);
      return {
        fullName: progName,
        shortName,
        color: theme.color,
        bg: theme.bg,
        border: theme.border,
      };
    });
  }, [isGlobalAudience, calendar.targetPrograms]);

  // Fallback targeted faculty pills if only faculties were targeted
  const targetedFacultiesList = React.useMemo(() => {
    if (isGlobalAudience || targetedProgramsList.length > 0) return [];
    return (calendar.targetFaculties || []).map((fac) => {
      const theme = getFacultyPillTheme(fac);
      return {
        name: fac,
        color: theme.color,
        bg: theme.bg,
        border: theme.border,
      };
    });
  }, [isGlobalAudience, targetedProgramsList.length, calendar.targetFaculties]);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  };

  const durationLabel = calendar.semesterDuration || "6-Month";
  const hasMoreThanLimit = targetedProgramsList.length > COLLAPSED_LIMIT;
  const displayedPrograms =
    hasMoreThanLimit && !isExpanded
      ? targetedProgramsList.slice(0, COLLAPSED_LIMIT)
      : targetedProgramsList;

  const isPub = calendar.status === "PUBLISHED";
  const isDraft = calendar.status === "DRAFT";

  return (
    <View style={styles.container}>
      {/* Full Width Academic Calendar Overview Bento Card */}
      <View style={styles.card}>
        {/* Top Chips Row */}
        <View style={styles.topChipsRow}>
          <View style={styles.ayChip}>
            <Feather name="calendar" size={11} color="#0284c7" />
            <Text style={styles.ayChipText}>
              {calendar.semester} {calendar.academicYear ? `• AY ${calendar.academicYear}` : ""}
            </Text>
          </View>

          <View style={styles.durationChip}>
            <Text style={styles.durationChipText}>{durationLabel}</Text>
          </View>

          {/* Status Badge (LIVE / DRAFT / ARCHIVED) */}
          <View
            style={[
              styles.statusChip,
              isPub
                ? styles.statusChipLive
                : isDraft
                  ? styles.statusChipDraft
                  : styles.statusChipArchived,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isPub && { backgroundColor: "#059669" },
                isDraft && { backgroundColor: "#d97706" },
                !isPub && !isDraft && { backgroundColor: "#64748b" },
              ]}
            />
            <Text
              style={[
                styles.statusChipText,
                isPub && { color: "#047857" },
                isDraft && { color: "#b45309" },
                !isPub && !isDraft && { color: "#475569" },
              ]}
            >
              {isPub ? "Active" : isDraft ? "Draft" : "Archived"}
            </Text>
          </View>
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.mainTitle}>
          {calendar.title || "Academic Calendar"}
        </Text>
        <Text style={styles.subtitle}>
          {calendar.semester} {calendar.academicYear || ""} term timeline, assessments, and key milestones.
        </Text>

        {/* Target Cohorts Section */}
        <View style={styles.cohortsSection}>
          <View style={styles.cohortsHeader}>
            <View style={styles.cohortsHeaderLeft}>
              <Text style={styles.cohortsLabel}>TARGET COHORTS</Text>
              {!isGlobalAudience && targetedProgramsList.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {targetedProgramsList.length} Selected
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={onManageCohorts}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.manageLink}
            >
              <Text style={styles.manageText}>Manage ↗</Text>
            </TouchableOpacity>
          </View>

          {/* Cohorts Pills Flow */}
          <View style={styles.cohortPillsRow}>
            {isGlobalAudience ? (
              <View style={[styles.cohortPill, styles.globalPill]}>
                <Feather name="globe" size={12} color="#0284c7" />
                <Text style={[styles.cohortText, { color: "#0284c7" }]}>
                  All Faculties & Programs (Universal)
                </Text>
              </View>
            ) : targetedProgramsList.length > 0 ? (
              <>
                {displayedPrograms.map((prog, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.cohortPill,
                      {
                        backgroundColor: prog.bg,
                        borderColor: prog.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.cohortDot,
                        { backgroundColor: prog.color },
                      ]}
                    />
                    <Text
                      style={[styles.cohortText, { color: prog.color }]}
                      numberOfLines={1}
                    >
                      {prog.shortName}
                    </Text>
                  </View>
                ))}

                {/* Inline expand/collapse pill */}
                {hasMoreThanLimit && (
                  <TouchableOpacity
                    onPress={toggleExpand}
                    activeOpacity={0.75}
                    style={styles.morePill}
                  >
                    <Text style={styles.morePillText}>
                      {isExpanded
                        ? "Collapse"
                        : `+${targetedProgramsList.length - COLLAPSED_LIMIT} more`}
                    </Text>
                    <Feather
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={11}
                      color="#4f46e5"
                    />
                  </TouchableOpacity>
                )}
              </>
            ) : targetedFacultiesList.length > 0 ? (
              targetedFacultiesList.map((fac, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.cohortPill,
                    {
                      backgroundColor: fac.bg,
                      borderColor: fac.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.cohortDot,
                      { backgroundColor: fac.color },
                    ]}
                  />
                  <Text style={[styles.cohortText, { color: fac.color }]}>
                    {fac.name}
                  </Text>
                </View>
              ))
            ) : (
              <View style={[styles.cohortPill, styles.globalPill]}>
                <Feather name="globe" size={12} color="#0284c7" />
                <Text style={[styles.cohortText, { color: "#0284c7" }]}>
                  All Faculties & Programs
                </Text>
              </View>
            )}
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
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusChipLive: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  statusChipDraft: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  statusChipArchived: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
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
  cohortsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cohortsLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 0.5,
  },
  cohortsHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  countBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  countBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#2563eb",
  },
  collapseToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#f5f3ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ede9fe",
  },
  collapseToggleText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6366f1",
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
    borderWidth: 1,
  },
  globalPill: {
    backgroundColor: "#e0f2fe",
    borderColor: "#bae6fd",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  morePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  morePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4f46e5",
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
