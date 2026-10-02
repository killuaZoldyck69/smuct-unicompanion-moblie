import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

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
} from "../components/materials";

interface MaterialsTabProps {
  hubId: string;
  canManage: boolean;
  currentUserId?: string;
}

export default function MaterialsTab({
  hubId,
  canManage,
  currentUserId,
}: MaterialsTabProps) {
  const queryClient = useQueryClient();

  const { data: resources, isLoading, isRefetching } = useResources(hubId);
  const createMutation = useCreateResource(hubId);
  const deleteMutation = useDeleteResource(hubId);

  // Filter state: strictly "Course Material" (OFFICIAL) vs "Student Resources" (STUDENT_NOTES)
  const [activeSection, setActiveSection] = useState<MaterialSectionTab>("OFFICIAL");
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);

  const resourceList: MaterialItem[] = useMemo(() => {
    return Array.isArray(resources) ? (resources as MaterialItem[]) : [];
  }, [resources]);

  // Section item counts
  const officialCount = useMemo(() => {
    return resourceList.filter((r) => !r.isStudentNote).length;
  }, [resourceList]);

  const studentNotesCount = useMemo(() => {
    return resourceList.filter((r) => r.isStudentNote).length;
  }, [resourceList]);

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
    (payload: CreateMaterialPayload) => {
      createMutation.mutate(payload as any, {
        onSuccess: () => {
          setIsUploadModalVisible(false);
          Toast.show({ type: "success", text1: "Material Published Successfully!" });
        },
        onError: (err: any) => {
          Toast.show({
            type: "error",
            text1: "Upload Failed",
            text2: err.response?.data?.message || err.message,
          });
        },
      });
    },
    [createMutation]
  );

  const handleDeleteResource = useCallback(
    (resourceId: string, itemTitle: string) => {
      Alert.alert(
        "Delete Material",
        `Are you sure you want to remove "${itemTitle}"? This cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              deleteMutation.mutate(resourceId, {
                onSuccess: () => {
                  Toast.show({ type: "success", text1: "Material Deleted" });
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
          },
        ]
      );
    },
    [deleteMutation]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: MaterialItem; index: number }) => (
      <MaterialCard
        item={item}
        canManage={canManage}
        currentUserId={currentUserId}
        onDelete={handleDeleteResource}
        isFirst={index === 0}
        isLast={index === displayedResources.length - 1}
      />
    ),
    [canManage, currentUserId, handleDeleteResource, displayedResources.length]
  );

  return (
    <View style={styles.container}>
      {/* 1. Dual Filter Tabs: "Course Material" and "Student Resources" */}
      <MaterialsFilterTabs
        activeTab={activeSection}
        onTabChange={setActiveSection}
        officialCount={officialCount}
        studentNotesCount={studentNotesCount}
      />

      {/* 2. Materials List with Section Header */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
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
            />
          }
          ListEmptyComponent={
            <MaterialsEmptyState
              activeTab={activeSection}
              canManage={canManage}
              onUploadPress={() => setIsUploadModalVisible(true)}
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
