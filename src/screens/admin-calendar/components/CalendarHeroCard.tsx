import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AcademicCalendarItem } from "@/services/calendar-service";
import { BENTO_COLORS, SMUCT_FACULTIES } from "../constants";

interface CalendarHeroCardProps {
  calendar: AcademicCalendarItem;
  onEditAudience: () => void;
}

export const CalendarHeroCard: React.FC<CalendarHeroCardProps> = ({
  calendar,
  onEditAudience,
}) => {
  const isPub = calendar.status === "PUBLISHED";
  const isDraft = calendar.status === "DRAFT";
  const isArchived = calendar.status === "ARCHIVED";
  const eventCount = calendar.events?.length || 0;

  // Compute targeted faculty breakdown
  const targetedFacultyChips = React.useMemo(() => {
    const isAudienceGlobal =
      calendar.isGlobal ??
      (!calendar.targetPrograms?.length && !calendar.targetFaculties?.length);
    if (isAudienceGlobal) return [];

    const chips: Array<{ name: string; count: number }> = [];
    SMUCT_FACULTIES.forEach((fac) => {
      const matchCount = fac.programs.filter((p) =>
        calendar.targetPrograms?.includes(p),
      ).length;
      if (matchCount > 0) {
        chips.push({ name: fac.shortName, count: matchCount });
      }
    });
    return chips;
  }, [calendar.isGlobal, calendar.targetPrograms, calendar.targetFaculties]);

  return (
    <View style={styles.card}>
      {/* Top Badges Row */}
      <View style={styles.topRow}>
        <View style={styles.semesterBadge}>
          <Feather name="calendar" size={12} color="#94a3b8" />
          <Text style={styles.semesterBadgeText}>{calendar.semester}</Text>
        </View>

        <View style={styles.rightBadges}>
          <View style={styles.eventCountBadge}>
            <Text style={styles.eventCountText}>{eventCount} Events</Text>
          </View>

          <View
            style={[
              styles.statusPill,
              isPub && styles.statusPublished,
              isDraft && styles.statusDraft,
              isArchived && styles.statusArchived,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isPub && { backgroundColor: "#10b981" },
                isDraft && { backgroundColor: "#f59e0b" },
                isArchived && { backgroundColor: "#94a3b8" },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                isPub && { color: "#34d399" },
                isDraft && { color: "#fbbf24" },
                isArchived && { color: "#cbd5e1" },
              ]}
            >
              {calendar.status}
            </Text>
          </View>
        </View>
      </View>

      {/* Main Title */}
      <Text style={styles.title}>{calendar.title}</Text>

      {/* Meta Specs */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          {calendar.semesterDuration || "6 Months"}
        </Text>
        {calendar.targetBatch ? (
          <>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{calendar.targetBatch}</Text>
          </>
        ) : null}
      </View>

      {/* Audience Chips Row */}
      <View style={styles.audienceContainer}>
        {calendar.isGlobal || (!calendar.targetPrograms?.length && !calendar.targetFaculties?.length) ? (
          <View style={styles.globalChip}>
            <Feather name="globe" size={12} color="#60a5fa" />
            <Text style={styles.globalChipText}>All Faculties & Programs</Text>
          </View>
        ) : targetedFacultyChips.length > 0 ? (
          <View style={styles.facultyChipsGrid}>
            {targetedFacultyChips.map((chip, idx) => (
              <View key={idx} style={styles.facultyChip}>
                <Text style={styles.facultyChipName}>{chip.name}</Text>
                <View style={styles.facultyChipCount}>
                  <Text style={styles.facultyChipCountText}>{chip.count}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.facultyChip}>
            <Text style={styles.facultyChipName}>Targeted Audience</Text>
          </View>
        )}

        {/* Quick Edit Audience Button */}
        <TouchableOpacity
          style={styles.editAudienceBtn}
          onPress={onEditAudience}
          activeOpacity={0.8}
        >
          <Feather name="sliders" size={12} color="#94a3b8" />
          <Text style={styles.editAudienceText}>Edit Scope</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.heroNavy,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    ...BENTO_COLORS.heroShadow,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  semesterBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },
  semesterBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#e2e8f0",
  },
  rightBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eventCountBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  eventCountText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#cbd5e1",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  statusPublished: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  statusDraft: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
  },
  statusArchived: {
    backgroundColor: "rgba(148, 163, 184, 0.15)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
  },
  metaDot: {
    fontSize: 13,
    color: "#475569",
  },
  audienceContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  globalChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(30, 58, 138, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.3)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },
  globalChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#bfdbfe",
  },
  facultyChipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
  },
  facultyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  facultyChipName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#e2e8f0",
  },
  facultyChipCount: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  facultyChipCountText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
  },
  editAudienceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },
  editAudienceText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#cbd5e1",
  },
});
