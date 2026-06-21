import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, rounded, shadows } from "../../theme/layout";

interface HubCardProps {
  item: any;
}

export default function HubCard({ item }: HubCardProps) {
  const router = useRouter();
  const hub = item.hub;
  const role = item.role;

  // Extract relational data (Fallback to empty/default if backend isn't updated yet)
  const teacherName = hub.members?.[0]?.user?.name || "Assigning...";
  const memberCount = hub._count?.members || 1;
  const nextAssessment = hub.assessments?.[0] || null;

  // Real-time Countdown Logic for the card
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
      const m = Math.floor((diff / 1000 / 60) % 60);

      if (d > 0) setTimeLeft(`${d}d ${h}h left`);
      else setTimeLeft(`${h}h ${m}m left`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 60000);
    return () => clearInterval(timer);
  }, [nextAssessment]);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push(`/hub/${hub.id}`)}
    >
      {/* Top Row: Course Code & Role */}
      <View style={styles.cardHeader}>
        <View style={styles.courseCodeBadge}>
          <Text style={styles.courseCodeText}>{hub.courseCode}</Text>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{role}</Text>
        </View>
      </View>

      {/* Course Title */}
      <Text style={styles.courseName} numberOfLines={2}>
        {hub.courseName}
      </Text>

      {/* Meta Information Row */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Feather
            name="user"
            size={14}
            color={colors.outline}
            style={styles.metaIcon}
          />
          <Text style={styles.metaText} numberOfLines={1}>
            {teacherName}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Feather
            name="users"
            size={14}
            color={colors.outline}
            style={styles.metaIcon}
          />
          <Text style={styles.metaText}>{memberCount} Members</Text>
        </View>
      </View>
      <View style={[styles.metaRow, { marginTop: 4 }]}>
        <View style={styles.metaItem}>
          <Feather
            name="layers"
            size={14}
            color={colors.outline}
            style={styles.metaIcon}
          />
          <Text style={styles.metaText}>Semester {hub.semesterNumber}th</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather
            name="map-pin"
            size={14}
            color={colors.outline}
            style={styles.metaIcon}
          />
          <Text style={styles.metaText}>{hub.department}</Text>
        </View>
      </View>

      {/* Footer: Upcoming Assessment OR General Footer */}
      {nextAssessment ? (
        <View style={styles.upcomingBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.upcomingLabel}>
              Upcoming {nextAssessment.type.toLowerCase()}
            </Text>
            <Text style={styles.upcomingTitle} numberOfLines={1}>
              {nextAssessment.title}
            </Text>
          </View>
          <View style={styles.timerBadge}>
            <Feather
              name="clock"
              size={12}
              color={colors.primary}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.timerText}>{timeLeft}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>No upcoming deadlines</Text>
          <Feather name="chevron-right" size={20} color={colors.outline} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    marginBottom: spacing.stackMd,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.stackMd,
  },
  courseCodeBadge: {
    backgroundColor: colors.primaryContainer + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: rounded.md,
  },
  courseCodeText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "800",
  },
  roleBadge: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: rounded.full,
  },
  roleText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: 10,
  },
  courseName: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: spacing.stackSm,
  },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", flex: 1 },
  metaIcon: { marginRight: 6 },
  metaText: { ...typography.labelSm, color: colors.onSurfaceVariant },

  upcomingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.stackLg,
    padding: spacing.stackMd,
    backgroundColor: colors.primaryContainer + "10",
    borderRadius: rounded.md,
    borderWidth: 1,
    borderColor: colors.primaryContainer + "30",
  },
  upcomingLabel: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: "700",
    textTransform: "capitalize",
    fontSize: 10,
    marginBottom: 2,
  },
  upcomingTitle: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: "600",
    paddingRight: 8,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: rounded.full,
    borderWidth: 1,
    borderColor: colors.primaryContainer + "30",
  },
  timerText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: "700",
    fontSize: 10,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.stackLg,
    paddingTop: spacing.stackSm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
  },
  footerText: {
    ...typography.labelSm,
    color: colors.outline,
    fontStyle: "italic",
  },
});
