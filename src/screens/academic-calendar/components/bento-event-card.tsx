import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AcademicEventItem } from "@/services/calendar-service";
import { BENTO_COLORS, CATEGORY_CONFIG, fontFamily } from "../constants";
import { formatEventDate, getMonthAndDay } from "../utils";

interface BentoEventCardProps {
  event: AcademicEventItem;
  highlight?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const BentoEventCard = React.memo(function BentoEventCard({
  event,
  highlight,
  onEdit,
  onDelete,
}: BentoEventCardProps) {
  const catConfig =
    CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.ACADEMIC;
  const { month, day } = getMonthAndDay(event.startDate);
  const dateRangeStr = formatEventDate(event.startDate, event.endDate);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: catConfig.surfaceBg },
        highlight && styles.cardHighlight,
      ]}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`${event.title}, ${catConfig.label}. Date: ${dateRangeStr}.`}
    >
      <View style={styles.cardTop}>
        <View style={[styles.dateBlock, { backgroundColor: catConfig.bg }]}>
          <Text style={[styles.dateMonth, { color: catConfig.text }]}>
            {month}
          </Text>
          <Text style={[styles.dateDay, { color: catConfig.text }]}>
            {day}
          </Text>
        </View>

        <View style={styles.cardRightCol}>
          <View style={styles.categoryRow}>
            <View
              style={[
                styles.categoryPill,
                { backgroundColor: catConfig.pillBg },
              ]}
            >
              <Feather
                name={catConfig.icon}
                size={11}
                color={catConfig.pillText}
              />
              <Text
                style={[
                  styles.categoryPillText,
                  { color: catConfig.pillText },
                ]}
              >
                {catConfig.label}
              </Text>
            </View>

            {event.weekNumber !== null && event.weekNumber !== undefined && (
              <View style={styles.weekChip}>
                <Text style={styles.weekChipText}>
                  WK {event.weekNumber}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.dateRangeText}>{dateRangeStr}</Text>
        </View>
      </View>

      <Text style={styles.eventTitle}>{event.title}</Text>

      {event.description ? (
        <Text style={styles.eventDesc} numberOfLines={2}>
          {event.description}
        </Text>
      ) : null}

      <View style={styles.cardFooter}>
        <View style={styles.remarksGroup}>
          {event.isHoliday && (
            <View style={styles.holidayBadge}>
              <Feather name="sun" size={10} color="#047857" />
              <Text style={styles.holidayBadgeText}>Holiday</Text>
            </View>
          )}

          {event.remarks ? (
            <View style={styles.remarksBadge}>
              <Feather name="info" size={10} color="#475569" />
              <Text style={styles.remarksBadgeText}>{event.remarks}</Text>
            </View>
          ) : null}
        </View>

        {(onEdit || onDelete) && (
          <View style={styles.adminActionGroup}>
            {onEdit && (
              <TouchableOpacity
                style={styles.adminIconBtn}
                onPress={onEdit}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Edit event ${event.title}`}
              >
                <Feather
                  name="edit-2"
                  size={15}
                  color={BENTO_COLORS.deepNavy}
                />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                style={styles.adminIconBtn}
                onPress={onDelete}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Delete event ${event.title}`}
              >
                <Feather name="trash" size={15} color="#ba1a1a" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  cardHighlight: {
    borderColor: "rgba(2, 132, 199, 0.3)",
    borderWidth: 1.5,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dateBlock: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dateMonth: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  dateDay: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 20,
  },
  cardRightCol: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BENTO_COLORS.pillRadius,
    gap: 4,
  },
  categoryPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  weekChip: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  weekChipText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
  },
  dateRangeText: {
    fontFamily,
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
    fontWeight: "600",
  },
  eventTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: BENTO_COLORS.neutralText,
    lineHeight: 20,
    marginBottom: 4,
  },
  eventDesc: {
    fontFamily,
    fontSize: 12,
    color: BENTO_COLORS.subtleText,
    lineHeight: 16,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  remarksGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
  },
  holidayBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BENTO_COLORS.pillRadius,
    gap: 4,
  },
  holidayBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#047857",
  },
  remarksBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BENTO_COLORS.pillRadius,
    gap: 4,
  },
  remarksBadgeText: {
    fontFamily,
    fontSize: 10,
    color: "#475569",
    fontWeight: "600",
  },
  adminActionGroup: {
    flexDirection: "row",
    gap: 6,
  },
  adminIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BENTO_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    ...BENTO_COLORS.shadow,
  },
});
