import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AcademicEventItem } from "@/services/calendar-service";
import { BENTO_COLORS, CATEGORY_CONFIG, fontFamily } from "../constants";
import { formatEventDate, getMonthAndDay } from "../utils";

interface MilestoneEventCardProps {
  event: AcademicEventItem;
}

export const MilestoneEventCard = React.memo(function MilestoneEventCard({
  event,
}: MilestoneEventCardProps) {
  const { month, day } = getMonthAndDay(event.startDate);
  const catConfig = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.ACADEMIC;

  return (
    <View style={styles.card}>
      <View style={[styles.datePill, { backgroundColor: catConfig.bg }]}>
        <Text style={[styles.dateDay, { color: catConfig.text }]}>{day}</Text>
        <Text style={[styles.dateMonth, { color: catConfig.text }]}>{month}</Text>
      </View>

      <View style={styles.textCol}>
        <Text style={styles.title} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={styles.dateText}>
          {formatEventDate(event.startDate, event.endDate)}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    marginBottom: 8,
    ...BENTO_COLORS.shadow,
  },
  datePill: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dateDay: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 18,
  },
  dateMonth: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
    marginBottom: 2,
  },
  dateText: {
    fontFamily,
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
    fontWeight: "500",
  },
});
