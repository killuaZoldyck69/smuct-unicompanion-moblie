import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface HubCardProps {
  item: any;
  index: number;
}

// 🎨 Expanded Soft Campus Bento Color Themes (8 Colors)
const CARD_THEMES = [
  {
    bg: "#d1fae5",
    tagBg: "#ffffff",
    caughtUpBg: "#a7f3d0",
    caughtUpText: "#065f46",
  }, // 0: Mint
  {
    bg: "#fce7f3",
    tagBg: "#ffffff",
    caughtUpBg: "#fbcfe8",
    caughtUpText: "#831843",
  }, // 1: Pink
  {
    bg: "#e0e7ff",
    tagBg: "#ffffff",
    caughtUpBg: "#c7d2fe",
    caughtUpText: "#3730a3",
  }, // 2: Indigo/Purple
  {
    bg: "#fef08a",
    tagBg: "#ffffff",
    caughtUpBg: "#fde047",
    caughtUpText: "#854d0e",
  }, // 3: Yellow
  {
    bg: "#e0f2fe",
    tagBg: "#ffffff",
    caughtUpBg: "#bae6fd",
    caughtUpText: "#0369a1",
  }, // 4: Sky Blue
  {
    bg: "#ffedd5",
    tagBg: "#ffffff",
    caughtUpBg: "#fed7aa",
    caughtUpText: "#9a3412",
  }, // 5: Peach
  {
    bg: "#f3e8ff",
    tagBg: "#ffffff",
    caughtUpBg: "#e9d5ff",
    caughtUpText: "#581c87",
  }, // 6: Lavender
  {
    bg: "#ffe4e6",
    tagBg: "#ffffff",
    caughtUpBg: "#fecdd3",
    caughtUpText: "#9f1239",
  }, // 7: Rose
];

// Helper for semester suffix (e.g., 3 -> 3rd)
const getOrdinalSuffix = (num: number | string) => {
  const n = typeof num === "string" ? parseInt(num) : num;
  if (isNaN(n)) return num;
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export default function HubCard({ item, index }: HubCardProps) {
  const router = useRouter();
  const hub = item.hub;
  const role = item.role;

  const theme = CARD_THEMES[index % CARD_THEMES.length];

  const teacherMember = hub.members?.find((m: any) => m.role === "TEACHER");
  const crMember = hub.members?.find((m: any) => m.role === "CR");
  const teacherName =
    teacherMember?.user?.name ||
    hub.teacher?.name ||
    (hub.members?.length ? hub.members[0]?.user?.name : "Faculty");
  const crName = crMember?.user?.name || null;
  const memberCount = hub._count?.members || hub.members?.length || 1;
  const nextAssessment = hub.assessments?.[0] || null;

  // Real-time Countdown Logic
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!nextAssessment?.deadline) return;

    const calculateTime = () => {
      const diff =
        new Date(nextAssessment.deadline).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft("Due now");
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);

      if (d > 0) setTimeLeft(d === 1 ? "1d left" : `${d}d left`);
      else setTimeLeft(`${h}h left`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 60000);
    return () => clearInterval(timer);
  }, [nextAssessment]);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.bg }]}
      activeOpacity={0.88}
      onPress={() => router.push(`/hub/${hub.id}`)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Open Course Hub: ${hub.courseName}, Code: ${hub.courseCode}, ${memberCount} students, taught by ${teacherName}`}
    >
      {/* 1. TOP STATUS & BADGES ROW */}
      <View style={styles.topStatusRow}>
        <View style={styles.leftBadges}>
          <View style={[styles.pillBadge, { backgroundColor: theme.tagBg }]}>
            <Text style={styles.codeText}>{hub.courseCode}</Text>
          </View>
          {hub.credit !== undefined && hub.credit !== null && (
            <View style={[styles.pillBadge, { backgroundColor: "rgba(255,255,255,0.7)" }]}>
              <Text style={styles.creditText}>{hub.credit} Cr</Text>
            </View>
          )}
          {hub.isClassLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE CLASS</Text>
            </View>
          )}
        </View>

        <View style={styles.rightAction}>
          {role && role !== "STUDENT" && (
            <View style={[styles.rolePill, { backgroundColor: theme.tagBg }]}>
              <Text style={styles.roleText}>{role}</Text>
            </View>
          )}
          <View style={styles.enterIconBox}>
            <Feather name="arrow-up-right" size={18} color="#131b2e" />
          </View>
        </View>
      </View>

      {/* 2. COURSE TITLE */}
      <Text style={styles.courseName} numberOfLines={2}>
        {hub.courseName}
      </Text>

      {/* 3. METADATA SUBTITLE (Dept • Semester • Batch) */}
      <Text style={styles.departmentSubtitle} numberOfLines={1}>
        {hub.department || "Academic Department"}
        {hub.semesterNumber ? ` • ${getOrdinalSuffix(hub.semesterNumber)} Sem` : ""}
        {hub.batch ? ` • Batch ${hub.batch}` : ""}
      </Text>

      {/* 4. PEOPLE & STATS ROW */}
      <View style={styles.peopleRow}>
        <View style={styles.metaCol}>
          <View style={styles.metaItem}>
            <Feather name="user-check" size={14} color="#334155" style={styles.metaIcon} />
            <Text style={styles.metaPersonText} numberOfLines={1}>
              {teacherName}
            </Text>
          </View>
          {crName && (
            <View style={[styles.metaItem, { marginTop: 4 }]}>
              <Feather name="shield" size={13} color="#475569" style={styles.metaIcon} />
              <Text style={styles.metaCrText} numberOfLines={1}>
                CR: {crName}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.metaItemRight}>
          <Feather name="users" size={14} color="#334155" style={styles.metaIcon} />
          <Text style={styles.metaStatText}>{memberCount} Students</Text>
        </View>
      </View>

      {/* 5. FOOTER TASK / STATUS PILL */}
      <View style={styles.footerRow}>
        {nextAssessment ? (
          <View style={styles.taskPillActive}>
            <Feather
              name="alert-circle"
              size={15}
              color="#DC2626"
              style={styles.taskIcon}
            />
            <Text style={styles.taskTitle} numberOfLines={1}>
              {nextAssessment.title}
            </Text>
            <View style={styles.taskBadge}>
              <Text style={styles.taskBadgeText}>{timeLeft}</Text>
            </View>
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
              size={15}
              color={theme.caughtUpText}
              style={styles.taskIcon}
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

// --- ISOLATED NEW DESIGN THEME (Soft Campus Bento) ---
// --- ISOLATED NEW DESIGN THEME (Soft Campus Bento) ---
const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },

  // 1. Top status row
  topStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  leftBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    flex: 1,
  },
  pillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  codeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 0.3,
  },
  creditText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ef4444",
  },
  liveText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#b91c1c",
    letterSpacing: 0.5,
  },
  rightAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rolePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
  },
  enterIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },

  // 2. Title & Subtitle
  courseName: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 25,
    marginBottom: 4,
  },
  departmentSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 14,
  },

  // 3. People & Stats
  peopleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.45)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 14,
  },
  metaCol: {
    flex: 1,
    paddingRight: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    marginRight: 6,
  },
  metaPersonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
  },
  metaCrText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  metaItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaStatText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e293b",
  },

  // 4. Footer Tasks
  footerRow: {},
  taskPillActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 9999,
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 8,
    gap: 8,
  },
  taskIcon: {},
  taskTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  taskBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  taskBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
  },
  taskPillCaughtUp: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 8,
  },
  taskTitleCaughtUp: {
    fontSize: 13,
    fontWeight: "700",
  },
});
