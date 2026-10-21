import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AcademicEventItem } from "@/services/calendar-service";
import { WeekGroup } from "../utils/grouping";
import { BENTO_COLORS } from "../constants";
import { NestedTimelineEventRow } from "./NestedTimelineEventRow";

interface WeekBentoContainerProps {
  group: WeekGroup;
  onAddEventToWeek: (weekNumber?: number | null) => void;
  onEditEvent: (event: AcademicEventItem) => void;
  onDeleteEvent: (event: AcademicEventItem) => void;
}

export const WeekBentoContainer = React.memo(function WeekBentoContainer({
  group,
  onAddEventToWeek,
  onEditEvent,
  onDeleteEvent,
}: WeekBentoContainerProps) {
  const isPhase = group.type === "PHASE";

  // Days badge text e.g. "06 Class Days", "15 Exam Days", or "03 Days Break"
  const daysBadgeText = React.useMemo(() => {
    // 1. Regular academic weeks (e.g. WEEK 01)
    if (!isPhase) {
      if (group.classDaysSummary) {
        return group.classDaysSummary;
      }
      // Calculate dynamically from date difference
      try {
        const s = new Date(group.startDate).getTime();
        const e = new Date(group.endDate).getTime();
        if (!isNaN(s) && !isNaN(e) && e >= s) {
          const totalSpan = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
          const holidaysInWeek = group.events.filter(
            (ev) => ev.isHoliday || ev.category === "HOLIDAY",
          ).length;
          const workingDays = Math.max(
            1,
            totalSpan - (holidaysInWeek > 0 ? holidaysInWeek : 1),
          );
          return `${String(workingDays).padStart(2, "0")} Class Days`;
        }
      } catch {
        // Fallback
      }
      return "06 Class Days";
    }

    // 2. Future Semester / Tentative Milestone
    const isTentative = group.events.some(
      (ev) =>
        (ev.remarks || "").toLowerCase().includes("tentative") ||
        ev.title.toLowerCase().includes("commencement") ||
        ev.title.toLowerCase().includes("next sem"),
    );
    if (isTentative) {
      return "Tentative Date";
    }

    // 3. Examination Period / Mid-term / Final Exam phase blocks
    const examEvent = group.events.find((ev) => ev.category === "EXAM");
    if (examEvent) {
      // Check remarks for explicit day count (e.g. "Offline Mode; 15 days")
      const match = (examEvent.remarks || "").match(/(\d{1,2})\s*days/i);
      if (match) {
        const count = parseInt(match[1], 10);
        return `${String(count).padStart(2, "0")} Exam Days`;
      }

      // Calculate days dynamically from start and end date
      try {
        const s = new Date(examEvent.startDate).getTime();
        const e = new Date(examEvent.endDate || examEvent.startDate).getTime();
        if (!isNaN(s) && !isNaN(e) && e >= s) {
          const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
          return `${String(diff).padStart(2, "0")} Exam Days`;
        }
      } catch {
        // ignore
      }
    }

    // 4. Semester Break / Recess phase blocks
    const holidayEvent = group.events.find(
      (ev) => ev.category === "HOLIDAY" || ev.isHoliday,
    );
    if (holidayEvent) {
      const match = (holidayEvent.remarks || "").match(/(\d{1,2})\s*days/i);
      if (match) {
        const count = parseInt(match[1], 10);
        return `${String(count).padStart(2, "0")} Days Break`;
      }
      try {
        const s = new Date(group.startDate).getTime();
        const e = new Date(group.endDate).getTime();
        if (!isNaN(s) && !isNaN(e) && e >= s) {
          const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
          return `${String(diff).padStart(2, "0")} Days Break`;
        }
      } catch {
        // ignore
      }
    }

    // 5. Fallback: Calculate actual span in calendar days for this phase block dynamically
    try {
      const s = new Date(group.startDate).getTime();
      const e = new Date(group.endDate).getTime();
      if (!isNaN(s) && !isNaN(e) && e >= s) {
        const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
        if (diff === 1) return "1 Day";
        return `${String(diff).padStart(2, "0")} Days`;
      }
    } catch {
      // Fallback
    }
    return "Event";
  }, [group.classDaysSummary, isPhase, group.events, group.startDate, group.endDate]);

  // Dynamic Phase Title derived directly from event data with category-appropriate icon
  const phasePillTitle = React.useMemo(() => {
    if (!isPhase) return group.title;

    const hasExam = group.events.some((ev) => ev.category === "EXAM");
    const hasHoliday = group.events.some(
      (ev) => ev.category === "HOLIDAY" || ev.isHoliday,
    );
    const hasRegistration = group.events.some(
      (ev) => ev.category === "REGISTRATION",
    );
    const hasDeadline = group.events.some((ev) => ev.category === "DEADLINE");
    const isCommencement = group.events.some((ev) => {
      const t = (ev.title || "").toLowerCase();
      return (
        t.includes("commencement") ||
        t.includes("next sem") ||
        t.includes("next semester")
      );
    });

    let icon = "⚡";
    if (isCommencement) icon = "🚀";
    else if (hasExam) icon = "⚡";
    else if (hasHoliday) icon = "🏖️";
    else if (hasRegistration) icon = "📋";
    else if (hasDeadline) icon = "📌";
    else icon = "📅";

    const title = (group.title || "Academic Milestone").trim();
    return `${icon} ${title.toUpperCase()}`;
  }, [isPhase, group.title, group.events]);

  return (
    <View
      style={[
        styles.card,
        isPhase ? styles.phaseCard : styles.weekCard,
      ]}
    >
      {/* Bento Header */}
      <View style={[styles.header, isPhase && styles.phaseHeader]}>
        <View style={styles.headerLeft}>
          {/* Week or Phase Pill Badge */}
          <View
            style={[
              styles.badge,
              isPhase ? styles.phaseBadge : styles.weekBadge,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isPhase ? styles.phaseBadgeText : styles.weekBadgeText,
              ]}
            >
              {isPhase ? phasePillTitle : group.title}
            </Text>
          </View>

          {/* Date Range String */}
          <Text style={styles.dateRangeText}>{group.dateRangeLabel}</Text>

          {/* Days summary outline pill */}
          <View style={styles.daysBadge}>
            <Text style={styles.daysBadgeText}>{daysBadgeText}</Text>
          </View>
        </View>

        {/* Circular + Button */}
        <TouchableOpacity
          style={styles.plusBtn}
          onPress={() => onAddEventToWeek(group.weekNumber)}
          activeOpacity={0.75}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Add event to ${group.title}`}
        >
          <Feather name="plus" size={15} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Events Timeline Container */}
      <View style={styles.eventsContainer}>
        {group.events.map((ev, index) => (
          <NestedTimelineEventRow
            key={ev.id || `${group.id}-event-${index}`}
            event={ev}
            isLast={index === group.events.length - 1}
            onEdit={() => onEditEvent(ev)}
            onDelete={() => onDeleteEvent(ev)}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
    ...BENTO_COLORS.shadow,
  },
  weekCard: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
  },
  phaseCard: {
    backgroundColor: "#fffdf0",
    borderColor: "#fef08a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  phaseHeader: {
    borderBottomColor: "rgba(254, 240, 138, 0.6)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  weekBadge: {
    backgroundColor: "#6366f1",
  },
  phaseBadge: {
    backgroundColor: "#f59e0b",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  weekBadgeText: {
    color: "#ffffff",
  },
  phaseBadgeText: {
    color: "#ffffff",
  },
  dateRangeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  daysBadge: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  daysBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
  },
  plusBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  eventsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});
