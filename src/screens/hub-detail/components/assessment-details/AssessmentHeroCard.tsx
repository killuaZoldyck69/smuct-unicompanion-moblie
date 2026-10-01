import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AssessmentData, AssessmentTypeConfig } from "./types";
import { formatDueDate } from "./utils";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface AssessmentHeroCardProps {
  assessment: AssessmentData;
  typeConfig: AssessmentTypeConfig;
  statusLabel: string;
  isOverdue: boolean;
}

export const AssessmentHeroCard: React.FC<AssessmentHeroCardProps> = React.memo(
  ({ assessment, typeConfig, statusLabel, isOverdue }) => {
    return (
      <View style={styles.cardContainer}>
        {/* Top Icon and Type Pill */}
        <View style={styles.topRow}>
          <View
            style={[
              styles.typeIconContainer,
              {
                backgroundColor: typeConfig.iconBg,
                borderColor: typeConfig.iconBorder,
              },
            ]}
          >
            <Feather name={typeConfig.icon} size={20} color={typeConfig.iconColor} />
          </View>

          <View style={[styles.typeBadgePill, { backgroundColor: typeConfig.badgeBg }]}>
            <Text style={[styles.typeBadgeText, { color: typeConfig.badgeText }]}>
              {typeConfig.label}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.titleText}>{assessment.title}</Text>

        {/* Description */}
        {assessment.description ? (
          <Text style={styles.descriptionText}>{assessment.description}</Text>
        ) : null}

        {/* 3 Metric Cards: Max Marks | Due Date | Status */}
        <View style={styles.metricsRow}>
          {/* Max Marks */}
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Max Marks</Text>
            <Text style={styles.metricValue}>{assessment.totalMarks}</Text>
          </View>

          {/* Due Date */}
          <View style={[styles.metricBox, { flex: 1.5 }]}>
            <Text style={styles.metricLabel}>Due Date</Text>
            <Text style={styles.metricValue} numberOfLines={1}>
              {formatDueDate(assessment.deadline)}
            </Text>
          </View>

          {/* Status */}
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Status</Text>
            <View
              style={[
                styles.statusPill,
                isOverdue ? styles.statusPillClosed : styles.statusPillPublished,
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  isOverdue
                    ? styles.statusPillTextClosed
                    : styles.statusPillTextPublished,
                ]}
              >
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  typeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  typeBadgePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  typeBadgeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
  },
  titleText: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 24,
    marginBottom: 8,
  },
  descriptionText: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
    lineHeight: 19,
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.04)",
  },
  metricLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 4,
  },
  metricValue: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    alignSelf: "flex-start",
  },
  statusPillPublished: {
    backgroundColor: "#ecfdf5",
  },
  statusPillClosed: {
    backgroundColor: "#fff1f2",
  },
  statusPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
  },
  statusPillTextPublished: {
    color: "#059669",
  },
  statusPillTextClosed: {
    color: "#e11d48",
  },
});
