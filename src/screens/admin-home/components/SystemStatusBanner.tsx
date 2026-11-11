import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { SystemHealth } from "../hooks/use-admin-dashboard";
import { FONT_FAMILIES } from "@/theme/typography";
import { colors } from "@/theme/colors";

interface SystemStatusBannerProps {
  health: SystemHealth;
  isFetching: boolean;
}

type StatusKey = "checking" | "operational" | "degraded" | "unreachable";

const STATUS_THEMES: Record<
  StatusKey,
  {
    bg: string;
    borderColor: string;
    dotColor: string;
    textColor: string;
    waveformColor: string;
    label: string;
  }
> = {
  checking: {
    bg: colors.slate50,
    borderColor: colors.slate200,
    dotColor: colors.slate400,
    textColor: colors.slate500,
    waveformColor: colors.semantic.red.solid,
    label: "Checking server status...",
  },
  operational: {
    bg: colors.semantic.emerald.softSurface,
    borderColor: colors.semantic.emerald.border,
    dotColor: colors.semantic.emerald.solid,
    textColor: colors.navyInk,
    waveformColor: colors.semantic.emerald.solid,
    label: "All Systems Operational",
  },
  degraded: {
    bg: colors.semantic.amber.tint,
    borderColor: colors.semantic.amber.border,
    dotColor: colors.semantic.amber.solid,
    textColor: colors.semantic.amber.darkText,
    waveformColor: colors.semantic.amber.solid,
    label: "Database Unavailable",
  },
  unreachable: {
    bg: colors.semantic.rose.tint,
    borderColor: colors.semantic.rose.border,
    dotColor: colors.semantic.red.solid,
    textColor: colors.semantic.rose.darkText,
    waveformColor: colors.semantic.red.solid,
    label: "Server Unreachable",
  },
};

export const SystemStatusBanner = React.memo(function SystemStatusBanner({
  health,
  isFetching,
}: SystemStatusBannerProps) {
  const router = useRouter();
  const isChecking = health.status === "checking";
  const isDegraded = !isChecking && health.isOnline && health.isDegraded;
  const isOperational = !isChecking && health.isOnline && !health.isDegraded;

  const statusKey: StatusKey = isChecking
    ? "checking"
    : isOperational
      ? "operational"
      : isDegraded
        ? "degraded"
        : "unreachable";

  const { bg, borderColor, dotColor, textColor, waveformColor, label: statusText } =
    STATUS_THEMES[statusKey];

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
            isDegraded && styles.latencyPillDegraded,
          ]}
        >
          <Feather
            name="zap"
            size={11}
            color={
              isDegraded
                ? colors.semantic.amber.deep
                : colors.semantic.emerald.accent
            }
          />
          <Text
            style={[
              styles.latencyText,
              isDegraded && styles.latencyTextDegraded,
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
    backgroundColor: colors.semantic.emerald.border,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
  },
  latencyPillDegraded: {
    backgroundColor: colors.semantic.amber.soft,
  },
  latencyText: {
    fontFamily: FONT_FAMILIES.bodyExtraBold,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    color: colors.semantic.emerald.accent,
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  latencyTextDegraded: {
    color: colors.semantic.amber.deep,
  },
  pingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.slate400,
    opacity: 0.5,
  },
});
