// src/screens/exams/components/exam-routine-header.tsx
import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { ExamTheme, fontFamily } from "../theme";

interface HeaderProps {
  theme: ExamTheme;
}

export const ExamRoutineHeader = React.memo(function ExamRoutineHeader({
  theme,
}: HeaderProps) {
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.topRow}>
        {/* Left: Title + subtitle */}
        <View style={styles.titleGroup}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Exam Routines
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Upcoming midterms & finals schedule
          </Text>
        </View>

        {/* Right: Exam study illustration matching Explore header style */}
        <View style={styles.illustrationWrap} pointerEvents="none">
          <Image
            source={require("@/assets/header-bg-images/exam-routine-screen-bg.png")}
            style={styles.illustration}
            resizeMode="contain"
            accessible={false}
          />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  titleGroup: {
    flex: 1,
    paddingTop: 6,
  },
  title: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 7,
  },
  illustrationWrap: {
    width: 116,
    height: 66,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -4,
  },
  illustration: {
    width: 135,
    height: 90,
    opacity: 0.8,
  },
});
