import React, { memo } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { FieldBookingItem } from "@/services/field-service";
import { BENTO } from "../constants";
import {
  formatDate,
  formatTime,
  getBookingDuration,
  formatPurposeWithEmoji,
} from "../utils";

interface ScheduleCardProps {
  item: FieldBookingItem;
}

export const ScheduleCard = memo(function ScheduleCard({
  item,
}: ScheduleCardProps) {
  const duration = getBookingDuration(item);
  const dateDisplay = formatDate(item.bookingDate || item.startTime);
  const userName = item.user?.name || "University Member";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <View style={styles.card}>
      {/* Row 1: Date & Reserved Slot Pill */}
      <View style={styles.cardHeader}>
        <View style={styles.dateRow}>
          <Feather
            name="calendar"
            size={13.5}
            color={BENTO.navy}
            style={styles.calendarIcon}
          />
          <Text style={styles.dateText}>{dateDisplay}</Text>
        </View>

        <View style={styles.reservedBadge}>
          <Feather
            name="lock"
            size={11}
            color={BENTO.emerald}
            style={styles.lockIcon}
          />
          <Text style={styles.reservedBadgeText}>APPROVED SLOT</Text>
        </View>
      </View>

      {/* Row 2: Event Title */}
      <View style={styles.titleRow}>
        <Text style={styles.purposeTitle} numberOfLines={2} ellipsizeMode="tail">
          {formatPurposeWithEmoji(item.purpose)}
        </Text>
      </View>

      {/* Row 3: Time Slot & Duration */}
      <View style={styles.timeRow}>
        <View style={styles.timePill}>
          <Feather
            name="clock"
            size={12.5}
            color={BENTO.indigo}
            style={styles.clockIcon}
          />
          <Text style={styles.timeText}>
            {formatTime(item.startTime)} – {formatTime(item.endTime)}
          </Text>
        </View>

        {duration ? (
          <View style={styles.durationPill}>
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        ) : null}
      </View>

      {/* Row 5: Booked By */}
      <View style={styles.bookedByRow}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{userInitial}</Text>
        </View>
        <Text style={styles.bookedByText}>
          Reserved for <Text style={styles.userNameHighlight}>{userName}</Text>
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO.card,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    marginBottom: 12,
    borderLeftWidth: 3.5,
    borderLeftColor: BENTO.emerald,
    borderWidth: 1,
    borderColor: BENTO.border,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
    position: "relative",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarIcon: {
    marginRight: 6,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "600",
    color: BENTO.navySecondary,
  },
  reservedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.emeraldBg,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.emeraldBorder,
  },
  lockIcon: {
    marginRight: 4,
  },
  reservedBadgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: BENTO.emerald,
    letterSpacing: 0.3,
  },
  titleRow: {
    marginBottom: 10,
  },
  purposeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BENTO.navy,
    letterSpacing: -0.3,
    lineHeight: 23,
    fontFamily:
      Platform.OS === "web"
        ? "var(--font-heading), 'Plus Jakarta Sans', system-ui, sans-serif"
        : undefined,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
    gap: 8,
  },
  timePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.indigoBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  clockIcon: {
    marginRight: 5,
  },
  timeText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: BENTO.indigo,
  },
  durationPill: {
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  durationText: {
    fontSize: 12,
    fontWeight: "600",
    color: BENTO.slate,
  },
  bookedByRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  avatarWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: "700",
    color: BENTO.navy,
  },
  bookedByText: {
    fontSize: 11.5,
    color: BENTO.slate,
  },
  userNameHighlight: {
    fontWeight: "600",
    color: BENTO.navySecondary,
  },
});
