import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
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

import {
  ClassworkTabProps,
  AssessmentData,
  ClassworkCard,
  ClassworkOptionsSheet,
  ClassworkEmptyState,
} from "../components/classwork";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export default function ClassworkTab({
  hubId,
  hubDetails,
  canManage,
  canSubmit = true,
  isTeacher,
  currentUserId,
}: ClassworkTabProps) {
  const queryClient = useQueryClient();

  const isTeacherRole = useMemo(() => {
    if (typeof isTeacher === "boolean") return isTeacher;
    if (hubDetails?.teacherId && currentUserId) {
      return hubDetails.teacherId === currentUserId;
    }
    return Boolean(
      hubDetails?.members?.some(
        (m: any) =>
          (m.userId === currentUserId || m.id === currentUserId) &&
          m.role === "TEACHER"
      )
    );
  }, [isTeacher, hubDetails, currentUserId]);

  // Queries & Mutations
  const { data: assessments, isLoading, isRefetching } = useAssessments(hubId);
  const createMutation = useCreateAssessment(hubId);
  const updateMutation = useUpdateAssessment(hubId);
  const deleteMutation = useDeleteAssessment(hubId);

  // Modal State
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<AssessmentData | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentData | null>(null);
  const [optionsAssessment, setOptionsAssessment] = useState<AssessmentData | null>(null);

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

  // Handlers
  const handleCreateSubmit = useCallback(
    (payload: any) => {
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
    },
    [createMutation]
  );

  const handleEditSubmit = useCallback(
    (payload: any) => {
      if (!editingAssessment) return;
      updateMutation.mutate(
        { assessmentId: editingAssessment.id, payload },
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
        }
      );
    },
    [editingAssessment, updateMutation]
  );

  const handleDelete = useCallback(
    (assessmentId: string) => {
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
    },
    [deleteMutation]
  );

  const handleCardPress = useCallback((item: AssessmentData) => {
    setSelectedAssessment(item);
  }, []);

  const handleOptionsPress = useCallback((item: AssessmentData) => {
    setOptionsAssessment(item);
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
        onPress={handleCardPress}
        onOptionsPress={handleOptionsPress}
      />
    ),
    [canManage, handleCardPress, handleOptionsPress]
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
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

      {/* Assessment Details & Submission Modal */}
      {currentSelectedAssessment && (
        <AssessmentDetailsModal
          isVisible={!!currentSelectedAssessment}
          onClose={() => setSelectedAssessment(null)}
          assessment={currentSelectedAssessment}
          hubId={hubId}
          canManage={canManage}
          canSubmit={canSubmit}
          isTeacher={isTeacherRole}
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

      {/* 3-Dots Options Bottom Sheet for Teacher & CR */}
      <ClassworkOptionsSheet
        item={optionsAssessment}
        isVisible={!!optionsAssessment}
        onClose={() => setOptionsAssessment(null)}
        onEdit={(item) => {
          setEditingAssessment(item);
        }}
        onDelete={(id) => {
          handleDelete(id);
        }}
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
