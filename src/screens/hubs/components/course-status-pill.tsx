import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { fontFamily } from "../constants";
import { CourseVisualTheme } from "../theme/course-theme-types";

const COURSEWORK_ICONS = {
  assignment: require("@/assets/icons/assignment.png"),
  quiz: require("@/assets/icons/quiz.png"),
  presentation: require("@/assets/icons/presentation.png"),
} as const;

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

    const typeStr = (upcomingAssessment.type || "").toUpperCase();
    const isQuiz = typeStr.includes("QUIZ") || typeStr.includes("CT");
    const isPresentation = typeStr.includes("PRESENTATION");

    const courseworkAsset = isQuiz
      ? COURSEWORK_ICONS.quiz
      : isPresentation
        ? COURSEWORK_ICONS.presentation
        : COURSEWORK_ICONS.assignment;

    const squircleBg = isDueSoon
      ? "#fee2e2"
      : isQuiz
        ? "#eff6ff"
        : isPresentation
          ? "#ecfdf5"
          : "#e0f2fe";

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
        {/* Coursework Squircle Icon Box */}
        <View
          style={[
            styles.taskIconBox,
            { backgroundColor: squircleBg },
          ]}
        >
          <Image
            source={courseworkAsset}
            style={styles.courseworkIconImage}
            resizeMode="contain"
          />
        </View>

        {/* Task Title */}
        <Text style={styles.taskTitle} numberOfLines={1}>
          {upcomingAssessment.title}
        </Text>

        {/* Right Section: Blue Countdown Pill */}
        {timeLeft ? (
          <View
            style={[
              styles.timeBadge,
              { backgroundColor: isDueSoon ? "#dc2626" : "#1d72fe" },
            ]}
          >
            <Feather name="clock" size={12} color="#ffffff" />
            <Text style={styles.timeBadgeText}>{timeLeft}</Text>
          </View>
        ) : null}
      </View>
    );
  }

  // All caught up state matching the pill design
  return (
    <View
      style={[
        styles.caughtUpContainer,
        { backgroundColor: theme.caughtUpBg || "#dbeafe" },
      ]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel="All caught up, no pending tasks"
    >
      <Feather
        name="check-circle"
        size={14}
        color={theme.caughtUpText || "#0284c7"}
      />
      <Text
        style={[
          styles.caughtUpText,
          { color: theme.caughtUpText || "#0284c7" },
        ]}
      >
        All caught up
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  // Active Assessment Status Card
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 6.5,
    paddingHorizontal: 10,
    borderWidth: 1,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  taskNormalBorder: {
    borderColor: "rgba(15, 23, 42, 0.04)",
  },
  taskDueSoonBorder: {
    borderColor: "rgba(220, 38, 38, 0.25)",
  },
  taskIconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  courseworkIconImage: {
    width: 20,
    height: 20,
  },
  taskTitle: {
    flex: 1,
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0f172a",
    marginRight: 8,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 16,
    gap: 4,
  },
  timeBadgeText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
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
    fontSize: 12.5,
    fontWeight: "700",
  },
});
