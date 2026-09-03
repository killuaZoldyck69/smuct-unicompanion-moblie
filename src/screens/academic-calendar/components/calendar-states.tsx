import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";

export const CalendarLoadingState = React.memo(function CalendarLoadingState() {
  return (
    <View style={styles.centerBox}>
      <ActivityIndicator size="large" color={BENTO_COLORS.deepNavy} />
      <Text style={styles.loadingLabel}>Loading Academic Schedule...</Text>
    </View>
  );
});

interface CalendarErrorStateProps {
  onRetry: () => void;
}

export const CalendarErrorState = React.memo(function CalendarErrorState({
  onRetry,
}: CalendarErrorStateProps) {
  return (
    <View style={styles.centerBox}>
      <View style={styles.errorIconCircle}>
        <Feather name="alert-circle" size={32} color="#dc2626" />
      </View>
      <Text style={styles.stateTitle}>Unable to Load Schedule</Text>
      <Text style={styles.stateDesc}>
        Please check your network connection and try again.
      </Text>
      <TouchableOpacity
        style={styles.retryPill}
        onPress={onRetry}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Retry loading calendar"
      >
        <Feather
          name="refresh-cw"
          size={14}
          color="#ffffff"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.retryPillText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
});

export const CalendarEmptyState = React.memo(function CalendarEmptyState() {
  return (
    <View style={styles.centerBox}>
      <View style={styles.emptyIconCircle}>
        <Feather name="calendar" size={36} color={BENTO_COLORS.subtleText} />
      </View>
      <Text style={styles.stateTitle}>No Active Calendar</Text>
      <Text style={styles.stateDesc}>
        There is currently no published academic calendar for your semester.
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  centerBox: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
    marginTop: 10,
  },
  loadingLabel: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
    marginTop: 14,
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
  stateTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.neutralText,
    marginBottom: 8,
    textAlign: "center",
  },
  stateDesc: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  retryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  retryPillText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
