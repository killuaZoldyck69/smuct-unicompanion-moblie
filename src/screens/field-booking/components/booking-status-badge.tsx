import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO } from "../constants";

interface BookingStatusBadgeProps {
  status: string;
}

export const BookingStatusBadge = memo(function BookingStatusBadge({
  status,
}: BookingStatusBadgeProps) {
  const norm = (status || "").toUpperCase();

  if (norm === "APPROVED") {
    return (
      <View style={[styles.badge, styles.approvedBadge]}>
        <Feather
          name="check-circle"
          size={11}
          color={BENTO.emerald}
          style={styles.icon}
        />
        <Text style={[styles.badgeText, { color: BENTO.emerald }]}>
          APPROVED
        </Text>
      </View>
    );
  }

  if (norm === "REJECTED") {
    return (
      <View style={[styles.badge, styles.rejectedBadge]}>
        <Feather
          name="x-circle"
          size={11}
          color={BENTO.rose}
          style={styles.icon}
        />
        <Text style={[styles.badgeText, { color: BENTO.rose }]}>
          REJECTED
        </Text>
      </View>
    );
  }

  if (norm === "CANCELLED") {
    return (
      <View style={[styles.badge, styles.cancelledBadge]}>
        <Feather
          name="slash"
          size={11}
          color={BENTO.slate}
          style={styles.icon}
        />
        <Text style={[styles.badgeText, { color: BENTO.slate }]}>
          CANCELLED
        </Text>
      </View>
    );
  }

  // Default to PENDING / PENDING REVIEW
  return (
    <View style={[styles.badge, styles.pendingBadge]}>
      <Feather
        name="clock"
        size={11}
        color={BENTO.amber}
        style={styles.icon}
      />
      <Text style={[styles.badgeText, { color: BENTO.amber }]}>
        PENDING REVIEW
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 14,
    borderWidth: 1,
  },
  icon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  approvedBadge: {
    backgroundColor: BENTO.emeraldBg,
    borderColor: BENTO.emeraldBorder,
  },
  rejectedBadge: {
    backgroundColor: BENTO.roseBg,
    borderColor: BENTO.roseBorder,
  },
  pendingBadge: {
    backgroundColor: BENTO.amberBg,
    borderColor: BENTO.amberBorder,
  },
  cancelledBadge: {
    backgroundColor: BENTO.slateSubtle,
    borderColor: BENTO.border,
  },
});
