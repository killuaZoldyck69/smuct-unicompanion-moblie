import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CARD_THEMES } from "@/features/hubs/hub-themes";

interface HubCardProps {
  item: any;
  index: number;
}

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

// Helper for semester suffix (e.g., 3 -> 3rd)
const getOrdinalSuffix = (num: number | string) => {
  const n = typeof num === "string" ? parseInt(num, 10) : num;
  if (isNaN(n)) return num;
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export default function HubCard({ item, index }: HubCardProps) {
  const router = useRouter();
  const hub = item?.hub || {};

  const theme = CARD_THEMES[index % CARD_THEMES.length];

  // 1. Teacher Information
  const teacherMember = hub.members?.find((m: any) => m.role === "TEACHER");
  const teacherUser = teacherMember?.user || hub.teacher;
  const teacherName =
    teacherUser?.name ||
    (hub.members?.length ? hub.members[0]?.user?.name : "Faculty");
  const teacherImage = teacherUser?.image || null;

  // 2. Single Course Work with Deadline Upcoming First
  const upcomingAssessment = useMemo(() => {
    const list = hub.assessments || hub.courseWorks || hub.assignments || [];
    if (!Array.isArray(list) || list.length === 0) return null;

    const now = Date.now();
    // Prioritize upcoming future deadlines (closest first)
    const futureAssessments = list
      .filter(
        (a: any) => a.deadline && new Date(a.deadline).getTime() > now,
      )
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

  // Real-time Countdown for Upcoming Assessment
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!upcomingAssessment?.deadline) {
      setTimeLeft("");
      return;
    }

    const calculateTime = () => {
      const diff =
        new Date(upcomingAssessment.deadline).getTime() - Date.now();
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
      style={[styles.card, { backgroundColor: theme.bg }]}
      activeOpacity={0.88}
      onPress={() =>
        router.push({
          pathname: "/hub/[id]",
          params: { id: hub.id, colorIndex: String(index % CARD_THEMES.length) },
        })
      }
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Open Course Hub: ${hub.courseName || "Course"}, Code: ${hub.courseCode || ""}, taught by ${teacherName}`}
    >
      {/* 1. TOP FIRST: COURSE TITLE & LIVE STATUS */}
      <View style={styles.titleRow}>
        <Text style={styles.courseName} numberOfLines={2}>
          {hub.courseName}
        </Text>
        {hub.isClassLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      {/* 2. COURSE CODE, SEMESTER, SECTION UNDER TITLE */}
      <View style={styles.metaRow}>
        {hub.courseCode ? (
          <View style={[styles.pillBadge, { backgroundColor: theme.tagBg }]}>
            <Text style={styles.codeText}>{hub.courseCode}</Text>
          </View>
        ) : null}

        {semesterVal ? (
          <View style={[styles.pillBadge, { backgroundColor: theme.tagBg }]}>
            <Text style={styles.metaBadgeText}>
              {getOrdinalSuffix(semesterVal)} Sem
            </Text>
          </View>
        ) : null}

        {hub.section ? (
          <View style={[styles.pillBadge, { backgroundColor: theme.tagBg }]}>
            <Text style={styles.metaBadgeText}>Sec {hub.section}</Text>
          </View>
        ) : null}

        {hub.credit !== undefined && hub.credit !== null ? (
          <View
            style={[
              styles.pillBadge,
              { backgroundColor: "rgba(255, 255, 255, 0.7)" },
            ]}
          >
            <Text style={styles.creditText}>{hub.credit} Cr</Text>
          </View>
        ) : null}
      </View>

      {/* 3. TEACHER NAME WITH PROFILE IMAGE */}
      <View style={styles.teacherRow}>
        {teacherImage ? (
          <Image source={{ uri: teacherImage }} style={styles.teacherAvatar} />
        ) : (
          <View style={styles.teacherAvatarFallback}>
            <Text style={styles.teacherAvatarText}>
              {(teacherName || "F").charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.teacherTextCol}>
          <Text style={styles.teacherLabel}>Instructor</Text>
          <Text style={styles.teacherName} numberOfLines={1}>
            {teacherName}
          </Text>
        </View>
      </View>

      {/* 4. FOOTER: ONE COURSE WORK WITH DEADLINE UPCOMING FIRST */}
      <View style={styles.footerRow}>
        {upcomingAssessment ? (
          <View style={styles.taskPillActive}>
            <View style={styles.taskIconBox}>
              <Feather
                name={
                  upcomingAssessment.type === "QUIZ"
                    ? "help-circle"
                    : upcomingAssessment.type === "PRESENTATION"
                      ? "airplay"
                      : "file-text"
                }
                size={13}
                color="#dc2626"
              />
            </View>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {upcomingAssessment.title}
            </Text>
            {timeLeft ? (
              <View style={styles.taskBadge}>
                <Text style={styles.taskBadgeText}>{timeLeft}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View
            style={[
              styles.taskPillCaughtUp,
              { backgroundColor: theme.caughtUpBg },
            ]}
          >
            <Feather
              name="check-circle"
              size={14}
              color={theme.caughtUpText}
            />
            <Text
              style={[styles.taskTitleCaughtUp, { color: theme.caughtUpText }]}
            >
              All caught up
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20, // Decreased border radius from 28
    padding: 18,
    marginBottom: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },

  // 1. Course Title & Live Badge
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  courseName: {
    flex: 1,
    fontFamily,
    fontSize: 17.5,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 7,
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

  // 2. Metadata Badges (Code, Semester, Section, Credit)
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 13,
  },
  pillBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  codeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 0.2,
  },
  metaBadgeText: {
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

  // 3. Teacher Profile
  teacherRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 11,
  },
  teacherAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ffffff",
  },
  teacherAvatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  teacherAvatarText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  teacherTextCol: {
    marginLeft: 10,
    flex: 1,
  },
  teacherLabel: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  teacherName: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },

  // 4. Footer Coursework / Assessment Pill
  footerRow: {},
  taskPillActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 11,
    paddingVertical: 7,
    paddingLeft: 8,
    paddingRight: 8,
    gap: 8,
  },
  taskIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },
  taskTitle: {
    flex: 1,
    fontFamily,
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0f172a",
  },
  taskBadge: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  taskBadgeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: "#ffffff",
  },
  taskPillCaughtUp: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 11,
    paddingVertical: 7,
    paddingHorizontal: 11,
    gap: 7,
  },
  taskTitleCaughtUp: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
  },
});
