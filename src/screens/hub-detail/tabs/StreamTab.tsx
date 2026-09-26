import React, { useState } from "react";
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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import AnnouncementCard from "../components/announcement-card";
import CreateAnnouncementModal from "../components/create-announcement-modal";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  useAddAnnouncementComment,
} from "@/features/hubs/useHubs";

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

interface StreamTabProps {
  hubId: string;
  canManage: boolean;
  currentUserId?: string;
}

export default function StreamTab({
  hubId,
  canManage,
  currentUserId,
}: StreamTabProps) {
  const queryClient = useQueryClient();

  const { data: announcements, isLoading, isRefetching } = useAnnouncements(hubId);
  const createMutation = useCreateAnnouncement(hubId);
  const updateMutation = useUpdateAnnouncement(hubId);
  const deleteMutation = useDeleteAnnouncement(hubId);
  const commentMutation = useAddAnnouncementComment(hubId);

  const [isComposerVisible, setIsComposerVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const handleCreateAnnouncement = (payload: any) => {
    createMutation.mutate(payload, {
      onSuccess: () => {
        setIsComposerVisible(false);
        Toast.show({ type: "success", text1: "Announcement Posted" });
      },
      onError: (err: any) => {
        Toast.show({
          type: "error",
          text1: "Failed to post announcement",
          text2: err.response?.data?.message || err.message,
        });
      },
    });
  };

  const handleUpdateAnnouncement = (payload: any) => {
    if (!editingItem) return;
    updateMutation.mutate(
      {
        announcementId: editingItem.id,
        data: payload,
      },
      {
        onSuccess: () => {
          setEditingItem(null);
          setIsComposerVisible(false);
          Toast.show({ type: "success", text1: "Announcement Updated" });
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

  const handleDeleteAnnouncement = (item: any) => {
    deleteMutation.mutate(item.id, {
      onSuccess: () => {
        Toast.show({ type: "success", text1: "Announcement Deleted" });
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

  const handleAddComment = (announcementId: string, content: string) => {
    commentMutation.mutate(
      {
        announcementId,
        content,
      },
      {
        onSuccess: () => {
          Toast.show({ type: "success", text1: "Comment added" });
        },
        onError: (err: any) => {
          Toast.show({
            type: "error",
            text1: "Failed to add comment",
            text2: err.response?.data?.message || err.message,
          });
        },
      },
    );
  };

  const announcementList = Array.isArray(announcements) ? announcements : [];

  return (
    <View style={styles.container}>
      {/* Stream Feed */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : announcementList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Feather name="bell" size={32} color="#94a3b8" />
          </View>
          <Text style={styles.emptyTitle}>No Announcements Yet</Text>
          <Text style={styles.emptySubtitle}>
            {canManage
              ? "Keep students informed by posting lecture updates, notices, and routine changes."
              : "Faculty and CRs will broadcast urgent updates, schedule notices, and exam routines here."}
          </Text>
          {canManage && (
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => {
                setEditingItem(null);
                setIsComposerVisible(true);
              }}
            >
              <Feather name="plus" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.emptyActionText}>Create Announcement</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={announcementList}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            canManage ? (
              <View style={styles.headerActionRow}>
                <TouchableOpacity
                  style={styles.newAnnouncementBtn}
                  onPress={() => {
                    setEditingItem(null);
                    setIsComposerVisible(true);
                  }}
                  activeOpacity={0.85}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="New Announcement"
                >
                  <Feather name="plus" size={15} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.newAnnouncementBtnText}>New Announcement</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <AnnouncementCard
              item={item}
              currentUserId={currentUserId}
              canManage={canManage}
              onAddComment={handleAddComment}
              isAddingComment={commentMutation.isPending}
              onEditPress={(ann) => {
                setEditingItem(ann);
                setIsComposerVisible(true);
              }}
              onDeletePress={handleDeleteAnnouncement}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                queryClient.invalidateQueries({ queryKey: ["announcements", hubId] });
              }}
              tintColor="#0f172a"
            />
          }
        />
      )}

      {/* Composer Modal */}
      <CreateAnnouncementModal
        isVisible={isComposerVisible}
        onClose={() => {
          setIsComposerVisible(false);
          setEditingItem(null);
        }}
        onSubmit={editingItem ? handleUpdateAnnouncement : handleCreateAnnouncement}
        isPending={createMutation.isPending || updateMutation.isPending}
        initialData={editingItem}
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
  newAnnouncementBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 9999,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  newAnnouncementBtnText: {
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
});
