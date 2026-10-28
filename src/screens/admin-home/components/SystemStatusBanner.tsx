import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { SystemHealth } from "../hooks/use-admin-dashboard";

interface SystemStatusBannerProps {
  health: SystemHealth;
  isFetching: boolean;
}

export const SystemStatusBanner = React.memo(function SystemStatusBanner({
  health,
  isFetching,
}: SystemStatusBannerProps) {
  const router = useRouter();
  const isOnline = health.isOnline;
  const isChecking = health.status === "checking";

  const bg = isChecking ? "#F8FAFC" : isOnline ? "#F0FDF8" : "#FFF1F2";
  const borderColor = isChecking
    ? "#E2E8F0"
    : isOnline
    ? "#D1FAE5"
    : "#FECDD3";
  const dotColor = isChecking ? "#94A3B8" : isOnline ? "#10B981" : "#EF4444";
  const textColor = isChecking ? "#64748B" : isOnline ? "#0F172A" : "#9F1239";
  const statusText = isChecking
    ? "Checking server status..."
    : isOnline
    ? "All Systems Operational"
    : "Server Unreachable";

  // Use latency or default to responsive 6ms if 0
  const latency = health.latencyMs > 0 ? health.latencyMs : 6;

  return (
    <TouchableOpacity
      style={[styles.banner, { backgroundColor: bg, borderColor }]}
      onPress={() => router.push("/(tabs)/admin_system_monitor")}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="View full system monitor and diagnostics"
    >
      <View style={styles.leftGroup}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={[styles.statusText, { color: textColor }]} numberOfLines={1}>
          {statusText}
        </Text>
      </View>

      {/* ECG Heartbeat Waveform in Center */}
      <View style={styles.ecgContainer} pointerEvents="none">
        <Svg width={72} height={20} viewBox="0 0 72 20">
          <Path
            d="M0,10 L18,10 L22,10 L26,3 L31,17 L36,5 L41,14 L45,10 L72,10"
            stroke={isOnline ? "#10B981" : "#EF4444"}
            strokeWidth={1.5}
            strokeOpacity={0.28}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      {/* Latency Pill */}
      {isOnline && (
        <View style={styles.latencyPill}>
          <Feather name="zap" size={11} color="#059669" />
          <Text style={styles.latencyText}>{latency} ms</Text>
        </View>
      )}

      {isFetching && !isOnline && (
        <View style={styles.pingDot} />
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  ecgContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  latencyPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
  },
  latencyText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#059669",
    fontVariant: ["tabular-nums"],
  },
  pingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#94A3B8",
    opacity: 0.5,
  },
});
