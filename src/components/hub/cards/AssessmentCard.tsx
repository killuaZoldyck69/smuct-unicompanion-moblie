import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { spacing, rounded, shadows } from "../../../theme/layout";

// --- Live Countdown Hook ---
const useCountdown = (deadline: string) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    if (!deadline) return;
    const calculateTime = () => {
      const diff = new Date(deadline).getTime() - new Date().getTime();
      if (diff <= 0) {
        setIsOverdue(true);
        setTimeLeft("Closed");
        return;
      }
      setIsOverdue(false);
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      setTimeLeft(`${d}d ${h}h ${m}m remaining`);
    };
    calculateTime();
    const timer = setInterval(calculateTime, 60000);
    return () => clearInterval(timer);
  }, [deadline]);

  return { timeLeft, isOverdue };
};

export default function AssessmentCard({
  item,
  isExpanded,
  onToggle,
  hubMembers,
  myUserId,
  canManage,
  canSubmit,
  submitMutation,
  gradeMutation,
}: any) {
  const { timeLeft, isOverdue } = useCountdown(item.deadline);
  const mySub = item.submissions?.find((s: any) => s.studentId === myUserId);

  // Local State
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [grades, setGrades] = useState<{ [key: string]: string }>({});

  // Formatting Helper
  const formatDateTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Secure Grading Input
  const handleGradeChange = (studentId: string, val: string) => {
    // Strip non-numeric characters (allows decimals)
    let numStr = val.replace(/[^0-9.]/g, "");

    // Prevent exceeding max marks[cite: 10]
    if (numStr !== "") {
      const num = parseFloat(numStr);
      if (num > item.totalMarks) {
        numStr = String(item.totalMarks);
      }
    }

    setGrades((prev) => ({ ...prev, [studentId]: numStr }));
  };

  const handleInlineSubmit = () => {
    let finalUrl = submissionUrl.trim();
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = `https://${finalUrl}`;
    submitMutation.mutate({ assessmentId: item.id, submittedUrl: finalUrl });
  };

  // Ensure CRs and TAs are included in the grading list, but prevent TAs from grading themselves
  const students =
    hubMembers?.filter((m: any) => {
      const isStudentRole = ["STUDENT", "CR", "TA"].includes(m.role);
      const isNotSelf = m.user.id !== myUserId; // TA cannot grade themselves
      return isStudentRole && isNotSelf;
    }) || [];

  return (
    <TouchableOpacity
      style={[styles.card, isExpanded && styles.cardExpanded]}
      activeOpacity={0.9}
      onPress={onToggle}
    >
      {/* --- CARD HEADER --- */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
        <View
          style={[
            styles.timerBadge,
            isOverdue && { backgroundColor: colors.errorContainer },
          ]}
        >
          <Feather
            name="clock"
            size={12}
            color={isOverdue ? colors.error : colors.primary}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[styles.timerText, isOverdue && { color: colors.error }]}
          >
            {timeLeft}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      {item.description ? (
        <Text
          style={styles.description}
          numberOfLines={isExpanded ? undefined : 2}
        >
          {item.description}
        </Text>
      ) : null}

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Marks: {item.totalMarks}</Text>
        <Text style={styles.metaText}>
          Submissions: {item.submissions?.length || 0}
        </Text>
        {mySub && canSubmit && (
          <Feather
            name="check-circle"
            size={16}
            color="#2E7D32"
            style={{ marginLeft: "auto" }}
          />
        )}
      </View>

      {/* --- EXPANDED CONTENT --- */}
      {isExpanded && (
        <View style={styles.expandedSection}>
          {/* STUDENT / TA / CR VIEW: Inline Submission */}
          {canSubmit && (
            <View style={styles.studentSection}>
              {mySub ? (
                <View style={styles.successBanner}>
                  <Text style={styles.successText}>
                    Work Submitted Successfully
                  </Text>
                  {mySub.marks !== null ? (
                    <Text style={styles.gradeText}>
                      Grade: {mySub.marks} / {item.totalMarks}
                    </Text>
                  ) : (
                    <Text style={styles.pendingGradeText}>Pending Grading</Text>
                  )}
                  {mySub.submittedUrl && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(mySub.submittedUrl)}
                      style={styles.linkBtn}
                    >
                      <Feather
                        name="external-link"
                        size={14}
                        color={colors.primary}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.linkText}>View Submission</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={[styles.submitBox, isOverdue && { opacity: 0.6 }]}>
                  <Text style={styles.sectionLabel}>Submit Your Work</Text>
                  <View style={styles.inlineInputRow}>
                    <TextInput
                      style={styles.inlineInput}
                      placeholder="Paste Link (Drive, GitHub, etc.)"
                      value={submissionUrl}
                      onChangeText={setSubmissionUrl}
                      editable={!isOverdue}
                    />
                    <TouchableOpacity
                      style={[
                        styles.inlineSubmitBtn,
                        (!submissionUrl ||
                          submitMutation.isPending ||
                          isOverdue) && {
                          backgroundColor: colors.surfaceContainerHighest,
                        },
                      ]}
                      disabled={
                        !submissionUrl || submitMutation.isPending || isOverdue
                      }
                      onPress={handleInlineSubmit}
                    >
                      {submitMutation.isPending ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Feather name="send" size={18} color="#FFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {isOverdue && (
                    <Text style={styles.overdueWarning}>
                      Submission deadline has passed.
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}

          {/* TEACHER / TA VIEW: Grading List */}
          {canManage && (
            <View style={styles.gradingSection}>
              <Text style={styles.sectionLabel}>Grade Students</Text>

              {students.length === 0 && (
                <Text style={styles.emptyText}>No students in this class.</Text>
              )}

              {students.map((member: any) => {
                const studentUser = member.user;
                const sub = item.submissions?.find(
                  (s: any) => s.studentId === studentUser.id,
                );
                const isGraded =
                  sub?.marks !== null && sub?.marks !== undefined;
                const studentIdStr =
                  studentUser.studentProfile?.studentId || "No ID";

                return (
                  <View key={member.id} style={styles.studentCard}>
                    <View style={styles.studentHeader}>
                      {studentUser.image ? (
                        <Image
                          source={{ uri: studentUser.image }}
                          style={styles.avatar}
                        />
                      ) : (
                        <View style={styles.avatarFallback}>
                          <Text style={styles.avatarText}>
                            {studentUser.name?.charAt(0).toUpperCase() || "U"}
                          </Text>
                        </View>
                      )}
                      <View style={styles.studentInfoCol}>
                        <Text style={styles.studentName}>
                          {studentUser.name}
                        </Text>
                        <Text style={styles.studentMeta} numberOfLines={1}>
                          {studentUser.email}
                        </Text>
                        <Text style={styles.studentMeta}>
                          ID: {studentIdStr}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.studentActions}>
                      {sub?.submittedUrl ? (
                        <View>
                          <Text style={styles.subTime}>
                            Submitted: {formatDateTime(sub.createdAt)}
                          </Text>
                          <TouchableOpacity
                            onPress={() => Linking.openURL(sub.submittedUrl)}
                            style={styles.viewWorkInlineBtn}
                          >
                            <Feather
                              name="external-link"
                              size={14}
                              color={colors.primary}
                              style={{ marginRight: 6 }}
                            />
                            <Text style={styles.linkText}>View Work</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View>
                          <Text style={styles.noSubText}>No submission</Text>
                        </View>
                      )}

                      <View style={styles.gradeBox}>
                        <TextInput
                          style={styles.gradeInput}
                          placeholder={isGraded ? String(sub.marks) : "--"}
                          placeholderTextColor={colors.outlineVariant}
                          keyboardType="numeric"
                          value={grades[studentUser.id] || ""}
                          onChangeText={(val) =>
                            handleGradeChange(studentUser.id, val)
                          }
                        />
                        <Text style={styles.maxMarksText}>
                          / {item.totalMarks}
                        </Text>

                        <TouchableOpacity
                          style={[
                            styles.saveBtn,
                            (!grades[studentUser.id] ||
                              gradeMutation.isPending) && { opacity: 0.5 },
                          ]}
                          disabled={
                            !grades[studentUser.id] || gradeMutation.isPending
                          }
                          onPress={() =>
                            gradeMutation.mutate({
                              assessmentId: item.id,
                              studentId: studentUser.id,
                              marks: Number(grades[studentUser.id]),
                            })
                          }
                        >
                          <Feather name="check" size={16} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Expand/Collapse Chevron Indicator */}
      <View style={styles.chevronContainer}>
        <Feather
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.outline}
        />
      </View>
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
  cardExpanded: { borderColor: colors.primaryContainer },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.stackMd,
  },
  typeBadge: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: rounded.sm,
  },
  typeText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontWeight: "700",
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryContainer + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: rounded.sm,
  },
  timerText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: "700",
  },
  title: {
    ...typography.titleLg,
    fontSize: 18,
    color: colors.onSurface,
    fontWeight: "800",
    marginBottom: 6,
  },
  description: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: 12,
  },
  metaRow: { flexDirection: "row", gap: 16, alignItems: "center" },
  metaText: {
    ...typography.labelSm,
    color: colors.outline,
    fontWeight: "600",
  },

  expandedSection: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
    marginTop: spacing.stackLg,
    paddingTop: spacing.stackLg,
  },
  sectionLabel: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: "800",
    marginBottom: 12,
  },

  // Student Submission Box
  studentSection: { marginBottom: 16 },
  submitBox: { backgroundColor: colors.surfaceContainerLowest },
  inlineInputRow: { flexDirection: "row", gap: 8 },
  inlineInput: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    paddingHorizontal: 16,
    ...typography.bodyMd,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  inlineSubmitBtn: {
    backgroundColor: colors.primary,
    width: 50,
    height: 50,
    borderRadius: rounded.md,
    justifyContent: "center",
    alignItems: "center",
  },
  overdueWarning: {
    ...typography.labelSm,
    color: colors.error,
    marginTop: 8,
  },
  successBanner: {
    backgroundColor: "#E8F5E9",
    padding: 16,
    borderRadius: rounded.lg,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  successText: {
    ...typography.labelMd,
    color: "#2E7D32",
    fontWeight: "800",
    marginBottom: 4,
  },
  gradeText: {
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: "800",
    marginTop: 4,
  },
  pendingGradeText: {
    ...typography.labelSm,
    color: colors.outline,
    marginTop: 4,
    fontStyle: "italic",
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#FFF",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },

  // Teacher Grading Box
  gradingSection: { marginBottom: 8 },
  studentCard: {
    backgroundColor: colors.surfaceContainerHigh,
    padding: 16,
    borderRadius: rounded.lg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: colors.surfaceContainerHighest,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: colors.secondaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    ...typography.titleLg,
    color: colors.secondary,
    fontWeight: "700",
  },
  studentInfoCol: { flex: 1 },
  studentName: {
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: "800",
    marginBottom: 2,
  },
  studentMeta: {
    ...typography.labelSm,
    color: colors.outline,
    fontSize: 11,
  },

  studentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  subTime: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontSize: 10,
    marginBottom: 6,
  },
  viewWorkInlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryContainer + "20",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: rounded.md,
    alignSelf: "flex-start",
  },
  linkText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: "700",
  },
  noSubText: {
    ...typography.labelSm,
    color: colors.outline,
    fontStyle: "italic",
    marginTop: 4,
  },

  gradeBox: { flexDirection: "row", alignItems: "center", gap: 8 },
  gradeInput: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: 50,
    textAlign: "center",
    ...typography.bodyMd,
    fontWeight: "700",
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  maxMarksText: {
    ...typography.labelMd,
    color: colors.outline,
  },
  saveBtn: {
    backgroundColor: "#2E7D32",
    padding: 10,
    borderRadius: rounded.sm,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.outline,
    fontStyle: "italic",
  },

  chevronContainer: { alignItems: "center", marginTop: 12 },
});
