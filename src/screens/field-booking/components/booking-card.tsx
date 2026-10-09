import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { FieldBookingItem } from "@/services/field-service";
import { BENTO } from "../constants";
import {
  formatDate,
  formatRequestedDate,
  formatTime,
  getBookingDuration,
  formatPurposeWithEmoji,
  isPastBooking,
} from "../utils";
import { BookingStatusBadge } from "./booking-status-badge";

interface BookingCardProps {
  item: FieldBookingItem;
  onPress?: () => void;
  onDelete?: (item: FieldBookingItem) => void;
  isDeleting?: boolean;
}

export const BookingCard = memo(function BookingCard({
  item,
  onPress,
  onDelete,
  isDeleting,
}: BookingCardProps) {
  const isPast = isPastBooking(item);
  const duration = getBookingDuration(item);
  const dateDisplay = formatDate(item.bookingDate || item.startTime);
  const requestedDate = formatRequestedDate(item.createdAt);

  const statusNorm = (item.status || "").toUpperCase();
  const leftAccentColor = isPast
    ? "#94a3b8"
    : statusNorm === "APPROVED"
      ? BENTO.emerald
      : statusNorm === "REJECTED"
        ? BENTO.rose
        : BENTO.amber;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderLeftColor: leftAccentColor },
        isPast && styles.cardPast,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Booking for ${item.purpose}, ${statusNorm}, on ${dateDisplay}${isPast ? ", past booking" : ""}`}
    >
      {/* Row 1: Date & Status Badge */}
      <View style={styles.cardHeader}>
        <View style={styles.dateRow}>
          <Feather
            name="calendar"
            size={13.5}
            color={isPast ? BENTO.slateLight : BENTO.navy}
            style={styles.calendarIcon}
          />
          <Text style={[styles.dateText, isPast && styles.dateTextPast]}>
            {dateDisplay}
          </Text>
          {isPast && (
            <View style={styles.pastBadge}>
              <Text style={styles.pastBadgeText}>PAST</Text>
            </View>
          )}
        </View>
        <BookingStatusBadge status={item.status} />
      </View>

      {/* Row 2: Booking Title */}
      <View style={styles.titleRow}>
        <Text
          style={[styles.purposeTitle, isPast && styles.purposeTitlePast]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {formatPurposeWithEmoji(item.purpose)}
        </Text>
      </View>

      {/* Row 3: Time Slot & Duration Pill */}
      <View style={styles.timeRow}>
        <View style={[styles.timePill, isPast && styles.timePillPast]}>
          <Feather
            name="clock"
            size={12.5}
            color={isPast ? BENTO.slate : BENTO.indigo}
            style={styles.clockIcon}
          />
          <Text style={[styles.timeText, isPast && styles.timeTextPast]}>
            {formatTime(item.startTime)} – {formatTime(item.endTime)}
          </Text>
        </View>

        {duration ? (
          <View style={styles.durationPill}>
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        ) : null}
      </View>

      {/* Admin Feedback Box if present */}
      {item.adminFeedback ? (
        <View
          style={[
            styles.feedbackBox,
            statusNorm === "REJECTED"
              ? styles.feedbackBoxRejected
              : styles.feedbackBoxNormal,
          ]}
        >
          <Feather
            name="info"
            size={12}
            color={statusNorm === "REJECTED" ? BENTO.rose : BENTO.slate}
            style={styles.feedbackIcon}
          />
          <Text
            style={[
              styles.feedbackText,
              statusNorm === "REJECTED" && { color: BENTO.rose },
            ]}
          >
            {item.adminFeedback}
          </Text>
        </View>
      ) : null}

      {/* Footer: Secondary Requested Date & Delete Action */}
      <View style={styles.cardFooterRow}>
        {requestedDate ? (
          <View style={styles.requestedRow}>
            <Feather
              name="user"
              size={12}
              color={BENTO.slateLight}
              style={styles.requestedIcon}
            />
            <Text style={styles.requestedText}>
              Requested {requestedDate}
            </Text>
          </View>
        ) : (
          <View />
        )}

        {onDelete ? (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(item)}
            activeOpacity={0.7}
            disabled={isDeleting}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={`Delete booking for ${item.purpose}`}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={BENTO.rose} />
            ) : (
              <>
                <Feather
                  name="trash-2"
                  size={12.5}
                  color={BENTO.rose}
                  style={styles.deleteIcon}
                />
                <Text style={styles.deleteText}>Delete</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
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
  cardPast: {
    opacity: 0.6,
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
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
  dateTextPast: {
    color: BENTO.slate,
  },
  pastBadge: {
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  pastBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: BENTO.slate,
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
  purposeTitlePast: {
    color: BENTO.slate,
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
  timePillPast: {
    backgroundColor: BENTO.slateSubtle,
  },
  clockIcon: {
    marginRight: 5,
  },
  timeText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: BENTO.indigo,
  },
  timeTextPast: {
    color: BENTO.slate,
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
  feedbackBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  feedbackBoxNormal: {
    backgroundColor: BENTO.slateSubtle,
    borderColor: BENTO.border,
  },
  feedbackBoxRejected: {
    backgroundColor: BENTO.roseBg,
    borderColor: BENTO.roseBorder,
  },
  feedbackIcon: {
    marginRight: 6,
  },
  feedbackText: {
    fontSize: 12,
    color: BENTO.slate,
    flex: 1,
  },
  cardFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    minHeight: 28,
  },
  requestedRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  requestedIcon: {
    marginRight: 5,
  },
  requestedText: {
    fontSize: 11.5,
    fontWeight: "500",
    color: BENTO.slateLight,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.roseBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BENTO.roseBorder,
  },
  deleteIcon: {
    marginRight: 4,
  },
  deleteText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: BENTO.rose,
  },
});
