import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { formatCourseFolderName } from "@/services/google-drive-service";
import Toast from "react-native-toast-message";
import CourseHubSkeleton from "../components/course-hub-skeleton";

import { useResources, useCreateResource, useDeleteResource } from "@/features/hubs/useHubs";
import {
  MaterialSectionTab,
  MaterialItem,
  CreateMaterialPayload,
  MaterialsHeaderAction,
  MaterialsFilterTabs,
  MaterialCard,
  MaterialsEmptyState,
  UploadMaterialModal,
  DeleteMaterialModal,
} from "../components/materials";

interface MaterialsTabProps {
  hubId: string;
  canManage: boolean;
  currentUserId?: string;
  readOnly?: boolean;
  hubDetails?: any;
}

export default function MaterialsTab({
  hubId,
  canManage,
  currentUserId,
  readOnly = false,
  hubDetails,
}: MaterialsTabProps) {
  const queryClient = useQueryClient();
  const courseTitle = useMemo(() => formatCourseFolderName(hubDetails), [hubDetails]);

  const { data: resources, isLoading, isRefetching } = useResources(hubId);
  const createMutation = useCreateResource(hubId);
  const deleteMutation = useDeleteResource(hubId);

  // Filter state: strictly "Course Material" (OFFICIAL) vs "Student Resources" (STUDENT_NOTES)
  const [activeSection, setActiveSection] = useState<MaterialSectionTab>("OFFICIAL");
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<MaterialItem | null>(null);

  const resourceList: MaterialItem[] = useMemo(() => {
    return Array.isArray(resources) ? (resources as MaterialItem[]) : [];
  }, [resources]);

  // Filtered resources for the active tab
  const displayedResources = useMemo(() => {
    if (activeSection === "OFFICIAL") {
      return resourceList.filter((r) => !r.isStudentNote);
    }
    return resourceList.filter((r) => r.isStudentNote);
  }, [resourceList, activeSection]);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["resources", hubId] });
  }, [queryClient, hubId]);

  const handleUploadSubmit = useCallback(
    async (payload: CreateMaterialPayload) => {
      try {
        await createMutation.mutateAsync(payload as any);
        setIsUploadModalVisible(false);
        const isStudentResource = payload.isStudentNote;
        Toast.show({
          type: "success",
          text1: isStudentResource ? "Student Resource Shared" : "Course Material Published",
          text2: `"${payload.title}" is now available in this hub.`,
          visibilityTime: 3500,
        });
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: "Publish Failed",
          text2:
            err.response?.data?.message ||
            err.message ||
            "Unable to publish material. Please check your network and try again.",
          visibilityTime: 4000,
        });
        throw err;
      }
    },
    [createMutation]
  );

  const handleDeletePress = useCallback(
    (resourceId: string, itemTitle: string, item?: MaterialItem) => {
      setMaterialToDelete(item || ({ id: resourceId, title: itemTitle } as MaterialItem));
    },
    []
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!materialToDelete) return;
    const targetTitle = materialToDelete.title;
    try {
      await deleteMutation.mutateAsync(materialToDelete.id);
      setMaterialToDelete(null);
      Toast.show({
        type: "success",
        text1: "Material Deleted",
        text2: `"${targetTitle}" was permanently removed from this hub.`,
        visibilityTime: 3500,
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2:
          err.response?.data?.message ||
          err.message ||
          "Could not remove this material. Please try again.",
        visibilityTime: 4000,
      });
    }
  }, [deleteMutation, materialToDelete]);

  const renderItem = useCallback(
    ({ item, index }: { item: MaterialItem; index: number }) => (
      <MaterialCard
        item={item}
        canManage={canManage}
        currentUserId={currentUserId}
        onDelete={handleDeletePress}
        isFirst={index === 0}
        isLast={index === displayedResources.length - 1}
      />
    ),
    [canManage, currentUserId, handleDeletePress, displayedResources.length]
  );

  return (
    <View style={styles.container}>
      {/* 1. Dual Filter Tabs: "Course Material" and "Student Resources" */}
      <MaterialsFilterTabs
        activeTab={activeSection}
        onTabChange={setActiveSection}
      />

      {/* 2. Materials List with Section Header */}
      {isLoading ? (
        <CourseHubSkeleton variant="materials" />
      ) : (
        <FlatList
          data={displayedResources}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <MaterialsHeaderAction
              canManage={canManage}
              activeTab={activeSection}
              onUploadPress={() => setIsUploadModalVisible(true)}
              readOnly={readOnly}
            />
          }
          ListEmptyComponent={
            <MaterialsEmptyState
              activeTab={activeSection}
              canManage={canManage}
              onUploadPress={() => setIsUploadModalVisible(true)}
              readOnly={readOnly}
              onSwitchToStudentNotes={() => {
                setActiveSection("STUDENT_NOTES");
                setIsUploadModalVisible(true);
              }}
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor="#0f172a"
            />
          }
        />
      )}

      {/* 4. Upload Material Modal */}
      <UploadMaterialModal
        isVisible={isUploadModalVisible}
        onClose={() => setIsUploadModalVisible(false)}
        onSubmit={handleUploadSubmit}
        isPending={createMutation.isPending}
        canManage={canManage}
        initialTab={activeSection}
        courseTitle={courseTitle}
      />

      {/* 5. Delete Material Modal */}
      <DeleteMaterialModal
        isVisible={Boolean(materialToDelete)}
        item={materialToDelete}
        isDeleting={deleteMutation.isPending}
        onClose={() => setMaterialToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: "#f7f9fb",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
});
