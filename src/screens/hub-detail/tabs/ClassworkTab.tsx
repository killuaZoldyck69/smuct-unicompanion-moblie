import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { formatCourseFolderName } from "@/services/google-drive-service";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import {
  useAssessments,
  useCreateAssessment,
  useUpdateAssessment,
  useDeleteAssessment,
} from "@/features/hubs/useHubs";
import { useCurrentUser } from "@/hooks/use-current-user";

import CreateCourseworkModal from "../components/create-coursework-modal";
import CourseHubSkeleton from "../components/course-hub-skeleton";
import EditCourseworkModal from "../components/edit-coursework-modal";
import AssessmentDetailsModal from "../components/assessment-details-modal";
import { CreateCourseworkPayload } from "../components/create-coursework";

import {
  ClassworkTabProps,
  AssessmentData,
  ClassworkCard,
  ClassworkEmptyState,
  DeleteCourseworkModal,
} from "../components/classwork";
import { fontFamily, titleFontFamily } from "@/theme/typography";

export default function ClassworkTab({
  hubId,
  hubDetails,
  canManage,
  canSubmit = true,
  isTeacher,
  currentUserId,
  initialAssessmentId,
  fromNotification,
}: ClassworkTabProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser } = useCurrentUser();
  const effectiveUserId = currentUserId || authUser?.id;
  const hasAutoOpenedRef = useRef<string | null>(null);

  const isTeacherRole = useMemo(() => {
    if (typeof isTeacher === "boolean") return isTeacher;
    if (hubDetails?.teacherId && effectiveUserId) {
      return hubDetails.teacherId === effectiveUserId;
    }
    return Boolean(
      hubDetails?.members?.some(
        (m: any) =>
          (m.userId === effectiveUserId || m.id === effectiveUserId) &&
          m.role === "TEACHER"
      )
    );
  }, [isTeacher, hubDetails, effectiveUserId]);

  const courseTitle = useMemo(() => formatCourseFolderName(hubDetails), [hubDetails]);

  // Queries & Mutations
  const { data: assessments, isLoading, isRefetching } = useAssessments(hubId);
  const createMutation = useCreateAssessment(hubId);
  const updateMutation = useUpdateAssessment(hubId);
  const deleteMutation = useDeleteAssessment(hubId);

  // Modal State
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<AssessmentData | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentData | null>(null);
  const [deletingAssessment, setDeletingAssessment] = useState<AssessmentData | null>(null);

  // Memoized Base Assessment List
  const assessmentList: AssessmentData[] = useMemo(
    () => (Array.isArray(assessments) ? assessments : []),
    [assessments]
  );

  // Fresh selected assessment synchronization
  const currentSelectedAssessment = useMemo(() => {
    if (!selectedAssessment) return null;
    return (
      assessmentList.find((a) => a.id === selectedAssessment.id) ||
      selectedAssessment
    );
  }, [assessmentList, selectedAssessment]);

  // Chronologically Sorted Assessments List
  const displayedAssessments = useMemo(() => {
    return [...assessmentList].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.deadline || 0).getTime();
      const timeB = new Date(b.createdAt || b.deadline || 0).getTime();
      return timeB - timeA;
    });
  }, [assessmentList]);

  // Auto-open requested assessment if deep-linked via initialAssessmentId (only once)
  useEffect(() => {
    if (
      initialAssessmentId &&
      displayedAssessments.length > 0 &&
      hasAutoOpenedRef.current !== initialAssessmentId
    ) {
      const match = displayedAssessments.find((a) => a.id === initialAssessmentId);
      if (match) {
        hasAutoOpenedRef.current = initialAssessmentId;
        setSelectedAssessment(match);
      }
    }
  }, [initialAssessmentId, displayedAssessments]);

  // Handle closing details modal with proper navigation back when opened via notification
  const handleCloseDetailsModal = useCallback(() => {
    setSelectedAssessment(null);
    if (initialAssessmentId || fromNotification) {
      router.replace("/(tabs)/notifications");
    }
  }, [initialAssessmentId, fromNotification, router]);

  // Handlers
  const handleCreateSubmit = useCallback(
    async (payload: CreateCourseworkPayload) => {
      await createMutation.mutateAsync(payload as any);
      setIsCreateModalVisible(false);
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "Coursework Published!",
          text2: "Your coursework has been published successfully.",
        });
      }, 350);
    },
    [createMutation]
  );

  const handleEditSubmit = useCallback(
    async (payload: any) => {
      if (!editingAssessment) return;
      await updateMutation.mutateAsync({
        assessmentId: editingAssessment.id,
        payload,
      });
      setEditingAssessment(null);
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "Coursework Updated!",
          text2: "Your changes have been saved successfully.",
        });
      }, 350);
    },
    [editingAssessment, updateMutation]
  );

  const handleDelete = useCallback(
    async (assessmentId: string) => {
      try {
        await deleteMutation.mutateAsync(assessmentId);
        setTimeout(() => {
          Toast.show({
            type: "success",
            text1: "Coursework Deleted",
            text2: "The coursework has been removed.",
          });
        }, 350);
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: "Delete Failed",
          text2:
            err?.response?.data?.message ||
            err?.message ||
            "Failed to delete coursework.",
        });
      }
    },
    [deleteMutation]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingAssessment) return;
    try {
      await deleteMutation.mutateAsync(deletingAssessment.id);
      setDeletingAssessment(null);
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "Coursework Deleted",
          text2: "The coursework has been removed.",
        });
      }, 350);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to delete coursework.",
      });
    }
  }, [deletingAssessment, deleteMutation]);

  const handleCardPress = useCallback((item: AssessmentData) => {
    setSelectedAssessment(item);
  }, []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["assessments", hubId] });
  }, [queryClient, hubId]);

  // Render Item for FlatList
  const renderItem = useCallback(
    ({ item }: { item: AssessmentData }) => (
      <ClassworkCard
        item={item}
        canManage={canManage}
        currentUserId={effectiveUserId}
        isTeacher={isTeacherRole}
        onPress={handleCardPress}
        onEdit={(it) => setEditingAssessment(it)}
        onDelete={(it) => setDeletingAssessment(it)}
      />
    ),
    [canManage, effectiveUserId, isTeacherRole, handleCardPress]
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <CourseHubSkeleton variant="classwork" />
      ) : displayedAssessments.length === 0 ? (
        <ClassworkEmptyState
          canManage={canManage}
          onCreatePress={() => setIsCreateModalVisible(true)}
        />
      ) : (
        <FlatList
          data={displayedAssessments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={
            canManage ? (
              <View style={styles.headerActionRow}>
                <TouchableOpacity
                  style={styles.createBtn}
                  onPress={() => setIsCreateModalVisible(true)}
                  activeOpacity={0.85}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Create Classwork"
                >
                  <Feather
                    name="plus"
                    size={15}
                    color="#ffffff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.createBtnText}>Create Classwork</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor="#0f172a"
            />
          }
        />
      )}

      {/* Create Coursework Modal */}
      {isCreateModalVisible && (
        <CreateCourseworkModal
          isVisible={isCreateModalVisible}
          onClose={() => setIsCreateModalVisible(false)}
          onSubmit={handleCreateSubmit}
          isPending={createMutation.isPending}
          courseTitle={courseTitle}
        />
      )}

      {/* Edit Coursework Modal */}
      {editingAssessment && (
        <EditCourseworkModal
          isVisible={!!editingAssessment}
          onClose={() => setEditingAssessment(null)}
          onSubmit={handleEditSubmit}
          isPending={updateMutation.isPending}
          assessment={editingAssessment}
          courseTitle={courseTitle}
        />
      )}

      {/* Assessment Details & Submission Modal */}
      {currentSelectedAssessment && (
        <AssessmentDetailsModal
          isVisible={!!currentSelectedAssessment}
          onClose={handleCloseDetailsModal}
          assessment={currentSelectedAssessment}
          hubId={hubId}
          courseTitle={courseTitle}
          canManage={canManage}
          canSubmit={canSubmit}
          isTeacher={isTeacherRole}
          currentUserId={currentUserId}
          hubMembers={hubDetails?.members || []}
          onEdit={(item) => {
            StatusBar.setBarStyle("dark-content", true);
            setSelectedAssessment(null);
            setTimeout(() => {
              setEditingAssessment(item);
            }, 120);
          }}
          onDelete={(id) => {
            const item =
              assessmentList.find((a) => a.id === id) ||
              currentSelectedAssessment;
            setSelectedAssessment(null);
            if (item) {
              setDeletingAssessment(item);
            } else {
              handleDelete(id);
            }
          }}
        />
      )}

      {/* Soft Campus Bento Delete Confirmation Modal */}
      <DeleteCourseworkModal
        isVisible={!!deletingAssessment}
        onClose={() => setDeletingAssessment(null)}
        onConfirm={handleConfirmDelete}
        assessment={deletingAssessment}
        isPending={deleteMutation.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  headerActionRow: {
    marginBottom: 12,
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  createBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.1,
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
});
