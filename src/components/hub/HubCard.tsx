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

  // Determine dynamic colors based on index cycling through the 8 themes
  const theme = CARD_THEMES[index % CARD_THEMES.length];

  // Extract relational data
  const teacherName = hub.members?.[0]?.user?.name || "Assigning...";
  const memberCount = hub._count?.members || 1;
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

      if (d > 0) setTimeLeft(d === 1 ? "1 Day Left" : `${d} Days Left`);
      else setTimeLeft(`${h}h Left`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 60000);
    return () => clearInterval(timer);
  }, [nextAssessment]);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.bg }]}
      activeOpacity={0.9}
      onPress={() => router.push(`/hub/${hub.id}`)}
    >
      {/* 1. TITLE ROW */}
      <View style={styles.cardHeader}>
        <Text style={styles.courseName} numberOfLines={1}>
          {hub.courseName}
        </Text>
        <TouchableOpacity style={styles.menuIcon}>
          <Feather name="more-vertical" size={20} color="#131b2e" />
        </TouchableOpacity>
      </View>

      {/* 2. TAGS ROW */}
      <View style={styles.tagsRow}>
        <View style={[styles.pillBadge, { backgroundColor: theme.tagBg }]}>
          <Text style={styles.pillText}>{hub.courseCode}</Text>
        </View>
        {role !== "STUDENT" && (
          <View style={[styles.pillBadge, { backgroundColor: theme.tagBg }]}>
            <Text style={styles.pillText}>{role}</Text>
          </View>
        )}
      </View>

      {/* 3. META GRID */}
      <View style={styles.metaGrid}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather
              name="user"
              size={16}
              color="#45464d"
              style={styles.metaIcon}
            />
            <Text style={styles.metaText} numberOfLines={1}>
              {teacherName.includes("Dr.") || teacherName.includes("Prof.")
                ? teacherName
                : `Prof. ${teacherName.split(" ").pop()}`}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Feather
              name="users"
              size={16}
              color="#45464d"
              style={styles.metaIcon}
            />
            <Text style={styles.metaText}>{memberCount} Students</Text>
          </View>
        </View>

        <View style={[styles.metaRow, { marginTop: 12 }]}>
          <View style={styles.metaItem}>
            <Feather
              name="calendar"
              size={16}
              color="#45464d"
              style={styles.metaIcon}
            />
            <Text style={styles.metaText}>
              {getOrdinalSuffix(hub.semesterNumber)} Semester
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Feather
              name="briefcase"
              size={16}
              color="#45464d"
              style={styles.metaIcon}
            />
            <Text style={styles.metaText}>{hub.department || "Dept"}</Text>
          </View>
        </View>
      </View>

      {/* 4. FOOTER PILL (Task vs Caught up) */}
      {nextAssessment ? (
        <View style={styles.taskPillActive}>
          <Feather
            name="clipboard"
            size={16}
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
            size={16}
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
    </TouchableOpacity>
  );
}

// --- ISOLATED NEW DESIGN THEME (Soft Campus Bento) ---
const styles = StyleSheet.create({
  card: {
    borderRadius: 32, // Exaggerated roundness
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 1,
  },

  // Header
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  courseName: {
    flex: 1,
    fontFamily: "Plus Jakarta Sans",
    fontSize: 20,
    fontWeight: "800",
    color: "#131b2e",
    paddingRight: 16,
  },
  menuIcon: { padding: 4 },

  // Tags
  tagsRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  pillBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999 },
  pillText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 12,
    fontWeight: "800",
    color: "#131b2e",
    textTransform: "uppercase",
  },

  // Meta Grid
  metaGrid: { marginBottom: 20 },
  metaRow: { flexDirection: "row", alignItems: "center" },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },
  metaIcon: { marginRight: 8 },
  metaText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 14,
    fontWeight: "600",
    color: "#131b2e",
  },

  // Footer Pills
  taskPillActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 9999,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 8,
  },
  taskIcon: { marginRight: 8 },
  taskTitle: {
    flex: 1,
    fontFamily: "Plus Jakarta Sans",
    fontSize: 14,
    fontWeight: "700",
    color: "#131b2e",
  },
  taskBadge: {
    backgroundColor: "#DC2626", // Red badge
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  taskBadgeText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 12,
    fontWeight: "800",
    color: "#ffffff",
  },

  taskPillCaughtUp: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  taskTitleCaughtUp: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 14,
    fontWeight: "700",
  },
});
