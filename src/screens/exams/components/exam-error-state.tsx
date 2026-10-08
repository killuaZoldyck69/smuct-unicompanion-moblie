// src/screens/exams/components/exam-error-state.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ExamTheme, fontFamily } from "../theme";

interface ErrorStateProps {
  onRetry: () => void;
  theme: ExamTheme;
}

export const ExamErrorState = React.memo(function ExamErrorState({
  onRetry,
  theme,
}: ErrorStateProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.cardBorder,
          ...theme.shadow,
        },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: theme.isDark
              ? "rgba(220, 38, 38, 0.15)"
              : "#fee2e2",
          },
        ]}
      >
        <Feather name="alert-circle" size={30} color="#dc2626" />
      </View>
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        Unable to load exam schedule
      </Text>
      <Text style={[styles.desc, { color: theme.textSecondary }]}>
        Please check your network connection and try again.
      </Text>
      <TouchableOpacity
        style={[styles.retryBtn, { backgroundColor: theme.deepNavy }]}
        onPress={onRetry}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Retry loading exam routines"
      >
        <Feather
          name="refresh-cw"
          size={14}
          color="#ffffff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.retryBtnText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: "center",
    marginTop: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
    textAlign: "center",
  },
  desc: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  retryBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
