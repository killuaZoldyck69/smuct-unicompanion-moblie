import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  BENTO_COLORS,
  ClassRoutineItem,
  fontFamily,
} from "../constants";
import { getDeterministicColorTheme, isClassLiveNow } from "../utils";

interface ClassRoutineCardProps {
  item: ClassRoutineItem;
  isToday: boolean;
  nextClassId?: string;
}

export const ClassRoutineCard = React.memo(function ClassRoutineCard({
  item,
  isToday,
  nextClassId,
}: ClassRoutineCardProps) {
  const isLive = isClassLiveNow(item.day, item.startTime, item.endTime);
  const isNext = !isLive && isToday && nextClassId === item.id;
  const theme = isLive ? null : getDeterministicColorTheme(item.courseCode, item.courseName);

  return (
    <View
      style={[
        styles.card,
        isLive ? styles.cardLive : { backgroundColor: theme?.cardBg || "#ffffff" },
      ]}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`${item.courseCode}, ${item.courseName}. Starts at ${item.startTime}, ends at ${item.endTime}. Location: ${item.room}. ${
        isLive ? "Live now." : isNext ? "Next class." : ""
      }`}
    >
      <View style={styles.headerRow}>
        <View style={styles.badgeGroup}>
          {isLive ? (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>LIVE NOW</Text>
            </View>
          ) : isNext ? (
            <View style={styles.nextBadge}>
              <Text style={styles.nextBadgeText}>NEXT CLASS</Text>
            </View>
          ) : null}

          <View
            style={[
              styles.codePill,
              isLive ? styles.codePillLive : { backgroundColor: theme?.codePillBg },
            ]}
          >
            <Text
              style={[
                styles.codeText,
                isLive ? styles.codeTextLive : { color: theme?.codePillText },
              ]}
            >
              {item.courseCode}
            </Text>
          </View>
        </View>

        {item.duration ? (
          <View
            style={[
              styles.durationChip,
              isLive ? styles.durationChipLive : { backgroundColor: theme?.tagBg },
            ]}
          >
            <Feather
              name="clock"
              size={11}
              color={isLive ? "#ffffff" : theme?.tagText}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.durationText,
                isLive ? styles.durationTextLive : { color: theme?.tagText },
              ]}
            >
              {item.duration}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.timeRow}>
        <Text style={[styles.timeMainText, isLive && styles.textWhite]}>
          {item.startTime}
        </Text>
        <Text style={[styles.timeSeparatorText, isLive && styles.timeSeparatorLive]}>
          →
        </Text>
        <Text style={[styles.timeSecondaryText, isLive && styles.textWhiteMuted]}>
          {item.endTime || "TBA"}
        </Text>
      </View>

      <Text
        style={[styles.courseTitleText, isLive && styles.textWhite]}
        numberOfLines={3}
      >
        {item.courseName}
      </Text>

      <View style={styles.footerRow}>
        <View
          style={[
            styles.locationPill,
            isLive ? styles.locationPillLive : { backgroundColor: "rgba(0, 0, 0, 0.05)" },
          ]}
        >
          <Feather
            name="map-pin"
            size={12}
            color={isLive ? "#ffffff" : BENTO_COLORS.deepNavy}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[styles.locationText, isLive && styles.textWhite]}
            numberOfLines={1}
          >
            {item.room}
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  cardLive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: "rgba(255, 255, 255, 0.12)",
    ...BENTO_COLORS.heroShadow,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  badgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
    marginRight: 5,
  },
  liveBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.8,
  },
  nextBadge: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  nextBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.8,
  },
  codePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  codePillLive: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  codeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  codeTextLive: {
    color: "#a5b4fc",
  },
  durationChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  durationChipLive: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  durationText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
  },
  durationTextLive: {
    color: "#ffffff",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  timeMainText: {
    fontFamily,
    fontSize: 22,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  timeSeparatorText: {
    fontFamily,
    fontSize: 16,
    color: BENTO_COLORS.subtleText,
    marginHorizontal: 8,
  },
  timeSeparatorLive: {
    color: "#94a3b8",
  },
  timeSecondaryText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  courseTitleText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
    lineHeight: 21,
    marginBottom: 14,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  locationPillLive: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  locationText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  textWhite: {
    color: "#ffffff",
  },
  textWhiteMuted: {
    color: "#94a3b8",
  },
});
