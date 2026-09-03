import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";

interface BusRouteCardProps {
  item: any;
}

export const BusRouteCard = React.memo(function BusRouteCard({
  item,
}: BusRouteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const stops: string[] = Array.isArray(item.stops) ? item.stops : [];
  const hasStops = stops.length > 0;

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={hasStops ? toggleExpand : undefined}
        style={styles.cardHeader}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Bus Route: ${item.route || item.routeName}, Departure Time: ${item.departureTime}`}
      >
        <View style={styles.headerLeft}>
          <View style={styles.busIconBox}>
            <Feather name="truck" size={20} color="#0369a1" />
          </View>

          <View style={styles.titlesBlock}>
            <Text style={styles.routeNameText} numberOfLines={2}>
              {item.route || item.routeName}
            </Text>
            {item.busNumber && item.busNumber !== "N/A" && (
              <View style={styles.busNumberPill}>
                <Text style={styles.busNumberText}>Bus: {item.busNumber}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.timeBadgePill}>
          <Feather
            name="clock"
            size={11}
            color="#ffffff"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.timeBadgeText}>{item.departureTime}</Text>
        </View>
      </TouchableOpacity>

      {hasStops && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleExpand}
          style={styles.toggleBar}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={
            isExpanded ? "Hide route stops" : "View route stops"
          }
        >
          <Text style={styles.toggleBarText}>
            {isExpanded
              ? "Hide Stops"
              : `View Route Stops (${stops.length})`}
          </Text>
          <Feather
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={BENTO_COLORS.deepNavy}
          />
        </TouchableOpacity>
      )}

      {isExpanded && hasStops && (
        <View style={styles.timelineWrapper}>
          <View style={styles.timelineDivider} />
          <View style={styles.timelineContainer}>
            {stops.map((stop: string, idx: number) => {
              const isFirst = idx === 0;
              const isLast = idx === stops.length - 1;

              return (
                <View key={idx} style={styles.timelineRow}>
                  <View style={styles.timelineGraphicCol}>
                    <View
                      style={[
                        styles.timelineDot,
                        isFirst
                          ? styles.timelineDotStart
                          : isLast
                            ? styles.timelineDotEnd
                            : styles.timelineDotTransit,
                      ]}
                    />
                    {!isLast && <View style={styles.timelineVerticalLine} />}
                  </View>

                  <View style={styles.stopTextContainer}>
                    <Text
                      style={[
                        styles.stopNameText,
                        (isFirst || isLast) && styles.stopNameTextPrimary,
                      ]}
                    >
                      {stop}
                    </Text>
                    {isFirst && (
                      <Text style={styles.stopRolePillStart}>DEPARTURE</Text>
                    )}
                    {isLast && (
                      <Text style={styles.stopRolePillEnd}>DESTINATION</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  busIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titlesBlock: {
    flex: 1,
  },
  routeNameText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: BENTO_COLORS.neutralText,
    lineHeight: 20,
    marginBottom: 4,
  },
  busNumberPill: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  busNumberText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
  },
  timeBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  timeBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  toggleBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 14,
  },
  toggleBarText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  timelineWrapper: {
    marginTop: 10,
  },
  timelineDivider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    marginBottom: 12,
  },
  timelineContainer: {
    paddingLeft: 6,
    paddingRight: 6,
  },
  timelineRow: {
    flexDirection: "row",
    minHeight: 38,
  },
  timelineGraphicCol: {
    width: 24,
    alignItems: "center",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    zIndex: 1,
  },
  timelineDotStart: {
    backgroundColor: "#0284c7",
  },
  timelineDotEnd: {
    backgroundColor: "#10b981",
  },
  timelineDotTransit: {
    backgroundColor: "#cbd5e1",
  },
  timelineVerticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#e2e8f0",
    marginTop: -2,
    marginBottom: -2,
  },
  stopTextContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 10,
    paddingBottom: 14,
  },
  stopNameText: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.subtleText,
    flex: 1,
    marginRight: 8,
  },
  stopNameTextPrimary: {
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
  },
  stopRolePillStart: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: "#0284c7",
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    letterSpacing: 0.5,
  },
  stopRolePillEnd: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: "#059669",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    letterSpacing: 0.5,
  },
});
