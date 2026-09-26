import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";

// Header
import HubHeader from "./components/hub-header";

// 5 Bento Content Tabs
import StreamTab from "./tabs/StreamTab";
import ClassworkTab from "./tabs/ClassworkTab";
import MaterialsTab from "./tabs/MaterialsTab";
import ReviewTab from "./tabs/ReviewTab";
import MembersTab from "./tabs/MembersTab";

// Options & Management Modals
import EditHubModal from "./components/edit-hub-modal";
import HubOptionsModal from "./components/hub-options-modal";
import EditClassLinkModal from "./components/edit-class-link-modal";

import {
  useHubDetails,
  useMyHubs,
  useUpdateHub,
  useArchiveHub,
  useDeleteHub,
  useRemoveMember,
  useToggleLiveClass,
} from "@/features/hubs/useHubs";
import { useCurrentUser } from "@/hooks/use-current-user";

// ==================================================
// 1. SOFT CAMPUS BENTO DESIGN SYSTEM CONSTANTS
// ==================================================
const BENTO_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  cardRadius: 20,
  pillRadius: 9999,
  border: "rgba(19, 27, 46, 0.08)",
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export type HubTabId = "stream" | "classwork" | "materials" | "review" | "members";

interface TabDefinition {
  id: HubTabId;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

const TABS: TabDefinition[] = [
  { id: "stream", label: "Stream", icon: "activity" },
  { id: "classwork", label: "Classwork", icon: "clipboard" },
  { id: "materials", label: "Materials", icon: "folder" },
  { id: "review", label: "Review", icon: "star" },
  { id: "members", label: "Members", icon: "users" },
];

export interface HubDetailProps {
  hubId: string;
}

export function HubDetail({ hubId }: HubDetailProps) {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ id?: string; tab?: string }>();

  // Deep-linkable tab state
  const initialTab = (
    searchParams.tab && ["stream", "classwork", "materials", "review", "members"].includes(searchParams.tab)
      ? searchParams.tab
      : "stream"
  ) as HubTabId;

  const [activeTab, setActiveTab] = useState<HubTabId>(initialTab);

  // Modals state
  const [isEditHubModalVisible, setIsEditHubModalVisible] = useState(false);
  const [isHubOptionsVisible, setIsHubOptionsVisible] = useState(false);
  const [isEditClassLinkModalVisible, setIsEditClassLinkModalVisible] = useState(false);

  // --- Data Fetching ---
  const {
    data: hubDetails,
    isLoading: isLoadingHub,
    refetch: refetchHub,
    isRefetching: isRefetchingHub,
  } = useHubDetails(hubId);

  const { data: myHubs } = useMyHubs();

  // --- Mutations ---
  const updateHubMutation = useUpdateHub(hubId);
  const archiveHubMutation = useArchiveHub(hubId);
  const deleteHubMutation = useDeleteHub();
  const removeMemberMutation = useRemoveMember(hubId);
  const toggleLiveClassMutation = useToggleLiveClass(hubId);

  // Keep state synced with URL parameter if it changes externally
  useEffect(() => {
    if (
      searchParams.tab &&
      ["stream", "classwork", "materials", "review", "members"].includes(searchParams.tab) &&
      searchParams.tab !== activeTab
    ) {
      setActiveTab(searchParams.tab as HubTabId);
    }
  }, [searchParams.tab]);

  const handleTabPress = (tabId: HubTabId) => {
    setActiveTab(tabId);
    router.setParams({ tab: tabId });
  };

  const { user: currentUser, role: userGlobalRole } = useCurrentUser();

  // User membership & role resolution
  const myHubMembership = myHubs?.find(
    (m: any) => m.hubId === hubId || m.hub?.id === hubId
  );
  const myUserId = currentUser?.id || myHubMembership?.userId;

  const memberFromDetails = hubDetails?.members?.find(
    (m: any) => m.userId === myUserId || m.user?.id === myUserId
  );

  const myRole = memberFromDetails?.role || myHubMembership?.role || (userGlobalRole === "TEACHER" ? "TEACHER" : "STUDENT");

  const isTeacher =
    userGlobalRole === "TEACHER" ||
    myRole === "TEACHER" ||
    hubDetails?.teacherId === myUserId;

  const isCR =
    myRole === "CR" ||
    (currentUser?.studentProfile as any)?.isCR === true;

  const canPostAnnouncement = isTeacher || isCR;
  const canEditClassLink = isTeacher || isCR;
  const canManage = canPostAnnouncement || myRole === "TA";

  const handleBack = useCallback(() => {
    router.replace("/(tabs)/hubs");
  }, [router]);

  useEffect(() => {
    const onHardwareBack = () => {
      handleBack();
      return true;
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", onHardwareBack);
    return () => sub.remove();
  }, [handleBack]);

  const handleUpdateHub = async (payload: any) => {
    try {
      await updateHubMutation.mutateAsync(payload);
      Toast.show({ type: "success", text1: "Course Hub Updated" });
      setIsEditHubModalVisible(false);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: err?.response?.data?.message || err.message || "Could not update course hub",
      });
    }
  };

  const handleUpdateClassLink = async (meetUrl: string | null) => {
    if (!canEditClassLink) {
      Toast.show({
        type: "error",
        text1: "Permission Denied",
        text2: "Only Teachers and student CRs can edit the class link.",
      });
      return;
    }
    try {
      await updateHubMutation.mutateAsync({ meetUrl });
      Toast.show({
        type: "success",
        text1: meetUrl ? "Class Link Saved!" : "Class Link Removed",
      });
      setIsEditClassLinkModalVisible(false);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to Update Link",
        text2: err?.response?.data?.message || err.message || "Could not update class link",
      });
    }
  };

  const handleArchiveHub = async () => {
    try {
      await archiveHubMutation.mutateAsync(true);
      Toast.show({ type: "success", text1: "Course Hub Archived" });
      setIsHubOptionsVisible(false);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Archive Failed",
        text2: err?.response?.data?.message || err.message,
      });
    }
  };

  const handleDeleteHub = async () => {
    try {
      await deleteHubMutation.mutateAsync(hubId);
      Toast.show({ type: "success", text1: "Course Hub Deleted" });
      router.replace("/(tabs)/hubs");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Deletion Failed",
        text2: err?.response?.data?.message || err.message,
      });
    }
  };

  const handleLeaveHub = async () => {
    if (!myHubMembership?.id) return;
    try {
      await removeMemberMutation.mutateAsync(myHubMembership.id);
      Toast.show({ type: "success", text1: "You left this Course Hub" });
      router.replace("/(tabs)/hubs");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to Leave",
        text2: err?.response?.data?.message || err.message,
      });
    }
  };

  const handleToggleLive = async (isLive: boolean, meetUrl?: string) => {
    try {
      await toggleLiveClassMutation.mutateAsync({ isLive, meetUrl });
      Toast.show({
        type: "success",
        text1: isLive ? "Class is Now Live! 🟢" : "Live Class Ended",
        text2: isLive ? "Students can now 1-tap join Google Meet." : undefined,
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Status Update Failed",
        text2: err?.response?.data?.message || err.message,
      });
    }
  };

  if (isLoadingHub) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={BENTO_COLORS.deepNavy} />
        <Text style={styles.loadingText}>Loading course workspace...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* 1. COMPACT BENTO COURSE HEADER */}
      <HubHeader
        hubDetails={hubDetails}
        canManage={canManage}
        canEditClassLink={canEditClassLink}
        onOptionsPress={() => setIsHubOptionsVisible(true)}
        onLiveClassPress={() => setIsEditClassLinkModalVisible(true)}
        onEditClassLink={() => setIsEditClassLinkModalVisible(true)}
        onBack={handleBack}
      />

      {/* 2. THE 5 SOFT BENTO PRIMARY TABS */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => handleTabPress(tab.id)}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="tab"
                accessibilityLabel={`${tab.label} tab`}
                accessibilityState={{ selected: isActive }}
              >
                <Feather
                  name={tab.icon}
                  size={14}
                  color={isActive ? "#ffffff" : BENTO_COLORS.subtleText}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. PRIMARY CONTENT TAB VIEW */}
      <View style={styles.tabContentContainer}>
        {activeTab === "stream" && (
          <StreamTab
            hubId={hubId}
            canManage={canManage}
            canPostAnnouncement={canPostAnnouncement}
            currentUserId={myUserId}
          />
        )}

        {activeTab === "classwork" && (
          <ClassworkTab
            hubId={hubId}
            hubDetails={hubDetails}
            canManage={canManage}
            canSubmit={!canManage}
            currentUserId={myUserId}
          />
        )}

        {activeTab === "materials" && (
          <MaterialsTab
            hubId={hubId}
            canManage={canManage}
            currentUserId={myUserId}
          />
        )}

        {activeTab === "review" && (
          <ReviewTab
            hubId={hubId}
            canManage={canManage}
            canSubmit={!canManage}
            currentUserId={myUserId}
          />
        )}

        {activeTab === "members" && (
          <MembersTab
            hubId={hubId}
            members={hubDetails?.members || []}
            isLoading={isLoadingHub}
            myRole={myRole}
            myUserId={myUserId}
            onRefresh={refetchHub}
            isRefreshing={isRefetchingHub}
          />
        )}
      </View>

      {/* --- MODALS --- */}
      <EditClassLinkModal
        isVisible={isEditClassLinkModalVisible}
        onClose={() => setIsEditClassLinkModalVisible(false)}
        currentMeetUrl={hubDetails?.meetUrl}
        courseName={hubDetails?.courseName}
        onSave={handleUpdateClassLink}
        isPending={updateHubMutation.isPending}
      />

      <EditHubModal
        isVisible={isEditHubModalVisible}
        onClose={() => setIsEditHubModalVisible(false)}
        onSubmit={handleUpdateHub}
        isPending={updateHubMutation.isPending}
        hubDetails={hubDetails}
      />

      <HubOptionsModal
        isVisible={isHubOptionsVisible}
        onClose={() => setIsHubOptionsVisible(false)}
        canManage={canManage}
        isTeacher={myRole === "TEACHER"}
        onViewMembers={() => {
          setIsHubOptionsVisible(false);
          handleTabPress("members");
        }}
        onEditHub={() => {
          setIsHubOptionsVisible(false);
          setIsEditHubModalVisible(true);
        }}
        onArchiveHub={handleArchiveHub}
        onDeleteHub={handleDeleteHub}
        onLeaveHub={handleLeaveHub}
      />
    </SafeAreaView>
  );
}

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
  loadingText: {
    marginTop: 12,
    fontFamily,
    fontSize: 14,
    color: BENTO_COLORS.subtleText,
    fontWeight: "500",
  },

  // --- 5 TABS NAVIGATION ---
  tabsWrapper: {
    backgroundColor: BENTO_COLORS.background,
    paddingVertical: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    borderWidth: 1,
    borderColor: BENTO_COLORS.border,
    ...BENTO_COLORS.shadow,
  },
  tabButtonActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  tabText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
  },
  tabTextActive: {
    color: "#ffffff",
  },

  // --- CONTENT CONTAINER ---
  tabContentContainer: {
    flex: 1,
  },
});
