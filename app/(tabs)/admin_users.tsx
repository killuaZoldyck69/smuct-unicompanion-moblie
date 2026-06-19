import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  SafeAreaView,
  Alert,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import api from "../../src/services/api";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded, shadows } from "../../src/theme/layout";

type TabType = "STUDENT" | "TEACHER";

export default function AdminManageUsersScreen() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>("STUDENT");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null,
  );
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // --- Fetch Data ---
  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const response = await api.get("/users");
      return response.data?.data || [];
    },
  });

  // --- Mutations ---
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => await api.delete(`/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      Toast.show({ type: "success", text1: "Account Deleted" });
      setSelectedUser(null);
    },
    onError: (err: any) =>
      Toast.show({ type: "error", text1: "Delete Failed", text2: err.message }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      action,
    }: {
      userId: string;
      action: "MAKE_CR" | "MAKE_TA" | "REMOVE_ROLE";
    }) => {
      return await api.patch(`/users/${userId}/role`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      Toast.show({ type: "success", text1: "User Role Updated" });
      setSelectedUser(null);
    },
    onError: (err: any) =>
      Toast.show({ type: "error", text1: "Update Failed", text2: err.message }),
  });

  // --- Action Handlers ---
  const handleDelete = (userId: string, name: string) => {
    if (Platform.OS === "web") {
      if (
        window.confirm(
          `Are you sure you want to permanently delete ${name}'s account?`,
        )
      ) {
        deleteUserMutation.mutate(userId);
      }
    } else {
      Alert.alert(
        "Delete Account",
        `Are you sure you want to permanently delete ${name}? This cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteUserMutation.mutate(userId),
          },
        ],
      );
    }
  };

  const handleUpdateRole = (
    userId: string,
    action: "MAKE_CR" | "MAKE_TA" | "REMOVE_ROLE",
  ) => {
    updateRoleMutation.mutate({ userId, action });
  };

  // --- Filtering & Sorting Logic ---
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    let filtered = users.filter((u: any) => u.role === activeTab);

    if (selectedDepartment) {
      filtered = filtered.filter((u: any) => {
        const dept =
          activeTab === "STUDENT"
            ? u.studentProfile?.department
            : u.teacherProfile?.department;
        return dept === selectedDepartment;
      });
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((u: any) => {
        const nameMatch = u.name?.toLowerCase().includes(lowerQuery);
        const emailMatch = u.email?.toLowerCase().includes(lowerQuery);
        // FIX: Match teacherId correctly from schema
        const idMatch =
          activeTab === "STUDENT"
            ? u.studentProfile?.studentId?.toLowerCase().includes(lowerQuery)
            : u.teacherProfile?.teacherId?.toLowerCase().includes(lowerQuery);

        return nameMatch || emailMatch || idMatch;
      });
    }

    return filtered;
  }, [users, activeTab, searchQuery, selectedDepartment]);

  const uniqueDepartments = useMemo(() => {
    if (!users) return [];
    const depts = new Set<string>();
    users
      .filter((u: any) => u.role === activeTab)
      .forEach((u: any) => {
        const dept =
          activeTab === "STUDENT"
            ? u.studentProfile?.department
            : u.teacherProfile?.department;
        if (dept) depts.add(dept);
      });
    return Array.from(depts);
  }, [users, activeTab]);

  // --- Reusable Info Row Component for Modal ---
  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value?: string | number | null;
  }) => {
    if (!value) return null;
    return (
      <View style={styles.infoRow}>
        <View style={styles.infoRowLeft}>
          <Feather
            name={icon}
            size={16}
            color={colors.outline}
            style={styles.infoIcon}
          />
          <Text style={styles.infoLabel}>{label}</Text>
        </View>
        <Text style={styles.infoValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    );
  };

  // --- UI Renderers ---
  const renderUserCard = ({ item }: { item: any }) => {
    const profile =
      activeTab === "STUDENT" ? item.studentProfile : item.teacherProfile;
    const identifier =
      activeTab === "STUDENT" ? profile?.studentId : profile?.teacherId;
    const isCR = profile?.isCR;
    const isTA = profile?.isTA;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => setSelectedUser(item)}
      >
        {/* Avatar Handle */}
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>
              {item.name?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.name}
            </Text>
            {isCR && (
              <View style={styles.badgeCR}>
                <Text style={styles.badgeTextDark}>CR</Text>
              </View>
            )}
            {isTA && (
              <View style={styles.badgeTA}>
                <Text style={styles.badgeTextLight}>TA</Text>
              </View>
            )}
          </View>

          {/* Subtitle based on role */}
          {activeTab === "TEACHER" && profile?.designation && (
            <Text style={styles.userSubtitle} numberOfLines={1}>
              {profile.designation}
            </Text>
          )}

          <Text style={styles.userInfo}>
            {identifier || "No ID"} • {profile?.department || "No Dept"}
          </Text>
        </View>
        <Feather name="chevron-right" size={20} color={colors.outline} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Directory</Text>

        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={20}
            color={colors.outline}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ID, or email..."
            placeholderTextColor={colors.outlineVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x-circle" size={18} color={colors.outline} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "STUDENT" && styles.tabButtonActive,
          ]}
          onPress={() => {
            setActiveTab("STUDENT");
            setSelectedDepartment(null);
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "STUDENT" && styles.tabTextActive,
            ]}
          >
            Students
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "TEACHER" && styles.tabButtonActive,
          ]}
          onPress={() => {
            setActiveTab("TEACHER");
            setSelectedDepartment(null);
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "TEACHER" && styles.tabTextActive,
            ]}
          >
            Teachers
          </Text>
        </TouchableOpacity>
      </View>

      {uniqueDepartments.length > 0 && (
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={uniqueDepartments}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterPill,
                  selectedDepartment === item && styles.filterPillActive,
                ]}
                onPress={() =>
                  setSelectedDepartment(
                    selectedDepartment === item ? null : item,
                  )
                }
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedDepartment === item && styles.filterTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="users"
            size={48}
            color={colors.surfaceContainerHighest}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>No Users Found</Text>
          <Text style={styles.emptyDesc}>
            Try adjusting your search or filters.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserCard}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* --- DETAILED USER PROFILE MODAL --- */}
      <Modal
        visible={!!selectedUser}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>User Profile</Text>
            <TouchableOpacity
              onPress={() => setSelectedUser(null)}
              style={styles.closeBtn}
            >
              <Feather name="x" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          {selectedUser && (
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Profile Header Block */}
              <View style={styles.modalProfileHeader}>
                {selectedUser.image ? (
                  <Image
                    source={{ uri: selectedUser.image }}
                    style={styles.modalAvatarImage}
                  />
                ) : (
                  <View style={styles.modalAvatarFallback}>
                    <Text style={styles.modalAvatarTextLarge}>
                      {selectedUser.name?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

                <Text style={styles.modalName}>{selectedUser.name}</Text>
                <Text style={styles.modalEmail}>{selectedUser.email}</Text>

                <View style={styles.modalRoleBadge}>
                  <Text style={styles.modalRoleBadgeText}>
                    {selectedUser.role}
                  </Text>
                </View>
              </View>

              {/* Contact & Personal Info Section */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Contact & Personal</Text>
                <InfoRow
                  icon="phone"
                  label="Phone"
                  value={selectedUser.phoneNumber}
                />
                <InfoRow
                  icon="droplet"
                  label="Blood Group"
                  value={selectedUser.bloodGroup}
                />
                <InfoRow
                  icon="linkedin"
                  label="LinkedIn"
                  value={
                    selectedUser.role === "STUDENT"
                      ? selectedUser.studentProfile?.linkedInUrl
                      : selectedUser.teacherProfile?.linkedInUrl
                  }
                />
                <InfoRow
                  icon="globe"
                  label="Website"
                  value={
                    selectedUser.role === "STUDENT"
                      ? selectedUser.studentProfile?.personalWebsiteUrl
                      : selectedUser.teacherProfile?.personalWebsiteUrl
                  }
                />
              </View>

              {/* Academic Details Section */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Academic Information</Text>
                {selectedUser.role === "STUDENT" ? (
                  <>
                    <InfoRow
                      icon="hash"
                      label="Student ID"
                      value={selectedUser.studentProfile?.studentId}
                    />
                    <InfoRow
                      icon="book"
                      label="Program"
                      value={selectedUser.studentProfile?.program}
                    />
                    <InfoRow
                      icon="layers"
                      label="Department"
                      value={selectedUser.studentProfile?.department}
                    />
                    <InfoRow
                      icon="users"
                      label="Batch"
                      value={selectedUser.studentProfile?.batch}
                    />
                    <InfoRow
                      icon="book-open"
                      label="Semester"
                      value={
                        selectedUser.studentProfile?.currentSemester
                          ? `Semester ${selectedUser.studentProfile.currentSemester}`
                          : null
                      }
                    />
                    <InfoRow
                      icon="grid"
                      label="Section"
                      value={selectedUser.studentProfile?.section}
                    />
                  </>
                ) : (
                  <>
                    <InfoRow
                      icon="hash"
                      label="Teacher ID"
                      value={selectedUser.teacherProfile?.teacherId}
                    />
                    <InfoRow
                      icon="briefcase"
                      label="Designation"
                      value={selectedUser.teacherProfile?.designation}
                    />
                    <InfoRow
                      icon="layers"
                      label="Department"
                      value={selectedUser.teacherProfile?.department}
                    />
                    <InfoRow
                      icon="map-pin"
                      label="Office"
                      value={selectedUser.teacherProfile?.officeRoom}
                    />
                    <InfoRow
                      icon="clock"
                      label="Consultation"
                      value={selectedUser.teacherProfile?.consultationHours}
                    />
                  </>
                )}
              </View>

              {/* Skills / Expertise Tags Section */}
              {(selectedUser.studentProfile?.skills?.length > 0 ||
                selectedUser.teacherProfile?.expertiseFields?.length > 0) && (
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>
                    {selectedUser.role === "STUDENT"
                      ? "Skills"
                      : "Expertise Fields"}
                  </Text>
                  <View style={styles.tagsContainer}>
                    {(selectedUser.role === "STUDENT"
                      ? selectedUser.studentProfile?.skills
                      : selectedUser.teacherProfile?.expertiseFields
                    ).map((tag: string, i: number) => (
                      <View key={i} style={styles.tagChip}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Administrative Actions Section */}
              <View style={styles.adminActionSection}>
                <Text style={styles.sectionTitle}>Administrative Actions</Text>

                {selectedUser.role === "STUDENT" && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnNavy]}
                      onPress={() =>
                        handleUpdateRole(
                          selectedUser.id,
                          selectedUser.studentProfile?.isCR
                            ? "REMOVE_ROLE"
                            : "MAKE_CR",
                        )
                      }
                    >
                      <Feather
                        name="award"
                        size={20}
                        color={colors.onPrimary}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.actionBtnText}>
                        {selectedUser.studentProfile?.isCR
                          ? "Revoke CR Status"
                          : "Make Class Representative"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnGreen]}
                      onPress={() =>
                        handleUpdateRole(
                          selectedUser.id,
                          selectedUser.studentProfile?.isTA
                            ? "REMOVE_ROLE"
                            : "MAKE_TA",
                        )
                      }
                    >
                      <Feather
                        name="book-open"
                        size={20}
                        color={colors.onPrimary}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.actionBtnText}>
                        {selectedUser.studentProfile?.isTA
                          ? "Revoke TA Status"
                          : "Make Teaching Assistant"}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnRed]}
                  onPress={() =>
                    handleDelete(selectedUser.id, selectedUser.name)
                  }
                  disabled={deleteUserMutation.isPending}
                >
                  <Feather
                    name="trash-2"
                    size={20}
                    color={colors.error}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.actionBtnTextRed}>
                    Permanently Delete Account
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.stackMd,
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
  },
  headerTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.stackLg,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.lg,
    paddingHorizontal: spacing.stackMd,
    height: 48,
  },
  searchIcon: { marginRight: spacing.stackSm },
  searchInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    height: "100%",
  },

  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
    backgroundColor: colors.surfaceContainerLowest,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.stackMd,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: { borderBottomColor: colors.primaryContainer },
  tabText: { ...typography.labelMd, color: colors.outline },
  tabTextActive: { color: colors.primaryContainer, fontWeight: "700" },

  filterContainer: {
    paddingVertical: spacing.stackMd,
    paddingLeft: spacing.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: rounded.full,
    backgroundColor: colors.surfaceContainerHigh,
    marginRight: spacing.stackSm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterPillActive: {
    backgroundColor: colors.secondaryContainer,
    borderColor: colors.secondary,
  },
  filterText: { ...typography.labelSm, color: colors.onSurfaceVariant },
  filterTextActive: { color: colors.secondary, fontWeight: "700" },

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
  emptyDesc: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: "center",
  },

  listContent: {
    padding: spacing.marginMobile,
    paddingBottom: spacing.sectionBreak * 2,
  },

  // User Card List Styles
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.lg,
    padding: spacing.stackLg,
    marginBottom: spacing.stackMd,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.stackMd,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.stackMd,
    backgroundColor: colors.surfaceContainerHigh,
  },
  avatarText: {
    ...typography.titleLg,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  cardContent: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  userName: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "700",
    marginRight: 8,
    flexShrink: 1,
  },
  userSubtitle: {
    ...typography.labelSm,
    color: colors.secondary,
    marginBottom: 2,
    fontWeight: "600",
  },
  badgeCR: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  badgeTA: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  badgeTextDark: { fontSize: 10, fontWeight: "800", color: "#000" },
  badgeTextLight: { fontSize: 10, fontWeight: "800", color: "#FFF" },
  userInfo: { ...typography.labelSm, color: colors.outline, marginTop: 2 },

  // --- Modal Styles ---
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
    backgroundColor: colors.surfaceContainerLowest,
  },
  modalHeaderTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontWeight: "700",
  },
  closeBtn: {
    padding: spacing.stackSm,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.full,
  },
  modalScrollContent: { padding: spacing.marginMobile, paddingBottom: 60 },

  // Profile Header
  modalProfileHeader: {
    alignItems: "center",
    marginBottom: spacing.sectionBreak,
  },
  modalAvatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.stackLg,
  },
  modalAvatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: spacing.stackLg,
    borderWidth: 3,
    borderColor: colors.surfaceContainerLowest,
  },
  modalAvatarTextLarge: {
    fontSize: 36,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  modalName: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontWeight: "700",
    textAlign: "center",
  },
  modalEmail: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: "center",
    marginTop: 4,
  },
  modalRoleBadge: {
    marginTop: spacing.stackMd,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: rounded.full,
  },
  modalRoleBadgeText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontWeight: "700",
    letterSpacing: 1,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    marginBottom: spacing.stackLg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },
  sectionTitle: {
    ...typography.labelMd,
    fontSize: 13,
    color: colors.primary,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.stackLg,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  infoRowLeft: { flexDirection: "row", alignItems: "center" },
  infoIcon: { marginRight: 10 },
  infoLabel: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  infoValue: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
    paddingLeft: 16,
  },

  // Tags
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagChip: {
    backgroundColor: colors.primaryContainer + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: rounded.md,
    borderWidth: 1,
    borderColor: colors.primaryContainer + "30",
  },
  tagText: {
    ...typography.labelSm,
    color: colors.primaryContainer,
    fontWeight: "600",
  },

  // Admin Actions
  adminActionSection: { marginTop: spacing.stackLg },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: rounded.md,
    marginBottom: spacing.stackMd,
  },
  actionBtnNavy: { backgroundColor: colors.primaryContainer },
  actionBtnGreen: { backgroundColor: "#2E7D32" },
  actionBtnRed: {
    backgroundColor: "#FFF9F9",
    borderWidth: 1,
    borderColor: "rgba(186, 26, 26, 0.3)",
  },
  actionBtnText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  actionBtnTextRed: {
    ...typography.labelMd,
    color: colors.error,
    fontWeight: "700",
  },
});
