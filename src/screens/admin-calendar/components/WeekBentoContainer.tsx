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

  // Days badge text e.g. "06 Days" or "15 Exam Days"
  const daysBadgeText = React.useMemo(() => {
    if (group.classDaysSummary) {
      // E.g. "06 Class Days" -> "06 Days"
      return group.classDaysSummary.replace(/class\s*days/i, "Days").trim();
    }
    if (isPhase) {
      return "15 Exam Days";
    }
    return "06 Days";
  }, [group.classDaysSummary, isPhase]);

  // Phase Title e.g. "⚡ EXAM & PREP"
  const phasePillTitle = React.useMemo(() => {
    if (!isPhase) return group.title;
    if (group.title.toLowerCase().includes("mid-term") || group.title.toLowerCase().includes("prep")) {
      return "⚡ EXAM & PREP";
    }
    return "⚡ FINAL EXAM & CLOSING";
  }, [isPhase, group.title]);

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
