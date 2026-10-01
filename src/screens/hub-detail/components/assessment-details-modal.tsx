import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import {
  useAssessmentSubmissions,
  useSubmitAssessment,
  useGradeSubmission,
} from "@/features/hubs/useHubs";

import {
  AssessmentDetailsModalProps,
  GradingStudentTarget,
  AssessmentSubmission,
  AssessmentData,
  AssessmentAttachment,
} from "./assessment-details/types";
import { getAssessmentTypeConfig } from "./assessment-details/utils";
import { AssessmentHeroCard } from "./assessment-details/AssessmentHeroCard";
import { AssessmentResourcesSection } from "./assessment-details/AssessmentResourcesSection";
import { SubmissionsAnalyticsCard } from "./assessment-details/SubmissionsAnalyticsCard";
import { TeacherSubmissionsList } from "./assessment-details/TeacherSubmissionsList";
import { GradingModalSheet } from "./assessment-details/GradingModalSheet";
import { StudentSubmissionView } from "./assessment-details/StudentSubmissionView";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface AssessmentDetailsContentProps {
  onClose: () => void;
  assessment: AssessmentData;
  hubId: string;
  canManage: boolean;
  canSubmit?: boolean;
  isTeacher?: boolean;
  currentUserId?: string;
  hubMembers?: any[];
  onEdit?: (item: AssessmentData) => void;
  onDelete?: (assessmentId: string) => void;
}

function AssessmentDetailsContent({
  onClose,
  assessment,
  hubId,
  canManage: _canManage,
  canSubmit = true,
  isTeacher,
  currentUserId,
  hubMembers = [],
  onEdit,
  onDelete,
}: AssessmentDetailsContentProps) {
  // Check if current user has the TEACHER role.
  // CR and TA are treated as students for coursework submission and cannot view/grade peer submissions.
  const isTeacherUser = Boolean(
    isTeacher ||
      hubMembers?.some(
        (m: any) =>
          (m.userId === currentUserId || m.id === currentUserId) &&
          m.role === "TEACHER"
      )
  );

  // React Queries & Mutations - Only teachers can fetch all student submissions
  const { data: serverSubmissions, isLoading: isLoadingSubmissions } =
    useAssessmentSubmissions(isTeacherUser ? assessment.id : "");
  const submitMutation = useSubmitAssessment(hubId, assessment.id);
  const gradeMutation = useGradeSubmission(assessment.id);

  // Tab State: Teachers default to DETAILS; CR, TA, and Students default to MY_SUBMISSION
  const [activeTab, setActiveTab] = useState<"DETAILS" | "MY_SUBMISSION">(
    isTeacherUser ? "DETAILS" : "MY_SUBMISSION"
  );

  // Grading Sheet Target State
  const [gradingTarget, setGradingTarget] = useState<GradingStudentTarget | null>(null);
  const [initialGradeMarks, setInitialGradeMarks] = useState<number | null>(null);
  const [initialGradeFeedback, setInitialGradeFeedback] = useState<string | null>(null);

  // Memoized Submissions List
  const submissionsList: AssessmentSubmission[] = useMemo(() => {
    if (Array.isArray(serverSubmissions) && serverSubmissions.length > 0) {
      return serverSubmissions;
    }
    if (Array.isArray(assessment.submissions)) {
      return assessment.submissions;
    }
    return [];
  }, [serverSubmissions, assessment.submissions]);

  // Current student's own submission
  const mySub = useMemo(() => {
    return submissionsList.find(
      (s: AssessmentSubmission) => s.studentId === currentUserId || s.student?.id === currentUserId
    );
  }, [submissionsList, currentUserId]);

  // Submissions Analytics Computation
  const eligibleStudentCount = useMemo(() => {
    const students = hubMembers.filter((m: { role?: string }) =>
      ["STUDENT", "CR", "TA"].includes(m.role || "")
    );
    return students.length > 0 ? students.length : Math.max(submissionsList.length, 12);
  }, [hubMembers, submissionsList.length]);

  const totalSubmitted = submissionsList.length;
  const gradedCount = useMemo(() => {
    return submissionsList.filter(
      (s) => s.marks !== null && s.marks !== undefined
    ).length;
  }, [submissionsList]);
  const pendingCount = Math.max(0, eligibleStudentCount - totalSubmitted);

  const typeConfig = useMemo(() => {
    return getAssessmentTypeConfig(assessment.type);
  }, [assessment.type]);

  const isOverdue = useMemo(() => {
    return Boolean(
      assessment.deadline && new Date().getTime() > new Date(assessment.deadline).getTime()
    );
  }, [assessment.deadline]);

  const statusLabel = useMemo(() => {
    if (assessment.status) {
      return (
        assessment.status.charAt(0).toUpperCase() +
        assessment.status.slice(1).toLowerCase()
      );
    }
    return isOverdue ? "Closed" : "Published";
  }, [assessment.status, isOverdue]);

  // Navigation title
  const appBarTitle = useMemo(() => {
    if (!isTeacherUser) return "Submit Classwork";
    if (activeTab === "DETAILS") return "Classwork Details";
    return "Submit Classwork";
  }, [activeTab, isTeacherUser]);

  // Handlers
  const handleOpenGrading = useCallback(
    (
      target: GradingStudentTarget,
      currentMarks?: number | null,
      currentFeedback?: string | null
    ) => {
      setGradingTarget(target);
      setInitialGradeMarks(currentMarks ?? null);
      setInitialGradeFeedback(currentFeedback ?? null);
    },
    []
  );

  const handleSaveGrade = useCallback(
    (marks: number, feedback?: string) => {
      if (!gradingTarget) return;

      gradeMutation.mutate(
        {
          submissionId: gradingTarget.submissionId,
          marks,
          feedback,
        },
        {
          onSuccess: () => {
            setGradingTarget(null);
            Toast.show({ type: "success", text1: "Grade & Feedback Saved!" });
          },
          onError: (err: any) => {
            Toast.show({
              type: "error",
              text1: "Grading Failed",
              text2: err.response?.data?.message || err.message,
            });
          },
        }
      );
    },
    [gradingTarget, gradeMutation]
  );

  const handleStudentSubmit = useCallback(
    (payload: {
      submittedUrl?: string;
      content?: string;
      attachments?: AssessmentAttachment[];
      links?: { title: string; url: string }[];
      status: "SUBMITTED" | "HAND_SUBMISSION";
      isLate?: boolean;
    }) => {
      submitMutation.mutate(payload as any, {
        onSuccess: () => {
          Toast.show({ type: "success", text1: "Work Submitted Successfully!" });
        },
        onError: (err: any) => {
          Toast.show({
            type: "error",
            text1: "Submission Failed",
            text2: err.response?.data?.message || err.message,
          });
        },
      });
    },
    [submitMutation]
  );

  return (
    <SafeAreaView style={styles.modalRoot} edges={["top", "bottom"]}>
        {/* TOP APP BAR */}
        <View style={styles.appBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="arrow-left" size={22} color="#0f172a" />
          </TouchableOpacity>

          <Text style={styles.appBarTitle} numberOfLines={1}>
            {appBarTitle}
          </Text>

          {/* Teacher Only Management Controls */}
          {isTeacherUser && (
            <View style={styles.headerActionsRow}>
              {canSubmit && (
                <TouchableOpacity
                  style={[
                    styles.modeTogglePill,
                    activeTab === "MY_SUBMISSION" && styles.modeTogglePillActive,
                  ]}
                  onPress={() =>
                    setActiveTab((prev) =>
                      prev === "MY_SUBMISSION" ? "DETAILS" : "MY_SUBMISSION"
                    )
                  }
                >
                  <Text
                    style={[
                      styles.modeToggleText,
                      activeTab === "MY_SUBMISSION" && styles.modeToggleTextActive,
                    ]}
                  >
                    {activeTab === "MY_SUBMISSION" ? "Overview" : "My Submission"}
                  </Text>
                </TouchableOpacity>
              )}

              {activeTab === "DETAILS" && onEdit && (
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => onEdit(assessment)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Edit classwork"
                >
                  <Feather name="edit-2" size={15} color="#64748b" />
                </TouchableOpacity>
              )}

              {activeTab === "DETAILS" && onDelete && (
                <TouchableOpacity
                  style={[styles.iconBtn, styles.deleteBtn]}
                  onPress={() => {
                    Alert.alert(
                      "Delete Classwork",
                      `Are you sure you want to delete "${assessment.title}"?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => onDelete(assessment.id),
                        },
                      ]
                    );
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Delete classwork"
                >
                  <Feather name="trash-2" size={15} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* ===================================================================== */}
        {/* VIEW 1: TEACHER CLASSWORK DETAILS & INLINE SUBMISSIONS (UNIFIED)      */}
        {/* ===================================================================== */}
        {isTeacherUser && activeTab === "DETAILS" && (
          <View style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <AssessmentHeroCard
                assessment={assessment}
                typeConfig={typeConfig}
                statusLabel={statusLabel}
                isOverdue={isOverdue}
              />

              <AssessmentResourcesSection
                attachments={assessment.attachments}
                links={assessment.links}
              />

              <SubmissionsAnalyticsCard
                total={eligibleStudentCount}
                submitted={totalSubmitted}
                pending={pendingCount}
                graded={gradedCount}
              />

              {/* ALL SUBMISSIONS UNDER STATS */}
              <View style={styles.submissionsSectionContainer}>
                <TeacherSubmissionsList
                  submissions={submissionsList}
                  totalMarks={assessment.totalMarks}
                  isLoading={isLoadingSubmissions}
                  hubMembers={hubMembers}
                  onOpenGrading={handleOpenGrading}
                />
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>

            {/* SECURE GRADING MODAL SHEET */}
            <GradingModalSheet
              target={gradingTarget}
              totalMarks={assessment.totalMarks}
              initialMarks={initialGradeMarks}
              initialFeedback={initialGradeFeedback}
              isPending={gradeMutation.isPending}
              onClose={() => setGradingTarget(null)}
              onSave={handleSaveGrade}
            />
          </View>
        )}

        {/* ===================================================================== */}
        {/* VIEW 2: STUDENT SUBMISSION SCREEN (IMAGE 2)                          */}
        {/* ===================================================================== */}
        {(!isTeacherUser || activeTab === "MY_SUBMISSION") && (
          <View style={{ flex: 1 }}>
            <StudentSubmissionView
              assessment={assessment}
              typeConfig={typeConfig}
              mySub={mySub}
              isSubmitting={submitMutation.isPending}
              onSubmit={handleStudentSubmit}
            />
          </View>
        )}
      </SafeAreaView>
  );
}

export default function AssessmentDetailsModal(props: AssessmentDetailsModalProps) {
  const { isVisible, onClose, assessment } = props;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      {assessment ? <AssessmentDetailsContent {...props} assessment={assessment} /> : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 23, 42, 0.06)",
    backgroundColor: "#ffffff",
  },
  backBtn: {
    padding: 6,
    marginRight: 10,
  },
  appBarTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    flex: 1,
  },
  headerActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modeTogglePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    backgroundColor: "#f1f5f9",
  },
  modeTogglePillActive: {
    backgroundColor: "#0f172a",
  },
  modeToggleText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  modeToggleTextActive: {
    color: "#ffffff",
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    backgroundColor: "#fef2f2",
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  submissionsSectionContainer: {
    marginTop: 16,
  },
});
