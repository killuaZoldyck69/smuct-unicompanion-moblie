import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
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

      {/* 2. COURSE TITLE WITH CATEGORY ICON */}
      <View style={styles.titleRow}>
        <Feather
          name={theme.iconName}
          size={24}
          color={theme.accent}
          style={styles.courseIcon}
        />

        <Text style={styles.courseTitle} numberOfLines={2}>
          {hub.courseName || "Untitled Course"}
        </Text>
      </View>

      {/* 3. METADATA ROW: CODE, SEMESTER, SECTION, CREDIT */}
      <View style={styles.metaRow}>
        {hub.courseCode ? (
          <View style={[styles.metaBadge, { backgroundColor: theme.tagBg }]}>
            <Text style={styles.codeText}>{hub.courseCode}</Text>
          </View>
        ) : null}

        {semesterVal ? (
          <View style={[styles.metaBadge, { backgroundColor: theme.tagBg }]}>
            <Text style={styles.metaText}>
              {getOrdinalSuffix(semesterVal)} Sem
            </Text>
          </View>
        ) : null}

        {hub.section ? (
          <View style={[styles.metaBadge, { backgroundColor: theme.tagBg }]}>
            <Text style={styles.metaText}>Sec {hub.section}</Text>
          </View>
        ) : null}

        {hub.credit !== undefined && hub.credit !== null ? (
          <View
            style={[
              styles.metaBadge,
              { backgroundColor: "rgba(255, 255, 255, 0.75)" },
            ]}
          >
            <Text style={styles.creditText}>{hub.credit} Cr</Text>
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
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
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

  // Course Title Row (Category Icon + Title)
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  courseIcon: {
    marginTop: Platform.OS === "android" ? 2 : 1,
    flexShrink: 0,
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

  // 3. Metadata Badges Row
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 13,
  },
  metaBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  codeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 0.3,
  },
  metaText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#334155",
  },
  creditText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },

  // Footer Row
  footerRow: {
    marginTop: 2,
  },
});
