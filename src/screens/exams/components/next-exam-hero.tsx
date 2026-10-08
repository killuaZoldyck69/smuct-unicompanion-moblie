// src/screens/exams/components/next-exam-hero.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ExamItem, HeroTimingStatus, ExamCountdownInfo } from "../types";
import { ExamTheme, fontFamily } from "../theme";
import { HeroAcademicIllustration, AcademicEmptyIllustration } from "./academic-illustration";

interface NextExamHeroProps {
  nextExam: ExamItem | null;
  heroStatus: HeroTimingStatus;
  countdown: ExamCountdownInfo;
  theme: ExamTheme;
}

export const NextExamHero = React.memo(function NextExamHero({
  nextExam,
  heroStatus,
  countdown,
  theme,
}: NextExamHeroProps) {
  // If no upcoming exam exists: STRICT REQUIREMENT: Show ALL CLEAR, never "NEXT EXAM + COMPLETED"
  if (!nextExam) {
    return (
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.cardBorder,
            ...theme.heroShadow,
          },
        ]}
      >
        <AcademicEmptyIllustration theme={theme} />
        <Text style={[styles.allClearTitle, { color: theme.textPrimary }]}>
          All Clear
        </Text>
        <Text style={[styles.allClearDesc, { color: theme.textSecondary }]}>
          You have no upcoming exams scheduled. You're completely up to date!
        </Text>
      </View>
    );
  }

  const mintColor = theme.isDark ? "#2dd4bf" : "#059669";
  const mintBg = theme.isDark ? "rgba(45, 212, 191, 0.12)" : "#e6f8f2";
  const countdownBarBg = theme.isDark ? "rgba(45, 212, 191, 0.08)" : "#f0fdf9";

  return (
    <View
      style={[
        styles.heroCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.cardBorder,
          ...theme.heroShadow,
        },
      ]}
    >
      {/* 1. Left green vertical accent bar matching screenshot */}
      <View
        style={[
          styles.leftAccentBar,
          { backgroundColor: mintColor },
        ]}
      />

      {/* 2. Device & Books Illustration on right */}
      <HeroAcademicIllustration theme={theme} />

      <View style={styles.cardContent}>
        {/* 3. Top Row: 📅 NEXT EXAM Pill */}
        <View style={styles.topRow}>
          <View
            style={[
              styles.heroBadgePill,
              { backgroundColor: mintBg },
            ]}
          >
            <Feather
              name="calendar"
              size={12}
              color={mintColor}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.heroBadgeText, { color: mintColor }]}>
              {heroStatus}
            </Text>
          </View>
        </View>

        {/* 4. Course Title */}
        <Text
          style={[styles.courseTitle, { color: theme.textPrimary }]}
          numberOfLines={2}
        >
          {nextExam.courseName}
        </Text>

        {/* 5. Course Code Pill */}
        {nextExam.courseCode ? (
          <View style={styles.codeRow}>
            <View
              style={[
                styles.codePill,
                {
                  backgroundColor: theme.isDark
                    ? "rgba(96, 165, 250, 0.15)"
                    : "#eff6ff",
                },
              ]}
            >
              <Text
                style={[
                  styles.codeText,
                  { color: theme.isDark ? "#93c5fd" : "#2563eb" },
                ]}
              >
                {nextExam.courseCode}
              </Text>
            </View>
          </View>
        ) : null}

        {/* 6. Date & Time Row */}
        <View style={styles.metaRow}>
          <Feather
            name="calendar"
            size={13}
            color={theme.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>
            {nextExam.formattedHeroDate}  ·  {nextExam.startTime}
          </Text>
        </View>

        {/* 7. Room Location */}
        <View style={styles.roomRow}>
          <Feather
            name="map-pin"
            size={13}
            color={theme.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>
            {nextExam.room}
          </Text>
        </View>

        {/* 8. Bottom "Starts in" Section matching screenshot */}
        <View
          style={[
            styles.countdownBar,
            { backgroundColor: countdownBarBg },
          ]}
        >
          <View style={styles.startsInGroup}>
            <Feather
              name="clock"
              size={15}
              color={mintColor}
              style={{ marginRight: 7 }}
            />
            <Text style={[styles.startsInText, { color: mintColor }]}>
              {countdown.status === "inProgress"
                ? "In progress"
                : countdown.status === "startingSoon" && countdown.diffMinutes <= 0
                ? "Starting now"
                : "Starts in"}
            </Text>
          </View>

          {countdown.status === "inProgress" ? (
            <Text style={[styles.inProgressLabel, { color: mintColor }]}>
              Exam is active
            </Text>
          ) : (
            <View style={styles.countdownColumnsRow}>
              {countdown.days > 0 ? (
                <>
                  <View style={styles.countdownCol}>
                    <Text
                      style={[styles.countdownNumber, { color: mintColor }]}
                    >
                      {String(countdown.days).padStart(2, "0")}
                    </Text>
                    <Text
                      style={[styles.countdownUnit, { color: theme.textSecondary }]}
                    >
                      Days
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.verticalDivider,
                      {
                        backgroundColor: theme.isDark
                          ? "rgba(255, 255, 255, 0.12)"
                          : "rgba(13, 148, 136, 0.18)",
                      },
                    ]}
                  />
                </>
              ) : null}

              <View style={styles.countdownCol}>
                <Text
                  style={[styles.countdownNumber, { color: mintColor }]}
                >
                  {String(countdown.hours).padStart(2, "0")}
                </Text>
                <Text
                  style={[styles.countdownUnit, { color: theme.textSecondary }]}
                >
                  Hours
                </Text>
              </View>

              <View
                style={[
                  styles.verticalDivider,
                  {
                    backgroundColor: theme.isDark
                      ? "rgba(255, 255, 255, 0.12)"
                      : "rgba(13, 148, 136, 0.18)",
                  },
                ]}
              />

              <View style={styles.countdownCol}>
                <Text
                  style={[styles.countdownNumber, { color: mintColor }]}
                >
                  {String(countdown.minutes).padStart(2, "0")}
                </Text>
                <Text
                  style={[styles.countdownUnit, { color: theme.textSecondary }]}
                >
                  Minutes
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    marginBottom: 16,
  },
  leftAccentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4.5,
  },
  cardContent: {
    paddingLeft: 18,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  heroBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 9999,
  },
  heroBadgeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  courseTitle: {
    fontFamily,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    lineHeight: 27,
    marginBottom: 5,
    paddingRight: 50, // Space so text doesn't overlap device illustration
  },
  codeRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  codePill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  codeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  metaText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
  },
  roomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  countdownBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
  },
  startsInGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  startsInText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
  },
  inProgressLabel: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "700",
  },
  countdownColumnsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  countdownCol: {
    alignItems: "center",
    minWidth: 38,
  },
  countdownNumber: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 21,
    letterSpacing: -0.3,
  },
  countdownUnit: {
    fontFamily,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 1,
  },
  verticalDivider: {
    width: 1,
    height: 22,
  },
  allClearTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
    marginTop: 12,
  },
  allClearDesc: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
});
