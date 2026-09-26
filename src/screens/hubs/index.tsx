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
  ScrollView,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useMyHubs, useJoinHub, useCreateHub } from "@/features/hubs/useHubs";
import { getStudentProfile } from "@/services/student-service";
import { getTeacherProfile } from "@/services/teacher-service";
import CreateHubModal from "./components/create-hub-modal";
import HubCard from "./components/hub-card";
import { authClient } from "@/services/auth-client";
import { PROFILE_CACHE_CONFIG } from "@/screens/profile/constants";

type HubTab = "ACTIVE" | "ARCHIVED";

export function Hubs() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    status?: string;
    search?: string;
    semester?: string;
  }>();

  // States
  const [activeTab, setActiveTab] = useState<HubTab>(
    params.status?.toUpperCase() === "ARCHIVED" ? "ARCHIVED" : "ACTIVE",
  );
  const [searchQuery, setSearchQuery] = useState(params.search || "");
  const [selectedSemester, setSelectedSemester] = useState<string>(
    params.semester || "ALL",
  );
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  // Sync with params if they change externally
  useEffect(() => {
    if (params.status && (params.status.toUpperCase() === "ACTIVE" || params.status.toUpperCase() === "ARCHIVED")) {
      setActiveTab(params.status.toUpperCase() as HubTab);
    }
    if (params.search !== undefined) {
      setSearchQuery(params.search);
    }
    if (params.semester !== undefined) {
      setSelectedSemester(params.semester);
    }
  }, [params.status, params.search, params.semester]);

  // Sync state back to router params
  const updateRouteParams = (updates: {
    status?: string;
    search?: string;
    semester?: string;
  }) => {
    router.setParams({
      status: updates.status ?? (activeTab === "ARCHIVED" ? "archived" : "active"),
      search: updates.search !== undefined ? updates.search : (searchQuery || undefined),
      semester: (updates.semester ?? selectedSemester) !== "ALL" ? (updates.semester ?? selectedSemester) : undefined,
    } as any);
  };

  // --- Fetch Auth & Profile Data ---
  const { data: session, isPending: isSessionPending } = authClient.useSession();
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

  // Filter hubs
  const displayedHubs = useMemo(() => {
    if (!Array.isArray(myHubs)) return [];

    let list = myHubs.filter((item: any) =>
      activeTab === "ACTIVE" ? !item.hub?.isArchived : item.hub?.isArchived,
    );

    // Search filter (Course Name, Course Code, Teacher)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item: any) => {
        const name = (item.hub?.courseName || "").toLowerCase();
        const code = (item.hub?.courseCode || "").toLowerCase();
        const dept = (item.hub?.department || "").toLowerCase();
        const teacher = (item.hub?.teacher?.name || "").toLowerCase();
        return (
          name.includes(q) ||
          code.includes(q) ||
          dept.includes(q) ||
          teacher.includes(q)
        );
      });
    }

    // Semester filter
    if (selectedSemester !== "ALL") {
      const semNum = parseInt(selectedSemester, 10);
      if (!isNaN(semNum)) {
        list = list.filter((item: any) => item.hub?.semesterNumber === semNum);
      }
    }

    return list;
  }, [myHubs, activeTab, searchQuery, selectedSemester]);

  // Extract unique available semesters for quick pills
  const availableSemesters = useMemo(() => {
    if (!Array.isArray(myHubs)) return [];
    const s = new Set<number>();
    myHubs.forEach((m: any) => {
      if (m.hub?.semesterNumber) s.add(m.hub.semesterNumber);
    });
    return Array.from(s).sort((a, b) => a - b);
  }, [myHubs]);

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

      <View style={styles.header}>
        <Text style={styles.pageTitle}>Course Hubs</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.btnDark}
            onPress={() => setIsJoinModalVisible(true)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Join a Course Hub"
          >
            <Feather
              name="plus"
              size={18}
              color="#ffffff"
              style={styles.btnIcon}
            />
            <Text style={styles.btnTextWhite}>Join Hub</Text>
          </TouchableOpacity>

          {canCreateHub && (
            <TouchableOpacity
              style={styles.btnLight}
              onPress={() => setIsCreateModalVisible(true)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Create a new Course Hub"
            >
              <Feather
                name="edit-2"
                size={16}
                color="#131b2e"
                style={styles.btnIcon}
              />
              <Text style={styles.btnTextDark}>Create Hub</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={17} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses, codes, faculty..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              updateRouteParams({ search: text || undefined });
            }}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                updateRouteParams({ search: undefined });
              }}
              style={styles.clearSearchBtn}
            >
              <Feather name="x-circle" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs & Quick Filters */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabsContainer}>
          {(["ACTIVE", "ARCHIVED"] as HubTab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => {
                  setActiveTab(tab);
                  updateRouteParams({ status: tab.toLowerCase() });
                }}
                accessible={true}
                accessibilityRole="tab"
                accessibilityLabel={
                  tab === "ACTIVE" ? "Active Classes tab" : "Archived Classes tab"
                }
              >
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                >
                  {tab === "ACTIVE" ? "Active Classes" : "Archived"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Semester Filter Pills */}
        {availableSemesters.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPillsContainer}
          >
            <TouchableOpacity
              style={[
                styles.filterPill,
                selectedSemester === "ALL" && styles.filterPillActive,
              ]}
              onPress={() => {
                setSelectedSemester("ALL");
                updateRouteParams({ semester: undefined });
              }}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedSemester === "ALL" && styles.filterPillTextActive,
                ]}
              >
                All Semesters
              </Text>
            </TouchableOpacity>
            {availableSemesters.map((sem) => (
              <TouchableOpacity
                key={sem}
                style={[
                  styles.filterPill,
                  selectedSemester === String(sem) && styles.filterPillActive,
                ]}
                onPress={() => {
                  const val = String(sem);
                  setSelectedSemester(val);
                  updateRouteParams({ semester: val });
                }}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    selectedSemester === String(sem) && styles.filterPillTextActive,
                  ]}
                >
                  {sem}th Sem
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {isLoadingScreen ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#131b2e" />
        </View>
      ) : !myHubs || myHubs.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="layers"
            size={48}
            color="#c6c6cd"
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>No Hubs Found</Text>
          <Text style={styles.emptySubtitle}>
            You aren't enrolled in any classes yet.
          </Text>
        </View>
      ) : displayedHubs.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="search"
            size={48}
            color="#c6c6cd"
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>
            {searchQuery || selectedSemester !== "ALL"
              ? "No Matching Courses"
              : activeTab === "ACTIVE"
              ? "No Active Classes"
              : "No Archived Classes"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery || selectedSemester !== "ALL"
              ? "Try adjusting your search query or semester filters."
              : activeTab === "ACTIVE"
              ? "All your classes are currently in the archive."
              : "You don't have any past classes archived."}
          </Text>
          {(searchQuery || selectedSemester !== "ALL") && (
            <TouchableOpacity
              style={styles.clearFiltersBtn}
              onPress={() => {
                setSearchQuery("");
                setSelectedSemester("ALL");
                updateRouteParams({ search: undefined, semester: undefined });
              }}
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={displayedHubs}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <HubCard item={item} index={index} />
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
              tintColor="#131b2e"
            />
          }
        />
      )}

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
              <Text style={styles.sheetTitle}>Join a Course</Text>
              <TouchableOpacity
                onPress={() => setIsJoinModalVisible(false)}
                style={styles.closeBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close join course modal"
              >
                <Feather name="x" size={24} color="#131b2e" />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Enter 6-Character Join Code</Text>
            <TextInput
              style={styles.inputCode}
              value={joinCode}
              onChangeText={setJoinCode}
              placeholder="e.g. X7B9Q2"
              placeholderTextColor="#c6c6cd"
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

      <CreateHubModal
        isVisible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSubmit={handleCreateCourse}
        isPending={createHubMutation.isPending}
        currentUser={currentUser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fb" },

  // Header & Buttons
  header: { paddingHorizontal: 20, paddingTop: 16, marginBottom: 20 },
  pageTitle: {
    fontFamily: Platform.select({
      ios: "Plus Jakarta Sans",
      android: "sans-serif",
      default: "sans-serif",
    }),
    fontSize: 28,
    fontWeight: "800",
    color: "#131b2e",
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  actionRow: { flexDirection: "row", gap: 12 },
  btnDark: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#131b2e",
    paddingVertical: 14,
    borderRadius: 9999,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  btnLight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d0e4ff",
    paddingVertical: 14,
    borderRadius: 9999,
  },
  btnIcon: { marginRight: 8 },
  btnTextWhite: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
  btnTextDark: {
    fontSize: 14,
    fontWeight: "800",
    color: "#131b2e",
  },

  // Search Bar
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  clearSearchBtn: {
    padding: 4,
  },

  // Custom Tabs
  tabsWrapper: { paddingHorizontal: 20, marginBottom: 16 },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#f2f4f6",
    borderRadius: 9999,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 9999,
  },
  tabButtonActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#45464d",
  },
  tabTextActive: { color: "#131b2e", fontWeight: "800" },

  // Filter Pills
  filterPillsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
  },
  filterPillActive: {
    backgroundColor: "#131b2e",
    borderColor: "#131b2e",
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  filterPillTextActive: {
    color: "#ffffff",
  },

  // Layouts
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#131b2e",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#76777d",
    textAlign: "center",
    marginBottom: 12,
  },
  clearFiltersBtn: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    marginTop: 8,
  },
  clearFiltersText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#131b2e",
  },
  listContent: { paddingHorizontal: 20, paddingTop: 8 },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(19, 27, 46, 0.4)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheet: {
    backgroundColor: "#f7f9fb",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#131b2e",
  },
  closeBtn: { padding: 4 },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#45464d",
    marginBottom: 8,
  },
  inputCode: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    fontSize: 24,
    fontWeight: "800",
    color: "#131b2e",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 4,
    borderWidth: 1,
    borderColor: "#e0e3e5",
  },
  submitBlockBtn: {
    backgroundColor: "#131b2e",
    paddingVertical: 18,
    borderRadius: 9999,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  submitBlockText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "800",
  },
});
