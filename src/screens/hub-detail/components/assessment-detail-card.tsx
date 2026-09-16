import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  Image,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useCountdown } from "@/hooks/use-countdown";
import Toast from "react-native-toast-message";

const BENTO = {
  canvas: "#f7f9fb",
  card: "#ffffff",
  navy: "#131b2e",
  slate: "#64748b",
  border: "rgba(19, 27, 46, 0.08)",
  mintSoft: "#f0fdf4",
  mintBorder: "#bbf7d0",
  mintText: "#15803d",
  blueSoft: "#eff6ff",
  blueBorder: "#bfdbfe",
  blueText: "#1d4ed8",
  purpleSoft: "#faf5ff",
  purpleBorder: "#e9d5ff",
  purpleText: "#7e22ce",
  amberSoft: "#fffbeb",
  amberBorder: "#fde68a",
  amberText: "#b45309",
  roseSoft: "#fff1f2",
  roseBorder: "#fecdd3",
  roseText: "#e11d48",
  subCard: "#f8fafc",
  subCardBorder: "rgba(19, 27, 46, 0.06)",
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface Props {
  item: any;
  isExpanded: boolean;
  onToggle: () => void;
  hubMembers: any[];
  myUserId?: string;
  canManage: boolean;
  canSubmit: boolean;
  submitMutation: any;
  gradeMutation: any;
}

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
}: Props) {
  const { timeLeft, isOverdue } = useCountdown(item.deadline);
  const mySub = item.submissions?.find((s: any) => s.studentId === myUserId);

  // Local State
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [grades, setGrades] = useState<{ [key: string]: string }>({});

  // Formatting Helper
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "No deadline";
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
    let numStr = val.replace(/[^0-9.]/g, "");
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
    if (!finalUrl) return;
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = `https://${finalUrl}`;
    submitMutation.mutate({ assessmentId: item.id, submittedUrl: finalUrl });
  };

  const handleOpenLink = (url?: string) => {
    if (!url) return;
    const validUrl = url.startsWith("http") ? url : `https://${url}`;
    Linking.openURL(validUrl).catch(() => {
      Toast.show({ type: "error", text1: "Unable to open submission link" });
    });
  };

  // Filter students for teachers, excluding self if TA
  const students =
    hubMembers?.filter((m: any) => {
      const isStudentRole = ["STUDENT", "CR", "TA"].includes(m.role);
      const isNotSelf = m.user?.id !== myUserId;
      return isStudentRole && isNotSelf;
    }) || [];

  // Determine badge styling based on type
  const typeStr = (item.type || "ASSIGNMENT").toUpperCase();
  const isQuiz = typeStr.includes("QUIZ");
  const isPresentation = typeStr.includes("PRESENTATION");

  const typeBadgeStyle = isQuiz
    ? { bg: BENTO.purpleSoft, border: BENTO.purpleBorder, text: BENTO.purpleText }
    : isPresentation
      ? { bg: BENTO.amberSoft, border: BENTO.amberBorder, text: BENTO.amberText }
      : { bg: BENTO.blueSoft, border: BENTO.blueBorder, text: BENTO.blueText };

  return (
    // ROOT IS A VIEW TO PREVENT NESTED BUTTON HYDRATION ERRORS
    <View style={[styles.card, isExpanded && styles.cardExpanded]}>
      {/* CARD HEADER (COLLAPSIBLE TRIGGER) */}
      <TouchableOpacity
        style={styles.cardHeaderTouchable}
        activeOpacity={0.8}
        onPress={onToggle}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Assessment: ${item.title}, ${item.type}, deadline ${formatDateTime(item.deadline)}`}
      >
        {/* Top Badges Row */}
        <View style={styles.topBadgeRow}>
          <View
            style={[
              styles.bentoPill,
              {
                backgroundColor: typeBadgeStyle.bg,
                borderColor: typeBadgeStyle.border,
              },
            ]}
          >
            <Text style={[styles.bentoPillText, { color: typeBadgeStyle.text }]}>
              {item.type}
            </Text>
          </View>

          <View
            style={[
              styles.bentoPill,
              isOverdue
                ? {
                    backgroundColor: BENTO.roseSoft,
                    borderColor: BENTO.roseBorder,
                  }
                : {
                    backgroundColor: BENTO.mintSoft,
                    borderColor: BENTO.mintBorder,
                  },
            ]}
          >
            <Feather
              name={isOverdue ? "alert-circle" : "clock"}
              size={12}
              color={isOverdue ? BENTO.roseText : BENTO.mintText}
              style={{ marginRight: 5 }}
            />
            <Text
              style={[
                styles.bentoPillText,
                { color: isOverdue ? BENTO.roseText : BENTO.mintText },
              ]}
            >
              {isOverdue ? "Closed" : timeLeft}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{item.title}</Text>

        {/* Description */}
        {item.description ? (
          <Text
            style={styles.description}
            numberOfLines={isExpanded ? undefined : 2}
          >
            {item.description}
          </Text>
        ) : null}

        {/* Bento Meta Bar */}
        <View style={styles.metaBar}>
          <View style={styles.metaChip}>
            <Feather name="award" size={13} color={BENTO.navy} />
            <Text style={styles.metaChipText}>{item.totalMarks} Marks</Text>
          </View>

          <View style={styles.metaChip}>
            <Feather name="file-text" size={13} color={BENTO.navy} />
            <Text style={styles.metaChipText}>
              {item.submissions?.length || 0} Submissions
            </Text>
          </View>

          {/* Submission Mode Chip */}
          <View style={styles.metaChip}>
            <Feather
              name={item.submissionType === "HAND" ? "clipboard" : "globe"}
              size={13}
              color={BENTO.navy}
            />
            <Text style={styles.metaChipText}>
              {item.submissionType === "HAND" ? "In-Hand / Offline" : "Online Link"}
            </Text>
          </View>

          {mySub && canSubmit ? (
            <View style={[styles.metaChip, styles.submittedChip]}>
              <Feather name="check-circle" size={13} color={BENTO.mintText} />
              <Text style={[styles.metaChipText, { color: BENTO.mintText }]}>
                {mySub.marks !== null ? `Graded: ${mySub.marks}/${item.totalMarks}` : "Submitted"}
              </Text>
            </View>
          ) : null}

          <View style={styles.headerChevron}>
            <Feather
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={18}
              color={BENTO.slate}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* --- EXPANDED SECTION --- */}
      {isExpanded && (
        <View style={styles.expandedSection}>
          {/* STUDENT VIEW: Inline Submission */}
          {canSubmit && (
            <View style={styles.studentSection}>
              {item.submissionType === "HAND" ? (
                <View style={styles.bentoHandBox}>
                  <View style={styles.handHeader}>
                    <View style={styles.handIconBadge}>
                      <Feather name="clipboard" size={18} color="#ffffff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.handTitle}>In-Hand / Physical Submission</Text>
                      <Text style={styles.handSubtitle}>
                        Submit your hardcopy assignment or lab report directly to the course instructor in class.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.gradeResultBox}>
                    <Text style={styles.gradeResultLabel}>Evaluation Status</Text>
                    {mySub?.marks !== null && mySub?.marks !== undefined ? (
                      <View style={styles.scoreRow}>
                        <Text style={styles.scoreNumber}>{mySub.marks}</Text>
                        <Text style={styles.scoreMax}> / {item.totalMarks} Marks</Text>
                      </View>
                    ) : (
                      <View style={styles.pendingBadge}>
                        <Feather name="clock" size={13} color={BENTO.amberText} />
                        <Text style={styles.pendingText}>Pending Faculty Review</Text>
                      </View>
                    )}
                  </View>
                </View>
              ) : mySub ? (
                <View style={styles.bentoSuccessBox}>
                  <View style={styles.successHeader}>
                    <View style={styles.successIconBadge}>
                      <Feather name="check" size={18} color="#ffffff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.successTitle}>
                        Work Submitted Successfully
                      </Text>
                      {mySub.createdAt ? (
                        <Text style={styles.successSubtitle}>
                          Submitted on {formatDateTime(mySub.createdAt)}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.gradeResultBox}>
                    <Text style={styles.gradeResultLabel}>Evaluation Status</Text>
                    {mySub.marks !== null ? (
                      <View style={styles.scoreRow}>
                        <Text style={styles.scoreNumber}>{mySub.marks}</Text>
                        <Text style={styles.scoreMax}> / {item.totalMarks} Marks</Text>
                      </View>
                    ) : (
                      <View style={styles.pendingBadge}>
                        <Feather name="clock" size={13} color={BENTO.amberText} />
                        <Text style={styles.pendingText}>Pending Faculty Grading</Text>
                      </View>
                    )}
                  </View>

                  {mySub.submittedUrl ? (
                    <TouchableOpacity
                      onPress={() => handleOpenLink(mySub.submittedUrl)}
                      style={styles.viewLinkBtn}
                      activeOpacity={0.8}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Open submitted coursework link"
                    >
                      <Feather
                        name="external-link"
                        size={14}
                        color={BENTO.navy}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.viewLinkBtnText} numberOfLines={1}>
                        View Submitted Link
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : (
                <View
                  style={[
                    styles.bentoSubmitBox,
                    isOverdue && { opacity: 0.7 },
                  ]}
                >
                  <View style={styles.submitHeaderRow}>
                    <Text style={styles.sectionLabel}>Submit Your Coursework</Text>
                    {isOverdue && (
                      <View style={styles.deadlinePassedBadge}>
                        <Feather name="alert-triangle" size={12} color={BENTO.roseText} />
                        <Text style={styles.deadlinePassedText}>Deadline Closed</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.submitPrompt}>
                    Paste your Google Drive, GitHub repository, or OneDrive document URL:
                  </Text>

                  <View style={styles.bentoInputRow}>
                    <View style={styles.inputPrefix}>
                      <Feather name="link-2" size={16} color={BENTO.slate} />
                    </View>
                    <TextInput
                      style={styles.bentoInput}
                      placeholder="https://drive.google.com/..."
                      placeholderTextColor="#94a3b8"
                      value={submissionUrl}
                      onChangeText={setSubmissionUrl}
                      editable={!isOverdue}
                      autoCapitalize="none"
                      accessible={true}
                      accessibilityLabel="Submission URL"
                    />
                    <TouchableOpacity
                      style={[
                        styles.bentoSubmitBtn,
                        (!submissionUrl.trim() ||
                          submitMutation.isPending ||
                          isOverdue) && styles.bentoSubmitBtnDisabled,
                      ]}
                      disabled={
                        !submissionUrl.trim() ||
                        submitMutation.isPending ||
                        isOverdue
                      }
                      onPress={handleInlineSubmit}
                      activeOpacity={0.85}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Submit assignment URL"
                    >
                      {submitMutation.isPending ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Feather name="arrow-up-right" size={18} color="#ffffff" />
                      )}
                    </TouchableOpacity>
                  </View>

                  {isOverdue ? (
                    <Text style={styles.overdueNote}>
                      The submission window for this task has ended.
                    </Text>
                  ) : null}
                </View>
              )}
            </View>
          )}

          {/* TEACHER / TA VIEW: Grading List */}
          {canManage && (
            <View style={styles.gradingSection}>
              <View style={styles.gradingSectionHeader}>
                <Text style={styles.sectionLabel}>Student Submissions & Grading</Text>
                <View style={styles.studentCountBadge}>
                  <Text style={styles.studentCountText}>{students.length} Students</Text>
                </View>
              </View>

              {students.length === 0 ? (
                <View style={styles.noStudentsBox}>
                  <Feather name="users" size={24} color={BENTO.slate} />
                  <Text style={styles.emptyText}>No students enrolled in this hub cohort.</Text>
                </View>
              ) : null}

              {students.map((member: any) => {
                const studentUser = member?.user;
                if (!studentUser) return null;

                const sub = item.submissions?.find(
                  (s: any) => s.studentId === studentUser.id,
                );
                const isGraded =
                  sub?.marks !== null && sub?.marks !== undefined;
                const studentIdStr =
                  studentUser.studentProfile?.studentId || "No ID";

                return (
                  <View key={member.id} style={styles.studentBentoCard}>
                    {/* Student Info Row */}
                    <View style={styles.studentHeader}>
                      {studentUser.image ? (
                        <Image
                          source={{ uri: studentUser.image }}
                          style={styles.avatar}
                          resizeMode="cover"
                          accessible={true}
                          accessibilityLabel={`${studentUser.name}'s avatar`}
                        />
                      ) : (
                        <View style={styles.avatarFallback}>
                          <Text style={styles.avatarText}>
                            {studentUser.name?.charAt(0).toUpperCase() || "S"}
                          </Text>
                        </View>
                      )}
                      <View style={styles.studentInfoCol}>
                        <Text style={styles.studentName} numberOfLines={1}>
                          {studentUser.name}
                        </Text>
                        <Text style={styles.studentMeta} numberOfLines={1}>
                          ID: {studentIdStr} • {studentUser.email}
                        </Text>
                      </View>
                    </View>

                    {/* Submission & Grade Action Row */}
                    <View style={styles.studentActionsRow}>
                      {sub?.submittedUrl ? (
                        <View style={styles.submissionMetaCol}>
                          <View style={styles.submittedTag}>
                            <Feather name="check" size={11} color={BENTO.mintText} />
                            <Text style={styles.submittedTagText}>
                              Submitted {formatDateTime(sub.createdAt)}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleOpenLink(sub.submittedUrl)}
                            style={styles.viewWorkBtn}
                            activeOpacity={0.8}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel={`View work submitted by ${studentUser.name}`}
                          >
                            <Feather
                              name="external-link"
                              size={12}
                              color={BENTO.navy}
                              style={{ marginRight: 5 }}
                            />
                            <Text style={styles.viewWorkBtnText}>View Work</Text>
                          </TouchableOpacity>
                        </View>
                      ) : item.submissionType === "HAND" ? (
                        <View style={styles.handSubTag}>
                          <Feather name="clipboard" size={11} color={BENTO.amberText} />
                          <Text style={styles.handSubText}>In-Hand Physical</Text>
                        </View>
                      ) : (
                        <View style={styles.noSubTag}>
                          <Feather name="minus-circle" size={11} color={BENTO.slate} />
                          <Text style={styles.noSubText}>No submission yet</Text>
                        </View>
                      )}

                      {/* Grade Input & Save */}
                      <View style={styles.gradeBox}>
                        <TextInput
                          style={styles.gradeInput}
                          placeholder={isGraded ? String(sub.marks) : "--"}
                          placeholderTextColor="#94a3b8"
                          keyboardType="numeric"
                          value={grades[studentUser.id] ?? ""}
                          onChangeText={(val) =>
                            handleGradeChange(studentUser.id, val)
                          }
                          accessible={true}
                          accessibilityLabel={`Score out of ${item.totalMarks}`}
                        />
                        <Text style={styles.maxMarksText}>/ {item.totalMarks}</Text>

                        <TouchableOpacity
                          style={[
                            styles.saveGradeBtn,
                            (!grades[studentUser.id] ||
                              gradeMutation.isPending) &&
                              styles.saveGradeBtnDisabled,
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
                          activeOpacity={0.85}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={`Save grade for ${studentUser.name}`}
                        >
                          {gradeMutation.isPending ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                          ) : (
                            <Feather name="check" size={15} color="#ffffff" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Toggle Footer */}
          <TouchableOpacity
            style={styles.collapseFooter}
            onPress={onToggle}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Collapse coursework details"
          >
            <Text style={styles.collapseText}>Collapse Details</Text>
            <Feather name="chevron-up" size={16} color={BENTO.slate} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO.card,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BENTO.border,
    shadowColor: BENTO.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
    overflow: "hidden",
  },
  cardExpanded: {
    borderColor: "rgba(19, 27, 46, 0.16)",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  cardHeaderTouchable: {
    padding: 20,
  },
  topBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bentoPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  bentoPillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  title: {
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: BENTO.navy,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  description: {
    fontFamily,
    fontSize: 14,
    color: BENTO.slate,
    lineHeight: 21,
    marginBottom: 14,
  },
  metaBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    paddingTop: 4,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: BENTO.canvas,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  submittedChip: {
    backgroundColor: BENTO.mintSoft,
    borderColor: BENTO.mintBorder,
  },
  metaChipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: BENTO.navy,
  },
  headerChevron: {
    marginLeft: "auto",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BENTO.canvas,
    alignItems: "center",
    justifyContent: "center",
  },

  // EXPANDED CONTENT
  expandedSection: {
    borderTopWidth: 1,
    borderTopColor: BENTO.border,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  sectionLabel: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: BENTO.navy,
  },

  // Student Section
  studentSection: {
    marginBottom: 16,
  },
  bentoSuccessBox: {
    backgroundColor: BENTO.mintSoft,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: BENTO.mintBorder,
  },
  successHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  successIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BENTO.mintText,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: BENTO.mintText,
  },
  successSubtitle: {
    fontFamily,
    fontSize: 12,
    color: BENTO.slate,
    marginTop: 2,
  },
  gradeResultBox: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.06)",
    marginBottom: 12,
  },
  gradeResultLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    color: BENTO.slate,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  scoreNumber: {
    fontFamily,
    fontSize: 26,
    fontWeight: "800",
    color: BENTO.navy,
  },
  scoreMax: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: BENTO.slate,
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 2,
  },
  pendingText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: BENTO.amberText,
  },
  viewLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  viewLinkBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.navy,
  },

  // Submission Input
  bentoSubmitBox: {
    backgroundColor: BENTO.subCard,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: BENTO.subCardBorder,
  },
  submitHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  deadlinePassedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: BENTO.roseSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BENTO.roseBorder,
  },
  deadlinePassedText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.roseText,
  },
  submitPrompt: {
    fontFamily,
    fontSize: 13,
    color: BENTO.slate,
    lineHeight: 18,
    marginBottom: 14,
  },
  bentoInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.12)",
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 4,
  },
  inputPrefix: {
    marginRight: 8,
  },
  bentoInput: {
    flex: 1,
    fontFamily,
    fontSize: 14,
    color: BENTO.navy,
    paddingVertical: 8,
  },
  bentoSubmitBtn: {
    backgroundColor: BENTO.navy,
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bentoSubmitBtnDisabled: {
    backgroundColor: "#94a3b8",
    opacity: 0.6,
  },
  overdueNote: {
    fontFamily,
    fontSize: 12,
    color: BENTO.roseText,
    marginTop: 8,
  },

  // Teacher Grading Section
  gradingSection: {
    marginTop: 8,
  },
  gradingSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  studentCountBadge: {
    backgroundColor: BENTO.canvas,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  studentCountText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.navy,
  },
  noStudentsBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    gap: 8,
  },
  emptyText: {
    fontFamily,
    fontSize: 13,
    color: BENTO.slate,
    fontStyle: "italic",
    textAlign: "center",
  },
  studentBentoCard: {
    backgroundColor: BENTO.subCard,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BENTO.subCardBorder,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#e2e8f0",
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: BENTO.blueSoft,
    borderWidth: 1,
    borderColor: BENTO.blueBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "700",
    color: BENTO.blueText,
  },
  studentInfoCol: {
    flex: 1,
  },
  studentName: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO.navy,
    marginBottom: 1,
  },
  studentMeta: {
    fontFamily,
    fontSize: 11,
    color: BENTO.slate,
  },
  studentActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(19, 27, 46, 0.05)",
  },
  submissionMetaCol: {
    flex: 1,
    gap: 4,
  },
  submittedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  submittedTagText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.mintText,
  },
  viewWorkBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.1)",
  },
  viewWorkBtnText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.navy,
  },
  noSubTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  noSubText: {
    fontFamily,
    fontSize: 11,
    color: BENTO.slate,
    fontStyle: "italic",
  },
  gradeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 10,
  },
  gradeInput: {
    width: 48,
    height: 36,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.15)",
    textAlign: "center",
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: BENTO.navy,
    paddingVertical: 4,
  },
  maxMarksText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: BENTO.slate,
  },
  saveGradeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
  },
  saveGradeBtnDisabled: {
    backgroundColor: "#94a3b8",
    opacity: 0.5,
  },
  bentoHandBox: {
    backgroundColor: BENTO.amberSoft,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: BENTO.amberBorder,
  },
  handHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  handIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BENTO.amberText,
    alignItems: "center",
    justifyContent: "center",
  },
  handTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: BENTO.amberText,
  },
  handSubtitle: {
    fontFamily,
    fontSize: 12,
    color: BENTO.slate,
    marginTop: 2,
  },
  handSubTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: BENTO.amberSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BENTO.amberBorder,
  },
  handSubText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.amberText,
  },
  collapseFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(19, 27, 46, 0.06)",
  },
  collapseText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: BENTO.slate,
  },
});
