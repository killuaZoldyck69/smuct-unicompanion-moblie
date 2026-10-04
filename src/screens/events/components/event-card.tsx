import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CampusEventItem } from "@/services/event-service";
import { BENTO_COLORS, fontFamily } from "../constants";
import { formatEventTime, getEventDateComponents } from "../utils";

interface EventCardProps {
  item: CampusEventItem;
  index?: number;
  onPress: (item: CampusEventItem) => void;
}

const THEME_PALETTES = [
  {
    bg: "#e6f9f0", // mint/teal
    monthColor: "#0d9488",
    badgeBg: "#e6f9f0",
    badgeText: "#059669",
    badgeDot: "#059669",
  },
  {
    bg: "#eff6ff", // soft blue
    monthColor: "#2563eb",
    badgeBg: "#eff6ff",
    badgeText: "#2563eb",
    badgeDot: "#2563eb",
  },
  {
    bg: "#f5f3ff", // soft lavender
    monthColor: "#7c3aed",
    badgeBg: "#f5f3ff",
    badgeText: "#7c3aed",
    badgeDot: "#7c3aed",
  },
];

export const EventCard = React.memo(function EventCard({
  item,
  index = 0,
  onPress,
}: EventCardProps) {
  const eventDateStr = item.eventDate || item.date || item.createdAt;
  const eventDate = new Date(eventDateStr);
  const now = new Date();
  const isToday = eventDate.toDateString() === now.toDateString();
  const isPast = eventDate.getTime() < now.getTime() && !isToday;

  const { month, dayNumber, weekday } = getEventDateComponents(eventDateStr);
  const formattedTime = formatEventTime(eventDateStr);

  // Palette assignment
  const palette = isPast
    ? {
        bg: "#f1f5f9",
        monthColor: "#64748b",
        badgeBg: "#f1f5f9",
        badgeText: "#64748b",
        badgeDot: "#94a3b8",
      }
    : isToday
      ? {
          bg: "#ecfdf5",
          monthColor: "#059669",
          badgeBg: "#ecfdf5",
          badgeText: "#047857",
          badgeDot: "#059669",
        }
      : THEME_PALETTES[index % THEME_PALETTES.length];

  const statusLabel = isToday
    ? "Happening Today"
    : isPast
      ? "Completed"
      : "Upcoming";

  return (
    <TouchableOpacity
      style={[styles.card, isPast && styles.cardPast]}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Event: ${item.title}. Date: ${month} ${dayNumber}, ${weekday} at ${formattedTime}. Venue: ${
        item.location || "Campus"
      }. Tap to view details.`}
    >
      {/* Left Date Block */}
      <View style={[styles.dateBlock, { backgroundColor: palette.bg }]}>
        <Text style={[styles.dateMonth, { color: palette.monthColor }]}>
          {month}
        </Text>
        <Text style={styles.dateNumber}>{dayNumber}</Text>
        <Text style={styles.dateWeekday}>{weekday}</Text>
      </View>

      {/* Right Content Column */}
      <View style={styles.contentCol}>
        {/* Title & Arrow Button */}
        <View style={styles.titleRow}>
          <Text style={styles.titleText} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.arrowCircle}>
            <Feather name="arrow-right" size={15} color="#64748b" />
          </View>
        </View>

        {/* Status Pill */}
        <View style={[styles.statusPill, { backgroundColor: palette.badgeBg }]}>
          <View
            style={[styles.statusDot, { backgroundColor: palette.badgeDot }]}
          />
          <Text style={[styles.statusText, { color: palette.badgeText }]}>
            {statusLabel}
          </Text>
        </View>

        {/* Description */}
        {item.description ? (
          <Text style={styles.descText} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {/* Meta Info Row: Time & Location */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="clock" size={13} color="#64748b" />
            <Text style={styles.metaText}>{formattedTime}</Text>
          </View>

          {item.location ? (
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={13} color="#64748b" />
              <Text style={styles.metaText} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    flexDirection: "row",
    alignItems: "flex-start",
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardPast: {
    opacity: 0.72,
  },
  dateBlock: {
    width: 58,
    height: 74,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  dateMonth: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  dateNumber: {
    fontFamily,
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    lineHeight: 25,
  },
  dateWeekday: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 1,
  },
  contentCol: {
    flex: 1,
    marginLeft: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  titleText: {
    flex: 1,
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 21,
    marginRight: 8,
  },
  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BENTO_COLORS.pillRadius,
    marginTop: 6,
    marginBottom: 6,
  },
  statusDot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 2.75,
    marginRight: 5,
  },
  statusText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
  },
  descText: {
    fontFamily,
    fontSize: 12,
    color: "#64748b",
    lineHeight: 17,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    columnGap: 14,
    rowGap: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "65%",
  },
  metaText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748b",
    marginLeft: 4,
  },
});
