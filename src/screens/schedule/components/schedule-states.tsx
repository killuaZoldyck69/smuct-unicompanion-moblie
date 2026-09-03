import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BENTO_COLORS, fontFamily } from "../constants";

export const ScheduleSkeleton = React.memo(function ScheduleSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonHeader} />
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonPill} />
          <View style={[styles.skeletonPill, { width: 60 }]} />
        </View>
        <View style={styles.skeletonTimeBar} />
        <View style={styles.skeletonTitleBar} />
        <View style={styles.skeletonFooterBar} />
      </View>
      <View style={[styles.skeletonCard, { marginTop: 14 }]}>
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonPill} />
          <View style={[styles.skeletonPill, { width: 50 }]} />
        </View>
        <View style={styles.skeletonTimeBar} />
        <View style={styles.skeletonTitleBar} />
        <View style={styles.skeletonFooterBar} />
      </View>
    </View>
  );
});

interface ScheduleErrorProps {
  onRetry: () => void;
}

export const ScheduleError = React.memo(function ScheduleError({
  onRetry,
}: ScheduleErrorProps) {
  return (
    <View style={styles.card}>
      <View style={styles.errorIconCircle}>
        <Feather name="alert-circle" size={32} color="#dc2626" />
      </View>
      <Text style={styles.title}>Couldn't load your schedule</Text>
      <Text style={styles.desc}>
        We couldn't connect to retrieve your weekly routines. Please check your connection.
      </Text>
      <TouchableOpacity
        style={styles.retryBtn}
        onPress={onRetry}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Retry loading class schedule"
      >
        <Feather
          name="refresh-cw"
          size={14}
          color="#ffffff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.retryBtnText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
});

interface ScheduleEmptyProps {
  selectedDay: string;
  onResetDay: () => void;
}

export const ScheduleEmpty = React.memo(function ScheduleEmpty({
  selectedDay,
  onResetDay,
}: ScheduleEmptyProps) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.emptyIconCircle}>
        <Feather name="coffee" size={36} color="#64748b" />
      </View>
      <Text style={styles.title}>
        {selectedDay !== "ALL"
          ? `No classes on ${selectedDay}`
          : "No classes scheduled"}
      </Text>
      <Text style={styles.desc}>
        {selectedDay !== "ALL"
          ? "Enjoy your free day or review materials from other courses."
          : "Join your semester course hubs to automatically build your routine."}
      </Text>
      {selectedDay !== "ALL" ? (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onResetDay}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="View entire week"
        >
          <Text style={styles.actionBtnText}>View Full Week</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push("/(tabs)/hubs")}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Explore Course Hubs"
        >
          <Text style={styles.actionBtnText}>Explore Hubs</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.neutralText,
    marginBottom: 8,
    textAlign: "center",
  },
  desc: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  retryBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  actionBtn: {
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  actionBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  skeletonContainer: {
    paddingVertical: 8,
  },
  skeletonHeader: {
    width: 120,
    height: 20,
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    marginBottom: 14,
  },
  skeletonCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
  },
  skeletonRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  skeletonPill: {
    width: 70,
    height: 22,
    backgroundColor: "#f1f5f9",
    borderRadius: 11,
  },
  skeletonTimeBar: {
    width: 140,
    height: 24,
    backgroundColor: "#e2e8f0",
    borderRadius: 6,
    marginBottom: 10,
  },
  skeletonTitleBar: {
    width: "80%",
    height: 18,
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    marginBottom: 14,
  },
  skeletonFooterBar: {
    width: 90,
    height: 22,
    backgroundColor: "#f1f5f9",
    borderRadius: 11,
  },
});
