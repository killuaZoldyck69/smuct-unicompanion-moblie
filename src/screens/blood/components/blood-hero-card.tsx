import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { BENTO_COLORS, BloodFeedCounts, fontFamily } from "../constants";

export interface BloodHeroCardProps {
  counts: BloodFeedCounts;
  selectedFilter?: string;
  urgentHospital?: string;
  urgentBloodGroup?: string;
  onPressPledge?: () => void;
  onPressStat?: (type: "ALL" | "ACTIVE" | "FULFILLED" | "URGENT") => void;
}

export const BloodHeroCard = React.memo(function BloodHeroCard({
  counts,
  selectedFilter = "ACTIVE",
  urgentHospital,
  urgentBloodGroup,
  onPressPledge,
  onPressStat,
}: BloodHeroCardProps) {
  const hasUrgent = counts.urgent > 0;
  const isUrgentSelected = selectedFilter === "URGENT";
  const isActiveSelected = selectedFilter === "ACTIVE";
  const isFulfilledSelected = selectedFilter === "FULFILLED";

  const criticalTitle = hasUrgent
    ? `${counts.urgent} Critical Request${counts.urgent > 1 ? "s" : ""}`
    : "No Urgent Requests";

  let criticalDesc = "All current requests are stable";
  if (hasUrgent) {
    if (urgentBloodGroup && urgentHospital) {
      criticalDesc = `${urgentBloodGroup} needed at ${urgentHospital}`;
    } else if (urgentHospital) {
      criticalDesc = `Required at ${urgentHospital}`;
    } else if (urgentBloodGroup) {
      criticalDesc = `${urgentBloodGroup} blood required immediately`;
    } else {
      criticalDesc = "Immediate blood required";
    }
  }

  const handleEmergencyPress = () => {
    if (onPressStat) {
      onPressStat("URGENT");
    } else if (onPressPledge) {
      onPressPledge();
    }
  };

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`Emergency broadcast: ${criticalTitle}, ${counts.active} requests, ${counts.fulfilled} completed.`}
    >
      {/* 1. LEFT FEATURED HERO CARD: EMERGENCY BROADCAST (WIDER) */}
      <TouchableOpacity
        style={[
          styles.emergencyCard,
          isUrgentSelected && styles.emergencyCardSelected,
        ]}
        onPress={handleEmergencyPress}
        activeOpacity={0.88}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${criticalTitle}, ${criticalDesc}. Tap to filter urgent requests.`}
      >
        {/* Top Accent Gradient Bar */}
        <View style={styles.emergencyTopBar} pointerEvents="none">
          <Svg height="4" width="100%">
            <Defs>
              <LinearGradient id="heroEmergencyTopGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#e11d48" />
                <Stop offset="40%" stopColor="#f43f5e" />
                <Stop offset="75%" stopColor="#f97316" />
                <Stop offset="100%" stopColor="#f59e0b" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="4" fill="url(#heroEmergencyTopGrad)" />
          </Svg>
        </View>

        <View style={styles.emergencyTopRow}>
          <View style={styles.pulseDot} />
          <Text style={styles.emergencyTag} numberOfLines={1}>
            EMERGENCY BROADCAST
          </Text>
        </View>

        <View style={styles.emergencyContent}>
          <Text style={styles.criticalTitle} numberOfLines={2}>
            {criticalTitle}
          </Text>

          <Text style={styles.criticalDesc} numberOfLines={2}>
            {criticalDesc}
          </Text>
        </View>
      </TouchableOpacity>

      {/* 2. RIGHT STACKED BENTO CELLS: ACTIVE & FULFILLED */}
      <View style={styles.rightStack}>
        {/* Active Cell (Red Theme) */}
        <TouchableOpacity
          style={[
            styles.rightCard,
            styles.activeCard,
            isActiveSelected && styles.activeCardSelected,
          ]}
          onPress={() => onPressStat?.("ACTIVE")}
          activeOpacity={0.78}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Active requests: ${counts.active} requests`}
        >
          <View style={styles.rightCardHeader}>
            <Text style={styles.rightCardTitle}>Active</Text>
            <View style={styles.dropletIconCircle}>
              <Feather name="droplet" size={13} color="#e11d48" />
            </View>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLargeNumber}>{counts.active}</Text>
            <Text style={styles.statSubText}>requests</Text>
          </View>
        </TouchableOpacity>

        {/* Fulfilled Cell */}
        <TouchableOpacity
          style={[
            styles.rightCard,
            styles.fulfilledCard,
            isFulfilledSelected && styles.fulfilledCardSelected,
          ]}
          onPress={() => onPressStat?.("FULFILLED")}
          activeOpacity={0.78}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Fulfilled requests: ${counts.fulfilled} completed`}
        >
          <View style={styles.rightCardHeader}>
            <Text style={styles.rightCardTitle}>Fulfilled</Text>
            <View style={styles.checkIconCircle}>
              <Feather name="check-circle" size={13} color="#2563eb" />
            </View>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLargeNumber}>{counts.fulfilled}</Text>
            <Text style={styles.statSubText}>completed</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
    alignItems: "stretch",
  },
  /* LEFT CARD: EMERGENCY BROADCAST (WIDER) */
  emergencyCard: {
    flex: 1.6,
    backgroundColor: "#fff5f6",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: "#fb7185",
    justifyContent: "center",
    gap: 8,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#e11d48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  emergencyCardSelected: {
    borderColor: BENTO_COLORS.crimson,
    backgroundColor: "#ffe4e6",
  },
  emergencyTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    zIndex: 10,
  },
  emergencyTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#dc2626",
    marginRight: 6,
  },
  emergencyTag: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#b91c1c",
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  emergencyContent: {
    justifyContent: "center",
    paddingTop: 0,
  },
  criticalTitle: {
    fontFamily,
    fontSize: 19,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  criticalDesc: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
    lineHeight: 17,
  },

  /* RIGHT STACK */
  rightStack: {
    flex: 1,
    gap: 8,
  },
  rightCard: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "space-between",
    borderWidth: 1.5,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  activeCard: {
    backgroundColor: "#fff5f6",
    borderColor: "#fecdd3",
  },
  activeCardSelected: {
    borderColor: BENTO_COLORS.crimson,
    backgroundColor: "#ffe4e6",
  },
  fulfilledCard: {
    backgroundColor: "#eff6ff",
    borderColor: "#dbeafe",
  },
  fulfilledCardSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#e0e7ff",
  },
  rightCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  rightCardTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  dropletIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.2)",
  },
  checkIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
  },
  statLargeNumber: {
    fontFamily,
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  statSubText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
  },
});
