// src/screens/exams/components/exam-date-header.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ExamTheme, fontFamily } from "../theme";

interface DateHeaderProps {
  dateHeader: string;
  isToday: boolean;
  theme: ExamTheme;
}

export const ExamDateHeader = React.memo(function ExamDateHeader({
  dateHeader,
  isToday,
  theme,
}: DateHeaderProps) {
  return (
    <View style={styles.headerRow}>
      <Text
        style={[
          styles.headerText,
          { color: isToday ? theme.mintText : theme.textSecondary },
        ]}
      >
        {dateHeader}
      </Text>

      {isToday ? (
        <View
          style={[
            styles.todayBadge,
            {
              backgroundColor: theme.mintBg,
              borderColor: theme.mintBorder,
            },
          ]}
        >
          <Text style={[styles.todayBadgeText, { color: theme.mintText }]}>
            TODAY
          </Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  headerText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  todayBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
  },
  todayBadgeText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
});
