import React, { useState, useEffect } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import api from "../../src/services/api";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded, shadows } from "../../src/theme/layout";

// Components
import HubHeader from "../../src/components/hub/HubHeader";
import AnnouncementCard from "../../src/components/hub/cards/AnnouncementCard";
import ResourceCard from "../../src/components/hub/cards/ResourceCard";
import DiscussionCard from "../../src/components/hub/cards/DiscussionCard";
import MemberRow from "../../src/components/hub/cards/MemberRow";

// Modals
import CreateAnnouncementModal from "../../src/components/hub/modals/CreateAnnouncementModal";
import UploadResourceModal from "../../src/components/hub/UploadResourceModal";
import AnnouncementCommentsModal from "../../src/components/hub/modals/AnnouncementCommentsModal";
import AskQuestionModal from "../../src/components/hub/modals/AskQuestionModal";
import DiscussionRepliesModal from "../../src/components/hub/modals/DiscussionRepliesModal";
import ManageMemberModal from "../../src/components/hub/modals/ManageMemberModal";
import EditHubModal from "../../src/components/hub/modals/EditHubModal";
import HubOptionsModal from "../../src/components/hub/modals/HubOptionsModal";
import CreateCourseworkModal from "../../src/components/hub/modals/CreateCourseworkModal";

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

// --- Live Countdown Hook for Coursework ---
const useCountdown = (deadline: string) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    if (!deadline) return;
    const calculateTime = () => {
      const diff = new Date(deadline).getTime() - new Date().getTime();
      if (diff <= 0) {
        setIsOverdue(true);
        setTimeLeft("Deadline Passed");
        return;
      }
      setIsOverdue(false);
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      setTimeLeft(`${d}d ${h}h ${m}m remaining`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 60000);
    return () => clearInterval(timer);
  }, [deadline]);

  return { timeLeft, isOverdue };
};

export default function CourseHubScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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

  // --- Data Fetching ---
  const { data: hubDetails, isLoading: isLoadingHub } = useQuery({
    queryKey: ["hub", id],
    queryFn: async () => (await api.get(`/hubs/${id}`)).data?.data,
  });

  const { data: announcements, isLoading: isLoadingAnnouncements } = useQuery({
    queryKey: ["hubAnnouncements", id],
    queryFn: async () =>
      (await api.get(`/hubs/${id}/announcements`)).data?.data || [],
  });

  const { data: discussions, isLoading: isLoadingDiscussions } = useQuery({
    queryKey: ["hubDiscussions", id],
    queryFn: async () =>
      (await api.get(`/hubs/${id}/discussions`)).data?.data || [],
  });

  const { data: resources, isLoading: isLoadingResources } = useQuery({
    queryKey: ["hubResources", id],
    queryFn: async () =>
      (await api.get(`/hubs/${id}/resources`)).data?.data || [],
  });

  const { data: assessments, isLoading: isLoadingAssessments } = useQuery({
    queryKey: ["hubAssessments", id],
    queryFn: async () =>
      (await api.get(`/hubs/${id}/assessments`)).data?.data || [],
  });

  const { data: myHubs } = useQuery({
    queryKey: ["myHubs"],
    queryFn: async () => (await api.get("/hubs/my")).data?.data || [],
  });

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
    (m: any) => m.hubId === id || m.hub?.id === id,
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

  // 👈 Only show Reviews if the setting is enabled or if the user is a Manager
  const visibleTabs = ALL_TABS.filter((tab) => {
    if (tab.id === "REVIEWS") return hubDetails?.isReviewOpen || canManage;
    return true;
  });

  // --- Mutations ---
  const postAnnouncementMutation = useMutation({
    mutationFn: async (payload: any) =>
      await api.post(`/hubs/${id}/announcements`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubAnnouncements", id] });
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
    mutationFn: async (payload: any) =>
      await api.post(`/hubs/${id}/discussions`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubDiscussions", id] });
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
    }) =>
      await api.post(`/hubs/${id}/discussions/${discussionId}/reply`, {
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubDiscussions", id] });
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
    }) => await api.patch(`/hubs/${id}/members/${memberId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hub", id] });
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
    mutationFn: async (memberId: string) =>
      await api.delete(`/hubs/${id}/members/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hub", id] });
      Toast.show({ type: "success", text1: "Action completed." });
      setIsMemberModalVisible(false);
      if (selectedMember?.user?.id === myUserId) router.replace("/(tabs)/hubs");
    },
    onError: (err: any) =>
      Toast.show({ type: "error", text1: "Failed", text2: err.message }),
  });

  const postResourceMutation = useMutation({
    mutationFn: async (payload: any) =>
      await api.post(`/hubs/${id}/resources`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubResources", id] });
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
    }) =>
      await api.post(`/hubs/${id}/announcements/${announcementId}/comments`, {
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubAnnouncements", id] });
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
    mutationFn: async (payload: any) => await api.patch(`/hubs/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hub", id] });
      Toast.show({ type: "success", text1: "Hub Updated Successfully!" });
      setIsEditHubModalVisible(false);
    },
    onError: (err: any) =>
      Toast.show({ type: "error", text1: "Update Failed", text2: err.message }),
  });

  const deleteHubMutation = useMutation({
    mutationFn: async () => await api.delete(`/hubs/${id}`),
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
    mutationFn: async () =>
      await api.patch(`/hubs/${id}/archive`, { isArchived: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hub", id] });
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
    mutationFn: async (payload: any) =>
      await api.post(`/hubs/${id}/assessments`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubAssessments", id] });
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

  // --- Inline Coursework Card ---
  const AssessmentCard = ({ item }: { item: any }) => {
    const { timeLeft, isOverdue } = useCountdown(item.deadline);
    const mySub = item.submissions?.find((s: any) => s.studentId === myUserId);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          router.push({
            pathname: `/hub/${id}/assessments`,
            params: { assessmentId: item.id },
          })
        }
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
          <View
            style={[
              styles.timerBadge,
              isOverdue && { backgroundColor: colors.errorContainer },
            ]}
          >
            <Feather
              name="clock"
              size={12}
              color={isOverdue ? colors.error : colors.primary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[styles.timerText, isOverdue && { color: colors.error }]}
            >
              {timeLeft}
            </Text>
          </View>
        </View>

        <Text style={styles.discussionTitle}>{item.title}</Text>
        {item.description ? (
          <Text style={styles.contentBody} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.cardFooter}>
          <Text style={styles.metaText}>Total Marks: {item.totalMarks}</Text>
          {canManage ? (
            <Text style={styles.metaText}>
              {item.submissions?.length || 0} Submissions
            </Text>
          ) : mySub ? (
            <Text
              style={[
                styles.metaText,
                { color: colors.primary, fontWeight: "700" },
              ]}
            >
              Submitted
            </Text>
          ) : (
            <Text
              style={[
                styles.metaText,
                isOverdue && { color: colors.error, fontWeight: "700" },
              ]}
            >
              {isOverdue ? "Overdue" : "Pending"}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // --- Render ---
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
              renderItem={({ item }) => <AssessmentCard item={item} />}
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
            onPress={() => router.push(`/hub/${id}/reviews`)}
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

  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    marginBottom: spacing.stackMd,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.stackMd,
  },
  typeBadge: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: rounded.sm,
  },
  typeText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontWeight: "700",
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryContainer + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: rounded.sm,
  },
  timerText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: "700",
  },
  discussionTitle: {
    ...typography.titleLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "800",
    marginBottom: 4,
  },
  contentBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.stackLg,
    paddingTop: spacing.stackSm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
  },
  metaText: { ...typography.labelSm, color: colors.outline },

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
    ...shadows.level1,
  },
});
