// src/screens/exams/components/countdown-display.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ExamCountdownInfo } from "../types";
import { ExamTheme, fontFamily } from "../theme";

interface CountdownProps {
  countdown: ExamCountdownInfo;
  theme: ExamTheme;
}

export const CountdownDisplay = React.memo(function CountdownDisplay({
  countdown,
  theme,
}: CountdownProps) {
  // 1. In Progress
  if (countdown.status === "inProgress") {
    return (
      <View
        style={[
          styles.inProgressBadge,
          {
            backgroundColor: theme.mintBg,
            borderColor: theme.mintBorder,
          },
        ]}
      >
        <View style={[styles.pulseDot, { backgroundColor: theme.mint }]} />
        <Text style={[styles.inProgressText, { color: theme.mintText }]}>
          Exam in progress
        </Text>
      </View>
    );
  }

  // 2. Starting Now
  if (countdown.diffMinutes <= 0 && countdown.status === "startingSoon") {
    return (
      <View
        style={[
          styles.inProgressBadge,
          {
            backgroundColor: theme.amberBg,
            borderColor: theme.amberBorder,
          },
        ]}
      >
        <View style={[styles.pulseDot, { backgroundColor: theme.amber }]} />
        <Text style={[styles.inProgressText, { color: theme.amberText }]}>
          Starting now
        </Text>
      </View>
    );
  }

  // 3. Less than 1 hour (< 60 mins)
  if (countdown.days === 0 && countdown.hours === 0 && countdown.minutes > 0) {
    return (
      <View style={styles.blocksRow}>
        <View
          style={[
            styles.countdownUnitBlock,
            {
              backgroundColor: theme.amberBg,
              borderColor: theme.amberBorder,
            },
          ]}
        >
          <Text style={[styles.countdownValue, { color: theme.amberText }]}>
            {String(countdown.minutes).padStart(2, "0")}
          </Text>
          <Text style={[styles.countdownUnitText, { color: theme.amberText }]}>
            Minutes
          </Text>
        </View>
      </View>
    );
  }

  // 4. Less than 24 hours (hours and minutes)
  if (countdown.days === 0 && countdown.hours > 0) {
    return (
      <View style={styles.blocksRow}>
        <View
          style={[
            styles.countdownUnitBlock,
            {
              backgroundColor: theme.mintBg,
              borderColor: theme.mintBorder,
            },
          ]}
        >
          <Text style={[styles.countdownValue, { color: theme.mintText }]}>
            {String(countdown.hours).padStart(2, "0")}
          </Text>
          <Text style={[styles.countdownUnitText, { color: theme.textSecondary }]}>
            Hours
          </Text>
        </View>

        <Text style={[styles.colonSeparator, { color: theme.textMuted }]}>:</Text>

        <View
          style={[
            styles.countdownUnitBlock,
            {
              backgroundColor: theme.mintBg,
              borderColor: theme.mintBorder,
            },
          ]}
        >
          <Text style={[styles.countdownValue, { color: theme.mintText }]}>
            {String(countdown.minutes).padStart(2, "0")}
          </Text>
          <Text style={[styles.countdownUnitText, { color: theme.textSecondary }]}>
            Minutes
          </Text>
        </View>
      </View>
    );
  }

  // 5. More than 1 day: Days, Hours, Minutes
  return (
    <View style={styles.blocksRow}>
      <View
        style={[
          styles.countdownUnitBlock,
          {
            backgroundColor: theme.mintBg,
            borderColor: theme.mintBorder,
          },
        ]}
      >
        <Text style={[styles.countdownValue, { color: theme.mintText }]}>
          {String(countdown.days).padStart(2, "0")}
        </Text>
        <Text style={[styles.countdownUnitText, { color: theme.textSecondary }]}>
          Days
        </Text>
      </View>

      <Text style={[styles.colonSeparator, { color: theme.textMuted }]}>:</Text>

      <View
        style={[
          styles.countdownUnitBlock,
          {
            backgroundColor: theme.mintBg,
            borderColor: theme.mintBorder,
          },
        ]}
      >
        <Text style={[styles.countdownValue, { color: theme.mintText }]}>
          {String(countdown.hours).padStart(2, "0")}
        </Text>
        <Text style={[styles.countdownUnitText, { color: theme.textSecondary }]}>
          Hours
        </Text>
      </View>

      <Text style={[styles.colonSeparator, { color: theme.textMuted }]}>:</Text>

      <View
        style={[
          styles.countdownUnitBlock,
          {
            backgroundColor: theme.mintBg,
            borderColor: theme.mintBorder,
          },
        ]}
      >
        <Text style={[styles.countdownValue, { color: theme.mintText }]}>
          {String(countdown.minutes).padStart(2, "0")}
        </Text>
        <Text style={[styles.countdownUnitText, { color: theme.textSecondary }]}>
          Minutes
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  blocksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countdownUnitBlock: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    minWidth: 56,
  },
  countdownValue: {
    fontFamily,
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  countdownUnitText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 1,
  },
  colonSeparator: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    marginTop: -8,
  },
  inProgressBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    gap: 7,
    alignSelf: "flex-start",
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  inProgressText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
  },
});
