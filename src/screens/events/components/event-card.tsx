import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CampusEventItem } from "@/services/event-service";
import { BENTO_COLORS, fontFamily } from "../constants";
import { formatEventDate, formatEventTime } from "../utils";

interface EventCardProps {
  item: CampusEventItem;
  onPress: (item: CampusEventItem) => void;
}

export const EventCard = React.memo(function EventCard({
  item,
  onPress,
}: EventCardProps) {
  const eventDate = new Date(item.eventDate || item.date || item.createdAt);
  const now = new Date();
  const isToday = eventDate.toDateString() === now.toDateString();
  const isPast = eventDate.getTime() < now.getTime() && !isToday;

  const formattedDate = formatEventDate(
    item.eventDate || item.date || item.createdAt
  );
  const formattedTime = formatEventTime(
    item.eventDate || item.date || item.createdAt
  );

  return (
    <TouchableOpacity
      style={[styles.card, isPast && styles.cardPast]}
      onPress={() => onPress(item)}
      activeOpacity={0.85}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Event: ${item.title}. Date: ${formattedDate} at ${formattedTime}. Venue: ${
        item.location || "Campus"
      }. Tap to view details.`}
    >
      <View style={styles.topRow}>
        <View style={styles.dateBadge}>
          <Feather
            name="calendar"
            size={11}
            color={
              isToday
                ? "#047857"
                : isPast
                  ? BENTO_COLORS.subtleText
                  : "#0284c7"
            }
            style={{ marginRight: 5 }}
          />
          <Text
            style={[
              styles.dateBadgeText,
              isToday && { color: "#047857" },
              isPast && { color: BENTO_COLORS.subtleText },
            ]}
          >
            {formattedDate.toUpperCase()}
          </Text>
        </View>

        {isToday ? (
          <View style={styles.todayPill}>
            <View style={styles.todayPulseDot} />
            <Text style={styles.todayText}>HAPPENING TODAY</Text>
          </View>
        ) : isPast ? (
          <View style={styles.pastPill}>
            <Text style={styles.pastText}>COMPLETED</Text>
          </View>
        ) : (
          <View style={styles.upcomingPill}>
            <Text style={styles.upcomingText}>UPCOMING</Text>
          </View>
        )}
      </View>

      <Text
        style={[styles.titleText, isPast && styles.titleTextPast]}
        numberOfLines={2}
      >
        {item.title}
      </Text>

      {item.description ? (
        <Text style={styles.descText} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View style={styles.footerChipsRow}>
          <View style={styles.chip}>
            <Feather
              name="clock"
              size={12}
              color={BENTO_COLORS.subtleText}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.chipText}>{formattedTime}</Text>
          </View>

          {item.location ? (
            <View style={styles.chip}>
              <Feather
                name="map-pin"
                size={12}
                color={BENTO_COLORS.subtleText}
                style={{ marginRight: 5 }}
              />
              <Text style={styles.chipText} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.arrowCircle}>
          <Feather
            name="arrow-up-right"
            size={14}
            color={BENTO_COLORS.deepNavy}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  cardPast: {
    opacity: 0.75,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  dateBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#0284c7",
    letterSpacing: 0.5,
  },
  todayPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  todayPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#059669",
    marginRight: 6,
  },
  todayText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#047857",
    letterSpacing: 0.5,
  },
  pastPill: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  pastText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 0.5,
  },
  upcomingPill: {
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  upcomingText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#0284c7",
    letterSpacing: 0.5,
  },
  titleText: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO_COLORS.neutralText,
    lineHeight: 23,
    marginBottom: 6,
  },
  titleTextPast: {
    color: "#475569",
  },
  descText: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.subtleText,
    lineHeight: 18,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    marginVertical: 12,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  chipText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
});
