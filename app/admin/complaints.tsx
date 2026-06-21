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
  Platform,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import api from "../../src/services/api";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded, shadows } from "../../src/theme/layout";
import * as FileSystem from "expo-file-system";
export const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

type FilterType = "ALL" | "PENDING" | "RESOLVED" | "REJECTED";
type ActionType = "RESOLVE" | "REJECT" | "DELETE" | null;

export default function AdminComplaintsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [actionData, setActionData] = useState<{
    id: string;
    title: string;
    type: ActionType;
  } | null>(null);

  // --- Fetch Data ---
  const { data: complaints, isLoading } = useQuery({
    queryKey: ["adminComplaints"],
    queryFn: async () => {
      const response = await api.get("/complaints");
      return response.data?.data || [];
    },
  });

  // --- Mutations ---
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "RESOLVED" | "REJECTED";
    }) => await api.patch(`/complaints/${id}/status`, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminComplaints"] });
      Toast.show({
        type: "success",
        text1: `Complaint Marked as ${variables.status}`,
      });
      closeConfirmModal();
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to update",
        text2: err.message,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/complaints/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminComplaints"] });
      Toast.show({ type: "info", text1: "Complaint Deleted" });
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
  const openConfirmModal = (id: string, title: string, type: ActionType) => {
    setActionData({ id, title, type });
    setIsConfirmModalVisible(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalVisible(false);
    setActionData(null);
  };

  const executeAction = () => {
    if (!actionData) return;
    if (actionData.type === "RESOLVE")
      updateStatusMutation.mutate({ id: actionData.id, status: "RESOLVED" });
    if (actionData.type === "REJECT")
      updateStatusMutation.mutate({ id: actionData.id, status: "REJECTED" });
    if (actionData.type === "DELETE") deleteMutation.mutate(actionData.id);
  };

  // --- PDF Export Logic ---
  const exportToPDF = async () => {
    if (!complaints || complaints.length === 0) {
      Toast.show({ type: "error", text1: "No data to export" });
      return;
    }

    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
              h1 { margin: 0; color: #111; font-size: 24px; }
              .meta { font-size: 12px; color: #666; margin-top: 5px; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; }
              th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
              th { background-color: #f4f4f4; font-weight: bold; }
              .status-pending { color: #E65100; font-weight: bold; }
              .status-resolved { color: #2E7D32; font-weight: bold; }
              .status-rejected { color: #D32F2F; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Campus Complaints Report</h1>
              <div class="meta">Generated on: ${new Date().toLocaleString()}</div>
              <div class="meta">Total Records: ${complaints.length}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Date</th>
                  <th>User</th>
                  <th>Category</th>
                  <th>Title</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${complaints
                  .map(
                    (c: any) => `
                  <tr>
                    <td>#${c.id.slice(-6).toUpperCase()}</td>
                    <td>${formatDate(c.createdAt)}</td>
                    <td>${c.user?.name || "Unknown"}</td>
                    <td>${c.category}</td>
                    <td>${c.title}</td>
                    <td class="status-${c.status.toLowerCase()}">${c.status}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;

      if (Platform.OS === "web") {
        await Print.printAsync({ html: htmlContent });
      } else {
        // 1. Generate the file in the restricted Print folder
        const { uri } = await Print.printToFileAsync({ html: htmlContent });

        // 2. Define a "safe" public path
        // @ts-ignore - Bypassing strict TS definition quirk
        const baseDir =
          FileSystem.documentDirectory || FileSystem.cacheDirectory;
        const safeUri = `${baseDir}Campus_Complaints_Report.pdf`;

        // 3. Move the file from the restricted folder to the safe folder
        await FileSystem.moveAsync({
          from: uri,
          to: safeUri,
        });

        // 4. Share the safe file!
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(safeUri, {
            UTI: ".pdf",
            mimeType: "application/pdf",
            dialogTitle: "Save Complaints Report",
          });
        } else {
          Toast.show({
            type: "info",
            text1: "Sharing not available on this device",
          });
        }
      }
    } catch (error: any) {
      console.error("PDF Generation Error:", error);
      Toast.show({
        type: "error",
        text1: "Export failed",
        text2: error.message || "Could not generate PDF",
      });
    }
  };

  // --- Filtering Logic ---
  const filteredComplaints = useMemo(() => {
    if (!complaints) return [];
    let filtered = complaints;

    if (activeFilter !== "ALL") {
      filtered = filtered.filter((c: any) => c.status === activeFilter);
    }

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c: any) =>
          c.title.toLowerCase().includes(lowerQ) ||
          c.user?.name?.toLowerCase().includes(lowerQ) ||
          c.id.toLowerCase().includes(lowerQ),
      );
    }
    return filtered;
  }, [complaints, activeFilter, searchQuery]);

  // --- Render Functions ---
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <View style={[styles.statusBadge, { backgroundColor: "#E8F5E9" }]}>
            <Text style={[styles.statusText, { color: "#2E7D32" }]}>
              Resolved
            </Text>
          </View>
        );
      case "REJECTED":
        return (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: colors.errorContainer },
            ]}
          >
            <Text style={[styles.statusText, { color: colors.error }]}>
              Rejected
            </Text>
          </View>
        );
      default:
        return (
          <View style={[styles.statusBadge, { backgroundColor: "#FFF3E0" }]}>
            <Text style={[styles.statusText, { color: "#E65100" }]}>
              Pending
            </Text>
          </View>
        );
    }
  };

  const renderComplaintCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {/* Top Row: User Info & Status */}
      <View style={styles.cardHeader}>
        <View style={styles.userInfoRow}>
          {item.user?.image ? (
            <Image
              source={{ uri: item.user.image }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>
                {item.user?.name?.charAt(0) || "?"}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.userName}>{item.user?.name}</Text>
            <Text style={styles.userRole}>{item.user?.role}</Text>
          </View>
        </View>
        {renderStatusBadge(item.status)}
      </View>

      {/* Main Content */}
      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <Text style={styles.complaintTitle}>{item.title}</Text>
          <Text style={styles.ticketId}>
            #{item.id.slice(-6).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.categoryText}>
          {item.category} • {formatDate(item.createdAt)}
        </Text>
        <Text style={styles.complaintDesc}>{item.description}</Text>
      </View>

      {/* Admin Actions */}
      <View style={styles.actionRow}>
        {item.status === "PENDING" && (
          <View style={styles.actionGroup}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.resolveBtn]}
              onPress={() => openConfirmModal(item.id, item.title, "RESOLVE")}
            >
              <Feather
                name="check"
                size={14}
                color="#FFF"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.actionTextWhite}>Resolve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => openConfirmModal(item.id, item.title, "REJECT")}
            >
              <Feather
                name="x"
                size={14}
                color="#FFF"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.actionTextWhite}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => openConfirmModal(item.id, item.title, "DELETE")}
        >
          <Feather name="trash-2" size={14} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Complaints Admin</Text>
            <Text style={styles.headerSubtitle}>Manage user reports</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.exportBtn} onPress={exportToPDF}>
          <Feather
            name="download"
            size={16}
            color={colors.primaryContainer}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.exportText}>PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
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
            placeholder="Search by title, name, or ticket ID..."
            placeholderTextColor={colors.outlineVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.tabsContainer}>
        {["ALL", "PENDING", "RESOLVED", "REJECTED"].map((filter) => (
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
                filter === "REJECTED" && { fontSize: 13 },
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
        </View>
      ) : filteredComplaints.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="check-circle"
            size={48}
            color={colors.surfaceContainerHighest}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>No Complaints Found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredComplaints}
          keyExtractor={(item) => item.id}
          renderItem={renderComplaintCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Confirmation Modal */}
      <Modal visible={isConfirmModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View
              style={[
                styles.modalIconContainer,
                actionData?.type === "DELETE" || actionData?.type === "REJECT"
                  ? { backgroundColor: colors.errorContainer }
                  : { backgroundColor: "#E8F5E9" },
              ]}
            >
              <Feather
                name={
                  actionData?.type === "RESOLVE"
                    ? "check-circle"
                    : actionData?.type === "REJECT"
                      ? "x-circle"
                      : "alert-triangle"
                }
                size={28}
                color={
                  actionData?.type === "DELETE" || actionData?.type === "REJECT"
                    ? colors.error
                    : "#2E7D32"
                }
              />
            </View>

            <Text style={styles.modalTitle}>
              {actionData?.type === "DELETE"
                ? "Delete Ticket"
                : actionData?.type === "REJECT"
                  ? "Reject Complaint"
                  : "Resolve Complaint"}
            </Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to {actionData?.type?.toLowerCase()} the
              complaint "{actionData?.title}"?
            </Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={closeConfirmModal}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  actionData?.type === "DELETE" || actionData?.type === "REJECT"
                    ? { backgroundColor: colors.error }
                    : { backgroundColor: "#2E7D32" },
                ]}
                onPress={executeAction}
              >
                {updateStatusMutation.isPending || deleteMutation.isPending ? (
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: spacing.stackLg,
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: spacing.stackMd, padding: spacing.stackSm },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  headerSubtitle: { ...typography.bodyMd, color: colors.outline, marginTop: 2 },

  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryContainer + "15",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: rounded.full,
    borderWidth: 1,
    borderColor: colors.primaryContainer + "30",
  },
  exportText: {
    ...typography.labelMd,
    color: colors.primaryContainer,
    fontWeight: "700",
  },

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

  listContent: { padding: spacing.marginMobile, paddingBottom: 100 },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
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
    marginBottom: spacing.stackMd,
  },
  userInfoRow: { flexDirection: "row", alignItems: "center" },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.stackSm,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: spacing.stackSm,
    backgroundColor: colors.surfaceContainerHigh,
  },
  avatarText: {
    ...typography.bodyLg,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  userName: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "700",
  },
  userRole: {
    ...typography.labelSm,
    color: colors.outline,
    fontSize: 10,
    textTransform: "uppercase",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: rounded.full,
  },
  statusText: {
    ...typography.labelSm,
    fontWeight: "800",
    textTransform: "uppercase",
    fontSize: 10,
  },

  cardBody: { marginBottom: spacing.stackMd },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  complaintTitle: {
    flex: 1,
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "700",
    marginRight: 8,
  },
  ticketId: {
    ...typography.labelSm,
    color: colors.outline,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  categoryText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: spacing.stackSm,
  },
  complaintDesc: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: spacing.stackSm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
    gap: spacing.stackSm,
  },
  actionGroup: { flexDirection: "row", flex: 1, gap: spacing.stackSm },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: rounded.md,
  },
  resolveBtn: { backgroundColor: "#2E7D32" },
  rejectBtn: { backgroundColor: colors.errorContainer },
  deleteBtn: {
    paddingHorizontal: 12,
    backgroundColor: colors.surfaceContainerHigh,
  },
  actionTextWhite: { ...typography.labelMd, color: "#FFF", fontWeight: "700" },

  // Modal Styles
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
