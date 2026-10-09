import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { FieldBookingItem } from "@/services/field-service";
import { BENTO } from "../constants";
import {
  formatTime,
  getBookingDuration,
  formatPurposeWithEmoji,
} from "../utils";

interface ScheduleTimelineCardProps {
  item: FieldBookingItem;
  isLast?: boolean;
  isFirst?: boolean;
  onPressReserver?: (item: FieldBookingItem) => void;
}

export const ScheduleTimelineCard = memo(function ScheduleTimelineCard({
  item,
  isLast,
  isFirst,
  onPressReserver,
}: ScheduleTimelineCardProps) {
  const duration = getBookingDuration(item);
  const userName = item.user?.name || "University Member";
  const userInitial = userName.charAt(0).toUpperCase();
  const titleDisplay = formatPurposeWithEmoji(item.purpose);

  return (
    <View style={styles.timelineRow}>
      {/* Vertical Timeline Track on the Left */}
      <View style={styles.track}>
        {/* Upper connecting line if not first */}
        <View style={[styles.upperLine, isFirst && styles.hiddenLine]} />

        {/* Timeline Node Halo & Dot */}
        <View style={styles.nodeHalo}>
          <View style={styles.nodeDot} />
        </View>

        {/* Lower connecting line if not last */}
        <View style={[styles.lowerLine, isLast && styles.hiddenLine]} />
      </View>

      {/* Main Schedule Card on the Right */}
      <View style={styles.contentWrap}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.88}
          onPress={() => onPressReserver?.(item)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Schedule card: ${titleDisplay}, reserved for ${userName}. Tap to view reserver profile.`}
        >
          {/* Header Row: Time Slot, Duration & Status Pill */}
          <View style={styles.cardHeader}>
            <View style={styles.timeCluster}>
              <View style={styles.timePill}>
                <Feather
                  name="clock"
                  size={12}
                  color={BENTO.indigo}
                  style={styles.timeIcon}
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

            <View style={styles.approvedBadge}>
              <Feather
                name="check-circle"
                size={11}
                color={BENTO.emerald}
                style={styles.badgeIcon}
              />
              <Text style={styles.approvedBadgeText}>APPROVED</Text>
            </View>
          </View>

          {/* Event Title with Emoji */}
          <View style={styles.titleRow}>
            <Text
              style={styles.purposeTitle}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {titleDisplay}
            </Text>
          </View>

          {/* Reserved By Footer */}
          <View style={styles.footerRow}>
            <View style={styles.avatarWrap}>
              {item.user?.image ? (
                <Image
                  source={{ uri: item.user.image }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>{userInitial}</Text>
              )}
            </View>

            <View style={styles.reservedInfoCol}>
              <Text style={styles.reservedText} numberOfLines={1}>
                Reserved for{" "}
                <Text style={styles.userNameHighlight}>{userName}</Text>
              </Text>
            </View>

            <Feather
              name="chevron-right"
              size={16}
              color={BENTO.slate}
              style={styles.chevronIcon}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  timelineRow: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 120,
  },
  track: {
    width: 32,
    alignItems: "center",
  },
  upperLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#cbd5e1",
  },
  lowerLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#cbd5e1",
  },
  hiddenLine: {
    backgroundColor: "transparent",
  },
  nodeHalo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BENTO.emeraldBg,
    borderWidth: 1.5,
    borderColor: BENTO.emeraldBorder,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  nodeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BENTO.emerald,
  },
  contentWrap: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 14,
  },
  card: {
    backgroundColor: BENTO.card,
    borderRadius: 16,
    borderLeftWidth: 3.5,
    borderLeftColor: BENTO.emerald,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingHorizontal: 15,
    paddingVertical: 13,
    ...Platform.select({
      web: {
        boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
      } as any,
      default: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
        elevation: 1,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    flexWrap: "wrap",
    gap: 6,
  },
  timeCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  timePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.indigoBg,
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BENTO.indigoBorder,
  },
  timeIcon: {
    marginRight: 5,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.indigo,
  },
  durationPill: {
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 7,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.slate,
  },
  approvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.emeraldBg,
    paddingHorizontal: 7.5,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BENTO.emeraldBorder,
  },
  badgeIcon: {
    marginRight: 3.5,
  },
  approvedBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: BENTO.emerald,
    letterSpacing: 0.3,
  },
  titleRow: {
    marginBottom: 10,
  },
  purposeTitle: {
    fontSize: 16.5,
    fontWeight: "700",
    color: BENTO.navy,
    letterSpacing: -0.3,
    lineHeight: 22,
    fontFamily:
      Platform.OS === "web"
        ? "var(--font-heading), 'Plus Jakarta Sans', system-ui, sans-serif"
        : undefined,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.04)",
  },
  avatarWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
    borderWidth: 1,
    borderColor: BENTO.border,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 10,
    fontWeight: "800",
    color: BENTO.navy,
  },
  reservedInfoCol: {
    flex: 1,
    marginRight: 6,
  },
  reservedText: {
    fontSize: 12,
    color: BENTO.slate,
  },
  userNameHighlight: {
    fontWeight: "700",
    color: BENTO.navySecondary,
  },
  chevronIcon: {
    marginLeft: 4,
    opacity: 0.7,
  },
});
