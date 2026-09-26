import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import ManageMemberModal from "../components/manage-member-modal";
import { useUpdateMemberRole, useRemoveMember } from "@/features/hubs/useHubs";

const BENTO = {
  canvas: "#f8fafc",
  card: "#ffffff",
  navy: "#0f172a",
  slate: "#64748b",
  border: "rgba(15, 23, 42, 0.08)",
  shadow: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

type FilterType = "ALL" | "TEACHER" | "CR" | "STUDENT";

interface MembersTabProps {
  hubId: string;
  members: any[];
  isLoading: boolean;
  myRole?: string;
  myUserId?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function MembersTab({
  hubId,
  members,
  isLoading,
  myRole = "STUDENT",
  myUserId,
  onRefresh,
  isRefreshing = false,
}: MembersTabProps) {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  const updateRoleMutation = useUpdateMemberRole(hubId);
  const removeMemberMutation = useRemoveMember(hubId);

  const canManage = ["TEACHER", "CR", "TA"].includes(myRole);

  // Group counts
  const counts = useMemo(() => {
    let teacherCount = 0;
    let crCount = 0;
    let studentCount = 0;

    (members || []).forEach((m) => {
      if (m.role === "TEACHER") teacherCount++;
      else if (m.role === "CR" || m.role === "TA") crCount++;
      else studentCount++;
    });

    return {
      all: (members || []).length,
      teacher: teacherCount,
      cr: crCount,
      student: studentCount,
    };
  }, [members]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    if (!Array.isArray(members)) return [];

    return members
      .filter((m) => {
        // Role filter
        if (selectedRoleFilter === "TEACHER" && m.role !== "TEACHER") return false;
        if (selectedRoleFilter === "CR" && m.role !== "CR" && m.role !== "TA") return false;
        if (selectedRoleFilter === "STUDENT" && (m.role === "TEACHER" || m.role === "CR" || m.role === "TA")) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const name = m.user?.name?.toLowerCase() || "";
          const email = m.user?.email?.toLowerCase() || "";
          const studentId = m.user?.studentProfile?.studentId?.toLowerCase() || "";
          const teacherId = m.user?.teacherProfile?.teacherId?.toLowerCase() || "";
          return name.includes(q) || email.includes(q) || studentId.includes(q) || teacherId.includes(q);
        }

        return true;
      })
      .sort((a, b) => {
        // Faculty first, then CRs, then Students alphabetically
        const roleOrder: Record<string, number> = { TEACHER: 1, CR: 2, TA: 3, STUDENT: 4 };
        const orderA = roleOrder[a.role] || 5;
        const orderB = roleOrder[b.role] || 5;
        if (orderA !== orderB) return orderA - orderB;
        return (a.user?.name || "").localeCompare(b.user?.name || "");
      });
  }, [members, selectedRoleFilter, searchQuery]);

  const handleUpdateRole = async (newRole: string) => {
    if (!selectedMember) return;
    try {
      await updateRoleMutation.mutateAsync({
        memberId: selectedMember.id,
        role: newRole,
      });
      Toast.show({
        type: "success",
        text1: "Role Updated",
        text2: `${selectedMember.user?.name} is now a ${newRole}`,
      });
      setSelectedMember(null);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: err?.response?.data?.message || err.message || "Could not update member role",
      });
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    try {
      await removeMemberMutation.mutateAsync(selectedMember.id);
      Toast.show({
        type: "success",
        text1: "Member Removed",
        text2: `${selectedMember.user?.name} removed from course hub`,
      });
      setSelectedMember(null);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Action Failed",
        text2: err?.response?.data?.message || err.message || "Could not remove member",
      });
    }
  };

  const renderMemberItem = ({ item }: { item: any }) => {
    const isTeacher = item.role === "TEACHER";
    const isCR = item.role === "CR" || item.role === "TA";
    const isMe = item.user?.id === myUserId;

    const idDisplay = isTeacher
      ? item.user?.teacherProfile?.teacherId
      : item.user?.studentProfile?.studentId;

    const department = isTeacher
      ? item.user?.teacherProfile?.department
      : item.user?.studentProfile?.department;

    return (
      <TouchableOpacity
        style={styles.memberCard}
        activeOpacity={0.8}
        onPress={() => {
          if (canManage || isMe) {
            setSelectedMember(item);
          }
        }}
        disabled={!canManage && !isMe}
      >
        <View style={styles.memberInfoRow}>
          {item.user?.image ? (
            <Image source={{ uri: item.user.image }} style={styles.avatarImage} />
          ) : (
            <View
              style={[
                styles.avatarFallback,
                isTeacher && { backgroundColor: BENTO.navy },
                isCR && { backgroundColor: "#fef3c7" },
              ]}
            >
              <Text
                style={[
                  styles.avatarText,
                  isTeacher && { color: "#ffffff" },
                  isCR && { color: "#b45309" },
                ]}
              >
                {item.user?.name?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
          )}

          <View style={styles.textContainer}>
            <View style={styles.nameHeaderRow}>
              <Text style={styles.memberName} numberOfLines={1}>
                {item.user?.name}
              </Text>
              {isMe && (
                <View style={styles.mePill}>
                  <Text style={styles.mePillText}>You</Text>
                </View>
              )}
            </View>

            <Text style={styles.memberSubtext} numberOfLines={1}>
              {idDisplay ? `${idDisplay}` : ""}
              {idDisplay && department ? " • " : ""}
              {department ? `${department}` : ""}
              {!idDisplay && !department ? item.user?.email : ""}
            </Text>
          </View>
        </View>

        <View style={styles.rightActionRow}>
          <View
            style={[
              styles.roleBadge,
              isTeacher && styles.roleTeacher,
              isCR && styles.roleCR,
              !isTeacher && !isCR && styles.roleStudent,
            ]}
          >
            <Text
              style={[
                styles.roleText,
                isTeacher && styles.roleTextTeacher,
                isCR && styles.roleTextCR,
                !isTeacher && !isCR && styles.roleTextStudent,
              ]}
            >
              {item.role === "TEACHER" ? "INSTRUCTOR" : item.role}
            </Text>
          </View>

          {(canManage || isMe) && (
            <Feather name="more-vertical" size={16} color={BENTO.slate} style={{ marginLeft: 6 }} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Search & Filter Bar */}
      <View style={styles.headerControls}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={BENTO.slate} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ID or email..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x" size={16} color={BENTO.slate} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedRoleFilter === "ALL" && styles.filterPillActive,
            ]}
            onPress={() => setSelectedRoleFilter("ALL")}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedRoleFilter === "ALL" && styles.filterPillTextActive,
              ]}
            >
              All ({counts.all})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedRoleFilter === "TEACHER" && styles.filterPillActive,
            ]}
            onPress={() => setSelectedRoleFilter("TEACHER")}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedRoleFilter === "TEACHER" && styles.filterPillTextActive,
              ]}
            >
              Teachers ({counts.teacher})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedRoleFilter === "CR" && styles.filterPillActive,
            ]}
            onPress={() => setSelectedRoleFilter("CR")}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedRoleFilter === "CR" && styles.filterPillTextActive,
              ]}
            >
              CR ({counts.cr})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedRoleFilter === "STUDENT" && styles.filterPillActive,
            ]}
            onPress={() => setSelectedRoleFilter("STUDENT")}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedRoleFilter === "STUDENT" && styles.filterPillTextActive,
              ]}
            >
              Students ({counts.student})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Member List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={BENTO.navy} />
          <Text style={styles.loadingText}>Loading members...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMembers}
          keyExtractor={(item) => item.id || item.user?.id}
          renderItem={renderMemberItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={BENTO.navy} />
            ) : undefined
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Feather name="users" size={24} color={BENTO.slate} />
              </View>
              <Text style={styles.emptyTitle}>No members found</Text>
              <Text style={styles.emptySub}>
                {searchQuery
                  ? "No one matches your search query."
                  : "No members currently enrolled under this filter."}
              </Text>
            </View>
          }
        />
      )}

      {/* Member Management Modal */}
      {selectedMember && (
        <ManageMemberModal
          isVisible={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          selectedMember={selectedMember}
          myRole={myRole}
          myUserId={myUserId || ""}
          onUpdateRole={handleUpdateRole}
          onRemoveMember={handleRemoveMember}
          isPending={updateRoleMutation.isPending || removeMemberMutation.isPending}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO.canvas,
  },
  headerControls: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: BENTO.canvas,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BENTO.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily,
    fontSize: 13,
    color: BENTO.navy,
  },
  filterPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  filterPillActive: {
    backgroundColor: BENTO.navy,
    borderColor: BENTO.navy,
  },
  filterPillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: BENTO.slate,
  },
  filterPillTextActive: {
    color: "#ffffff",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BENTO.border,
    ...BENTO.shadow,
  },
  memberInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#e2e8f0",
    marginRight: 12,
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  textContainer: {
    flex: 1,
  },
  nameHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberName: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO.navy,
    flexShrink: 1,
  },
  mePill: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mePillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  memberSubtext: {
    fontFamily,
    fontSize: 12,
    color: BENTO.slate,
    marginTop: 2,
  },
  rightActionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleTeacher: {
    backgroundColor: "#f1f5f9",
  },
  roleCR: {
    backgroundColor: "#fef3c7",
  },
  roleStudent: {
    backgroundColor: "#f8fafc",
  },
  roleText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  roleTextTeacher: {
    color: BENTO.navy,
  },
  roleTextCR: {
    color: "#b45309",
  },
  roleTextStudent: {
    color: BENTO.slate,
  },
  loadingContainer: {
    paddingTop: 48,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontFamily,
    fontSize: 13,
    color: BENTO.slate,
  },
  emptyContainer: {
    paddingTop: 64,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: BENTO.navy,
    marginBottom: 4,
  },
  emptySub: {
    fontFamily,
    fontSize: 13,
    color: BENTO.slate,
    textAlign: "center",
    lineHeight: 18,
  },
});
