import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { FieldBookingItem } from "@/services/field-service";
import { BENTO } from "../constants";
import {
  formatDate,
  formatTime,
  getBookingDuration,
  getSportIcon,
} from "../utils";
import { BookingStatusBadge } from "./booking-status-badge";

interface MyBookingCardProps {
  item: FieldBookingItem;
}

export const MyBookingCard = memo(function MyBookingCard({
  item,
}: MyBookingCardProps) {
  const sport = getSportIcon(item.purpose);
  const duration = getBookingDuration(item);
  const dateDisplay = formatDate(item.bookingDate || item.startTime);
  const isRejected = item.status === "REJECTED";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.dateChip}>
          <Feather
            name="calendar"
            size={14}
            color={BENTO.navy}
            style={styles.headerIcon}
          />
          <Text style={styles.dateChipText}>{dateDisplay}</Text>
        </View>
        <BookingStatusBadge status={item.status} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.purposeRow}>
          <View style={styles.sportIconWrap}>
            <Feather name={sport.name} size={16} color={BENTO.navy} />
          </View>
          <View style={styles.purposeTextContainer}>
            <Text style={styles.purposeTitle}>{item.purpose}</Text>
            <Text style={styles.sportCategoryText}>{sport.label}</Text>
          </View>
        </View>

        <View style={styles.timeInfoRow}>
          <View style={styles.timeChip}>
            <Feather
              name="clock"
              size={13}
              color={BENTO.indigo}
              style={styles.timeIcon}
            />
            <Text style={styles.timeChipText}>
              {formatTime(item.startTime)} – {formatTime(item.endTime)}
            </Text>
          </View>

          {duration ? (
            <View style={styles.durationChip}>
              <Text style={styles.durationChipText}>{duration}</Text>
            </View>
          ) : null}
        </View>

        {item.adminFeedback ? (
          <View
            style={[
              styles.feedbackBox,
              isRejected ? styles.feedbackBoxRejected : styles.feedbackBoxInfo,
            ]}
          >
            <Feather
              name="message-square"
              size={13}
              color={isRejected ? BENTO.rose : BENTO.slate}
              style={styles.feedbackIcon}
            />
            <Text
              style={[
                styles.feedbackText,
                isRejected && { color: BENTO.rose },
              ]}
            >
              Admin Note: {item.adminFeedback}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardFooter}>
        <Feather
          name="send"
          size={12}
          color={BENTO.slateLight}
          style={styles.footerIcon}
        />
        <Text style={styles.footerText}>
          Requested on {formatDate(item.createdAt)}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO.card,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 23, 42, 0.04)",
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  headerIcon: {
    marginRight: 6,
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.navy,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  purposeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sportIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  purposeTextContainer: {
    flex: 1,
  },
  purposeTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.2,
  },
  sportCategoryText: {
    fontSize: 11,
    color: BENTO.slate,
    marginTop: 2,
    fontWeight: "500",
  },
  timeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  timeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.indigoBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BENTO.indigoBorder,
  },
  timeIcon: {
    marginRight: 6,
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.indigo,
  },
  durationChip: {
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  durationChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.slate,
  },
  feedbackBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  feedbackBoxInfo: {
    backgroundColor: BENTO.slateSubtle,
    borderColor: BENTO.border,
  },
  feedbackBoxRejected: {
    backgroundColor: BENTO.roseBg,
    borderColor: BENTO.roseBorder,
  },
  feedbackIcon: {
    marginRight: 6,
    marginTop: 1,
  },
  feedbackText: {
    fontSize: 12,
    color: BENTO.navySecondary,
    flex: 1,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafbfc",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(15, 23, 42, 0.04)",
  },
  footerIcon: {
    marginRight: 5,
  },
  footerText: {
    fontSize: 11,
    color: BENTO.slate,
  },
});
