// src/screens/exams/components/exam-card.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ExamItem, ExamTimingStatus } from "../types";
import { ExamTheme, fontFamily } from "../theme";
import { ExamStatusBadge } from "./exam-status-badge";

interface ExamCardProps {
  exam: ExamItem;
  status: ExamTimingStatus;
  theme: ExamTheme;
}

export const ExamCard = React.memo(function ExamCard({
  exam,
  status,
  theme,
}: ExamCardProps) {
  const isCompleted = status === "completed";
  const isFinal = exam.type.toLowerCase().includes("fin");

  // Left accent bar color matches reference design (Blue for Midterm, Lavender for Final, Gray for Completed)
  let accentBarColor = isFinal ? theme.lavender : theme.softBlue;
  if (isCompleted) {
    accentBarColor = theme.completedText;
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.cardBorder,
          opacity: isCompleted ? 0.65 : 1,
          ...theme.shadow,
        },
      ]}
    >
      {/* Left Accent Bar (3.5px thin elegant vertical stripe) */}
      <View
        style={[
          styles.leftAccentBar,
          { backgroundColor: accentBarColor },
        ]}
      />

      <View style={styles.cardContent}>
        {/* Row 1: 📅 Date (left) */}
        <View style={styles.row1}>
          <View style={styles.dateGroup}>
            <Feather
              name="calendar"
              size={12}
              color={theme.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.dateText, { color: theme.textSecondary }]}>
              {exam.formattedDateHeader}
            </Text>
          </View>
        </View>

        {/* Row 2: ◷ Time Range (left) and Status Badge (right) */}
        <View style={styles.row2}>
          <View style={styles.timeGroup}>
            <Feather
              name="clock"
              size={12}
              color={isCompleted ? theme.textMuted : theme.textPrimary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.timeText,
                { color: isCompleted ? theme.textSecondary : theme.textPrimary },
              ]}
            >
              {exam.startTime} – {exam.endTime}
            </Text>
          </View>

          <ExamStatusBadge status={status} theme={theme} isFinal={isFinal} />
        </View>

        {/* Row 3: Tags (Course Code Pill + Location Tag side by side) */}
        {exam.courseCode || exam.room ? (
          <View style={styles.tagsRow}>
            {exam.courseCode ? (
              <View
                style={[
                  styles.codePill,
                  {
                    backgroundColor: isCompleted
                      ? theme.completedBg
                      : theme.softBlueBg,
                    borderColor: isCompleted
                      ? "transparent"
                      : theme.softBlueBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.codeText,
                    {
                      color: isCompleted
                        ? theme.textMuted
                        : theme.softBlueText,
                    },
                  ]}
                >
                  {exam.courseCode}
                </Text>
              </View>
            ) : null}

            {exam.room ? (
              <View
                style={[
                  styles.roomPill,
                  {
                    backgroundColor: isCompleted
                      ? theme.completedBg
                      : theme.surfaceMuted,
                    borderColor: isCompleted
                      ? "transparent"
                      : theme.cardBorder,
                  },
                ]}
              >
                <Feather
                  name="map-pin"
                  size={10.5}
                  color={isCompleted ? theme.textMuted : theme.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.roomText,
                    {
                      color: isCompleted
                        ? theme.textMuted
                        : theme.textSecondary,
                    },
                  ]}
                >
                  {exam.room}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Row 4: Course Title */}
        <Text
          style={[
            styles.courseTitle,
            { color: isCompleted ? theme.textSecondary : theme.textPrimary },
          ]}
          numberOfLines={2}
        >
          {exam.courseName}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  leftAccentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
  },
  cardContent: {
    paddingLeft: 16,
    paddingRight: 14,
    paddingTop: 12,
    paddingBottom: 13,
  },
  row1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  dateGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  row2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  timeGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  codePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  codeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  roomPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  roomText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  courseTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 21,
    letterSpacing: -0.3,
  },
});
