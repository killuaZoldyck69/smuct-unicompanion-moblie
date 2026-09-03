import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCountdown } from "@/hooks/use-countdown";

// ==================================================
// 1. SOFT CAMPUS BENTO DESIGN SYSTEM CONSTANTS
// ==================================================
const BENTO_COLORS = {
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  cardRadius: 24,
  pillRadius: 9999,
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface AssessmentCardProps {
  item: any;
  hubId: string;
  canManage: boolean;
  myUserId?: string;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  item,
  hubId,
  canManage,
  myUserId,
}) => {
  const router = useRouter();
  const { timeLeft, isOverdue } = useCountdown(item.deadline);
  const mySub = item.submissions?.find((s: any) => s.studentId === myUserId);

  // Type badge colors
  const typeStr = (item.type || "ASSIGNMENT").toUpperCase();
  const isQuiz = typeStr.includes("QUIZ");
  const isExam = typeStr.includes("MID") || typeStr.includes("FINAL") || typeStr.includes("EXAM");

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: `/hub/${hubId}/assessments`,
          params: { assessmentId: item.id },
        })
      }
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Coursework: ${item.title}, ${item.type}, Total Marks: ${item.totalMarks}, Deadline: ${timeLeft}`}
    >
      {/* Top Meta Bar */}
      <View style={styles.cardHeaderRow}>
        <View
          style={[
            styles.typeBadgePill,
            isQuiz
              ? styles.typeQuiz
              : isExam
                ? styles.typeExam
                : styles.typeAssignment,
          ]}
        >
          <Text
            style={[
              styles.typeBadgeText,
              isQuiz
                ? styles.textQuiz
                : isExam
                  ? styles.textExam
                  : styles.textAssignment,
            ]}
          >
            {typeStr}
          </Text>
        </View>

        {/* Status / Countdown Pill */}
        <View
          style={[
            styles.timerBadgePill,
            isOverdue ? styles.timerOverdue : styles.timerActive,
          ]}
        >
          <Feather
            name="clock"
            size={11}
            color={isOverdue ? "#be123c" : "#0284c7"}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.timerBadgeText,
              isOverdue ? styles.textOverdue : styles.textActiveTimer,
            ]}
          >
            {isOverdue ? "Closed" : timeLeft}
          </Text>
        </View>
      </View>

      {/* Coursework Title (Plus Jakarta Sans, Extra Bold) */}
      <Text style={styles.courseworkTitleText} numberOfLines={2}>
        {item.title}
      </Text>

      {/* Description Preview */}
      {item.description ? (
        <Text style={styles.courseworkDescText} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Card Footer: Marks, Submissions & Action */}
      <View style={styles.cardFooterRow}>
        <View style={styles.footerChipsRow}>
          <View style={styles.marksChipPill}>
            <Text style={styles.marksChipText}>
              Total Marks: {item.totalMarks}
            </Text>
          </View>

          {canManage ? (
            <View style={styles.submissionsChipPill}>
              <Text style={styles.submissionsChipText}>
                {item.submissions?.length || 0} Submissions
              </Text>
            </View>
          ) : mySub ? (
            <View style={styles.submittedPill}>
              <Feather
                name="check"
                size={11}
                color="#047857"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.submittedPillText}>Submitted</Text>
            </View>
          ) : (
            <View
              style={[
                styles.pendingPill,
                isOverdue && styles.overduePendingPill,
              ]}
            >
              <Text
                style={[
                  styles.pendingPillText,
                  isOverdue && styles.overduePendingText,
                ]}
              >
                {isOverdue ? "Overdue" : "Pending"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardActionCircle}>
          <Feather
            name="arrow-up-right"
            size={14}
            color={BENTO_COLORS.deepNavy}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ==================================================
// 2. STYLES
// ==================================================
const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    marginBottom: 14,
    ...BENTO_COLORS.shadow,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  typeBadgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  typeAssignment: {
    backgroundColor: "#e0f2fe",
  },
  typeQuiz: {
    backgroundColor: "#fefce8",
  },
  typeExam: {
    backgroundColor: "#ffe4e6",
  },
  typeBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  textAssignment: {
    color: "#0369a1",
  },
  textQuiz: {
    color: "#b45309",
  },
  textExam: {
    color: "#be123c",
  },

  timerBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  timerActive: {
    backgroundColor: "#f0f9ff",
  },
  timerOverdue: {
    backgroundColor: "#fff1f2",
  },
  timerBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
  },
  textActiveTimer: {
    color: "#0284c7",
  },
  textOverdue: {
    color: "#be123c",
  },

  courseworkTitleText: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    lineHeight: 23,
    marginBottom: 6,
  },
  courseworkDescText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    lineHeight: 18,
    marginBottom: 14,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginBottom: 12,
  },
  cardFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
    marginRight: 8,
  },
  marksChipPill: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  marksChipText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
  },
  submissionsChipPill: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  submissionsChipText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  submittedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  submittedPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#047857",
  },
  pendingPill: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  pendingPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#b45309",
  },
  overduePendingPill: {
    backgroundColor: "#ffe4e6",
  },
  overduePendingText: {
    color: "#be123c",
  },
  cardActionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
});
