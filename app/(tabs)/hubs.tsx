import React, { useState } from "react";
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
  Image,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import api from "../../src/services/api";
import CreateHubModal from "../../src/components/hub/CreateHubModal";
import HubCard from "../../src/components/hub/HubCard";
import { authClient } from "../../src/services/auth-client";

type HubTab = "ACTIVE" | "ARCHIVED";

export default function HubsDashboardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  // States
  const [activeTab, setActiveTab] = useState<HubTab>("ACTIVE");
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [joinCode, setJoinCode] = useState("");

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
    queryKey: ["studentProfile", user?.id],
    queryFn: async () => (await api.get("/students/profile")).data?.data,
    enabled: user?.role === "STUDENT",
  });

  const { data: teacherProfile, isLoading: isLoadingTeacher } = useQuery({
    queryKey: ["teacherProfile", user?.id],
    queryFn: async () => (await api.get("/teachers/profile")).data?.data,
    enabled: user?.role === "TEACHER",
  });

  const currentUser = user
    ? {
        ...user,
        studentProfile: studentProfile || null,
        teacherProfile: teacherProfile || null,
      }
    : null;

  // --- Fetch Hubs Data ---
  const { data: myHubs, isLoading: isLoadingHubs } = useQuery({
    queryKey: ["myHubs"],
    queryFn: async () => (await api.get("/hubs/my")).data?.data || [],
  });

  const { data: teachers, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["availableTeachers"],
    queryFn: async () => (await api.get("/hubs/teachers")).data?.data || [],
  });

  // --- Role Check & Filtering ---
  const canCreateHub =
    currentUser?.role === "TEACHER" ||
    currentUser?.studentProfile?.isCR === true;
  const isLoadingScreen =
    isSessionPending || isLoadingHubs || isLoadingStudent || isLoadingTeacher;

  // Filter hubs based on archive status
  const activeHubs = myHubs?.filter((item: any) => !item.hub.isArchived) || [];
  const archivedHubs = myHubs?.filter((item: any) => item.hub.isArchived) || [];
  const displayedHubs = activeTab === "ACTIVE" ? activeHubs : archivedHubs;

  // --- Mutations ---
  const joinHubMutation = useMutation({
    mutationFn: async (code: string) =>
      await api.post("/hubs/join", { joinCode: code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myHubs"] });
      Toast.show({ type: "success", text1: "Joined Successfully!" });
      setIsJoinModalVisible(false);
      setJoinCode("");
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Join Failed",
        text2: err.response?.data?.message || err.message,
      }),
  });

  const createHubMutation = useMutation({
    mutationFn: async (payload: any) => await api.post("/hubs", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myHubs"] });
      Toast.show({ type: "success", text1: "Course Hub Created!" });
      setIsCreateModalVisible(false);
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Creation Failed",
        text2: err.response?.data?.message || err.message,
      }),
  });

  // --- Render ---
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* 1. TOP NAV BAR */}
      <View style={styles.navBar}>
        <Feather name="book-open" size={24} color="#131b2e" />
        <Text style={styles.navTitle}>Course Hub</Text>
        {currentUser?.image ? (
          <Image source={{ uri: currentUser.image }} style={styles.navAvatar} />
        ) : (
          <View style={styles.navAvatarPlaceholder}>
            <Feather name="user" size={16} color="#76777d" />
          </View>
        )}
      </View>

      {/* 2. MAIN HEADER & BUTTONS */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Course Hubs</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.btnDark}
            onPress={() => setIsJoinModalVisible(true)}
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

      {/* 3. CUSTOM PILL TABS */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabsContainer}>
          {(["ACTIVE", "ARCHIVED"] as HubTab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
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
      </View>

      {/* 4. LIST CONTENT */}
      {isLoadingScreen ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#131b2e" />
        </View>
      ) : myHubs.length === 0 ? (
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
            name="archive"
            size={48}
            color="#c6c6cd"
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>
            {activeTab === "ACTIVE"
              ? "No Active Classes"
              : "No Archived Classes"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === "ACTIVE"
              ? "All your classes are currently in the archive."
              : "You don't have any past classes archived."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedHubs}
          keyExtractor={(item) => item.id}
          // Pass index to HubCard so it can cycle through pastel colors!
          renderItem={({ item, index }) => (
            <HubCard item={item} index={index} />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* JOIN MODAL */}
      <Modal visible={isJoinModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Join a Course</Text>
              <TouchableOpacity
                onPress={() => setIsJoinModalVisible(false)}
                style={styles.closeBtn}
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
            />
            <TouchableOpacity
              style={[
                styles.submitBlockBtn,
                joinHubMutation.isPending && { opacity: 0.7 },
              ]}
              onPress={() =>
                joinHubMutation.mutate(joinCode.trim().toUpperCase())
              }
              disabled={joinHubMutation.isPending}
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

      {/* CREATE HUB MODAL */}
      <CreateHubModal
        isVisible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSubmit={(payload) => createHubMutation.mutate(payload)}
        isPending={createHubMutation.isPending}
        teachers={teachers}
        isLoadingTeachers={isLoadingTeachers}
        currentUser={currentUser}
      />
    </View>
  );
}

// --- ISOLATED NEW DESIGN THEME (Soft Campus Bento) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fb" },

  // Navigation Bar
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "800",
    color: "#131b2e",
  },
  navAvatar: { width: 36, height: 36, borderRadius: 18 },
  navAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e0e3e5",
    justifyContent: "center",
    alignItems: "center",
  },

  // Header & Buttons
  header: { paddingHorizontal: 20, marginTop: 12, marginBottom: 20 },
  pageTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 32,
    fontWeight: "800",
    color: "#131b2e",
    letterSpacing: -0.64,
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
    fontFamily: "Plus Jakarta Sans",
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
  btnTextDark: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 14,
    fontWeight: "800",
    color: "#131b2e",
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
    fontFamily: "Plus Jakarta Sans",
    fontSize: 14,
    fontWeight: "600",
    color: "#45464d",
  },
  tabTextActive: { color: "#131b2e", fontWeight: "800" },

  // Layouts
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 20,
    fontWeight: "800",
    color: "#131b2e",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 14,
    color: "#76777d",
    textAlign: "center",
  },
  listContent: { paddingHorizontal: 20, paddingTop: 8 },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(19, 27, 46, 0.4)",
    justifyContent: "flex-end",
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
    fontFamily: "Plus Jakarta Sans",
    fontSize: 24,
    fontWeight: "800",
    color: "#131b2e",
  },
  closeBtn: { padding: 4 },
  label: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 14,
    fontWeight: "700",
    color: "#45464d",
    marginBottom: 8,
  },
  inputCode: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    fontFamily: "Plus Jakarta Sans",
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
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "800",
  },
});
