import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { SystemHealth } from "../hooks/use-admin-dashboard";
import { FONT_FAMILIES } from "@/theme/typography";

interface SystemStatusBannerProps {
  health: SystemHealth;
  isFetching: boolean;
}

export const SystemStatusBanner = React.memo(function SystemStatusBanner({
  health,
  isFetching,
}: SystemStatusBannerProps) {
  const router = useRouter();
  const isChecking = health.status === "checking";
  const isDegraded = !isChecking && health.isOnline && health.isDegraded;
  const isOperational = !isChecking && health.isOnline && !health.isDegraded;

  const bg = isChecking
    ? "#F8FAFC"
    : isOperational
      ? "#F0FDF8"
      : isDegraded
        ? "#FFFBEB"
        : "#FFF1F2";
  const borderColor = isChecking
    ? "#E2E8F0"
    : isOperational
      ? "#D1FAE5"
      : isDegraded
        ? "#FDE68A"
        : "#FECDD3";
  const dotColor = isChecking
    ? "#94A3B8"
    : isOperational
      ? "#10B981"
      : isDegraded
        ? "#F59E0B"
        : "#EF4444";
  const textColor = isChecking
    ? "#64748B"
    : isOperational
      ? "#0F172A"
      : isDegraded
        ? "#92400E"
        : "#9F1239";
  const statusText = isChecking
    ? "Checking server status..."
    : isOperational
      ? "All Systems Operational"
      : isDegraded
        ? "Database Unavailable"
        : "Server Unreachable";

  const waveformColor = isOperational
    ? "#10B981"
    : isDegraded
      ? "#F59E0B"
      : "#EF4444";

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
        <Svg width={56} height={18} viewBox="0 0 72 20">
          <Path
            d="M0,10 L18,10 L22,10 L26,3 L31,17 L36,5 L41,14 L45,10 L72,10"
            stroke={waveformColor}
            strokeWidth={1.5}
            strokeOpacity={0.28}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      {/* Latency Pill */}
      {health.isOnline && health.latencyMs > 0 && (
        <View
          style={[
            styles.latencyPill,
            isDegraded && { backgroundColor: "#FEF3C7" },
          ]}
        >
          <Feather
            name="zap"
            size={11}
            color={isDegraded ? "#B45309" : "#059669"}
          />
          <Text
            style={[
              styles.latencyText,
              isDegraded && { color: "#B45309" },
            ]}
          >
            {health.latencyMs} ms
          </Text>
        </View>
      )}

      {isFetching && !health.isOnline && (
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
    gap: 8,
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
    borderWidth: 1,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  statusText: {
    fontFamily: FONT_FAMILIES.bodyBold,
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: "700",
    letterSpacing: -0.15,
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
    fontFamily: FONT_FAMILIES.bodyExtraBold,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    color: "#059669",
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  pingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#94A3B8",
    opacity: 0.5,
  },
});
