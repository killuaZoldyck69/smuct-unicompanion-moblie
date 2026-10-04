import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { fontFamily } from "../constants";
import { CourseVisualTheme } from "../theme/course-theme-types";

interface CourseStatusPillProps {
  upcomingAssessment?: {
    id?: string;
    title: string;
    type?: string;
    deadline?: string | Date;
  } | null;
  timeLeft?: string;
  theme: CourseVisualTheme;
}

export const CourseStatusPill = React.memo(function CourseStatusPill({
  upcomingAssessment,
  timeLeft,
  theme,
}: CourseStatusPillProps) {
  if (upcomingAssessment) {
    const isDueSoon =
      timeLeft?.includes("Due now") ||
      timeLeft?.includes("m left") ||
      timeLeft?.includes("1h") ||
      timeLeft?.includes("2h");

    const iconName =
      upcomingAssessment.type === "QUIZ"
        ? "help-circle"
        : upcomingAssessment.type === "PRESENTATION"
          ? "airplay"
          : "file-text";

    return (
      <View
        style={[
          styles.taskContainer,
          isDueSoon ? styles.taskDueSoonBorder : styles.taskNormalBorder,
        ]}
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel={`Upcoming task: ${upcomingAssessment.title}${timeLeft ? `, ${timeLeft}` : ""}`}
      >
        <View
          style={[
            styles.taskIconBox,
            { backgroundColor: isDueSoon ? "#fee2e2" : "#f1f5f9" },
          ]}
        >
          <Feather
            name={iconName}
            size={13}
            color={isDueSoon ? "#dc2626" : "#475569"}
          />
        </View>

        <Text style={styles.taskTitle} numberOfLines={1}>
          {upcomingAssessment.title}
        </Text>

        {timeLeft ? (
          <View
            style={[
              styles.timeBadge,
              { backgroundColor: isDueSoon ? "#dc2626" : "#0284c7" },
            ]}
          >
            <Text style={styles.timeBadgeText}>{timeLeft}</Text>
          </View>
        ) : null}
      </View>
    );
  }

  // All caught up state
  return (
    <View
      style={[styles.caughtUpContainer, { backgroundColor: theme.caughtUpBg }]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel="All caught up, no pending tasks"
    >
      <Feather name="check-circle" size={13} color={theme.caughtUpText} />
      <Text style={[styles.caughtUpText, { color: theme.caughtUpText }]}>
        All caught up
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  // Active Assessment Status Pill
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 9,
    gap: 8,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  taskNormalBorder: {
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.07)",
  },
  taskDueSoonBorder: {
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.2)",
  },
  taskIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  taskTitle: {
    flex: 1,
    fontFamily,
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0f172a",
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  timeBadgeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: "#ffffff",
  },

  // "All Caught Up" Pill
  caughtUpContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 6.5,
    paddingHorizontal: 11,
    gap: 6,
    alignSelf: "flex-start",
  },
  caughtUpText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
  },
});
