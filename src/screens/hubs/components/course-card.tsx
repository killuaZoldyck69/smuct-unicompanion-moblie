import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { fontFamily, getOrdinalSuffix } from "../constants";
import { resolveCourseTheme } from "../theme/course-theme-resolver";
import { CourseDecorativeBackdrop } from "./course-decorative-backdrop";
import { InstructorBlock } from "./instructor-block";
import { CourseStatusPill } from "./course-status-pill";

export interface CourseCardProps {
  item: any;
  index: number;
}

export const CourseCard = React.memo(function CourseCard({
  item,
  index,
}: CourseCardProps) {
  const router = useRouter();
  const hub = item?.hub || {};

  // Resolve visual theme dynamically from course metadata
  const theme = useMemo(() => resolveCourseTheme(hub, index), [hub, index]);

  // 1. Teacher Information
  const teacherMember = hub.members?.find((m: any) => m.role === "TEACHER");
  const teacherUser = teacherMember?.user || hub.teacher;
  const teacherName =
    teacherUser?.name ||
    (hub.members?.length ? hub.members[0]?.user?.name : "Faculty");
  const teacherImage = teacherUser?.image || null;

  // 2. Upcoming Course Work / Assessment with countdown
  const upcomingAssessment = useMemo(() => {
    const list = hub.assessments || hub.courseWorks || hub.assignments || [];
    if (!Array.isArray(list) || list.length === 0) return null;

    const now = Date.now();
    // Prioritize upcoming future deadlines
    const futureAssessments = list
      .filter((a: any) => a.deadline && new Date(a.deadline).getTime() > now)
      .sort(
        (a: any, b: any) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
      );

    if (futureAssessments.length > 0) {
      return futureAssessments[0];
    }

    // Fallback: items with valid deadlines sorted by recency
    const validAssessments = list
      .filter((a: any) => a.deadline)
      .sort(
        (a: any, b: any) =>
          new Date(b.deadline).getTime() - new Date(a.deadline).getTime(),
      );

    return validAssessments[0] || list[0] || null;
  }, [hub.assessments, hub.courseWorks, hub.assignments]);

  // Real-time Countdown calculation for Assessment
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!upcomingAssessment?.deadline) {
      setTimeLeft("");
      return;
    }

    const calculateTime = () => {
      const diff = new Date(upcomingAssessment.deadline).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Due now");
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);

      if (d > 0) {
        setTimeLeft(d === 1 ? "1d left" : `${d}d left`);
      } else if (h > 0) {
        setTimeLeft(`${h}h left`);
      } else {
        setTimeLeft(`${m}m left`);
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 60000);
    return () => clearInterval(timer);
  }, [upcomingAssessment]);

  const semesterVal = hub.semesterNumber || hub.semester;

  // Bento Pill Colors aligned with the screenshot
  const isBlueCard = theme.colorIndex === 1;
  const semesterBadgeBg = isBlueCard ? "#dcfce7" : "#e0f2fe";
  const semesterBadgeColor = isBlueCard ? "#059669" : "#0284c7";

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.bg,
          borderColor: theme.cardBorderColor,
        },
      ]}
      activeOpacity={0.88}
      onPress={() =>
        router.push({
          pathname: "/hub/[id]",
          params: { id: hub.id, colorIndex: String(theme.colorIndex) },
        })
      }
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Open Course Hub: ${hub.courseName || "Course"}, Code: ${hub.courseCode || ""}, taught by ${teacherName}`}
    >
      {/* Procedural Visual Theme Decoration */}
      <CourseDecorativeBackdrop theme={theme} />

      {/* 1. LIVE BADGE (WHEN ACTIVE) */}
      {hub.isClassLive && (
        <View style={styles.liveRow}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
      )}

      {/* 2. COURSE TITLE WITH VIBRANT SQUIRCLE ICON */}
      <View style={styles.titleRow}>
        <View
          style={[
            styles.squircleIconBox,
            { backgroundColor: theme.squircleBg || theme.accent },
          ]}
        >
          {theme.iconFamily === "MaterialCommunityIcons" ? (
            <MaterialCommunityIcons
              name={theme.iconName as any}
              size={24}
              color="#ffffff"
            />
          ) : (
            <Feather
              name={theme.iconName as any}
              size={22}
              color="#ffffff"
            />
          )}
        </View>

        <Text style={styles.courseTitle} numberOfLines={2}>
          {hub.courseName || "Untitled Course"}
        </Text>
      </View>

      {/* 3. METADATA ROW: COLORFUL BENTO PILLS (CODE, SEMESTER, SECTION) */}
      <View style={styles.metaRow}>
        {hub.courseCode ? (
          <View style={[styles.metaBadge, styles.codeBadge]}>
            <Feather
              name="code"
              size={12}
              color={theme.accent}
            />
            <Text
              style={[
                styles.badgeText,
                { color: theme.accent },
              ]}
            >
              {hub.courseCode}
            </Text>
          </View>
        ) : null}

        {semesterVal ? (
          <View
            style={[
              styles.metaBadge,
              { backgroundColor: semesterBadgeBg },
            ]}
          >
            <MaterialCommunityIcons
              name="school"
              size={13}
              color={semesterBadgeColor}
            />
            <Text
              style={[
                styles.badgeText,
                { color: semesterBadgeColor },
              ]}
            >
              {getOrdinalSuffix(semesterVal)} Sem
            </Text>
          </View>
        ) : null}

        {hub.section ? (
          <View
            style={[
              styles.metaBadge,
              { backgroundColor: "#f3e8ff" },
            ]}
          >
            <Feather name="users" size={12} color="#7c3aed" />
            <Text style={[styles.badgeText, { color: "#6b21a8" }]}>
              Sec {hub.section}
            </Text>
          </View>
        ) : null}
      </View>

      {/* 4. INSTRUCTOR INFORMATION BLOCK */}
      <InstructorBlock name={teacherName} image={teacherImage} />

      {/* 5. COURSE STATUS / ASSESSMENT FOOTER */}
      <View style={styles.footerRow}>
        <CourseStatusPill
          upcomingAssessment={upcomingAssessment}
          timeLeft={timeLeft}
          theme={theme}
        />
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    position: "relative",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    overflow: "hidden",
  },

  // Live Class Badge
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ef4444",
  },
  liveText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#b91c1c",
    letterSpacing: 0.5,
  },

  // Course Title Row (Squircle + Title)
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  squircleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  courseTitle: {
    flex: 1,
    fontFamily,
    fontSize: 19,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 25,
    letterSpacing: -0.3,
  },

  // Metadata Badges Row (Bento Pills)
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexWrap: "wrap",
    marginBottom: 14,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  codeBadge: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
  },

  // Footer Row
  footerRow: {
    marginTop: 2,
  },
});
