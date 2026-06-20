import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import api from "../../src/services/api";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded, shadows } from "../../src/theme/layout";

export const format12HourTime = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString)
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
};

type FilterType = "ALL" | "URGENT" | "FULFILLED";
type ActionType = "RESOLVE" | "DELETE" | null;

export default function AdminBloodManageScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // --- Modal State ---
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [actionData, setActionData] = useState<{
    id: string;
    patientName: string;
    type: ActionType;
  } | null>(null);

  // --- Fetch Data ---
  const { data: posts, isLoading } = useQuery({
    queryKey: ["adminBloodPosts"],
    queryFn: async () => {
      const response = await api.get("/blood");
      return response.data?.data || [];
    },
  });

  // --- Mutations ---
  const resolveMutation = useMutation({
    mutationFn: async (id: string) => await api.patch(`/blood/${id}/resolve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBloodPosts"] });
      queryClient.invalidateQueries({ queryKey: ["bloodPosts"] });
      Toast.show({ type: "success", text1: "Request Marked Fulfilled" });
      closeConfirmModal();
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to resolve",
        text2: err.message,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/blood/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBloodPosts"] });
      queryClient.invalidateQueries({ queryKey: ["bloodPosts"] });
      Toast.show({ type: "info", text1: "Request Deleted Successfully" });
      closeConfirmModal();
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to delete",
        text2: err.message,
      }),
  });

  // --- Action Handlers ---
  const openResolveModal = (id: string, patientName: string) => {
    setActionData({ id, patientName, type: "RESOLVE" });
    setIsConfirmModalVisible(true);
  };

  const openDeleteModal = (id: string, patientName: string) => {
    setActionData({ id, patientName, type: "DELETE" });
    setIsConfirmModalVisible(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalVisible(false);
    setActionData(null);
  };

  const executeAction = () => {
    if (!actionData) return;
    if (actionData.type === "RESOLVE") resolveMutation.mutate(actionData.id);
    if (actionData.type === "DELETE") deleteMutation.mutate(actionData.id);
  };

  // --- Filtering Logic ---
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    let filtered = posts;

    if (activeFilter === "URGENT")
      filtered = filtered.filter(
        (p: any) => !p.isFulfilled && p.urgency === "High",
      );
    if (activeFilter === "FULFILLED")
      filtered = filtered.filter((p: any) => p.isFulfilled);

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p: any) =>
          p.patientName.toLowerCase().includes(lowerQ) ||
          p.patientCondition?.toLowerCase().includes(lowerQ) ||
          p.author?.name?.toLowerCase().includes(lowerQ) ||
          p.bloodGroup.replace("_", " ").toLowerCase().includes(lowerQ),
      );
    }
    return filtered;
  }, [posts, activeFilter, searchQuery]);

  const renderPostCard = ({ item }: { item: any }) => {
    const formattedBloodGroup = item.bloodGroup.replace("_", " ");

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.bloodBadge}>
            <Text style={styles.bloodBadgeText}>{formattedBloodGroup}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.metaText}>
              {format12HourTime(item.createdAt)}
            </Text>
            {item.urgency === "High" && !item.isFulfilled && (
              <Text style={styles.urgentText}>URGENT</Text>
            )}
            {item.isFulfilled && (
              <Text style={styles.fulfilledText}>FULFILLED</Text>
            )}
          </View>
        </View>

        <View style={styles.mainInfoBlock}>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text style={styles.patientCondition} numberOfLines={2}>
            Reason: {item.patientCondition}
          </Text>

          <View style={styles.authorInfo}>
            <Feather
              name="user"
              size={12}
              color={colors.outline}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.authorName}>Posted by {item.author?.name}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.viewDetailsBtn}
            onPress={() => router.push(`/blood/${item.id}`)}
          >
            <Text style={styles.viewDetailsText}>View Thread</Text>
          </TouchableOpacity>

          <View style={styles.actionButtonsRight}>
            {!item.isFulfilled && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnGreen]}
                onPress={() => openResolveModal(item.id, item.patientName)}
              >
                <Feather
                  name="check"
                  size={14}
                  color={colors.onPrimary}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.actionBtnText}>Resolve</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnRed]}
              onPress={() => openDeleteModal(item.id, item.patientName)}
            >
              <Feather name="trash-2" size={14} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Blood Hub Moderation</Text>
          <Text style={styles.headerSubtitle}>Manage emergency requests</Text>
        </View>
      </View>

      <View style={styles.searchContainerWrapper}>
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={20}
            color={colors.outline}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by patient, condition, or author..."
            placeholderTextColor={colors.outlineVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {["ALL", "URGENT", "FULFILLED"].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.tabButton,
              activeFilter === filter && styles.tabButtonActive,
            ]}
            onPress={() => setActiveFilter(filter as FilterType)}
          >
            <Text
              style={[
                styles.tabText,
                activeFilter === filter && styles.tabTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#D32F2F" />
        </View>
      ) : filteredPosts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="shield"
            size={48}
            color={colors.surfaceContainerHighest}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>No Requests Found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderPostCard}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* --- CUSTOM CONFIRMATION MODAL --- */}
      <Modal visible={isConfirmModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Dynamic Icon */}
            <View
              style={[
                styles.modalIconContainer,
                actionData?.type === "DELETE"
                  ? { backgroundColor: colors.errorContainer }
                  : { backgroundColor: "#E8F5E9" },
              ]}
            >
              <Feather
                name={
                  actionData?.type === "DELETE"
                    ? "alert-triangle"
                    : "check-circle"
                }
                size={28}
                color={actionData?.type === "DELETE" ? colors.error : "#2E7D32"}
              />
            </View>

            {/* Dynamic Text */}
            <Text style={styles.modalTitle}>
              {actionData?.type === "DELETE"
                ? "Delete Request"
                : "Resolve Request"}
            </Text>
            <Text style={styles.modalSubtitle}>
              {actionData?.type === "DELETE"
                ? `Are you sure you want to permanently delete the request for "${actionData?.patientName}"? This action cannot be undone.`
                : `Are you sure you want to mark the blood request for "${actionData?.patientName}" as fulfilled?`}
            </Text>

            {/* Buttons */}
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={closeConfirmModal}
                disabled={resolveMutation.isPending || deleteMutation.isPending}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  actionData?.type === "DELETE"
                    ? { backgroundColor: colors.error }
                    : { backgroundColor: "#2E7D32" },
                ]}
                onPress={executeAction}
                disabled={resolveMutation.isPending || deleteMutation.isPending}
              >
                {resolveMutation.isPending || deleteMutation.isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>
                    {actionData?.type === "DELETE" ? "Delete" : "Confirm"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: spacing.stackLg,
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
  },
  backButton: { marginRight: spacing.stackMd, padding: spacing.stackSm },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  headerSubtitle: { ...typography.bodyMd, color: colors.outline, marginTop: 2 },

  searchContainerWrapper: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.stackMd,
    backgroundColor: colors.surfaceContainerLowest,
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
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.stackMd,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: { borderBottomColor: "#D32F2F" },
  tabText: { ...typography.labelMd, color: colors.outline },
  tabTextActive: { color: "#D32F2F", fontWeight: "700" },

  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyTitle: {
    ...typography.bodyLg,
    fontSize: 18,
    color: colors.onSurface,
    fontWeight: "600",
  },

  listContent: { padding: spacing.marginMobile, paddingBottom: 100 },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.lg,
    padding: spacing.stackLg,
    marginBottom: spacing.stackMd,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.stackSm,
  },
  bloodBadge: {
    backgroundColor: "#D32F2F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: rounded.md,
  },
  bloodBadgeText: { ...typography.bodyLg, color: "#FFF", fontWeight: "800" },

  metaText: { ...typography.labelSm, color: colors.outline, marginBottom: 2 },
  urgentText: { ...typography.labelSm, color: "#D32F2F", fontWeight: "800" },
  fulfilledText: { ...typography.labelSm, color: "#2E7D32", fontWeight: "800" },

  mainInfoBlock: { marginBottom: spacing.stackMd },
  patientName: {
    ...typography.bodyLg,
    fontSize: 18,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: 2,
  },
  patientCondition: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.stackSm,
  },

  authorInfo: { flexDirection: "row", alignItems: "center" },
  authorName: { ...typography.labelSm, color: colors.outline },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
    paddingTop: spacing.stackMd,
  },
  viewDetailsBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  viewDetailsText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "700",
  },

  actionButtonsRight: { flexDirection: "row", gap: spacing.stackSm },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: rounded.md,
  },
  actionBtnGreen: { backgroundColor: "#2E7D32" },
  actionBtnRed: {
    backgroundColor: colors.errorContainer,
    paddingHorizontal: 12,
  },
  actionBtnText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: "700",
  },

  // --- Confirmation Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.marginMobile,
  },
  modalCard: {
    width: "100%",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    alignItems: "center",
    ...shadows.level1,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.stackLg,
  },
  modalTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: spacing.stackSm,
  },
  modalSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginBottom: spacing.stackLg,
    lineHeight: 22,
  },

  modalButtonRow: { flexDirection: "row", gap: spacing.stackMd, width: "100%" },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    paddingVertical: 14,
    borderRadius: rounded.md,
    alignItems: "center",
  },
  modalCancelText: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: "700",
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: rounded.md,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: { ...typography.labelMd, color: "#FFF", fontWeight: "700" },
});
