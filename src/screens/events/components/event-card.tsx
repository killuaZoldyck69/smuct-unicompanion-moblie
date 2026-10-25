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
import { BENTO_COLORS, fontFamily, getCategoryConfig } from "../constants";
import { formatEventTime, getEventDateComponents } from "../utils";

export interface EventCardProps {
  item: CampusEventItem;
  index?: number;
  onPress: (item: CampusEventItem) => void;
  isAdmin?: boolean;
  onEdit?: (item: CampusEventItem) => void;
  onDelete?: (item: CampusEventItem) => void;
}

const THEME_PALETTES = [
  {
    bg: "#e6f9f0", // mint/teal
    monthColor: "#0d9488",
  },
  {
    bg: "#eff6ff", // soft blue
    monthColor: "#2563eb",
  },
  {
    bg: "#f5f3ff", // soft lavender
    monthColor: "#7c3aed",
  },
];

export const EventCard = React.memo(function EventCard({
  item,
  index = 0,
  onPress,
  isAdmin = false,
  onEdit,
  onDelete,
}: EventCardProps) {
  const eventDateStr = item.eventDate || item.date || item.createdAt;
  const eventDate = new Date(eventDateStr);
  const now = new Date();
  const isToday = eventDate.toDateString() === now.toDateString();
  const isPast = eventDate.getTime() < now.getTime() && !isToday;

  const { month, dayNumber, weekday } = getEventDateComponents(eventDateStr);
  const formattedTime = formatEventTime(eventDateStr);
  const categoryConfig = getCategoryConfig(item.category);

  // Palette assignment for left date block
  const palette = isPast
    ? {
        bg: "#f1f5f9",
        monthColor: "#64748b",
      }
    : isToday
      ? {
          bg: "#ecfdf5",
          monthColor: "#059669",
        }
      : THEME_PALETTES[index % THEME_PALETTES.length];

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
      {/* Left Column: Date Block + Admin Edit/Delete Options Underneath */}
      <View style={styles.leftCol}>
        <View style={[styles.dateBlock, { backgroundColor: palette.bg }]}>
          <Text style={[styles.dateMonth, { color: palette.monthColor }]}>
            {month}
          </Text>
          <Text style={styles.dateNumber}>{dayNumber}</Text>
          <Text style={styles.dateWeekday}>{weekday}</Text>
        </View>

        {isAdmin && (
          <View style={styles.leftAdminRow}>
            <TouchableOpacity
              onPress={() => onEdit?.(item)}
              style={[styles.adminBtnCircle, styles.adminEditBtn]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Edit event ${item.title}`}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <Feather name="edit-2" size={13} color="#2563eb" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onDelete?.(item)}
              style={[styles.adminBtnCircle, styles.adminDeleteBtn]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Delete event ${item.title}`}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 8 }}
            >
              <Feather name="trash-2" size={13} color="#dc2626" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Right Content Column */}
      <View style={styles.contentCol}>
        {/* Full-width Title */}
        <Text style={styles.titleText}>
          {item.title}
        </Text>

        {/* Bottom Row: Time & Venue on Left, Chevron Arrow on Right */}
        <View style={styles.bottomRow}>
          <View style={styles.metaGroup}>
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

            {item.category && item.category !== "GENERAL" ? (
              <View style={styles.metaItem}>
                <Feather
                  name={categoryConfig.icon as any}
                  size={12}
                  color={categoryConfig.badgeText}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: categoryConfig.badgeText, fontWeight: "600" },
                  ]}
                  numberOfLines={1}
                >
                  {categoryConfig.label}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.arrowCircle}>
            <Feather name="chevron-right" size={17} color="#64748b" />
          </View>
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
  leftCol: {
    alignItems: "center",
  },
  dateBlock: {
    width: 60,
    minHeight: 68,
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
  leftAdminRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    gap: 6,
    width: 60,
  },
  adminBtnCircle: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    alignItems: "center",
    justifyContent: "center",
  },
  adminEditBtn: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.15)",
  },
  adminDeleteBtn: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.15)",
  },
  contentCol: {
    flex: 1,
    marginLeft: 14,
  },
  titleText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 22,
    width: "100%",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 8,
  },
  metaGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexWrap: "wrap",
    columnGap: 12,
    rowGap: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  metaText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748b",
    marginLeft: 4,
  },
  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
});
