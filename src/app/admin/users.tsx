import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
  Modal,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { api } from "@/services/api";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { spacing, rounded, shadows } from "@/theme/layout";

type RoleFilter = "ALL" | "STUDENT" | "TEACHER";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  image?: string;
  phoneNumber?: string;
  studentProfile?: {
    id: string;
    studentId: string;
    department: string;
    batch: string;
    section: string;
    isCR: boolean;
    isTA: boolean;
  } | null;
  teacherProfile?: {
    id: string;
    department: string;
    designation: string;
    faculty: string;
    officeRoom?: string;
  } | null;
}

export default function AdminUsersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<RoleFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Modal State for Delete Confirmation
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

  // --- Fetch Users Query ---
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-users", activeFilter, searchQuery, page],
    queryFn: async () => {
      const params: any = {
        page,
        limit: 30,
      };
      if (activeFilter !== "ALL") {
        params.role = activeFilter;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await api.get("/users", { params });
      return res.data;
    },
  });

  const users: UserItem[] = data?.data || [];
  const meta = data?.meta;

  // --- Role Update Mutation (CR / TA) ---
  const roleMutation = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: "MAKE_CR" | "REMOVE_CR" | "MAKE_TA" | "REMOVE_TA";
    }) => {
      const res = await api.patch(`/users/${id}/role`, { action });
      return res.data;
    },
    onSuccess: (_, variables) => {
      Toast.show({
        type: "success",
        text1: "Role Updated",
        text2: `Successfully executed ${variables.action.replace("_", " ")}`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: err?.response?.data?.message || err.message,
      });
    },
  });

  // --- Delete User Mutation ---
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/users/${id}`);
      return res.data;
    },
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "User Deleted",
        text2: "Account and associated profiles deleted cleanly.",
      });
      setDeleteModalVisible(false);
      setUserToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => {
      Toast.show({
        type: "error",
        text1: "Deletion Failed",
        text2: err?.response?.data?.message || err.message,
      });
    },
  });

  const promptDeleteUser = (user: UserItem) => {
    setUserToDelete(user);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    deleteMutation.mutate(userToDelete.id);
  };

  const renderUserItem = ({ item }: { item: UserItem }) => {
    const isTeacher = item.role === "TEACHER";
    const isStudent = item.role === "STUDENT";
    const isAdmin = item.role === "ADMIN";

    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          {/* Avatar / Initial */}
          <View style={styles.avatarContainer}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarFallback, isTeacher ? styles.teacherBg : styles.studentBg]}>
                <Text style={styles.avatarInitial}>
                  {(item.name?.[0] || item.email[0]).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* User Details */}
          <View style={styles.infoCol}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {item.name || "Academic Member"}
              </Text>
              {/* Role Badge */}
              <View
                style={[
                  styles.roleBadge,
                  isAdmin ? styles.adminBadge : isTeacher ? styles.teacherBadge : styles.studentBadge,
                ]}
              >
                <Text
                  style={[
                    styles.roleBadgeText,
                    isAdmin ? styles.adminBadgeText : isTeacher ? styles.teacherBadgeText : styles.studentBadgeText,
                  ]}
                >
                  {item.role}
                </Text>
              </View>
            </View>

            <Text style={styles.userEmail} numberOfLines={1}>
              {item.email}
            </Text>

            {/* Profile Specific Badges */}
            {isStudent && item.studentProfile && (
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  ID: {item.studentProfile.studentId} • {item.studentProfile.department} • Batch {item.studentProfile.batch}
                </Text>
                <View style={styles.tagGroup}>
                  {item.studentProfile.isCR && (
                    <View style={styles.crTag}>
                      <Text style={styles.crTagText}>CR</Text>
                    </View>
                  )}
                  {item.studentProfile.isTA && (
                    <View style={styles.taTag}>
                      <Text style={styles.taTagText}>TA</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {isTeacher && item.teacherProfile && (
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  {item.teacherProfile.designation} • {item.teacherProfile.department}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Row */}
        <View style={styles.cardActionRow}>
          {isStudent && item.studentProfile && (
            <View style={styles.studentActionGroup}>
              <TouchableOpacity
                style={[styles.smallBtn, item.studentProfile.isCR ? styles.activeCrBtn : styles.outlineBtn]}
                onPress={() =>
                  roleMutation.mutate({
                    id: item.id,
                    action: item.studentProfile?.isCR ? "REMOVE_CR" : "MAKE_CR",
                  })
                }
                disabled={roleMutation.isPending}
              >
                <Feather
                  name={item.studentProfile.isCR ? "check-circle" : "award"}
                  size={12}
                  color={item.studentProfile.isCR ? "#047857" : "#475569"}
                />
                <Text
                  style={[
                    styles.smallBtnText,
                    item.studentProfile.isCR ? styles.activeCrBtnText : styles.outlineBtnText,
                  ]}
                >
                  {item.studentProfile.isCR ? "Revoke CR" : "Assign CR"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smallBtn, item.studentProfile.isTA ? styles.activeTaBtn : styles.outlineBtn]}
                onPress={() =>
                  roleMutation.mutate({
                    id: item.id,
                    action: item.studentProfile?.isTA ? "REMOVE_TA" : "MAKE_TA",
                  })
                }
                disabled={roleMutation.isPending}
              >
                <Feather
                  name={item.studentProfile.isTA ? "check-circle" : "briefcase"}
                  size={12}
                  color={item.studentProfile.isTA ? "#1d4ed8" : "#475569"}
                />
                <Text
                  style={[
                    styles.smallBtnText,
                    item.studentProfile.isTA ? styles.activeTaBtnText : styles.outlineBtnText,
                  ]}
                >
                  {item.studentProfile.isTA ? "Revoke TA" : "Assign TA"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Delete User (Prevent delete if ADMIN) */}
          {!isAdmin && (
            <TouchableOpacity
              style={styles.deleteIconBtn}
              onPress={() => promptDeleteUser(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="trash-2" size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Top Bar ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={22} color="#131b2e" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSubtitle}>Teachers & Students Directory</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Search Input ── */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email or ID..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={(txt) => {
              setSearchQuery(txt);
              setPage(1);
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setPage(1);
              }}
            >
              <Feather name="x" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filter Tabs ── */}
      <View style={styles.tabContainer}>
        {(["ALL", "STUDENT", "TEACHER"] as RoleFilter[]).map((tab) => {
          const isActive = activeFilter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => {
                setActiveFilter(tab);
                setPage(1);
              }}
            >
              <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                {tab === "ALL" ? "All Users" : tab === "STUDENT" ? "Students" : "Teachers"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── User List ── */}
      {isLoading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#131b2e" />
          <Text style={styles.loadingText}>Loading directory...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 24 : 32 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={() => {
                setPage(1);
                refetch();
              }}
              colors={["#131b2e"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="users" size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No Users Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search query or role filter.
              </Text>
            </View>
          }
        />
      )}

      {/* ── Delete Confirmation Modal ── */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <Feather name="alert-triangle" size={24} color="#ef4444" />
            </View>
            <Text style={styles.modalTitle}>Delete User Account?</Text>
            <Text style={styles.modalBody}>
              Are you sure you want to delete{" "}
              <Text style={{ fontWeight: "700" }}>{userToDelete?.name || userToDelete?.email}</Text>?
              This will permanently remove their profile, sessions, and associated academic records.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setDeleteModalVisible(false)}
                disabled={deleteMutation.isPending}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  headerTitleWrap: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#ffffff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#0f172a",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tabButtonActive: {
    backgroundColor: "#131b2e",
    borderColor: "#131b2e",
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  tabButtonTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  centerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...shadows.level1,
  },
  cardTopRow: {
    flexDirection: "row",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  studentBg: {
    backgroundColor: "#e0f2fe",
  },
  teacherBg: {
    backgroundColor: "#ede9fe",
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
    marginRight: 8,
  },
  userEmail: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  metaRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  studentBadge: {
    backgroundColor: "#eff6ff",
  },
  teacherBadge: {
    backgroundColor: "#f5f3ff",
  },
  adminBadge: {
    backgroundColor: "#131b2e",
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  studentBadgeText: {
    color: "#2563eb",
  },
  teacherBadgeText: {
    color: "#7c3aed",
  },
  adminBadgeText: {
    color: "#ffffff",
  },
  tagGroup: {
    flexDirection: "row",
    gap: 4,
  },
  crTag: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  crTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#047857",
  },
  taTag: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  taTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  cardActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  studentActionGroup: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  smallBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  outlineBtn: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  smallBtnText: {
    fontSize: 11,
    fontWeight: "600",
  },
  outlineBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  activeCrBtn: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  activeCrBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#047857",
  },
  activeTaBtn: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  activeTaBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  deleteIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  emptyContainer: {
    paddingVertical: 64,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  modalIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#ef4444",
    alignItems: "center",
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
