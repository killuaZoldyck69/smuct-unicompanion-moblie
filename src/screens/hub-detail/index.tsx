import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  BackHandler,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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

// ==================================================
// 1. SOFT CAMPUS BENTO DESIGN SYSTEM CONSTANTS
// ==================================================
const BENTO_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  cardRadius: 24,
  pillRadius: 9999,
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  heroShadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 6,
  },
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

type SubTab =
  | "COURSEWORK"
  | "ANNOUNCEMENTS"
  | "QA"
  | "MATERIALS"
  | "MEMBERS"
  | "REVIEWS";

const ALL_TABS: { id: SubTab; label: string }[] = [
  { id: "COURSEWORK", label: "Coursework" },
  { id: "ANNOUNCEMENTS", label: "Announcements" },
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
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<SubTab>("COURSEWORK");

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

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/hubs");
    }
  }, [router]);

  useEffect(() => {
    const onHardwareBack = () => {
      handleBack();
      return true;
    };

    const sub = BackHandler.addEventListener(
      "hardwareBackPress",
      onHardwareBack
    );
    return () => sub.remove();
  }, [handleBack]);

  if (isLoadingHub) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={BENTO_COLORS.deepNavy} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* 1. HUB HERO HEADER */}
      <HubHeader
        hubDetails={hubDetails}
        onOptionsPress={() => setIsHubOptionsVisible(true)}
        onBack={handleBack}
      />

      {/* 2. SOFT BENTO SUB-TABS */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabButton,
                  isActive && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab(tab.id as SubTab)}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="tab"
                accessibilityLabel={`${tab.label} tab`}
              >
                <Text
                  style={[
                    styles.tabText,
                    isActive && styles.tabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. SUB-TAB CONTENT LISTS */}
      {activeTab === "COURSEWORK" && (
        <>
          {isLoadingAssessments ? (
            <ActivityIndicator
              size="large"
              color={BENTO_COLORS.deepNavy}
              style={{ marginTop: 40 }}
            />
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
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: insets.bottom > 0 ? insets.bottom + 90 : 100 },
              ]}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyBentoCard}>
                  <View style={styles.emptyIconCircle}>
                    <Feather
                      name="clipboard"
                      size={28}
                      color={BENTO_COLORS.subtleText}
                    />
                  </View>
                  <Text style={styles.emptyTitle}>No Coursework Assigned</Text>
                  <Text style={styles.emptyDesc}>
                    There are currently no assignments or quizzes scheduled for
                    this class.
                  </Text>
                </View>
              }
            />
          )}
          {canManage && (
            <TouchableOpacity
              style={[
                styles.fab,
                { bottom: insets.bottom > 0 ? insets.bottom + 20 : 28 },
              ]}
              onPress={() => setIsCourseworkModalVisible(true)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Assign new coursework"
              activeOpacity={0.85}
            >
              <Feather name="plus" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
        </>
      )}

      {activeTab === "ANNOUNCEMENTS" && (
        <>
          {isLoadingAnnouncements ? (
            <ActivityIndicator
              size="large"
              color={BENTO_COLORS.deepNavy}
              style={{ marginTop: 40 }}
            />
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
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: insets.bottom > 0 ? insets.bottom + 90 : 100 },
              ]}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyBentoCard}>
                  <View style={styles.emptyIconCircle}>
                    <Feather
                      name="bell"
                      size={28}
                      color={BENTO_COLORS.subtleText}
                    />
                  </View>
                  <Text style={styles.emptyTitle}>No Announcements Yet</Text>
                  <Text style={styles.emptyDesc}>
                    Your instructors have not published any class announcements.
                  </Text>
                </View>
              }
            />
          )}
          {canManage && (
            <TouchableOpacity
              style={[
                styles.fab,
                { bottom: insets.bottom > 0 ? insets.bottom + 20 : 28 },
              ]}
              onPress={() => setIsAnnounceModalVisible(true)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Create announcement"
              activeOpacity={0.85}
            >
              <Feather name="edit-2" size={22} color="#FFF" />
            </TouchableOpacity>
          )}
        </>
      )}

      {activeTab === "QA" && (
        <>
          {isLoadingDiscussions ? (
            <ActivityIndicator
              size="large"
              color={BENTO_COLORS.deepNavy}
              style={{ marginTop: 40 }}
            />
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
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: insets.bottom > 0 ? insets.bottom + 90 : 100 },
              ]}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyBentoCard}>
                  <View style={styles.emptyIconCircle}>
                    <Feather
                      name="help-circle"
                      size={28}
                      color={BENTO_COLORS.subtleText}
                    />
                  </View>
                  <Text style={styles.emptyTitle}>No Questions Asked</Text>
                  <Text style={styles.emptyDesc}>
                    Have questions about course topics? Start a discussion with
                    your peers and instructors.
                  </Text>
                </View>
              }
            />
          )}
          <TouchableOpacity
            style={[
              styles.fab,
              { bottom: insets.bottom > 0 ? insets.bottom + 20 : 28 },
            ]}
            onPress={() => setIsQuestionModalVisible(true)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Ask a question"
            activeOpacity={0.85}
          >
            <Feather name="help-circle" size={24} color="#FFF" />
          </TouchableOpacity>
        </>
      )}

      {activeTab === "MATERIALS" && (
        <>
          {isLoadingResources ? (
            <ActivityIndicator
              size="large"
              color={BENTO_COLORS.deepNavy}
              style={{ marginTop: 40 }}
            />
          ) : (
            <FlatList
              data={resources}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ResourceCard item={item} />}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: insets.bottom > 0 ? insets.bottom + 90 : 100 },
              ]}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyBentoCard}>
                  <View style={styles.emptyIconCircle}>
                    <Feather
                      name="folder"
                      size={28}
                      color={BENTO_COLORS.subtleText}
                    />
                  </View>
                  <Text style={styles.emptyTitle}>No Materials Uploaded</Text>
                  <Text style={styles.emptyDesc}>
                    Slides, syllabus, and lecture notes will appear here once
                    shared.
                  </Text>
                </View>
              }
            />
          )}
          <TouchableOpacity
            style={[
              styles.fab,
              { bottom: insets.bottom > 0 ? insets.bottom + 20 : 28 },
            ]}
            onPress={() => setIsResourceModalVisible(true)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Upload study material"
            activeOpacity={0.85}
          >
            <Feather name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </>
      )}

      {activeTab === "MEMBERS" && (
        <FlatList
          data={sortedMembers}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 40 : 50 },
          ]}
          showsVerticalScrollIndicator={false}
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
            <View style={styles.emptyBentoCard}>
              <View style={styles.emptyIconCircle}>
                <Feather
                  name="users"
                  size={28}
                  color={BENTO_COLORS.subtleText}
                />
              </View>
              <Text style={styles.emptyTitle}>No Members Found</Text>
              <Text style={styles.emptyDesc}>
                Share the invite code with your classmates to build your course
                hub.
              </Text>
            </View>
          }
        />
      )}

      {activeTab === "REVIEWS" && (
        <View style={styles.reviewsCenterWrapper}>
          <View style={styles.emptyBentoCard}>
            <View style={[styles.emptyIconCircle, { backgroundColor: "#fefce8" }]}>
              <Feather name="star" size={32} color="#b45309" />
            </View>
            <Text style={styles.emptyTitle}>Course Reviews</Text>
            <Text style={styles.emptyDesc}>
              {hubDetails?.isReviewOpen
                ? "Student feedback and reviews are currently active for this course."
                : "Course reviews are currently closed by the university administration."}
            </Text>
            <TouchableOpacity
              style={styles.reviewActionBtn}
              onPress={() => router.push(`/hub/${hubId}/reviews`)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Enter Reviews Portal"
              activeOpacity={0.85}
            >
              <Text style={styles.reviewActionBtnText}>
                Enter Reviews Portal
              </Text>
              <Feather
                name="arrow-right"
                size={16}
                color="#ffffff"
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          </View>
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

// ==================================================
// 4. STYLES
// ==================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.background,
  },

  // --- SUB-TABS ---
  tabsWrapper: {
    backgroundColor: BENTO_COLORS.background,
    paddingVertical: 12,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
  },
  tabButton: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    alignItems: "center",
    ...BENTO_COLORS.shadow,
  },
  tabButtonActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
  },
  tabText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
  },
  tabTextActive: {
    color: "#ffffff",
  },

  // --- LIST CONTENT ---
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },

  // --- EMPTY BENTO CARD ---
  emptyBentoCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 32,
    alignItems: "center",
    marginTop: 16,
    ...BENTO_COLORS.shadow,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 6,
    textAlign: "center",
  },
  emptyDesc: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 10,
  },

  // --- REVIEWS TAB ---
  reviewsCenterWrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  reviewActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: BENTO_COLORS.pillRadius,
    marginTop: 18,
    ...BENTO_COLORS.heroShadow,
  },
  reviewActionBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },

  // --- FAB ---
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BENTO_COLORS.deepNavy,
    justifyContent: "center",
    alignItems: "center",
    ...BENTO_COLORS.heroShadow,
  },
});
