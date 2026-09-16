import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCountdown } from "@/hooks/use-countdown";

// ==================================================
// SOFT CAMPUS BENTO DESIGN TOKENS
// ==================================================
const BENTO_COLORS = {
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  cardRadius: 22,
  pillRadius: 9999,
  border: "rgba(19, 27, 46, 0.07)",
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
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
  onEdit?: (item: any) => void;
  onDelete?: (assessmentId: string) => void;
}

const formatDeadlineDate = (deadlineStr?: string) => {
  if (!deadlineStr) return "No deadline set";
  try {
    const d = new Date(deadlineStr);
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return deadlineStr;
  }
};

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  item,
  hubId,
  canManage,
  myUserId,
  onEdit,
  onDelete,
}) => {
  const router = useRouter();
  const { timeLeft, isOverdue } = useCountdown(item.deadline);
  const mySub = item.submissions?.find((s: any) => s.studentId === myUserId);

  // Type configuration
  const typeStr = (item.type || "ASSIGNMENT").toUpperCase();
  const isQuiz = typeStr.includes("QUIZ");
  const isPresentation = typeStr.includes("PRESENTATION");
  const isExam =
    typeStr.includes("MID") || typeStr.includes("FINAL") || typeStr.includes("EXAM");

  let typeIcon: keyof typeof Feather.glyphMap = "file-text";
  let typeBadgeStyle = styles.typeAssignment;
  let typeTextStyle = styles.textAssignment;
  let typeLabel = "Assignment";

  if (isQuiz) {
    typeIcon = "help-circle";
    typeBadgeStyle = styles.typeQuiz;
    typeTextStyle = styles.textQuiz;
    typeLabel = "Quiz / CT";
  } else if (isPresentation) {
    typeIcon = "monitor";
    typeBadgeStyle = styles.typePresentation;
    typeTextStyle = styles.textPresentation;
    typeLabel = "Presentation";
  } else if (isExam) {
    typeIcon = "award";
    typeBadgeStyle = styles.typeExam;
    typeTextStyle = styles.textExam;
    typeLabel = typeStr;
  }

  // Submission method configuration
  const submissionType = (item.submissionType || "ONLINE").toUpperCase();
  const isHand = submissionType === "HAND";

  const handleDeletePress = () => {
    Alert.alert(
      "Delete Coursework",
      `Are you sure you want to delete "${item.title}"? All student submissions will also be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete?.(item.id),
        },
      ],
    );
  };

  const handleCardPress = () => {
    router.push({
      pathname: `/hub/${hubId}/assessments`,
      params: { assessmentId: item.id },
    });
  };

  return (
    <View style={styles.card}>
      {/* 1. TOP HEADER ROW: Badges on left, Status & Edit/Delete on right */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.headerLeftTags}>
          {/* Assessment Type Pill with Icon */}
          <View style={[styles.typeBadgePill, typeBadgeStyle]}>
            <Feather
              name={typeIcon}
              size={11}
              color={typeTextStyle.color}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.typeBadgeText, typeTextStyle]}>
              {typeLabel}
            </Text>
          </View>

          {/* Submission Method Pill (Online vs In-Hand) */}
          <View
            style={[
              styles.methodBadgePill,
              isHand ? styles.methodHand : styles.methodOnline,
            ]}
          >
            <Feather
              name={isHand ? "inbox" : "globe"}
              size={10}
              color={isHand ? "#c2410c" : "#0f766e"}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.methodBadgeText,
                isHand ? styles.textHand : styles.textOnline,
              ]}
            >
              {isHand ? "In-Hand" : "Online Link"}
            </Text>
          </View>
        </View>

        {/* Right side: Countdown & Management Actions */}
        <View style={styles.headerRightActions}>
          <View
            style={[
              styles.timerBadgePill,
              isOverdue ? styles.timerOverdue : styles.timerActive,
            ]}
          >
            <Feather
              name={isOverdue ? "alert-circle" : "clock"}
              size={10}
              color={isOverdue ? "#be123c" : "#0284c7"}
              style={{ marginRight: 3 }}
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

          {/* Manager Action Buttons (Edit & Delete) */}
          {canManage && (
            <View style={styles.managementButtonsRow}>
              {onEdit && (
                <TouchableOpacity
                  onPress={() => onEdit(item)}
                  style={styles.actionIconBtn}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit coursework ${item.title}`}
                >
                  <Feather name="edit-2" size={13} color="#334155" />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity
                  onPress={handleDeletePress}
                  style={[styles.actionIconBtn, styles.actionDeleteBtn]}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete coursework ${item.title}`}
                >
                  <Feather name="trash-2" size={13} color="#e11d48" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* 2. CLICKABLE BODY: Navigates to detail / submission */}
      <TouchableOpacity
        onPress={handleCardPress}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${item.title}`}
        style={styles.cardBodyPressable}
      >
        {/* Title */}
        <Text style={styles.courseworkTitleText} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Description Preview */}
        {item.description ? (
          <Text style={styles.courseworkDescText} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {/* 3. EXPLICIT DEADLINE BAR */}
        <View style={styles.deadlineContainer}>
          <View style={styles.deadlineContainerLeft}>
            <Feather
              name="calendar"
              size={12}
              color="#64748b"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.deadlinePrefix}>Due: </Text>
            <Text style={styles.deadlineValue}>
              {formatDeadlineDate(item.deadline)}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* 4. FOOTER: Total Marks, Submissions & Arrow */}
        <View style={styles.cardFooterRow}>
          <View style={styles.footerChipsRow}>
            <View style={styles.marksChipPill}>
              <Feather
                name="award"
                size={11}
                color={BENTO_COLORS.subtleText}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.marksChipText}>
                {item.totalMarks} Marks
              </Text>
            </View>

            {canManage ? (
              <View style={styles.submissionsChipPill}>
                <Feather
                  name="users"
                  size={11}
                  color={BENTO_COLORS.deepNavy}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.submissionsChipText}>
                  {item.submissions?.length || 0} Submissions
                </Text>
              </View>
            ) : mySub ? (
              <View style={styles.submittedPill}>
                <Feather
                  name="check-circle"
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
    </View>
  );
};

// ==================================================
// STYLES
// ==================================================
const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    borderWidth: 1,
    borderColor: BENTO_COLORS.border,
    padding: 18,
    marginBottom: 14,
    ...BENTO_COLORS.shadow,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeftTags: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    flex: 1,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  // Assessment Type Pills
  typeBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
  },
  typeAssignment: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  typeQuiz: {
    backgroundColor: "#faf5ff",
    borderColor: "#e9d5ff",
  },
  typePresentation: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  typeExam: {
    backgroundColor: "#fff1f2",
    borderColor: "#fecdd3",
  },
  typeBadgeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  textAssignment: {
    color: "#1d4ed8",
  },
  textQuiz: {
    color: "#7e22ce",
  },
  textPresentation: {
    color: "#b45309",
  },
  textExam: {
    color: "#be123c",
  },

  // Submission Method Pills
  methodBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
  },
  methodOnline: {
    backgroundColor: "#f0fdfa",
    borderColor: "#ccfbf1",
  },
  methodHand: {
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa",
  },
  methodBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
  },
  textOnline: {
    color: "#0f766e",
  },
  textHand: {
    color: "#c2410c",
  },

  // Timer Pills
  timerBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
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
    fontSize: 10.5,
    fontWeight: "700",
  },
  textActiveTimer: {
    color: "#0284c7",
  },
  textOverdue: {
    color: "#be123c",
  },

  // Action Buttons
  managementButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginLeft: 2,
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  actionDeleteBtn: {
    backgroundColor: "#fff1f2",
  },

  cardBodyPressable: {
    marginTop: 2,
  },
  courseworkTitleText: {
    fontFamily,
    fontSize: 16.5,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    lineHeight: 22,
    marginBottom: 4,
  },
  courseworkDescText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    lineHeight: 18,
    marginBottom: 10,
  },

  // Deadline Container
  deadlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.04)",
  },
  deadlineContainerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  deadlinePrefix: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748b",
  },
  deadlineValue: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },

  cardDivider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginBottom: 12,
  },

  // Footer Row
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 9,
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 9,
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
    paddingHorizontal: 9,
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
    paddingHorizontal: 9,
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
