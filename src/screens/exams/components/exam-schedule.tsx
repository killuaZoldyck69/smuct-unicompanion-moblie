// src/screens/exams/components/exam-schedule.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { ExamItem } from "../types";
import { ExamTheme } from "../theme";
import { getExamTimingStatus } from "../utils";
import { ExamCard } from "./exam-card";

interface ExamScheduleProps {
  exams: ExamItem[];
  currentTime: Date;
  theme: ExamTheme;
}

export const ExamSchedule = React.memo(function ExamSchedule({
  exams,
  currentTime,
  theme,
}: ExamScheduleProps) {
  return (
    <View style={styles.cardsStack}>
      {exams.map((exam) => {
        const status = getExamTimingStatus(exam, currentTime);
        return (
          <ExamCard
            key={exam.id}
            exam={exam}
            status={status}
            theme={theme}
          />
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  cardsStack: {
    gap: 12,
  },
});
