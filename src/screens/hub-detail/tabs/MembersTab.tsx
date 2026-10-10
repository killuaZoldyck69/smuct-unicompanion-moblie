import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { CourseHubMember, HubRole } from "@/types/member.types";
import { useMemberSorting } from "../components/members/useMemberSorting";
import { MemberStatusCard } from "../components/members/MemberStatusCard";
import { MemberRowItem } from "../components/members/MemberRowItem";
import { MembersEmptyState } from "../components/members/MembersEmptyState";
import { ManageMemberModal } from "../components/members/modal/ManageMemberModal";
import { useUpdateMemberRole, useRemoveMember } from "@/features/hubs/useHubs";
import { BENTO, fontFamily } from "../components/members/constants";

interface MembersTabProps {
  hubId: string;
  members: CourseHubMember[];
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
  myUserId = "",
  onRefresh,
  isRefreshing = false,
}: MembersTabProps) {
  const insets = useSafeAreaInsets();
  const [selectedMember, setSelectedMember] = useState<CourseHubMember | null>(null);

  const updateRoleMutation = useUpdateMemberRole(hubId);
  const removeMemberMutation = useRemoveMember(hubId);

  const { sortedMembers, counts } = useMemberSorting(members);

  const handleUpdateRole = useCallback(
    async (newRole: HubRole) => {
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
          text2:
            err?.response?.data?.message ||
            err.message ||
            "Could not update member role",
        });
      }
    },
    [selectedMember, updateRoleMutation],
  );

  const handleRemoveMember = useCallback(async () => {
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
        text2:
          err?.response?.data?.message ||
          err.message ||
          "Could not remove member",
      });
    }
  }, [selectedMember, removeMemberMutation]);

  const handleSelectMember = useCallback((member: CourseHubMember) => {
    setSelectedMember(member);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedMember(null);
  }, []);

  const renderHeader = useCallback(() => {
    return (
      <MemberStatusCard
        total={counts.total}
        teachers={counts.teachers}
        students={counts.students}
      />
    );
  }, [counts]);

  const renderMemberRow = useCallback(
    ({ item }: { item: CourseHubMember }) => {
      return <MemberRowItem member={item} onPress={handleSelectMember} />;
    },
    [handleSelectMember],
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={BENTO.navy} />
          <Text style={styles.loadingText}>Loading course members...</Text>
        </View>
      ) : (
        <FlatList
          data={sortedMembers}
          keyExtractor={(item) => item.id || item.user?.id}
          renderItem={renderMemberRow}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom + 24, 40) },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor={BENTO.navy}
              />
            ) : undefined
          }
          ListEmptyComponent={MembersEmptyState}
        />
      )}

      {selectedMember && (
        <ManageMemberModal
          isVisible={!!selectedMember}
          onClose={handleCloseModal}
          selectedMember={selectedMember}
          myRole={myRole}
          myUserId={myUserId}
          onUpdateRole={handleUpdateRole}
          onRemoveMember={handleRemoveMember}
          isPending={
            updateRoleMutation.isPending || removeMemberMutation.isPending
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fb",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
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
});
