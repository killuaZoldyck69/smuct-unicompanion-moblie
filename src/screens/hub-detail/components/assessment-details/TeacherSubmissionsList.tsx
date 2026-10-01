import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
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
  onOpenGrading: (
    target: GradingStudentTarget,
    currentMarks?: number | null,
    currentFeedback?: string | null
  ) => void;
}

export const TeacherSubmissionsList: React.FC<TeacherSubmissionsListProps> = React.memo(
  ({ submissions, totalMarks, isLoading, onOpenGrading }) => {
    return (
      <View style={styles.container}>
        <Text style={styles.headingText}>
          Student Submissions ({submissions.length})
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0f172a" />
            <Text style={styles.loadingText}>Loading submissions...</Text>
          </View>
        ) : submissions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={40} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No Submissions Yet</Text>
            <Text style={styles.emptySubtitle}>
              Students have not submitted their coursework for this assignment yet.
            </Text>
          </View>
        ) : (
          submissions.map((sub) => {
            const studentName = sub.student?.name || "Student";
            const studentId = sub.studentId || sub.student?.id || sub.id;
            const isGraded = sub.marks !== null && sub.marks !== undefined;

            return (
              <View key={sub.id} style={styles.subCard}>
                {/* Header Row: Student Name + Date + Grade Pill */}
                <View style={styles.subCardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentNameText}>{studentName}</Text>
                    <Text style={styles.submittedDateText}>
                      Submitted:{" "}
                      {new Date(sub.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {sub.isLate ? (
                        <Text style={{ color: "#ef4444", fontWeight: "700" }}> (Late)</Text>
                      ) : null}
                    </Text>
                  </View>

                  {/* Grade Pill */}
                  <View
                    style={[
                      styles.gradeStatusPill,
                      isGraded ? styles.gradePillGraded : styles.gradePillUngraded,
                    ]}
                  >
                    <Text
                      style={[
                        styles.gradeStatusPillText,
                        isGraded ? styles.gradeTextGraded : styles.gradeTextUngraded,
                      ]}
                    >
                      {isGraded ? `${sub.marks}/${totalMarks} Marks` : "Ungraded"}
                    </Text>
                  </View>
                </View>

                {/* Submitted URL */}
                {sub.submittedUrl ? (
                  <TouchableOpacity
                    style={styles.attachmentChip}
                    onPress={() => openSafeUrl(sub.submittedUrl)}
                    accessible={true}
                    accessibilityRole="link"
                    accessibilityLabel={`Open submission link ${sub.submittedUrl}`}
                  >
                    <Feather name="link-2" size={14} color="#2563eb" style={{ marginRight: 6 }} />
                    <Text style={styles.attachmentChipText} numberOfLines={1}>
                      {sub.submittedUrl}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {/* Submitted Attachments */}
                {sub.attachments &&
                  sub.attachments.map((att, aIdx) => (
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
                {sub.content ? (
                  <Text style={styles.contentNotesText}>"{sub.content}"</Text>
                ) : null}

                {/* Instructor feedback snippet */}
                {sub.feedback ? (
                  <View style={styles.feedbackContainer}>
                    <Text style={styles.feedbackLabel}>Feedback:</Text>
                    <Text style={styles.feedbackContentText}>{sub.feedback}</Text>
                  </View>
                ) : null}

                {/* Assign / Edit Grade Button */}
                <TouchableOpacity
                  style={styles.gradeActionBtn}
                  onPress={() =>
                    onOpenGrading(
                      {
                        submissionId: sub.id,
                        userId: studentId,
                        name: studentName,
                      },
                      sub.marks,
                      sub.feedback
                    )
                  }
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Grade ${studentName}`}
                >
                  <Feather
                    name="check-square"
                    size={14}
                    color="#ffffff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.gradeActionBtnText}>
                    {isGraded ? "Edit Marks & Feedback" : "Assign Grade"}
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
    marginBottom: 14,
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
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 12,
  },
  emptySubtitle: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 20,
  },
  subCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  subCardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  studentNameText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "800",
    color: "#0f172a",
  },
  submittedDateText: {
    fontFamily,
    fontSize: 11.5,
    color: "#64748b",
    marginTop: 2,
  },
  gradeStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 9999,
  },
  gradePillGraded: {
    backgroundColor: "#f0fdf4",
  },
  gradePillUngraded: {
    backgroundColor: "#f8fafc",
  },
  gradeStatusPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
  },
  gradeTextGraded: {
    color: "#16a34a",
  },
  gradeTextUngraded: {
    color: "#64748b",
  },
  attachmentChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 6,
  },
  attachmentChipText: {
    fontFamily,
    fontSize: 12,
    color: "#2563eb",
    flex: 1,
    fontWeight: "600",
  },
  contentNotesText: {
    fontFamily,
    fontSize: 12.5,
    color: "#475569",
    fontStyle: "italic",
    marginTop: 6,
    lineHeight: 18,
  },
  feedbackContainer: {
    backgroundColor: "#f8fafc",
    padding: 9,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#2563eb",
  },
  feedbackLabel: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
  },
  feedbackContentText: {
    fontFamily,
    fontSize: 12,
    color: "#0f172a",
    marginTop: 2,
  },
  gradeActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 10,
  },
  gradeActionBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: "#ffffff",
  },
});
