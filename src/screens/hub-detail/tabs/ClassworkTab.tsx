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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import {
  useAssessments,
  useCreateAssessment,
  useUpdateAssessment,
  useDeleteAssessment,
} from "@/features/hubs/useHubs";
import CreateCourseworkModal from "../components/create-coursework-modal";
import EditCourseworkModal from "../components/edit-coursework-modal";
import AssessmentDetailsModal from "../components/assessment-details-modal";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

const formatDueDate = (dateString?: string) => {
  if (!dateString) return "No deadline";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "No deadline";
    const day = d.getDate();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = hours.toString().padStart(2, "0");
    return `${day} ${month} ${year}, ${hoursStr}:${minutes} ${ampm}`;
  } catch {
    return "No deadline";
  }
};

const getAssessmentTypeConfig = (type?: string) => {
  const t = (type || "ASSIGNMENT").toUpperCase();
  if (t.includes("QUIZ") || t.includes("CT")) {
    return {
      label: "CT / Quiz",
      icon: "clipboard" as const,
      badgeBg: "#EFF6FF",
      badgeText: "#2563EB",
      iconBg: "#EFF6FF",
      iconColor: "#2563EB",
      iconBorder: "#DBEAFE",
    };
  }
  if (t.includes("PRESENTATION")) {
    return {
      label: "Presentation",
      icon: "monitor" as const,
      badgeBg: "#ECFDF5",
      badgeText: "#059669",
      iconBg: "#ECFDF5",
      iconColor: "#059669",
      iconBorder: "#A7F3D0",
    };
  }
  if (t.includes("EXAM") || t.includes("MID") || t.includes("FINAL")) {
    return {
      label: "Exam",
      icon: "award" as const,
      badgeBg: "#FAF5FF",
      badgeText: "#7E22CE",
      iconBg: "#FAF5FF",
      iconColor: "#7E22CE",
      iconBorder: "#E9D5FF",
    };
  }
  // Default: Assignment
  return {
    label: "Assignment",
    icon: "file-text" as const,
    badgeBg: "#FDF2F8",
    badgeText: "#C026D3",
    iconBg: "#FDF2F8",
    iconColor: "#C026D3",
    iconBorder: "#FCE7F3",
  };
};

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

  // Filters
  const [selectedType, setSelectedType] = useState<TypeFilter>("ALL");
  const [selectedStatus] = useState<StatusFilter>("ALL");

  // Modals
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<any | null>(
    null,
  );

  const assessmentList = useMemo(
    () => (Array.isArray(assessments) ? assessments : []),
    [assessments],
  );

  // Keep selected assessment up to date with fresh data from query
  const currentSelectedAssessment = useMemo(() => {
    if (!selectedAssessment) return null;
    return (
      assessmentList.find((a: any) => a.id === selectedAssessment.id) ||
      selectedAssessment
    );
  }, [assessmentList, selectedAssessment]);

  // Filtered List
  const displayedAssessments = useMemo(() => {
    let list = [...assessmentList];

    // Filter by Type
    if (selectedType !== "ALL") {
      list = list.filter((item: any) => {
        const t = (item.type || "").toUpperCase();
        if (selectedType === "QUIZ")
          return t.includes("QUIZ") || t.includes("CT");
        if (selectedType === "PRESENTATION") return t.includes("PRESENTATION");
        return t.includes("ASSIGNMENT");
      });
    }

    // Filter by Status
    if (selectedStatus !== "ALL") {
      const now = new Date().getTime();
      list = list.filter((item: any) => {
        const mySub = item.submissions?.find(
          (s: any) => s.studentId === currentUserId,
        );
        const deadlineTime = item.deadline
          ? new Date(item.deadline).getTime()
          : 0;
        const isOverdue = deadlineTime > 0 && deadlineTime < now;
        const diffHours = (deadlineTime - now) / (1000 * 60 * 60);
        const isDueSoon = diffHours > 0 && diffHours <= 48;

        if (selectedStatus === "GRADED")
          return mySub?.marks !== null && mySub?.marks !== undefined;
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
            <Feather
              name="plus-circle"
              size={17}
              color="#ffffff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.createBtnText}>Create Classwork</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 2. Type Filter Pills */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {[
            { id: "ALL", label: "All Types" },
            { id: "ASSIGNMENT", label: "Assignments" },
            { id: "QUIZ", label: "CT / Quizzes" },
            { id: "PRESENTATION", label: "Presentations" },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.filterChip,
                selectedType === item.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedType(item.id as TypeFilter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedType === item.id && styles.filterChipTextActive,
                ]}
              >
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
              <Feather
                name="plus"
                size={16}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.emptyActionText}>Create Classwork</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={displayedAssessments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const typeConfig = getAssessmentTypeConfig(item.type);

            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => setSelectedAssessment(item)}
              >
                {/* Main Card Content: Left Icon + Right Details */}
                <View style={styles.cardContentRow}>
                  {/* Left Circular Icon */}
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
                    {/* Top Row: Type Pill Badge (no Published/Closed tags) & Management Actions */}
                    <View style={styles.cardTopRow}>
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

                      {canManage && (
                        <View style={styles.actionMenuRow}>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation?.();
                              setEditingAssessment(item);
                            }}
                            style={styles.iconBtn}
                            activeOpacity={0.7}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Feather name="edit-2" size={13} color="#64748b" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation?.();
                              Alert.alert(
                                "Delete Classwork",
                                `Are you sure you want to delete "${item.title}"?`,
                                [
                                  { text: "Cancel", style: "cancel" },
                                  {
                                    text: "Delete",
                                    style: "destructive",
                                    onPress: () => handleDelete(item.id),
                                  },
                                ],
                              );
                            }}
                            style={[styles.iconBtn, styles.deleteIconBtn]}
                            activeOpacity={0.7}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Feather name="trash-2" size={13} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    {/* Classwork Title */}
                    <Text style={styles.classworkTitle}>{item.title}</Text>

                    {/* Due Date */}
                    <Text style={styles.dueText}>
                      Due: {formatDueDate(item.deadline)}
                    </Text>

                    {/* Max Marks */}
                    <Text style={styles.maxMarksText}>
                      Max Marks: {item.totalMarks}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                queryClient.invalidateQueries({
                  queryKey: ["assessments", hubId],
                });
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

      {/* Assessment Details & Submission Modal for Teacher, CR, and Students */}
      {currentSelectedAssessment && (
        <AssessmentDetailsModal
          isVisible={!!currentSelectedAssessment}
          onClose={() => setSelectedAssessment(null)}
          assessment={currentSelectedAssessment}
          hubId={hubId}
          canManage={canManage}
          canSubmit={canSubmit}
          currentUserId={currentUserId}
          hubMembers={hubDetails?.members || []}
          onEdit={(item) => {
            setSelectedAssessment(null);
            setEditingAssessment(item);
          }}
          onDelete={(id) => {
            setSelectedAssessment(null);
            handleDelete(id);
          }}
        />
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
  actionMenuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIconBtn: {
    backgroundColor: "#fef2f2",
  },
  classworkTitle: {
    fontFamily,
    fontSize: 15.5,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 20,
    marginBottom: 4,
  },
  dueText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "500",
    color: "#64748b",
    marginBottom: 3,
  },
  maxMarksText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: "#64748b",
  },
  classworkDesc: {
    fontFamily,
    fontSize: 12.5,
    color: "#475569",
    lineHeight: 18,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(15, 23, 42, 0.05)",
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
