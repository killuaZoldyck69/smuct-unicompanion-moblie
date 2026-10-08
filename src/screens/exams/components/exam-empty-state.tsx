// src/screens/exams/components/exam-empty-state.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ExamTabType } from "../types";
import { ExamTheme, fontFamily } from "../theme";
import { AcademicEmptyIllustration } from "./academic-illustration";

interface EmptyStateProps {
  selectedTab: ExamTabType;
  hasAnyExams: boolean;
  theme: ExamTheme;
}

export const ExamEmptyState = React.memo(function ExamEmptyState({
  selectedTab,
  hasAnyExams,
  theme,
}: EmptyStateProps) {
  let title = "No midterms scheduled";
  let desc = "There are currently no midterm exams published for your enrolled courses.";

  if (!hasAnyExams) {
    title = "All clear";
    desc = "No upcoming exams are scheduled for your courses.";
  } else if (selectedTab === "Finals") {
    title = "No finals scheduled";
    desc = "There are currently no final exams published for your enrolled courses.";
  }

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
      <AcademicEmptyIllustration theme={theme} />
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.desc, { color: theme.textSecondary }]}>{desc}</Text>
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
    marginTop: 4,
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
    paddingHorizontal: 10,
  },
});
