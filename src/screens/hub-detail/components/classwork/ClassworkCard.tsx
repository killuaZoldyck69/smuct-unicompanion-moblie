import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AssessmentData } from "./types";
import {
  getAssessmentTypeConfig,
  getSubmissionTypeInfo,
  getRemainingDaysInfo,
  formatDueDate,
} from "./utils";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface ClassworkCardProps {
  item: AssessmentData;
  canManage: boolean;
  onPress: (item: AssessmentData) => void;
  onOptionsPress?: (item: AssessmentData) => void;
  currentUserId?: string;
  isTeacher?: boolean;
}

export const ClassworkCard: React.FC<ClassworkCardProps> = React.memo(
  ({
    item,
    canManage,
    onPress,
    onOptionsPress,
    currentUserId,
    isTeacher,
  }) => {
    const typeConfig = getAssessmentTypeConfig(item.type);
    const submissionTypeInfo = getSubmissionTypeInfo(item.submissionType);
    const remainingDaysInfo = getRemainingDaysInfo(item.deadline);

    // Current user's submission
    const mySub = useMemo(() => {
      if (item.mySubmission) return item.mySubmission;
      if (!currentUserId || !item.submissions || !Array.isArray(item.submissions)) {
        return undefined;
      }
      return item.submissions.find(
        (s: any) =>
          s.studentId === currentUserId ||
          s.student?.id === currentUserId ||
          (s.student as any)?.userId === currentUserId
      );
    }, [item.mySubmission, item.submissions, currentUserId]);

    const isSubmitted = !!mySub;
    const isGraded = mySub?.marks !== null && mySub?.marks !== undefined;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => onPress(item)}
      >
        <View style={styles.cardContentRow}>
          {/* Left Circular Type Icon */}
          <View
            style={[
              styles.typeIconContainer,
              {
                backgroundColor: typeConfig.iconBg,
                borderColor: typeConfig.iconBorder,
              },
            ]}
          >
            <Feather
              name={typeConfig.icon}
              size={20}
              color={typeConfig.iconColor}
            />
          </View>

          {/* Right Details Column */}
          <View style={styles.cardDetailsCol}>
            {/* Top Row: Type Pill Badge, Submission Type Badge & 3-Dots Action Menu */}
            <View style={styles.cardTopRow}>
              <View style={styles.badgesCluster}>
                <View
                  style={[
                    styles.typeBadgePill,
                    { backgroundColor: typeConfig.badgeBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeBadgeText,
                      { color: typeConfig.badgeText },
                    ]}
                  >
                    {typeConfig.label}
                  </Text>
                </View>

                <View
                  style={[
                    styles.submissionTypeBadge,
                    submissionTypeInfo.isHand
                      ? styles.submissionTypeBadgeHand
                      : styles.submissionTypeBadgeOnline,
                  ]}
                >
                  <Feather
                    name={submissionTypeInfo.icon}
                    size={10}
                    color={submissionTypeInfo.isHand ? "#b45309" : "#0284c7"}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.submissionTypeText,
                      {
                        color: submissionTypeInfo.isHand ? "#b45309" : "#0284c7",
                      },
                    ]}
                  >
                    {submissionTypeInfo.label}
                  </Text>
                </View>

                {/* Late Submission Policy Badge */}
                <View
                  style={[
                    styles.policyBadge,
                    item.allowLateSubmission
                      ? styles.policyBadgeLate
                      : styles.policyBadgeStrict,
                  ]}
                >
                  <Feather
                    name={item.allowLateSubmission ? "clock" : "lock"}
                    size={9.5}
                    color={item.allowLateSubmission ? "#0d9488" : "#64748b"}
                    style={{ marginRight: 3 }}
                  />
                  <Text
                    style={[
                      styles.policyBadgeText,
                      item.allowLateSubmission
                        ? styles.policyBadgeTextLate
                        : styles.policyBadgeTextStrict,
                    ]}
                  >
                    {item.allowLateSubmission ? "Late OK" : "Strict"}
                  </Text>
                </View>

                {/* Submitted Tag */}
                {isSubmitted && (
                  <View
                    style={[
                      styles.statusBadge,
                      mySub?.isLate
                        ? styles.statusBadgeLate
                        : styles.statusBadgeSubmitted,
                    ]}
                  >
                    <Feather
                      name={mySub?.isLate ? "clock" : "check"}
                      size={10}
                      color={mySub?.isLate ? "#d97706" : "#16a34a"}
                      style={{ marginRight: 3.5 }}
                    />
                    <Text
                      style={[
                        styles.statusBadgeText,
                        mySub?.isLate
                          ? styles.statusBadgeLateText
                          : styles.statusBadgeSubmittedText,
                      ]}
                    >
                      {mySub?.isLate ? "Submitted (Late)" : "Submitted"}
                    </Text>
                  </View>
                )}

                {/* Graded Tag */}
                {isGraded && (
                  <View style={styles.statusBadgeGraded}>
                    <Feather
                      name="award"
                      size={10}
                      color="#7c3aed"
                      style={{ marginRight: 3.5 }}
                    />
                    <Text style={styles.statusBadgeGradedText}>
                      Graded • {mySub?.marks}/{item.totalMarks}
                    </Text>
                  </View>
                )}

                {/* Teacher Submissions Count Tag */}
                {isTeacher && !isSubmitted && (
                  <View style={styles.statusBadgeTeacher}>
                    <Feather
                      name="users"
                      size={10}
                      color="#475569"
                      style={{ marginRight: 3.5 }}
                    />
                    <Text style={styles.statusBadgeTeacherText}>
                      {item.submissionStats
                        ? `${item.submissionStats.total} submitted${
                            item.submissionStats.graded > 0
                              ? ` • ${item.submissionStats.graded} graded`
                              : ""
                          }`
                        : `${item.submissions?.length || 0} submitted`}
                    </Text>
                  </View>
                )}
              </View>

              {canManage && onOptionsPress && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation?.();
                    onOptionsPress(item);
                  }}
                  style={styles.moreBtn}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Classwork options"
                >
                  <Feather name="more-vertical" size={17} color="#64748b" />
                </TouchableOpacity>
              )}
            </View>

            {/* Classwork Title */}
            <Text style={styles.classworkTitle}>{item.title}</Text>

            {/* Due Date & Remaining Days Badge */}
            <View style={styles.dueRow}>
              <Text style={styles.dueText}>
                Due: {formatDueDate(item.deadline)}
              </Text>
              {remainingDaysInfo && !isSubmitted && (
                <View
                  style={[
                    styles.remainingBadge,
                    remainingDaysInfo.isOverdue
                      ? item.allowLateSubmission
                        ? styles.remainingBadgeLateAllowed
                        : styles.remainingBadgeOverdue
                      : remainingDaysInfo.isUrgent
                        ? styles.remainingBadgeUrgent
                        : styles.remainingBadgeNormal,
                  ]}
                >
                  <Feather
                    name={
                      remainingDaysInfo.isOverdue
                        ? item.allowLateSubmission
                          ? "clock"
                          : "lock"
                        : remainingDaysInfo.isUrgent
                          ? "alert-circle"
                          : "clock"
                    }
                    size={10}
                    color={
                      remainingDaysInfo.isOverdue
                        ? item.allowLateSubmission
                          ? "#b45309"
                          : "#dc2626"
                        : remainingDaysInfo.isUrgent
                          ? "#b45309"
                          : "#475569"
                    }
                    style={{ marginRight: 3 }}
                  />
                  <Text
                    style={[
                      styles.remainingBadgeText,
                      remainingDaysInfo.isOverdue
                        ? item.allowLateSubmission
                          ? styles.remainingBadgeTextLateAllowed
                          : styles.remainingBadgeTextOverdue
                        : remainingDaysInfo.isUrgent
                          ? styles.remainingBadgeTextUrgent
                          : styles.remainingBadgeTextNormal,
                    ]}
                  >
                    {remainingDaysInfo.isOverdue
                      ? item.allowLateSubmission
                        ? "Late Submissions Open"
                        : "Closed"
                      : remainingDaysInfo.text}
                  </Text>
                </View>
              )}
            </View>

            {/* Max Marks */}
            <Text style={styles.maxMarksText}>
              Max Marks: {item.totalMarks}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

ClassworkCard.displayName = "ClassworkCard";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardContentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  typeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    marginTop: 2,
  },
  cardDetailsCol: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  badgesCluster: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  typeBadgePill: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 9999,
    alignSelf: "flex-start",
  },
  typeBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
  },
  submissionTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
  },
  submissionTypeBadgeOnline: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
  },
  submissionTypeBadgeHand: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  submissionTypeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
  },
  moreBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  classworkTitle: {
    fontFamily,
    fontSize: 15.5,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 20,
    marginBottom: 4,
  },
  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 3,
  },
  dueText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "500",
    color: "#64748b",
  },
  remainingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6.5,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  remainingBadgeNormal: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  remainingBadgeUrgent: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  remainingBadgeOverdue: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  remainingBadgeLateAllowed: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  remainingBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
  },
  remainingBadgeTextNormal: {
    color: "#475569",
  },
  remainingBadgeTextUrgent: {
    color: "#b45309",
  },
  remainingBadgeTextOverdue: {
    color: "#dc2626",
  },
  remainingBadgeTextLateAllowed: {
    color: "#b45309",
  },
  maxMarksText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: "#64748b",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
  },
  statusBadgeSubmitted: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  statusBadgeLate: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  statusBadgeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
  },
  statusBadgeSubmittedText: {
    color: "#16a34a",
  },
  statusBadgeLateText: {
    color: "#d97706",
  },
  statusBadgeGraded: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    backgroundColor: "#faf5ff",
    borderColor: "#e9d5ff",
  },
  statusBadgeGradedText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
    color: "#7e22ce",
  },
  statusBadgeTeacher: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },
  statusBadgeTeacherText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
    color: "#475569",
  },
  policyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
  },
  policyBadgeStrict: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },
  policyBadgeLate: {
    backgroundColor: "#f0fdfa",
    borderColor: "#99f6e4",
  },
  policyBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
  },
  policyBadgeTextStrict: {
    color: "#64748b",
  },
  policyBadgeTextLate: {
    color: "#0f766e",
  },
});
