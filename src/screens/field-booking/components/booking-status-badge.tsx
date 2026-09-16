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
  switch (status) {
    case "APPROVED":
      return (
        <View style={[styles.badge, styles.approved]}>
          <Feather
            name="check-circle"
            size={12}
            color={BENTO.emerald}
            style={styles.icon}
          />
          <Text style={[styles.badgeText, { color: BENTO.emerald }]}>
            Approved
          </Text>
        </View>
      );
    case "REJECTED":
      return (
        <View style={[styles.badge, styles.rejected]}>
          <Feather
            name="x-circle"
            size={12}
            color={BENTO.rose}
            style={styles.icon}
          />
          <Text style={[styles.badgeText, { color: BENTO.rose }]}>
            Rejected
          </Text>
        </View>
      );
    default:
      return (
        <View style={[styles.badge, styles.pending]}>
          <Feather
            name="clock"
            size={12}
            color={BENTO.amber}
            style={styles.icon}
          />
          <Text style={[styles.badgeText, { color: BENTO.amber }]}>
            Pending Review
          </Text>
        </View>
      );
  }
});

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  icon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  approved: {
    backgroundColor: BENTO.emeraldBg,
    borderColor: BENTO.emeraldBorder,
  },
  rejected: {
    backgroundColor: BENTO.roseBg,
    borderColor: BENTO.roseBorder,
  },
  pending: {
    backgroundColor: BENTO.amberBg,
    borderColor: BENTO.amberBorder,
  },
});
