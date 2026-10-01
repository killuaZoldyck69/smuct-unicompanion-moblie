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
  statusLabel?: string;
  isOverdue?: boolean;
}

export const AssessmentHeroCard: React.FC<AssessmentHeroCardProps> = React.memo(
  ({ assessment, typeConfig }) => {
    const isHand =
      assessment.submissionType === "HAND" ||
      assessment.submissionType === "OFFLINE";

    return (
      <View style={styles.cardContainer}>
        {/* Top Icon, Type Pill, and Submission Method Pill */}
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

          {/* Submission Method Badge */}
          <View
            style={[
              styles.methodBadgePill,
              isHand ? styles.methodBadgePillHand : styles.methodBadgePillOnline,
            ]}
          >
            <Feather
              name={isHand ? "clipboard" : "globe"}
              size={12}
              color={isHand ? "#b45309" : "#0284c7"}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.methodBadgeText,
                { color: isHand ? "#b45309" : "#0284c7" },
              ]}
            >
              {isHand ? "In-Hand" : "Online"}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.titleText}>{assessment.title}</Text>

        {/* Description */}
        {assessment.description ? (
          <Text style={styles.descriptionText}>{assessment.description}</Text>
        ) : null}

        {/* 2 Metric Cards: Max Marks & Due Date */}
        <View style={styles.metricsRow}>
          {/* Max Marks */}
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Max Marks</Text>
            <Text style={styles.metricValue}>{assessment.totalMarks}</Text>
          </View>

          {/* Due Date & Time */}
          <View style={[styles.metricBox, styles.dueMetricBox]}>
            <Text style={styles.metricLabel}>Due Date</Text>
            <View style={styles.metricRowContent}>
              <Feather
                name="clock"
                size={13}
                color="#64748b"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.metricValue}>
                {formatDueDate(assessment.deadline)}
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
    gap: 8,
    marginBottom: 10,
  },
  typeIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
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
  methodBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  methodBadgePillOnline: {
    backgroundColor: "#f0f9ff",
  },
  methodBadgePillHand: {
    backgroundColor: "#fef3c7",
  },
  methodBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
  },
  titleText: {
    fontFamily,
    fontSize: 19,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  descriptionText: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
    lineHeight: 19,
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.04)",
  },
  dueMetricBox: {
    flex: 1.8,
  },
  metricRowContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 3,
  },
  metricValue: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
});
