// src/screens/exams/components/exam-status-badge.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ExamTimingStatus } from "../types";
import { ExamTheme, fontFamily } from "../theme";

interface StatusBadgeProps {
  status: ExamTimingStatus;
  theme: ExamTheme;
  isFinal?: boolean;
}

export const ExamStatusBadge = React.memo(function ExamStatusBadge({
  status,
  theme,
  isFinal = false,
}: StatusBadgeProps) {
  let label = "UPCOMING";
  let bg = isFinal ? theme.lavenderBg : theme.softBlueBg;
  let textColor = isFinal ? theme.lavenderText : theme.softBlueText;

  switch (status) {
    case "inProgress":
      label = "IN PROGRESS";
      bg = theme.mintBg;
      textColor = theme.mintText;
      break;
    case "startingSoon":
      label = "STARTING SOON";
      bg = theme.amberBg;
      textColor = theme.amberText;
      break;
    case "today":
      label = "TODAY";
      bg = theme.amberBg;
      textColor = theme.amberText;
      break;
    case "completed":
      label = "COMPLETED";
      bg = theme.completedBg;
      textColor = theme.completedText;
      break;
    case "upcoming":
    default:
      label = "UPCOMING";
      bg = isFinal ? theme.lavenderBg : theme.softBlueBg;
      textColor = isFinal ? theme.lavenderText : theme.softBlueText;
      break;
  }

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 9999,
  },
  text: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
});
