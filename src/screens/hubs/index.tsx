import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useMyHubs, useJoinHub, useCreateHub } from "@/features/hubs/useHubs";
import { getStudentProfile } from "@/services/student-service";
import { getTeacherProfile } from "@/services/teacher-service";
import { authClient } from "@/services/auth-client";
import { PROFILE_CACHE_CONFIG } from "@/screens/profile/constants";

import { BENTO_COLORS, fontFamily } from "./constants";
import { CourseHubsHeader } from "./components/course-hubs-header";
import { CourseTabs, HubTab } from "./components/course-tabs";
import { CourseCard } from "./components/course-card";
import { CourseHubsSkeleton } from "./components/course-hubs-skeleton";
import CreateHubModal from "./components/create-hub-modal";
import { HubsSettingsModal } from "./components/hubs-settings-modal";

export function Hubs() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    status?: string;
  }>();

  // Active Tab State ("ACTIVE" | "ARCHIVED")
  const [activeTab, setActiveTab] = useState<HubTab>(
    params.status?.toUpperCase() === "ARCHIVED" ? "ARCHIVED" : "ACTIVE",
  );
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  // Sync state with router params if changed externally
  useEffect(() => {
    if (
      params.status &&
      (params.status.toUpperCase() === "ACTIVE" ||
        params.status.toUpperCase() === "ARCHIVED")
    ) {
      setActiveTab(params.status.toUpperCase() as HubTab);
    }
  }, [params.status]);

  // Sync state back to router params
  const handleSelectTab = (tab: HubTab) => {
    setActiveTab(tab);
    router.setParams({
      status: tab.toLowerCase(),
    } as any);
  };

  // --- Fetch Auth & Profile Data ---
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const user = session?.user as
    | {
        id: string;
        name: string;
        email: string;
        role?: "STUDENT" | "TEACHER" | "ADMIN";
        image?: string | null;
      }
    | undefined;

  const { data: studentProfile, isLoading: isLoadingStudent } = useQuery({
    queryKey: ["studentProfile"],
    queryFn: getStudentProfile,
    enabled: user?.role === "STUDENT",
    ...PROFILE_CACHE_CONFIG,
  });

  const { data: teacherProfile, isLoading: isLoadingTeacher } = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: getTeacherProfile,
    enabled: user?.role === "TEACHER",
    ...PROFILE_CACHE_CONFIG,
  });

  const currentUser = user
    ? {
        ...user,
        studentProfile: studentProfile || null,
        teacherProfile: teacherProfile || null,
      }
    : null;

  const { data: myHubs, isLoading: isLoadingHubs, isRefetching } = useMyHubs();

  const canCreateHub =
    currentUser?.role === "TEACHER" ||
    (currentUser?.studentProfile as any)?.isCR === true;

  const isLoadingScreen =
    isSessionPending || isLoadingHubs || isLoadingStudent || isLoadingTeacher;

  // Dynamic counts for active and archived hubs
  const { activeCount, archivedCount } = useMemo(() => {
    if (!Array.isArray(myHubs)) return { activeCount: 0, archivedCount: 0 };
    let active = 0;
    let archived = 0;
    for (const item of myHubs) {
      if (item.hub?.isArchived) {
        archived++;
      } else {
        active++;
      }
    }
    return { activeCount: active, archivedCount: archived };
  }, [myHubs]);

  // Filter hubs according to the active tab
  const displayedHubs = useMemo(() => {
    if (!Array.isArray(myHubs)) return [];

    return myHubs.filter((item: any) =>
      activeTab === "ACTIVE" ? !item.hub?.isArchived : item.hub?.isArchived,
    );
  }, [myHubs, activeTab]);

  const joinHubMutation = useJoinHub();
  const createHubMutation = useCreateHub();

  const handleJoinCourse = () => {
    const code = joinCode.trim().toUpperCase();
    if (!code || code.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Invalid Code",
        text2: "Join code must be exactly 6 characters.",
      });
      return;
    }
    joinHubMutation.mutate(code, {
      onSuccess: () => {
        setIsJoinModalVisible(false);
        setJoinCode("");
      },
    });
  };

  const handleCreateCourse = (payload: any) => {
    createHubMutation.mutate(payload, {
      onSuccess: () => {
        setIsCreateModalVisible(false);
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* 1. SCREEN HEADER */}
      <CourseHubsHeader
        onOpenNotifications={() => router.push("/(tabs)/notices")}
        onOpenSettings={() => setIsSettingsModalVisible(true)}
      />

      {/* 2. ACTIVE / ARCHIVED SEGMENTED TABS */}
      <CourseTabs
        activeTab={activeTab}
        activeCount={activeCount}
        archivedCount={archivedCount}
        onSelectTab={handleSelectTab}
      />

      {/* 3. CONTENT AREA */}
      {isLoadingScreen ? (
        <CourseHubsSkeleton />
      ) : !myHubs || myHubs.length === 0 ? (
        // Entirely empty (no courses enrolled)
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons
              name="school-outline"
              size={42}
              color={BENTO_COLORS.primary}
            />
          </View>
          <Text style={styles.emptyTitle}>No active courses yet</Text>
          <Text style={styles.emptySubtitle}>
            Your enrolled courses and academic hubs will appear here.
          </Text>

          <View style={styles.emptyActionsRow}>
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => setIsJoinModalVisible(true)}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Join a course using join code"
            >
              <Feather
                name="plus-circle"
                size={16}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.primaryActionText}>Join with Code</Text>
            </TouchableOpacity>

            {canCreateHub && (
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={() => setIsCreateModalVisible(true)}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Create a new course hub"
              >
                <Feather
                  name="edit-3"
                  size={16}
                  color={BENTO_COLORS.deepNavy}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.secondaryActionText}>Create Hub</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : displayedHubs.length === 0 ? (
        // Empty tab state (e.g. 0 archived courses)
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconCircle}>
            <Feather
              name={activeTab === "ACTIVE" ? "book-open" : "archive"}
              size={36}
              color={BENTO_COLORS.textSecondary}
            />
          </View>
          <Text style={styles.emptyTitle}>
            {activeTab === "ACTIVE"
              ? "No active courses yet"
              : "No Archived Classes"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === "ACTIVE"
              ? "Your enrolled courses will appear here."
              : "You don't have any past classes archived."}
          </Text>

          {activeTab === "ACTIVE" && (
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => setIsJoinModalVisible(true)}
              activeOpacity={0.8}
            >
              <Feather
                name="plus-circle"
                size={16}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.primaryActionText}>Join with Code</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={displayedHubs}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <CourseCard item={item} index={index} />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                queryClient.invalidateQueries({ queryKey: ["myHubs"] });
              }}
              tintColor={BENTO_COLORS.deepNavy}
            />
          }
        />
      )}

      {/* 4. JOIN COURSE MODAL */}
      <Modal
        visible={isJoinModalVisible}
        animationType="slide"
        transparent
        statusBarTranslucent={true}
        onRequestClose={() => setIsJoinModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsJoinModalVisible(false)}
          />
          <View
            style={[
              styles.bottomSheet,
              { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
          >
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Join a Course</Text>
                <Text style={styles.sheetSubtitle}>
                  Enter the 6-character code given by your teacher or CR
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsJoinModalVisible(false)}
                style={styles.closeBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close join course modal"
              >
                <Feather name="x" size={20} color={BENTO_COLORS.deepNavy} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Course Join Code</Text>
            <TextInput
              style={styles.inputCode}
              value={joinCode}
              onChangeText={setJoinCode}
              placeholder="e.g. X7B9Q2"
              placeholderTextColor="#94a3b8"
              maxLength={6}
              autoCapitalize="characters"
              accessible={true}
              accessibilityLabel="6-Character Join Code"
            />

            <TouchableOpacity
              style={[
                styles.submitBlockBtn,
                joinHubMutation.isPending && { opacity: 0.7 },
              ]}
              onPress={handleJoinCourse}
              disabled={joinHubMutation.isPending}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Join Course"
            >
              {joinHubMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBlockText}>Join Course</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 5. CREATE HUB MODAL */}
      <CreateHubModal
        isVisible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSubmit={handleCreateCourse}
        isPending={createHubMutation.isPending}
        currentUser={currentUser}
      />

      {/* 6. HUBS SETTINGS MODAL */}
      <HubsSettingsModal
        isVisible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
        canCreateHub={canCreateHub}
        onJoinHub={() => {
          setIsSettingsModalVisible(false);
          setIsJoinModalVisible(true);
        }}
        onCreateHub={() => {
          setIsSettingsModalVisible(false);
          setIsCreateModalVisible(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },

  // Empty & Placeholder States
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    paddingBottom: 80,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: BENTO_COLORS.border,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily,
    fontSize: 14,
    color: BENTO_COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  primaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: BENTO_COLORS.pillRadius,
    shadowColor: BENTO_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryActionText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#ffffff",
  },
  secondaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: BENTO_COLORS.border,
  },
  secondaryActionText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },

  // Join Modal Bottom Sheet
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(19, 27, 46, 0.45)",
  },
  bottomSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  sheetTitle: {
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  sheetSubtitle: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.textSecondary,
    marginTop: 3,
    maxWidth: 260,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  inputLabel: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputCode: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: BENTO_COLORS.borderColor || "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 4,
    color: BENTO_COLORS.deepNavy,
    textAlign: "center",
    marginBottom: 20,
  },
  submitBlockBtn: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BENTO_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  submitBlockText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
});
