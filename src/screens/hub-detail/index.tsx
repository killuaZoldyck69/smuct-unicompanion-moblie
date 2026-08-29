import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import {
  createAnnouncement,
  createDiscussion,
  replyDiscussion,
  updateMemberRole,
  removeMember,
  createResource,
  addAnnouncementComment,
  updateHub,
  deleteHub,
  archiveHub,
  createAssessment,
} from "@/services/hub-service";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { spacing } from "@/theme/layout";

// Components
import HubHeader from "./components/hub-header";
import AnnouncementCard from "./components/announcement-card";
import ResourceCard from "./components/resource-card";
import DiscussionCard from "./components/discussion-card";
import MemberRow from "./components/member-row";
import { AssessmentCard } from "./components/assessment-card";

// Modals
import CreateAnnouncementModal from "./components/create-announcement-modal";
import UploadResourceModal from "./components/upload-resource-modal";
import AnnouncementCommentsModal from "./components/announcement-comments-modal";
import AskQuestionModal from "./components/ask-question-modal";
import DiscussionRepliesModal from "./components/discussion-replies-modal";
import ManageMemberModal from "./components/manage-member-modal";
import EditHubModal from "./components/edit-hub-modal";
import HubOptionsModal from "./components/hub-options-modal";
import CreateCourseworkModal from "./components/create-coursework-modal";

import {
  useHubDetails,
  useAnnouncements,
  useDiscussions,
  useResources,
  useAssessments,
  useMyHubs,
} from "@/features/hubs/useHubs";

type SubTab =
  | "ANNOUNCEMENTS"
  | "COURSEWORK"
  | "QA"
  | "MATERIALS"
  | "MEMBERS"
  | "REVIEWS";

const ALL_TABS: { id: SubTab; label: string }[] = [
  { id: "ANNOUNCEMENTS", label: "Announcements" },
  { id: "COURSEWORK", label: "Coursework" },
  { id: "QA", label: "Q&A" },
  { id: "MATERIALS", label: "Materials" },
  { id: "MEMBERS", label: "Members" },
  { id: "REVIEWS", label: "Reviews" },
];

export interface HubDetailProps {
  hubId: string;
}

export function HubDetail({ hubId }: HubDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<SubTab>("ANNOUNCEMENTS");

  // Modal States
  const [isAnnounceModalVisible, setIsAnnounceModalVisible] = useState(false);
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [isMemberModalVisible, setIsMemberModalVisible] = useState(false);
  const [isResourceModalVisible, setIsResourceModalVisible] = useState(false);
  const [isEditHubModalVisible, setIsEditHubModalVisible] = useState(false);
  const [isHubOptionsVisible, setIsHubOptionsVisible] = useState(false);
  const [isCourseworkModalVisible, setIsCourseworkModalVisible] =
    useState(false);

  const [activeAnnouncement, setActiveAnnouncement] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [activeDiscussion, setActiveDiscussion] = useState<any>(null);

  // --- Data Fetching using Feature Hooks ---
  const { data: hubDetails, isLoading: isLoadingHub } = useHubDetails(hubId);
  const { data: announcements, isLoading: isLoadingAnnouncements } =
    useAnnouncements(hubId);
  const { data: discussions, isLoading: isLoadingDiscussions } =
    useDiscussions(hubId);
  const { data: resources, isLoading: isLoadingResources } = useResources(hubId);
  const { data: assessments, isLoading: isLoadingAssessments } =
    useAssessments(hubId);
  const { data: myHubs } = useMyHubs();

  // --- Derived State ---
  const currentActiveAnnouncement = activeAnnouncement
    ? announcements?.find((a: any) => a.id === activeAnnouncement.id) ||
      activeAnnouncement
    : null;

  const currentActiveDiscussion = activeDiscussion
    ? discussions?.find((d: any) => d.id === activeDiscussion.id) ||
      activeDiscussion
    : null;

  const myHubMembership = myHubs?.find(
    (m: any) => m.hubId === hubId || m.hub?.id === hubId,
  );
  const myRole = myHubMembership?.role;
  const myUserId = myHubMembership?.userId;
  const canManage = ["TEACHER", "CR", "TA"].includes(myRole);

  const sortedMembers = [...(hubDetails?.members || [])].sort(
    (a: any, b: any) => {
      if (a.role === "TEACHER" && b.role !== "TEACHER") return -1;
      if (b.role === "TEACHER" && a.role !== "TEACHER") return 1;
      return 0;
    },
  );

  const visibleTabs = ALL_TABS.filter((tab) => {
    if (tab.id === "REVIEWS") return hubDetails?.isReviewOpen || canManage;
    return true;
  });

  // --- Mutations ---
  const postAnnouncementMutation = useMutation({
    mutationFn: async (payload: any) => createAnnouncement(hubId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubAnnouncements", hubId] });
      Toast.show({ type: "success", text1: "Announcement Posted" });
      setIsAnnounceModalVisible(false);
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to post",
        text2: err.message,
      }),
  });

  const postQuestionMutation = useMutation({
    mutationFn: async (payload: any) => createDiscussion(hubId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubDiscussions", hubId] });
      Toast.show({ type: "success", text1: "Question Posted" });
      setIsQuestionModalVisible(false);
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to post",
        text2: err.message,
      }),
  });

  const postReplyMutation = useMutation({
    mutationFn: async ({
      discussionId,
      content,
    }: {
      discussionId: string;
      content: string;
    }) => replyDiscussion(hubId, discussionId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubDiscussions", hubId] });
      Toast.show({ type: "success", text1: "Reply Posted!" });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to post",
        text2: err.message,
      }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: string;
    }) => updateMemberRole(hubId, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hub", hubId] });
      Toast.show({ type: "success", text1: "Role Updated!" });
      setIsMemberModalVisible(false);
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to update role",
        text2: err.message,
      }),
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => removeMember(hubId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hub", hubId] });
      Toast.show({ type: "success", text1: "Action completed." });
      setIsMemberModalVisible(false);
      if (selectedMember?.user?.id === myUserId) router.replace("/(tabs)/hubs");
    },
    onError: (err: any) =>
      Toast.show({ type: "error", text1: "Failed", text2: err.message }),
  });

  const postResourceMutation = useMutation({
    mutationFn: async (payload: any) => createResource(hubId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubResources", hubId] });
      Toast.show({ type: "success", text1: "Material Uploaded!" });
      setIsResourceModalVisible(false);
    },
    onError: (err: any) =>
      Toast.show({ type: "error", text1: "Upload Failed", text2: err.message }),
  });

  const postCommentMutation = useMutation({
    mutationFn: async ({
      announcementId,
      content,
    }: {
      announcementId: string;
      content: string;
    }) => addAnnouncementComment(hubId, announcementId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubAnnouncements", hubId] });
      Toast.show({ type: "success", text1: "Comment Posted!" });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to post",
        text2: err.message,
      }),
  });

  const updateHubMutation = useMutation({
    mutationFn: async (payload: any) => updateHub(hubId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hub", hubId] });
      Toast.show({ type: "success", text1: "Hub Updated Successfully!" });
      setIsEditHubModalVisible(false);
    },
    onError: (err: any) =>
      Toast.show({ type: "error", text1: "Update Failed", text2: err.message }),
  });

  const deleteHubMutation = useMutation({
    mutationFn: async () => deleteHub(hubId),
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Hub Deleted" });
      router.replace("/(tabs)/hubs");
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Deletion Failed",
        text2: err.message,
      }),
  });

  const archiveHubMutation = useMutation({
    mutationFn: async () => archiveHub(hubId, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hub", hubId] });
      Toast.show({ type: "success", text1: "Hub Archived" });
      setIsHubOptionsVisible(false);
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Archive Failed",
        text2: err.message,
      }),
  });

  const createAssessmentMutation = useMutation({
    mutationFn: async (payload: any) => createAssessment(hubId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubAssessments", hubId] });
      Toast.show({ type: "success", text1: "Coursework Created" });
      setIsCourseworkModalVisible(false);
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Creation Failed",
        text2: err.message,
      }),
  });

  if (isLoadingHub) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primaryContainer} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <HubHeader
        hubDetails={hubDetails}
        onOptionsPress={() => setIsHubOptionsVisible(true)}
      />

      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {visibleTabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab(tab.id as SubTab)}
              accessible={true}
              accessibilityRole="tab"
              accessibilityLabel={`${tab.label} tab`}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* CONTENT LISTS */}
      {activeTab === "ANNOUNCEMENTS" && (
        <>
          {isLoadingAnnouncements ? (
            <ActivityIndicator style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={announcements}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <AnnouncementCard
                  item={item}
                  onCommentPress={setActiveAnnouncement}
                />
              )}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No announcements yet.</Text>
              }
            />
          )}
          {canManage && (
            <TouchableOpacity
              style={styles.fab}
              onPress={() => setIsAnnounceModalVisible(true)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Create announcement"
            >
              <Feather name="edit-2" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
        </>
      )}

      {activeTab === "COURSEWORK" && (
        <>
          {isLoadingAssessments ? (
            <ActivityIndicator style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={assessments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <AssessmentCard
                  item={item}
                  hubId={hubId}
                  canManage={canManage}
                  myUserId={myUserId}
                />
              )}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No coursework assigned yet.
                </Text>
              }
            />
          )}
          {canManage && (
            <TouchableOpacity
              style={styles.fab}
              onPress={() => setIsCourseworkModalVisible(true)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Assign new coursework"
            >
              <Feather name="plus" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
        </>
      )}

      {activeTab === "QA" && (
        <>
          {isLoadingDiscussions ? (
            <ActivityIndicator style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={discussions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DiscussionCard
                  item={item}
                  onPress={() => setActiveDiscussion(item)}
                />
              )}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No questions asked yet.</Text>
              }
            />
          )}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setIsQuestionModalVisible(true)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Ask a question"
          >
            <Feather name="help-circle" size={24} color="#FFF" />
          </TouchableOpacity>
        </>
      )}

      {activeTab === "MATERIALS" && (
        <>
          {isLoadingResources ? (
            <ActivityIndicator style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={resources}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ResourceCard item={item} />}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No materials uploaded yet.</Text>
              }
            />
          )}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setIsResourceModalVisible(true)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Upload study material"
          >
            <Feather name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </>
      )}

      {activeTab === "MEMBERS" && (
        <FlatList
          data={sortedMembers}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <MemberRow
              item={item}
              onPress={(selectedItem) => {
                setSelectedMember(selectedItem);
                setIsMemberModalVisible(true);
              }}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No members found.</Text>
          }
        />
      )}

      {activeTab === "REVIEWS" && (
        <View style={styles.centerContainer}>
          <Feather
            name="star"
            size={48}
            color={colors.surfaceContainerHighest}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>Course Reviews</Text>
          <Text style={styles.emptyText}>
            {hubDetails?.isReviewOpen
              ? "Reviews are currently open for this course."
              : "Reviews are closed by the administration."}
          </Text>
          <TouchableOpacity
            style={[
              styles.fab,
              {
                position: "relative",
                bottom: 0,
                right: 0,
                marginTop: 24,
                width: "auto",
                paddingHorizontal: 24,
                height: 48,
                borderRadius: 24,
              },
            ]}
            onPress={() => router.push(`/hub/${hubId}/reviews`)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Enter Reviews Portal"
          >
            <Text style={{ color: "#FFF", fontWeight: "700" }}>
              Enter Reviews Portal
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- MODALS --- */}
      <CreateAnnouncementModal
        isVisible={isAnnounceModalVisible}
        onClose={() => setIsAnnounceModalVisible(false)}
        onSubmit={(payload) => postAnnouncementMutation.mutate(payload)}
        isPending={postAnnouncementMutation.isPending}
      />

      <UploadResourceModal
        isVisible={isResourceModalVisible}
        onClose={() => setIsResourceModalVisible(false)}
        onSubmit={(payload) => postResourceMutation.mutate(payload)}
        isPending={postResourceMutation.isPending}
        canManage={canManage}
      />

      <AnnouncementCommentsModal
        isVisible={!!activeAnnouncement}
        onClose={() => setActiveAnnouncement(null)}
        announcement={currentActiveAnnouncement}
        onSubmit={(content) =>
          postCommentMutation.mutate({
            announcementId: activeAnnouncement.id,
            content,
          })
        }
        isPending={postCommentMutation.isPending}
      />

      <AskQuestionModal
        isVisible={isQuestionModalVisible}
        onClose={() => setIsQuestionModalVisible(false)}
        onSubmit={(payload) => postQuestionMutation.mutate(payload)}
        isPending={postQuestionMutation.isPending}
      />

      <DiscussionRepliesModal
        isVisible={!!activeDiscussion}
        onClose={() => setActiveDiscussion(null)}
        discussion={currentActiveDiscussion}
        onSubmit={(content) =>
          postReplyMutation.mutate({
            discussionId: activeDiscussion.id,
            content,
          })
        }
        isPending={postReplyMutation.isPending}
      />

      <EditHubModal
        isVisible={isEditHubModalVisible}
        onClose={() => setIsEditHubModalVisible(false)}
        onSubmit={(payload) => updateHubMutation.mutate(payload)}
        isPending={updateHubMutation.isPending}
        hubDetails={hubDetails}
      />

      <ManageMemberModal
        isVisible={isMemberModalVisible}
        onClose={() => setIsMemberModalVisible(false)}
        selectedMember={selectedMember}
        myRole={myRole}
        myUserId={myUserId}
        onUpdateRole={(role) =>
          updateRoleMutation.mutate({ memberId: selectedMember.id, role })
        }
        onRemoveMember={() => removeMemberMutation.mutate(selectedMember.id)}
        isPending={
          updateRoleMutation.isPending || removeMemberMutation.isPending
        }
      />

      <HubOptionsModal
        isVisible={isHubOptionsVisible}
        onClose={() => setIsHubOptionsVisible(false)}
        canManage={canManage}
        onViewMembers={() => {
          setIsHubOptionsVisible(false);
          setActiveTab("MEMBERS");
        }}
        onEditHub={() => {
          setIsHubOptionsVisible(false);
          setIsEditHubModalVisible(true);
        }}
        onArchiveHub={() => archiveHubMutation.mutate()}
        onDeleteHub={() => deleteHubMutation.mutate()}
        onLeaveHub={() => {
          setIsHubOptionsVisible(false);
          if (myHubMembership?.id)
            removeMemberMutation.mutate(myHubMembership.id);
        }}
      />

      <CreateCourseworkModal
        isVisible={isCourseworkModalVisible}
        onClose={() => setIsCourseworkModalVisible(false)}
        onSubmit={(payload: any) => createAssessmentMutation.mutate(payload)}
        isPending={createAssessmentMutation.isPending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  tabsWrapper: {
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.marginMobile,
  },
  tabButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: { borderBottomColor: colors.primaryContainer },
  tabText: { ...typography.labelMd, color: colors.outline, fontSize: 13 },
  tabTextActive: { color: colors.primaryContainer, fontWeight: "700" },

  listContent: { padding: spacing.marginMobile, paddingBottom: 100 },
  emptyTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    marginBottom: spacing.stackSm,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: "center",
    marginTop: 10,
  },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
});
