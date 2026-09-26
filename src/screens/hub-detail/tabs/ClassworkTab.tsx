import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import * as DocumentPicker from "expo-document-picker";

import {
  useAssessments,
  useCreateAssessment,
  useUpdateAssessment,
  useDeleteAssessment,
  useSubmitAssessment,
  useGradeSubmission,
  useBulkGrade,
} from "@/features/hubs/useHubs";
import CreateCourseworkModal from "../components/create-coursework-modal";
import EditCourseworkModal from "../components/edit-coursework-modal";
import { useCountdown } from "@/hooks/use-countdown";
import { uploadMultipleFilesToCloudinary } from "@/services/cloudinary-service";

const BENTO = {
  canvas: "#f8fafc",
  card: "#ffffff",
  navy: "#0f172a",
  slate: "#64748b",
  border: "rgba(15, 23, 42, 0.08)",
  shadow: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface ClassworkTabProps {
  hubId: string;
  hubDetails?: any;
  canManage: boolean;
  canSubmit?: boolean;
  currentUserId?: string;
}

type TypeFilter = "ALL" | "ASSIGNMENT" | "QUIZ" | "PRESENTATION";
type StatusFilter = "ALL" | "OPEN" | "DUE_SOON" | "OVERDUE" | "GRADED";

export default function ClassworkTab({
  hubId,
  hubDetails,
  canManage,
  canSubmit = true,
  currentUserId,
}: ClassworkTabProps) {
  const queryClient = useQueryClient();

  const { data: assessments, isLoading, isRefetching } = useAssessments(hubId);
  const createMutation = useCreateAssessment(hubId);
  const updateMutation = useUpdateAssessment(hubId);
  const deleteMutation = useDeleteAssessment(hubId);
  const submitMutation = useSubmitAssessment(hubId, "");

  // Filters
  const [selectedType, setSelectedType] = useState<TypeFilter>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("ALL");

  // Modals
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any | null>(null);

  // Student Submission Modal
  const [submittingAssessment, setSubmittingAssessment] = useState<any | null>(null);
  const [submissionMode, setSubmissionMode] = useState<"ONLINE" | "HAND">("ONLINE");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionAttachments, setSubmissionAttachments] = useState<any[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Teacher Grading Modal
  const [gradingAssessment, setGradingAssessment] = useState<any | null>(null);
  const [selectedStudentForGrading, setSelectedStudentForGrading] = useState<any | null>(null);
  const [gradeMarks, setGradeMarks] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");
  const gradeMutation = useGradeSubmission(gradingAssessment?.id || "");

  const assessmentList = Array.isArray(assessments) ? assessments : [];

  // Filtered List
  const displayedAssessments = useMemo(() => {
    let list = [...assessmentList];

    // Filter by Type
    if (selectedType !== "ALL") {
      list = list.filter((item: any) => {
        const t = (item.type || "").toUpperCase();
        if (selectedType === "QUIZ") return t.includes("QUIZ") || t.includes("CT");
        if (selectedType === "PRESENTATION") return t.includes("PRESENTATION");
        return t.includes("ASSIGNMENT");
      });
    }

    // Filter by Status
    if (selectedStatus !== "ALL") {
      const now = new Date().getTime();
      list = list.filter((item: any) => {
        const mySub = item.submissions?.find((s: any) => s.studentId === currentUserId);
        const deadlineTime = item.deadline ? new Date(item.deadline).getTime() : 0;
        const isOverdue = deadlineTime > 0 && deadlineTime < now;
        const diffHours = (deadlineTime - now) / (1000 * 60 * 60);
        const isDueSoon = diffHours > 0 && diffHours <= 48;

        if (selectedStatus === "GRADED") return mySub?.marks !== null && mySub?.marks !== undefined;
        if (selectedStatus === "OVERDUE") return isOverdue && !mySub;
        if (selectedStatus === "DUE_SOON") return isDueSoon && !mySub;
        if (selectedStatus === "OPEN") return !isOverdue;
        return true;
      });
    }

    return list.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.deadline).getTime();
      const timeB = new Date(b.createdAt || b.deadline).getTime();
      return timeB - timeA;
    });
  }, [assessmentList, selectedType, selectedStatus, currentUserId]);

  const handleCreateSubmit = (payload: any) => {
    createMutation.mutate(payload, {
      onSuccess: () => {
        setIsCreateModalVisible(false);
        Toast.show({ type: "success", text1: "Coursework Published!" });
      },
      onError: (err: any) => {
        Toast.show({
          type: "error",
          text1: "Creation Failed",
          text2: err.response?.data?.message || err.message,
        });
      },
    });
  };

  const handleEditSubmit = (payload: any) => {
    if (!editingAssessment) return;
    updateMutation.mutate(
      {
        assessmentId: editingAssessment.id,
        payload,
      },
      {
        onSuccess: () => {
          setEditingAssessment(null);
          Toast.show({ type: "success", text1: "Coursework Updated!" });
        },
        onError: (err: any) => {
          Toast.show({
            type: "error",
            text1: "Update Failed",
            text2: err.response?.data?.message || err.message,
          });
        },
      },
    );
  };

  const handleDelete = (assessmentId: string) => {
    deleteMutation.mutate(assessmentId, {
      onSuccess: () => {
        Toast.show({ type: "success", text1: "Coursework Deleted" });
      },
      onError: (err: any) => {
        Toast.show({
          type: "error",
          text1: "Delete Failed",
          text2: err.response?.data?.message || err.message,
        });
      },
    });
  };

  const handlePickSubmissionFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets || res.assets.length === 0) return;

      setIsUploadingFile(true);
      const uploaded = await uploadMultipleFilesToCloudinary(
        res.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || undefined,
          size: asset.size || undefined,
        })),
      );

      setSubmissionAttachments((prev) => [
        ...prev,
        ...uploaded.map((u) => ({ name: u.name, url: u.secureUrl, size: u.size, type: u.type })),
      ]);
      Toast.show({ type: "success", text1: "Files Uploaded" });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: err.message || "Failed to upload file",
      });
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleStudentSubmit = () => {
    if (!submittingAssessment) return;

    const isLate =
      submittingAssessment.deadline &&
      new Date().getTime() > new Date(submittingAssessment.deadline).getTime();

    submitMutation.mutate(
      {
        submittedUrl: submissionUrl.trim() || undefined,
        content: submissionContent.trim() || undefined,
        attachments: submissionAttachments.length > 0 ? submissionAttachments : undefined,
        status: submissionMode === "HAND" ? "HAND_SUBMISSION" : "SUBMITTED",
        isLate,
      },
      {
        onSuccess: () => {
          setSubmittingAssessment(null);
          setSubmissionUrl("");
          setSubmissionContent("");
          setSubmissionAttachments([]);
          Toast.show({ type: "success", text1: "Work Submitted Successfully!" });
        },
        onError: (err: any) => {
          Toast.show({
            type: "error",
            text1: "Submission Failed",
            text2: err.response?.data?.message || err.message,
          });
        },
      },
    );
  };

  const handleSaveGrade = () => {
    if (!gradingAssessment || !selectedStudentForGrading) return;

    const numMarks = parseFloat(gradeMarks);
    if (isNaN(numMarks) || numMarks < 0) {
      Toast.show({ type: "error", text1: "Invalid Marks", text2: "Marks must be a positive number." });
      return;
    }
    if (numMarks > gradingAssessment.totalMarks) {
      Toast.show({
        type: "error",
        text1: "Invalid Marks",
        text2: `Marks cannot exceed the maximum mark of ${gradingAssessment.totalMarks}.`,
      });
      return;
    }

    const sub = gradingAssessment.submissions?.find(
      (s: any) => s.studentId === selectedStudentForGrading.userId || s.student?.id === selectedStudentForGrading.userId,
    );

    if (!sub) {
      Toast.show({ type: "error", text1: "Submission not found" });
      return;
    }

    gradeMutation.mutate(
      {
        submissionId: sub.id,
        marks: numMarks,
        feedback: gradeFeedback.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSelectedStudentForGrading(null);
          setGradeMarks("");
          setGradeFeedback("");
          Toast.show({ type: "success", text1: "Grade & Feedback Saved!" });
        },
        onError: (err: any) => {
          Toast.show({
            type: "error",
            text1: "Grading Failed",
            text2: err.response?.data?.message || err.message,
          });
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Actions & Create Button */}
      {canManage && (
        <View style={styles.topActionBar}>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setIsCreateModalVisible(true)}
            activeOpacity={0.85}
          >
            <Feather name="plus-circle" size={17} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.createBtnText}>Create Classwork</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 2. Type Filter Pills */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[
            { id: "ALL", label: "All Types" },
            { id: "ASSIGNMENT", label: "Assignments" },
            { id: "QUIZ", label: "CT / Quizzes" },
            { id: "PRESENTATION", label: "Presentations" },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.filterChip, selectedType === item.id && styles.filterChipActive]}
              onPress={() => setSelectedType(item.id as TypeFilter)}
            >
              <Text style={[styles.filterChipText, selectedType === item.id && styles.filterChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 3. Classwork List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : displayedAssessments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Feather name="book-open" size={32} color="#94a3b8" />
          </View>
          <Text style={styles.emptyTitle}>No Classwork Assigned</Text>
          <Text style={styles.emptySubtitle}>
            {canManage
              ? "Publish assignments, schedule CT quizzes, or setup presentation milestones for students."
              : "Assignments, CT quizzes, and presentations will appear here once assigned by faculty."}
          </Text>
          {canManage && (
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => setIsCreateModalVisible(true)}
            >
              <Feather name="plus" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.emptyActionText}>Create Classwork</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={displayedAssessments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const mySub = item.submissions?.find((s: any) => s.studentId === currentUserId);
            const totalSubs = item.submissions?.length || 0;
            const gradedSubs = item.submissions?.filter((s: any) => s.marks !== null && s.marks !== undefined).length || 0;
            const pendingSubs = totalSubs - gradedSubs;

            const isQuiz = (item.type || "").toUpperCase().includes("QUIZ");
            const isPresentation = (item.type || "").toUpperCase().includes("PRESENTATION");

            return (
              <View style={styles.card}>
                {/* Header & Badges */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.typeBadgePill}>
                    <Feather
                      name={isQuiz ? "help-circle" : isPresentation ? "monitor" : "file-text"}
                      size={13}
                      color="#0284c7"
                      style={{ marginRight: 5 }}
                    />
                    <Text style={styles.typeBadgeText}>
                      {isQuiz ? "Quiz / CT" : isPresentation ? "Presentation" : "Assignment"}
                    </Text>
                  </View>

                  <View style={styles.marksBadge}>
                    <Text style={styles.marksBadgeText}>{item.totalMarks} Marks</Text>
                  </View>

                  {canManage && (
                    <View style={styles.actionMenuRow}>
                      <TouchableOpacity
                        onPress={() => setEditingAssessment(item)}
                        style={styles.iconBtn}
                      >
                        <Feather name="edit-2" size={14} color="#64748b" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert("Delete Classwork", `Are you sure you want to delete "${item.title}"?`, [
                            { text: "Cancel", style: "cancel" },
                            { text: "Delete", style: "destructive", onPress: () => handleDelete(item.id) },
                          ]);
                        }}
                        style={styles.iconBtn}
                      >
                        <Feather name="trash-2" size={14} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Title & Instructions */}
                <Text style={styles.classworkTitle}>{item.title}</Text>
                {item.description ? (
                  <Text style={styles.classworkDesc} numberOfLines={3}>
                    {item.description}
                  </Text>
                ) : null}

                {/* Due Date & Submission Mode */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Feather name="clock" size={13} color="#64748b" style={{ marginRight: 5 }} />
                    <Text style={styles.metaText}>
                      Due: {item.deadline ? new Date(item.deadline).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "No deadline"}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather
                      name={item.submissionType === "HAND" ? "user-check" : "upload-cloud"}
                      size={13}
                      color="#64748b"
                      style={{ marginRight: 5 }}
                    />
                    <Text style={styles.metaText}>
                      {item.submissionType === "HAND" ? "In-Person / Offline" : "Online Submission"}
                    </Text>
                  </View>
                </View>

                {/* Teacher / CR Stats Bar */}
                {canManage && (
                  <View style={styles.statsBanner}>
                    <View style={styles.statCol}>
                      <Text style={styles.statNum}>{totalSubs}</Text>
                      <Text style={styles.statLabel}>Submissions</Text>
                    </View>
                    <View style={styles.statCol}>
                      <Text style={[styles.statNum, { color: "#16a34a" }]}>{gradedSubs}</Text>
                      <Text style={styles.statLabel}>Graded</Text>
                    </View>
                    <View style={styles.statCol}>
                      <Text style={[styles.statNum, { color: "#ea580c" }]}>{pendingSubs}</Text>
                      <Text style={styles.statLabel}>Pending</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.gradeReviewBtn}
                      onPress={() => setGradingAssessment(item)}
                    >
                      <Text style={styles.gradeReviewBtnText}>View & Grade</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Student Status & Submission Pill */}
                {canSubmit && (
                  <View style={styles.studentStatusRow}>
                    {mySub ? (
                      <View style={styles.submittedPill}>
                        <Feather name="check-circle" size={14} color="#15803d" style={{ marginRight: 6 }} />
                        <Text style={styles.submittedPillText}>
                          {mySub.marks !== null && mySub.marks !== undefined
                            ? `Graded: ${mySub.marks} / ${item.totalMarks}`
                            : mySub.isLate
                            ? "Submitted (Late)"
                            : "Work Submitted"}
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.submitWorkBtn}
                        onPress={() => {
                          setSubmittingAssessment(item);
                          setSubmissionMode(item.submissionType === "HAND" ? "HAND" : "ONLINE");
                          setSubmissionUrl("");
                          setSubmissionContent("");
                          setSubmissionAttachments([]);
                        }}
                      >
                        <Feather name="upload" size={14} color="#ffffff" style={{ marginRight: 6 }} />
                        <Text style={styles.submitWorkBtnText}>Submit Work</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                queryClient.invalidateQueries({ queryKey: ["assessments", hubId] });
              }}
              tintColor="#0f172a"
            />
          }
        />
      )}

      {/* Create Coursework Modal */}
      <CreateCourseworkModal
        isVisible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSubmit={handleCreateSubmit}
        isPending={createMutation.isPending}
      />

      {/* Edit Coursework Modal */}
      {editingAssessment && (
        <EditCourseworkModal
          isVisible={!!editingAssessment}
          onClose={() => setEditingAssessment(null)}
          onSubmit={handleEditSubmit}
          isPending={updateMutation.isPending}
          assessment={editingAssessment}
        />
      )}

      {/* Student Submission Modal */}
      {submittingAssessment && (
        <Modal visible={!!submittingAssessment} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Submit Classwork</Text>
                <TouchableOpacity onPress={() => setSubmittingAssessment(null)}>
                  <Feather name="x" size={20} color="#0f172a" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>{submittingAssessment.title}</Text>

              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>Google Drive / Work URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://drive.google.com/... or link"
                  value={submissionUrl}
                  onChangeText={setSubmissionUrl}
                  autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>Notes / Text Answer (Optional)</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  placeholder="Additional notes for your instructor..."
                  value={submissionContent}
                  onChangeText={setSubmissionContent}
                  multiline
                />

                {/* Attach File via Cloudinary */}
                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={handlePickSubmissionFile}
                  disabled={isUploadingFile}
                >
                  {isUploadingFile ? (
                    <ActivityIndicator size="small" color="#0284c7" />
                  ) : (
                    <Feather name="paperclip" size={15} color="#0284c7" style={{ marginRight: 6 }} />
                  )}
                  <Text style={styles.uploadBtnText}>
                    {isUploadingFile ? "Uploading File..." : "+ Attach Document / PDF"}
                  </Text>
                </TouchableOpacity>

                {submissionAttachments.map((att, idx) => (
                  <View key={idx} style={styles.attRow}>
                    <Text style={styles.attText} numberOfLines={1}>{att.name}</Text>
                    <TouchableOpacity onPress={() => setSubmissionAttachments((prev) => prev.filter((_, i) => i !== idx))}>
                      <Feather name="x" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.confirmSubmitBtn, (!submissionUrl && submissionAttachments.length === 0 && !submissionContent) && { opacity: 0.6 }]}
                  onPress={handleStudentSubmit}
                  disabled={!submissionUrl && submissionAttachments.length === 0 && !submissionContent}
                >
                  <Text style={styles.confirmSubmitBtnText}>Turn In Assignment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Teacher Grading Modal */}
      {gradingAssessment && (
        <Modal visible={!!gradingAssessment} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalSheet, { maxHeight: "85%" }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Grade Submissions</Text>
                <TouchableOpacity onPress={() => setGradingAssessment(null)}>
                  <Feather name="x" size={20} color="#0f172a" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle}>
                {gradingAssessment.title} (Max: {gradingAssessment.totalMarks} Marks)
              </Text>

              {/* Submissions List */}
              <ScrollView style={{ marginTop: 12 }}>
                {gradingAssessment.submissions?.length === 0 ? (
                  <Text style={styles.noSubsText}>No student submissions received yet.</Text>
                ) : (
                  gradingAssessment.submissions?.map((sub: any) => {
                    const studentName = sub.student?.name || "Student";
                    const isGraded = sub.marks !== null && sub.marks !== undefined;

                    return (
                      <View key={sub.id} style={styles.gradeSubItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.subStudentName}>{studentName}</Text>
                          <Text style={styles.subTimeText}>
                            Submitted: {new Date(sub.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            {sub.isLate ? " (Late)" : ""}
                          </Text>
                          {sub.submittedUrl && (
                            <TouchableOpacity onPress={() => Linking.openURL(sub.submittedUrl)}>
                              <Text style={styles.subUrlText} numberOfLines={1}>🔗 {sub.submittedUrl}</Text>
                            </TouchableOpacity>
                          )}
                          {sub.feedback && (
                            <Text style={styles.feedbackSnippet}>Feedback: "{sub.feedback}"</Text>
                          )}
                        </View>

                        <View style={styles.gradeActionCol}>
                          <Text style={styles.currentGradeBadge}>
                            {isGraded ? `${sub.marks}/${gradingAssessment.totalMarks}` : "Ungraded"}
                          </Text>
                          <TouchableOpacity
                            style={styles.gradeSmallBtn}
                            onPress={() => {
                              setSelectedStudentForGrading({ userId: sub.studentId, name: studentName });
                              setGradeMarks(isGraded ? String(sub.marks) : "");
                              setGradeFeedback(sub.feedback || "");
                            }}
                          >
                            <Text style={styles.gradeSmallBtnText}>{isGraded ? "Edit Grade" : "Assign Grade"}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>

              {/* Individual Student Grade Input Sheet */}
              {selectedStudentForGrading && (
                <View style={styles.gradingFormContainer}>
                  <Text style={styles.gradingFormTitle}>Grading: {selectedStudentForGrading.name}</Text>
                  <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                    <TextInput
                      style={[styles.input, { width: 100 }]}
                      placeholder={`0 - ${gradingAssessment.totalMarks}`}
                      value={gradeMarks}
                      onChangeText={setGradeMarks}
                      keyboardType="numeric"
                    />
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#64748b" }}>
                      / {gradingAssessment.totalMarks} Marks
                    </Text>
                  </View>
                  <TextInput
                    style={[styles.input, { height: 60, marginTop: 8 }]}
                    placeholder="Feedback for student (optional)..."
                    value={gradeFeedback}
                    onChangeText={setGradeFeedback}
                    multiline
                  />
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                    <TouchableOpacity
                      style={styles.saveGradeBtn}
                      onPress={handleSaveGrade}
                      disabled={gradeMutation.isPending}
                    >
                      <Text style={styles.saveGradeBtnText}>Save Grade</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelGradeBtn}
                      onPress={() => setSelectedStudentForGrading(null)}
                    >
                      <Text style={styles.cancelGradeBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  topActionBar: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    paddingVertical: 12,
    borderRadius: 9999,
  },
  createBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  filterSection: {
    marginBottom: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
  },
  filterChipActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  filterChipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  filterChipTextActive: {
    color: "#ffffff",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  emptyActionText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    ...BENTO.shadow,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  typeBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  typeBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#0284c7",
    textTransform: "uppercase",
  },
  marksBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  marksBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  actionMenuRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    gap: 6,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
  },
  classworkTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  classworkDesc: {
    fontFamily,
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  statsBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 10,
    marginTop: 6,
  },
  statCol: {
    marginRight: 16,
  },
  statNum: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  statLabel: {
    fontFamily,
    fontSize: 10,
    color: "#64748b",
    fontWeight: "600",
  },
  gradeReviewBtn: {
    marginLeft: "auto",
    backgroundColor: "#0f172a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  gradeReviewBtnText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
  },
  studentStatusRow: {
    marginTop: 6,
  },
  submittedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  submittedPillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#15803d",
  },
  submitWorkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0284c7",
    paddingVertical: 10,
    borderRadius: 12,
  },
  submitWorkBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  modalSubtitle: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
    marginTop: 4,
  },
  modalBody: {
    marginTop: 14,
  },
  inputLabel: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#0f172a",
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  uploadBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0284c7",
  },
  attRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f1f5f9",
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  attText: {
    fontFamily,
    fontSize: 12,
    color: "#0f172a",
    flex: 1,
  },
  confirmSubmitBtn: {
    backgroundColor: "#0f172a",
    paddingVertical: 14,
    borderRadius: 9999,
    alignItems: "center",
    marginTop: 18,
  },
  confirmSubmitBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
  noSubsText: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    marginVertical: 20,
  },
  gradeSubItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  subStudentName: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  subTimeText: {
    fontFamily,
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  subUrlText: {
    fontFamily,
    fontSize: 12,
    color: "#2563eb",
    marginTop: 4,
    fontWeight: "600",
  },
  feedbackSnippet: {
    fontFamily,
    fontSize: 11,
    color: "#475569",
    fontStyle: "italic",
    marginTop: 4,
  },
  gradeActionCol: {
    alignItems: "flex-end",
    gap: 6,
  },
  currentGradeBadge: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
  },
  gradeSmallBtn: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  gradeSmallBtnText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  gradingFormContainer: {
    backgroundColor: "#f1f5f9",
    padding: 14,
    borderRadius: 14,
    marginTop: 12,
  },
  gradingFormTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  saveGradeBtn: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveGradeBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: "#ffffff",
  },
  cancelGradeBtn: {
    backgroundColor: "#cbd5e1",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelGradeBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
});
