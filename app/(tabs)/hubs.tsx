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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import api from "../../src/services/api";
import { colors } from "../../src/theme/colors";
import { rounded, spacing } from "../../src/theme/layout";
import { typography } from "../../src/theme/typography";
import CreateHubModal from "../../src/components/hub/CreateHubModal";
import HubCard from "../../src/components/hub/HubCard";
import { authClient } from "../../src/services/auth-client";

type HubTab = "ACTIVE" | "ARCHIVED";

export default function HubsDashboardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Course Hubs</Text>
          <Text style={styles.headerSubtitle}>Your digital classrooms</Text>
        </View>
      </View>

      <View style={styles.topActions}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: colors.primaryContainer },
          ]}
          onPress={() => setIsJoinModalVisible(true)}
        >
          <Feather
            name="log-in"
            size={16}
            color={colors.onPrimary}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.actionBtnTextWhite}>Join Hub</Text>
        </TouchableOpacity>

        {canCreateHub && (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: colors.secondaryContainer },
            ]}
            onPress={() => setIsCreateModalVisible(true)}
          >
            <Feather
              name="plus-circle"
              size={16}
              color={colors.secondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[styles.actionBtnTextWhite, { color: colors.secondary }]}
            >
              Create Hub
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(["ACTIVE", "ARCHIVED"] as HubTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab === "ACTIVE" ? "Active Classes" : "Archived"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List Content */}
      {isLoadingScreen ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
        </View>
      ) : myHubs.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="layers"
            size={48}
            color={colors.surfaceContainerHighest}
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
            color={colors.surfaceContainerHighest}
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
          renderItem={({ item }) => <HubCard item={item} />}
          contentContainerStyle={styles.listContent}
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
              <TouchableOpacity onPress={() => setIsJoinModalVisible(false)}>
                <Feather name="x" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Enter 6-Character Join Code</Text>
            <TextInput
              style={[
                styles.input,
                {
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: "700",
                },
              ]}
              value={joinCode}
              onChangeText={setJoinCode}
              placeholder="e.g. X7B9Q2"
              placeholderTextColor={colors.outlineVariant}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingBottom: spacing.stackSm,
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
  },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  headerSubtitle: { ...typography.bodyMd, color: colors.outline, marginTop: 2 },
  topActions: {
    flexDirection: "row",
    gap: spacing.stackMd,
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.stackSm,
    paddingBottom: spacing.stackLg,
    backgroundColor: colors.surfaceContainerLowest,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: rounded.md,
  },
  actionBtnTextWhite: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: "700",
  },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: { borderBottomColor: colors.primaryContainer },
  tabText: { ...typography.labelMd, color: colors.outline },
  tabTextActive: { color: colors.primaryContainer, fontWeight: "700" },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.marginMobile,
  },
  emptyTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    marginBottom: spacing.stackSm,
  },
  emptySubtitle: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: "center",
  },
  listContent: { padding: spacing.marginMobile, paddingBottom: 100 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: rounded.xl,
    borderTopRightRadius: rounded.xl,
    padding: spacing.marginMobile,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.stackLg,
  },
  sheetTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontWeight: "700",
  },
  label: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  submitBlockBtn: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 16,
    borderRadius: rounded.md,
    alignItems: "center",
    marginTop: spacing.stackLg,
  },
  submitBlockText: { ...typography.labelMd, color: "#FFF", fontWeight: "700" },
});
