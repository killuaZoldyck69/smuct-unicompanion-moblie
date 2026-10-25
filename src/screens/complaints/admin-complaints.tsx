// src/screens/complaints/admin-complaints.tsx
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
  KeyboardAvoidingView,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import Toast from "react-native-toast-message";

import {
  CAMPUS_HUB_COLORS,
  fontFamily,
} from "@/screens/campus-hub/shared/design-tokens";
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
import { ComplaintFilterModal } from "@/screens/complaints/components/complaint-filter-modal";
import type { ComplaintItem } from "@/services/complaint-service";

type ActionType = "ACCEPT" | "REJECT" | "RESOLVE" | "DELETE" | null;

export function AdminComplaintsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { height: windowHeight } = useWindowDimensions();

  const [activeFilter, setActiveFilter] = useState<ComplaintFilter>("ALL");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Modal State for Lifecycle & Destructive Operations
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [actionItem, setActionItem] = useState<ComplaintItem | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [adminRemarksInput, setAdminRemarksInput] = useState("");

  // Floating tab bar style definition to restore when modal closes
  const defaultTabBarStyle = useMemo(
    () => ({
      position: "absolute" as const,
      bottom: insets.bottom > 0 ? insets.bottom + 16 : 24,
      marginHorizontal: 20,
      height: 68,
      backgroundColor: "#131b2e",
      borderRadius: 24,
      borderTopWidth: 0,
      elevation: 10,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      paddingBottom: 0,
      paddingTop: 0,
    }),
    [insets.bottom],
  );

  const isAnyModalOpen = isConfirmModalVisible || isFilterModalOpen;

  // Dynamically hide tab bar when ANY modal is open to fix bottom safe area overlap
  React.useEffect(() => {
    if (!navigation || typeof navigation.setOptions !== "function") return;

    if (isAnyModalOpen) {
      navigation.setOptions({
        tabBarStyle: { display: "none" },
      });
    } else {
      navigation.setOptions({
        tabBarStyle: defaultTabBarStyle,
      });
    }

    return () => {
      navigation.setOptions({
        tabBarStyle: defaultTabBarStyle,
      });
    };
  }, [isAnyModalOpen, navigation, defaultTabBarStyle]);

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

  // Compute category counts for the filter modal
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: complaints.length };
    complaints.forEach((c) => {
      if (c.category) {
        counts[c.category] = (counts[c.category] || 0) + 1;
      }
    });
    return counts;
  }, [complaints]);

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

  // Tab bar offset padding
  const listBottomPadding =
    72 + (insets.bottom > 0 ? insets.bottom + 16 : 24) + 16;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top Header - No Back Button & No PDF Export */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Manage Complaints</Text>
          <Text style={styles.headerSubtitle}>
            Grievance Resolution & Tracking
          </Text>
        </View>
      </View>

      {/* Hero Stats & Status Filter Tabs */}
      <ComplaintHeroStats
        stats={stats}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
      />

      {/* Search & Category Filter Row */}
      <View style={styles.filterSection}>
        <View style={styles.searchRow}>
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
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Clear search text"
              >
                <Feather
                  name="x"
                  size={14}
                  color={CAMPUS_HUB_COLORS.subtleText}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Filter Button */}
          <TouchableOpacity
            style={[
              styles.filterBtn,
              activeCategory !== "ALL" && styles.filterBtnActive,
            ]}
            onPress={() => setIsFilterModalOpen(true)}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Filter grievances by category. Currently ${activeCategory}`}
          >
            <Feather
              name="filter"
              size={18}
              color={
                activeCategory !== "ALL"
                  ? "#ffffff"
                  : CAMPUS_HUB_COLORS.deepNavy
              }
            />
            {activeCategory !== "ALL" && <View style={styles.activeDot} />}
          </TouchableOpacity>
        </View>

        {/* Active Category Filter Badge */}
        {activeCategory !== "ALL" && (
          <View style={styles.activeFiltersRow}>
            <View style={styles.activeCategoryChip}>
              <Text style={styles.activeCategoryChipText} numberOfLines={1}>
                Category: {activeCategory}
              </Text>
              <TouchableOpacity
                onPress={() => setActiveCategory("ALL")}
                style={styles.clearCategoryBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Clear category filter"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Feather name="x" size={11} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
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
            { paddingBottom: listBottomPadding },
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

      {/* Category Filter Bottom Sheet Modal */}
      <ComplaintFilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedCategory={activeCategory}
        onApplyCategory={setActiveCategory}
        categoryCounts={categoryCounts}
      />

      {/* Administrative Action & Confirmation Modal */}
      <Modal
        visible={isConfirmModalVisible}
        transparent={true}
        statusBarTranslucent={true}
        animationType="fade"
        onRequestClose={closeConfirmModal}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <View
          style={[
            styles.modalOverlay,
            {
              paddingTop: Math.max(insets.top, 20) + 12,
              paddingBottom: Math.max(insets.bottom, 20) + 12,
            },
          ]}
        >
          {/* Backdrop Tap to Dismiss */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeConfirmModal}
            accessible={false}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardAvoidWrapper}
          >
            <View
              style={[
                styles.modalCard,
                {
                  maxHeight: Math.min(
                    windowHeight - insets.top - insets.bottom - 48,
                    600,
                  ),
                },
              ]}
            >
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
        </View>
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
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontFamily,
    fontSize: 22,
    fontWeight: "900",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
    fontWeight: "500",
    marginTop: 2,
  },

  // Filter Section
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchBar: {
    flex: 1,
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
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  filterBtnActive: {
    backgroundColor: CAMPUS_HUB_COLORS.deepNavy,
    borderColor: CAMPUS_HUB_COLORS.deepNavy,
  },
  activeDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: CAMPUS_HUB_COLORS.complaintAccent,
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  activeFiltersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  activeCategoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: CAMPUS_HUB_COLORS.deepNavy,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 5,
    borderRadius: 8,
  },
  activeCategoryChipText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  clearCategoryBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: "rgba(11, 21, 40, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  keyboardAvoidWrapper: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: "100%",
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
