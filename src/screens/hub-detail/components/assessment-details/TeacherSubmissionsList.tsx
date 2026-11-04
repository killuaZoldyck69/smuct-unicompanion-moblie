import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { AssessmentSubmission, GradingStudentTarget } from "./types";
import { openSafeUrl } from "./utils";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface TeacherSubmissionsListProps {
  submissions: AssessmentSubmission[];
  totalMarks: number;
  isLoading: boolean;
  hubMembers?: any[];
  isOffline?: boolean;
  onOpenGrading: (
    target: GradingStudentTarget,
    currentMarks?: number | null,
    currentFeedback?: string | null
  ) => void;
}

export const TeacherSubmissionsList: React.FC<TeacherSubmissionsListProps> = React.memo(
  ({
    submissions,
    totalMarks,
    isLoading,
    hubMembers = [],
    isOffline = false,
    onOpenGrading,
  }) => {
    // Extract enrolled students (STUDENT and CR) from hubMembers
    const enrolledStudents = useMemo(() => {
      return (hubMembers || []).filter(
        (m: any) => m.role === "STUDENT" || m.role === "CR"
      );
    }, [hubMembers]);

    // Build the list of student records to display
    const studentRecords = useMemo(() => {
      if (!isOffline) {
        // Online: show submitted students
        return submissions.map((sub) => {
          const studentName = sub.student?.name || "Student";
          const studentId = sub.studentId || sub.student?.id || sub.id;
          const isGraded = sub.marks !== null && sub.marks !== undefined;
          const member = (hubMembers || []).find(
            (m: any) =>
              (m.userId && (m.userId === sub.studentId || m.userId === sub.student?.id)) ||
              (m.user?.id && (m.user.id === sub.studentId || m.user.id === sub.student?.id)) ||
              (m.id && (m.id === sub.studentId || m.id === sub.student?.id))
          );
          const studentAvatar =
            sub.student?.image ||
            sub.student?.avatar ||
            member?.user?.image ||
            member?.user?.avatar;
          const studentIdDisplay =
            sub.student?.studentProfile?.studentId ||
            sub.student?.studentId ||
            member?.user?.studentProfile?.studentId ||
            member?.user?.studentId ||
            (member?.role === "STUDENT" || member?.role === "CR"
              ? member.studentId
              : null);

          return {
            key: sub.id,
            submissionId: sub.id,
            studentId,
            studentName,
            studentAvatar,
            studentIdDisplay,
            isGraded,
            marks: sub.marks,
            feedback: sub.feedback,
            isLate: sub.isLate,
            submittedAt: sub.createdAt,
            submittedUrl: sub.submittedUrl,
            attachments: sub.attachments,
            content: sub.content,
            isOfflineEntry: false,
          };
        });
      }

      // Offline Coursework: display all enrolled students in the class
      return enrolledStudents.map((member: any) => {
        const studentUser = member.user || {};
        const studentId = member.userId || studentUser.id || member.id;
        const studentName = studentUser.name || member.name || "Student";
        const studentAvatar =
          studentUser.image || studentUser.avatar || member.image;
        const studentIdDisplay =
          studentUser.studentProfile?.studentId ||
          studentUser.studentId ||
          member.studentId;

        // Match with existing submission if graded
        const matchingSub = submissions.find(
          (s) =>
            (s.studentId && (s.studentId === studentId || s.studentId === member.userId)) ||
            (s.student?.id && (s.student?.id === studentId || s.student?.id === member.userId))
        );

        const isGraded =
          matchingSub?.marks !== null && matchingSub?.marks !== undefined;

        return {
          key: matchingSub?.id || `offline-${studentId}`,
          submissionId: matchingSub?.id || studentId,
          studentId,
          studentName,
          studentAvatar,
          studentIdDisplay,
          isGraded,
          marks: matchingSub?.marks,
          feedback: matchingSub?.feedback,
          isLate: matchingSub?.isLate,
          submittedAt: matchingSub?.createdAt,
          submittedUrl: matchingSub?.submittedUrl,
          attachments: matchingSub?.attachments,
          content: matchingSub?.content,
          isOfflineEntry: true,
        };
      });
    }, [isOffline, submissions, enrolledStudents, hubMembers]);

    return (
      <View style={styles.container}>
        <Text style={styles.headingText}>
          {isOffline
            ? `Class Students (${studentRecords.length})`
            : `Student Submissions (${studentRecords.length})`}
        </Text>

        {isOffline && (
          <View style={styles.offlineInfoBanner}>
            <Feather name="info" size={14} color="#0369a1" style={{ marginRight: 8 }} />
            <Text style={styles.offlineInfoBannerText}>
              In-person coursework. Record marks and feedback for enrolled students below.
            </Text>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0f172a" />
            <Text style={styles.loadingText}>
              {isOffline ? "Loading enrolled students..." : "Loading submissions..."}
            </Text>
          </View>
        ) : studentRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name={isOffline ? "users" : "inbox"} size={40} color="#94a3b8" />
            <Text style={styles.emptyTitle}>
              {isOffline ? "No Enrolled Students" : "No Submissions Yet"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {isOffline
                ? "There are no students enrolled in this Course Hub yet."
                : "Students have not submitted their coursework for this assignment yet."}
            </Text>
          </View>
        ) : (
          studentRecords.map((item) => {
            return (
              <View key={item.key} style={styles.subCard}>
                {/* Header Row: Student Avatar + Name + ID + Date + Grade Pill */}
                <View style={styles.subCardHeaderRow}>
                  {/* Profile Avatar / Initials */}
                  {item.studentAvatar ? (
                    <Image source={{ uri: item.studentAvatar }} style={styles.studentAvatar} />
                  ) : (
                    <View style={styles.studentAvatarFallback}>
                      <Text style={styles.studentAvatarText}>
                        {item.studentName.charAt(0).toUpperCase() || "S"}
                      </Text>
                    </View>
                  )}

                  <View style={styles.studentInfoCol}>
                    <Text style={styles.studentNameText} numberOfLines={1}>
                      {item.studentName}
                    </Text>

                    {item.studentIdDisplay ? (
                      <View style={styles.studentIdBadge}>
                        <Feather name="hash" size={10} color="#475569" style={{ marginRight: 2 }} />
                        <Text style={styles.studentIdText}>ID: {item.studentIdDisplay}</Text>
                      </View>
                    ) : null}

                    <Text style={styles.submittedDateText}>
                      {item.isOfflineEntry
                        ? (item.isGraded ? "Graded in class" : "In-Person Evaluation • Awaiting Grade")
                        : (item.submittedAt
                            ? `Submitted: ${new Date(item.submittedAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}`
                            : "Declared In-Class")}
                    </Text>
                  </View>

                  {/* Grade Pill & Late Submission Tag Column */}
                  <View style={styles.gradeCol}>
                    <View
                      style={[
                        styles.gradeStatusPill,
                        item.isGraded ? styles.gradePillGraded : styles.gradePillUngraded,
                      ]}
                    >
                      <Text
                        style={[
                          styles.gradeStatusPillText,
                          item.isGraded ? styles.gradeTextGraded : styles.gradeTextUngraded,
                        ]}
                      >
                        {item.isGraded ? `${item.marks}/${totalMarks} Marks` : "Not Graded"}
                      </Text>
                    </View>

                    {item.isLate ? (
                      <View style={styles.lateSubmissionBadge}>
                        <Feather name="clock" size={9.5} color="#b45309" style={{ marginRight: 3 }} />
                        <Text style={styles.lateSubmissionBadgeText}>Late Submission</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                {/* Submitted URL (if online submission) */}
                {item.submittedUrl ? (
                  <TouchableOpacity
                    style={styles.attachmentChip}
                    onPress={() => openSafeUrl(item.submittedUrl)}
                    accessible={true}
                    accessibilityRole="link"
                    accessibilityLabel={`Open submission link ${item.submittedUrl}`}
                  >
                    <Feather name="link-2" size={14} color="#2563eb" style={{ marginRight: 6 }} />
                    <Text style={styles.attachmentChipText} numberOfLines={1}>
                      {item.submittedUrl}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {/* Submitted Attachments (if online submission) */}
                {item.attachments &&
                  item.attachments.map((att: any, aIdx: number) => (
                    <TouchableOpacity
                      key={`sub-att-${aIdx}`}
                      style={styles.attachmentChip}
                      onPress={() => openSafeUrl(att.url)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Open attachment ${att.name}`}
                    >
                      <Feather
                        name="file-text"
                        size={14}
                        color="#2563eb"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.attachmentChipText} numberOfLines={1}>
                        {att.name || "Attachment Document"}
                      </Text>
                    </TouchableOpacity>
                  ))}

                {/* Text answer or notes */}
                {item.content ? (
                  <Text style={styles.contentNotesText}>"{item.content}"</Text>
                ) : null}

                {/* Instructor feedback snippet */}
                {item.feedback ? (
                  <View style={styles.feedbackContainer}>
                    <Text style={styles.feedbackLabel}>Feedback:</Text>
                    <Text style={styles.feedbackContentText}>{item.feedback}</Text>
                  </View>
                ) : null}

                {/* Assign / Edit Grade Button */}
                <TouchableOpacity
                  style={styles.gradeActionBtn}
                  onPress={() =>
                    onOpenGrading(
                      {
                        submissionId: item.submissionId,
                        userId: item.studentId,
                        name: item.studentName,
                      },
                      item.marks,
                      item.feedback
                    )
                  }
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Grade ${item.studentName}`}
                >
                  <Feather
                    name="check-square"
                    size={14}
                    color="#ffffff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.gradeActionBtnText}>
                    {item.isGraded ? "Edit Marks & Feedback" : "Assign Grade"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  headingText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 10,
  },
  offlineInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderColor: "#bae6fd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14,
  },
  offlineInfoBannerText: {
    fontFamily,
    fontSize: 12.5,
    color: "#0369a1",
    fontWeight: "500",
    flex: 1,
    lineHeight: 17,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
    marginTop: 10,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 12,
  },
  emptySubtitle: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  subCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  subCardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  studentAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  studentAvatarText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
  },
  studentInfoCol: {
    flex: 1,
  },
  studentNameText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0f172a",
  },
  studentIdBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 2,
    marginBottom: 2,
  },
  studentIdText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "600",
    color: "#475569",
  },
  submittedDateText: {
    fontFamily,
    fontSize: 11,
    color: "#64748b",
  },
  gradeCol: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  gradeStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gradePillGraded: {
    backgroundColor: "#dcfce7",
  },
  gradePillUngraded: {
    backgroundColor: "#fef3c7",
  },
  gradeStatusPillText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
  },
  gradeTextGraded: {
    color: "#166534",
  },
  gradeTextUngraded: {
    color: "#92400e",
  },
  lateSubmissionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  lateSubmissionBadgeText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "600",
    color: "#b45309",
  },
  attachmentChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 10,
  },
  attachmentChipText: {
    fontFamily,
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "500",
    flex: 1,
  },
  contentNotesText: {
    fontFamily,
    fontSize: 12.5,
    color: "#334155",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    fontStyle: "italic",
  },
  feedbackContainer: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  feedbackLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 2,
  },
  feedbackContentText: {
    fontFamily,
    fontSize: 12,
    color: "#14532d",
  },
  gradeActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    paddingVertical: 9,
    borderRadius: 8,
    marginTop: 12,
  },
  gradeActionBtnText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "700",
    color: "#ffffff",
  },
});
