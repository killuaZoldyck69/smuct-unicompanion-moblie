import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { CampusEventItem } from "@/services/event-service";
import { EventTabCounts, fontFamily } from "../constants";

interface EventHeroCardProps {
  counts?: EventTabCounts;
  nextEvent?: CampusEventItem | null;
}

export const EventHeroCard = React.memo(function EventHeroCard(
  _props: EventHeroCardProps
) {
  return (
    <View style={styles.card}>
      {/* Decorative ambient backdrop glow behind the calendar */}
      <View style={styles.decorGlow} />
      <View style={styles.decorGlowInner} />

      {/* Left Content: Title & Subtitle */}
      <View style={styles.contentCol}>
        <Text style={styles.title}>
          Explore Events{"\n"}Around Campus
        </Text>
        <Text style={styles.subtitle}>
          Workshops, seminars, fests, competitions and more. Be a part of what's
          happening at SMUCT.
        </Text>
      </View>

      {/* Right Column: 3D Calendar Illustration */}
      <View style={styles.imageCol}>
        <Image
          source={require("@/assets/events-calendar-3d.png")}
          style={styles.calendarImage}
          resizeMode="contain"
          accessible={true}
          accessibilityLabel="Events Calendar Illustration"
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f0f6ff",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#dbeafe",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  decorGlow: {
    position: "absolute",
    right: -25,
    top: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(186, 230, 253, 0.45)",
  },
  decorGlowInner: {
    position: "absolute",
    right: 0,
    bottom: -10,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(224, 242, 254, 0.65)",
  },
  contentCol: {
    flex: 1,
    paddingRight: 10,
    justifyContent: "center",
  },
  title: {
    fontFamily,
    fontSize: 21,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.4,
    lineHeight: 26,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily,
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
    fontWeight: "400",
  },
  imageCol: {
    width: 114,
    height: 114,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarImage: {
    width: 120,
    height: 120,
  },
});
