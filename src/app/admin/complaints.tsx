import React, { useState, useMemo, useCallback } from "react";
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
  RefreshControl,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

import {
  CAMPUS_HUB_COLORS,
  fontFamily,
} from "@/screens/campus-hub/shared/design-tokens";
import { formatDate } from "@/utils/date-formatter";
import {
  useAllComplaintsAdmin,
  useAdminComplaintStats,
  useUpdateComplaintStatus,
  useDeleteComplaint,
} from "@/features/complaints/useComplaints";
import {
  ComplaintHeroStats,
  ComplaintFilter,
} from "@/screens/complaints/components/complaint-hero-stats";
import { ComplaintCard } from "@/screens/complaints/components/complaint-card";
import type { ComplaintItem } from "@/services/complaint-service";

type ActionType = "ACCEPT" | "REJECT" | "RESOLVE" | "DELETE" | null;

const CATEGORIES = [
  "ALL",
  "Facilities",
  "Academic",
  "Hostel",
  "IT Support",
  "Other",
] as const;

export default function AdminComplaintsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState<ComplaintFilter>("ALL");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Lifecycle & Destructive Operations
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [actionItem, setActionItem] = useState<ComplaintItem | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [adminRemarksInput, setAdminRemarksInput] = useState("");

  // --- Queries ---
  const {
    data: complaints = [],
    isLoading,
    isError,
    error,
    refetch: refetchComplaints,
    isRefetching,
  } = useAllComplaintsAdmin({
    status: activeFilter !== "ALL" ? activeFilter : undefined,
    category: activeCategory !== "ALL" ? activeCategory : undefined,
  });

  const { data: statsData, refetch: refetchStats } = useAdminComplaintStats();

  const stats = useMemo(() => {
    return (
      statsData || {
        all: complaints.length,
        pending: complaints.filter((c) => c.status === "PENDING").length,
        accepted: complaints.filter((c) => c.status === "ACCEPTED").length,
        resolved: complaints.filter((c) => c.status === "RESOLVED").length,
        rejected: complaints.filter((c) => c.status === "REJECTED").length,
      }
    );
  }, [statsData, complaints]);

  // --- Mutations ---
  const updateStatusMutation = useUpdateComplaintStatus();
  const deleteMutation = useDeleteComplaint();

  const isActionLoading =
    updateStatusMutation.isPending || deleteMutation.isPending;

  const handleRefresh = useCallback(() => {
    refetchComplaints();
    refetchStats();
  }, [refetchComplaints, refetchStats]);

  // --- Action Modal Openers ---
  const handleOpenAccept = useCallback((item: ComplaintItem) => {
    setActionItem(item);
    setActionType("ACCEPT");
    setAdminRemarksInput("");
    setIsConfirmModalVisible(true);
  }, []);

  const handleOpenReject = useCallback((item: ComplaintItem) => {
    setActionItem(item);
    setActionType("REJECT");
    setAdminRemarksInput(item.adminRemarks || "");
    setIsConfirmModalVisible(true);
  }, []);

  const handleOpenResolve = useCallback((item: ComplaintItem) => {
    setActionItem(item);
    setActionType("RESOLVE");
    setAdminRemarksInput(item.adminRemarks || "");
    setIsConfirmModalVisible(true);
  }, []);

  const handleOpenDelete = useCallback((item: ComplaintItem) => {
    setActionItem(item);
    setActionType("DELETE");
    setAdminRemarksInput("");
    setIsConfirmModalVisible(true);
  }, []);

  const closeConfirmModal = useCallback(() => {
    setIsConfirmModalVisible(false);
    setActionItem(null);
    setActionType(null);
    setAdminRemarksInput("");
  }, []);

  // --- Execute Lifecycle Mutation ---
  const executeAction = useCallback(async () => {
    if (!actionItem || !actionType) return;

    try {
      if (actionType === "ACCEPT") {
        await updateStatusMutation.mutateAsync({
          id: actionItem.id,
          data: {
            status: "ACCEPTED",
            adminRemarks: adminRemarksInput.trim() || undefined,
          },
        });
        Toast.show({
          type: "success",
          text1: "Complaint Accepted",
          text2: `Ticket #${actionItem.id.slice(0, 8).toUpperCase()} has been marked as Accepted.`,
        });
      } else if (actionType === "REJECT") {
        await updateStatusMutation.mutateAsync({
          id: actionItem.id,
          data: {
            status: "REJECTED",
            adminRemarks: adminRemarksInput.trim() || undefined,
          },
        });
        Toast.show({
          type: "info",
          text1: "Complaint Rejected",
          text2: `Ticket #${actionItem.id.slice(0, 8).toUpperCase()} has been rejected.`,
        });
      } else if (actionType === "RESOLVE") {
        await updateStatusMutation.mutateAsync({
          id: actionItem.id,
          data: {
            status: "RESOLVED",
            adminRemarks: adminRemarksInput.trim() || undefined,
          },
        });
        Toast.show({
          type: "success",
          text1: "Complaint Resolved",
          text2: `Ticket #${actionItem.id.slice(0, 8).toUpperCase()} marked as Resolved.`,
        });
      } else if (actionType === "DELETE") {
        await deleteMutation.mutateAsync(actionItem.id);
        Toast.show({
          type: "info",
          text1: "Complaint Deleted",
          text2: `Ticket #${actionItem.id.slice(0, 8).toUpperCase()} has been removed.`,
        });
      }

      closeConfirmModal();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Operation failed.";
      Toast.show({
        type: "error",
        text1: "Action Failed",
        text2: errorMessage,
      });
    }
  }, [
    actionItem,
    actionType,
    adminRemarksInput,
    updateStatusMutation,
    deleteMutation,
    closeConfirmModal,
  ]);

  // --- Client Filtering for Search & Category ---
  const filteredComplaints = useMemo(() => {
    if (!complaints) return [];
    let list = [...complaints];

    if (activeFilter !== "ALL") {
      list = list.filter((c) => c.status === activeFilter);
    }

    if (activeCategory !== "ALL") {
      list = list.filter(
        (c) => c.category?.toLowerCase() === activeCategory.toLowerCase(),
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => {
        const matchesTitle = c.title?.toLowerCase().includes(q);
        const matchesDesc = c.description?.toLowerCase().includes(q);
        const matchesId = c.id?.toLowerCase().includes(q);
        const matchesCategory = c.category?.toLowerCase().includes(q);
        // Only search user name if complaint is not anonymous
        const matchesUser =
          !c.isAnonymous && c.user?.name?.toLowerCase().includes(q);
        return (
          matchesTitle ||
          matchesDesc ||
          matchesId ||
          matchesCategory ||
          matchesUser
        );
      });
    }

    return list;
  }, [complaints, activeFilter, activeCategory, searchQuery]);

  // --- PDF Export with Anonymity Guarantees ---
  const exportToPDF = async () => {
    if (!filteredComplaints || filteredComplaints.length === 0) {
      Toast.show({ type: "error", text1: "No records to export" });
      return;
    }

    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Campus Complaints Report</title>
            <style>
              body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                padding: 36px;
                color: #0f172a;
                background-color: #ffffff;
                margin: 0;
              }
              .header {
                text-align: center;
                margin-bottom: 24px;
                border-bottom: 2px solid #0f172a;
                padding-bottom: 14px;
              }
              h1 {
                margin: 0 0 6px 0;
                color: #0f172a;
                font-size: 22px;
                font-weight: 800;
              }
              .meta-line {
                font-size: 11px;
                color: #64748b;
                margin-top: 4px;
              }
              .stats-summary {
                display: flex;
                justify-content: space-between;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 10px 16px;
                margin-bottom: 20px;
                font-size: 11px;
                font-weight: 600;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                font-size: 10.5px;
              }
              th, td {
                padding: 8px 10px;
                border: 1px solid #e2e8f0;
                text-align: left;
                vertical-align: top;
              }
              th {
                background-color: #f1f5f9;
                font-weight: 700;
                color: #334155;
              }
              .badge {
                display: inline-block;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 9.5px;
                font-weight: 800;
                text-transform: uppercase;
              }
              .status-pending { background: #fef3c7; color: #b45309; }
              .status-accepted { background: #e0f2fe; color: #0284c7; }
              .status-resolved { background: #d1fae5; color: #047857; }
              .status-rejected { background: #fee2e2; color: #b91c1c; }
              .anon-label { color: #6366f1; font-weight: 700; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Campus Grievance Administration Report</h1>
              <div class="meta-line">Generated on ${new Date().toLocaleString()}</div>
              <div class="meta-line">Records Filtered: ${filteredComplaints.length} of ${complaints.length} Total</div>
            </div>

            <div class="stats-summary">
              <span>All: ${stats.all}</span>
              <span>Pending: ${stats.pending}</span>
              <span>Accepted: ${stats.accepted}</span>
              <span>Resolved: ${stats.resolved}</span>
              <span>Rejected: ${stats.rejected}</span>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 12%;">Ticket ID</th>
                  <th style="width: 12%;">Date</th>
                  <th style="width: 18%;">Complainant</th>
                  <th style="width: 14%;">Category</th>
                  <th style="width: 28%;">Title & Details</th>
                  <th style="width: 16%;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredComplaints
                  .map(
                    (c: any) => `
                  <tr>
                    <td><strong>#${c.id.slice(0, 8).toUpperCase()}</strong></td>
                    <td>${formatDate(c.createdAt)}</td>
                    <td>${
                      c.isAnonymous
                        ? '<span class="anon-label">🔒 Anonymous</span>'
                        : `${c.user?.name || "Student"} ${
                            c.user?.studentProfile?.studentId
                              ? `<br/><small style="color: #64748b;">(${c.user.studentProfile.studentId})</small>`
                              : ""
                          }`
                    }</td>
                    <td>${c.category}</td>
                    <td>
                      <strong>${c.title}</strong>
                      <div style="color: #64748b; font-size: 9.5px; margin-top: 2px;">${c.description}</div>
                      ${
                        c.adminRemarks
                          ? `<div style="color: #0369a1; font-size: 9px; margin-top: 4px; background: #f0f9ff; padding: 3px 6px; border-radius: 4px;"><strong>Admin Response:</strong> ${c.adminRemarks}</div>`
                          : ""
                      }
                    </td>
                    <td><span class="badge status-${c.status.toLowerCase()}">${c.status}</span></td>
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
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        const baseDir =
          (FileSystem as any).documentDirectory ||
          (FileSystem as any).cacheDirectory ||
          "";
        const safeUri = `${baseDir}Campus_Complaints_Report.pdf`;

        await FileSystem.moveAsync({
          from: uri,
          to: safeUri,
        });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(safeUri, {
            UTI: ".pdf",
            mimeType: "application/pdf",
            dialogTitle: "Save Campus Complaints Report",
          });
        } else {
          Toast.show({
            type: "info",
            text1: "Export created",
            text2: "Report saved to temporary document directory.",
          });
        }
      }
    } catch (err: any) {
      console.error("PDF Export Error:", err);
      Toast.show({
        type: "error",
        text1: "Export Failed",
        text2: err?.message || "Could not generate PDF report",
      });
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: ComplaintItem }) => (
      <ComplaintCard
        item={item}
        isAdmin={true}
        onAccept={handleOpenAccept}
        onReject={handleOpenReject}
        onResolve={handleOpenResolve}
        onDelete={handleOpenDelete}
        isActionLoading={isActionLoading}
        activeActionId={actionItem?.id}
      />
    ),
    [
      handleOpenAccept,
      handleOpenReject,
      handleOpenResolve,
      handleOpenDelete,
      isActionLoading,
      actionItem?.id,
    ],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            activeOpacity={0.7}
          >
            <Feather
              name="arrow-left"
              size={22}
              color={CAMPUS_HUB_COLORS.deepNavy}
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Manage Complaints</Text>
            <Text style={styles.headerSubtitle}>
              Grievance Resolution & Tracking
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.exportBtn}
          onPress={exportToPDF}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Export complaints report to PDF"
          activeOpacity={0.8}
        >
          <Feather
            name="download"
            size={14}
            color={CAMPUS_HUB_COLORS.deepNavy}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.exportText}>PDF Export</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Stats & Status Filter Tabs */}
      <ComplaintHeroStats
        stats={stats}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
      />

      {/* Search & Category Filter Controls */}
      <View style={styles.filterSection}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather
            name="search"
            size={16}
            color={CAMPUS_HUB_COLORS.subtleText}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, ticket ID, complainant..."
            placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessible={true}
            accessibilityLabel="Search complaints"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearSearchBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather
                name="x"
                size={14}
                color={CAMPUS_HUB_COLORS.subtleText}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryFilterPill,
                  isSelected && styles.categoryFilterPillActive,
                ]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Filter by category ${cat}`}
              >
                <Text
                  style={[
                    styles.categoryFilterText,
                    isSelected && styles.categoryFilterTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Complaints List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={CAMPUS_HUB_COLORS.complaintAccent}
          />
          <Text style={styles.loadingText}>Loading complaints...</Text>
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorIconCircle}>
            <Feather name="alert-triangle" size={32} color="#dc2626" />
          </View>
          <Text style={styles.errorTitle}>Failed to Load Complaints</Text>
          <Text style={styles.errorSubtitle}>
            {(error as any)?.message ||
              "Could not connect to the campus service. Please try again."}
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={handleRefresh}
            activeOpacity={0.8}
          >
            <Feather
              name="refresh-cw"
              size={15}
              color="#ffffff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredComplaints}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 28 },
            filteredComplaints.length === 0 && styles.listEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              colors={[CAMPUS_HUB_COLORS.complaintAccent]}
            />
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === "android"}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Feather
                  name={
                    activeFilter === "ALL"
                      ? "inbox"
                      : activeFilter === "PENDING"
                        ? "clock"
                        : activeFilter === "ACCEPTED"
                          ? "check"
                          : activeFilter === "RESOLVED"
                            ? "check-circle"
                            : "filter"
                  }
                  size={36}
                  color={CAMPUS_HUB_COLORS.subtleText}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery || activeCategory !== "ALL"
                  ? "No Matching Complaints"
                  : activeFilter === "ALL"
                    ? "No Complaints Submitted"
                    : `No ${activeFilter.toLowerCase()} Complaints`}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || activeCategory !== "ALL"
                  ? "Try adjusting your search terms or category filter to find reports."
                  : activeFilter === "ALL"
                    ? "There are currently no grievances filed by campus members."
                    : `No tickets are currently in ${activeFilter.toLowerCase()} status.`}
              </Text>
            </View>
          }
        />
      )}

      {/* Administrative Action & Confirmation Modal */}
      <Modal
        visible={isConfirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeConfirmModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            {/* Modal Header Icon */}
            <View
              style={[
                styles.modalIconContainer,
                actionType === "ACCEPT"
                  ? { backgroundColor: "#e0f2fe" }
                  : actionType === "RESOLVE"
                    ? { backgroundColor: "#d1fae5" }
                    : actionType === "REJECT" || actionType === "DELETE"
                      ? { backgroundColor: "#fee2e2" }
                      : { backgroundColor: "#f1f5f9" },
              ]}
            >
              <Feather
                name={
                  actionType === "ACCEPT"
                    ? "check"
                    : actionType === "RESOLVE"
                      ? "check-circle"
                      : actionType === "REJECT"
                        ? "x-circle"
                        : "trash-2"
                }
                size={28}
                color={
                  actionType === "ACCEPT"
                    ? "#0284c7"
                    : actionType === "RESOLVE"
                      ? "#047857"
                      : actionType === "REJECT" || actionType === "DELETE"
                        ? "#dc2626"
                        : CAMPUS_HUB_COLORS.deepNavy
                }
              />
            </View>

            {/* Modal Title */}
            <Text style={styles.modalTitle}>
              {actionType === "ACCEPT"
                ? "Accept Complaint Ticket"
                : actionType === "RESOLVE"
                  ? "Resolve Complaint"
                  : actionType === "REJECT"
                    ? "Reject Complaint"
                    : "Delete Complaint Ticket"}
            </Text>

            {/* Modal Subtitle / Context */}
            <Text style={styles.modalSubtitle}>
              {actionType === "ACCEPT"
                ? `Advance ticket #${actionItem?.id.slice(0, 8).toUpperCase()} ("${actionItem?.title}") to Accepted status to begin formal resolution.`
                : actionType === "RESOLVE"
                  ? `Mark ticket #${actionItem?.id.slice(0, 8).toUpperCase()} as officially resolved.`
                  : actionType === "REJECT"
                    ? `Reject ticket #${actionItem?.id.slice(0, 8).toUpperCase()}. The status change will be visible to the student.`
                    : `Are you sure you want to delete ticket #${actionItem?.id.slice(0, 8).toUpperCase()} ("${actionItem?.title}")?`}
            </Text>

            {/* Remarks Input for Accept, Resolve, and Reject actions */}
            {(actionType === "RESOLVE" ||
              actionType === "REJECT" ||
              actionType === "ACCEPT") && (
              <View style={styles.remarksInputContainer}>
                <Text style={styles.remarksInputLabel}>
                  {actionType === "RESOLVE"
                    ? "Official Resolution Response:"
                    : actionType === "REJECT"
                      ? "Reason for Rejection:"
                      : "Administrative Notes (Optional):"}
                </Text>
                <TextInput
                  style={styles.remarksTextInput}
                  placeholder={
                    actionType === "RESOLVE"
                      ? "Describe actions taken or completion details..."
                      : actionType === "REJECT"
                        ? "State reasons why this ticket cannot be addressed..."
                        : "Optional internal note..."
                  }
                  placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                  value={adminRemarksInput}
                  onChangeText={setAdminRemarksInput}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={1000}
                />
              </View>
            )}

            {/* Button Actions Row */}
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={closeConfirmModal}
                disabled={isActionLoading}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cancel operation"
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  actionType === "ACCEPT"
                    ? { backgroundColor: "#0284c7" }
                    : actionType === "RESOLVE"
                      ? { backgroundColor: "#059669" }
                      : { backgroundColor: "#dc2626" },
                  isActionLoading && styles.btnDisabled,
                ]}
                onPress={executeAction}
                disabled={isActionLoading}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Confirm administrative action"
              >
                {isActionLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalConfirmText}>
                    {actionType === "ACCEPT"
                      ? "Accept Ticket"
                      : actionType === "RESOLVE"
                        ? "Mark Resolved"
                        : actionType === "REJECT"
                          ? "Reject Ticket"
                          : "Delete Ticket"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  headerTitle: {
    fontFamily,
    fontSize: 20,
    fontWeight: "900",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
    fontWeight: "500",
    marginTop: 1,
  },

  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAMPUS_HUB_COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  exportText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },

  // Filter Section
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  searchInput: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.deepNavy,
    height: "100%",
  },
  clearSearchBtn: {
    padding: 4,
  },
  categoryScroll: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  categoryFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  categoryFilterPillActive: {
    backgroundColor: CAMPUS_HUB_COLORS.deepNavy,
    borderColor: CAMPUS_HUB_COLORS.deepNavy,
  },
  categoryFilterText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  categoryFilterTextActive: {
    color: "#ffffff",
  },

  // List States
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  listEmpty: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  errorIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  errorTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  errorSubtitle: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 280,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAMPUS_HUB_COLORS.deepNavy,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    marginTop: 4,
  },
  retryBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily,
    fontSize: 12.5,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 280,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(11, 21, 40, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  modalIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    marginBottom: 6,
    textAlign: "center",
  },
  modalSubtitle: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.neutralText,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 19,
  },
  remarksInputContainer: {
    width: "100%",
    marginBottom: 18,
  },
  remarksInputLabel: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    marginBottom: 6,
  },
  remarksTextInput: {
    width: "100%",
    minHeight: 80,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  modalConfirmBtn: {
    flex: 1.2,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
