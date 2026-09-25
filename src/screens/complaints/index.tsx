import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  useMyComplaints,
  useMyComplaintStats,
} from "@/features/complaints/useComplaints";
import { CAMPUS_HUB_COLORS, fontFamily } from "@/screens/campus-hub/shared/design-tokens";
import type { ComplaintItem } from "@/services/complaint-service";

import {
  ComplaintHeroStats,
  ComplaintFilter,
} from "./components/complaint-hero-stats";
import { ComplaintCard } from "./components/complaint-card";
import { ComplaintComposeModal } from "./components/complaint-compose-modal";
import { ComplaintDeleteModal } from "./components/complaint-delete-modal";

export function ComplaintsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listBottomPadding = 72 + (insets.bottom > 0 ? insets.bottom + 16 : 24) + 16;

  const [activeFilter, setActiveFilter] = useState<ComplaintFilter>("ALL");
  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [complaintToEdit, setComplaintToEdit] = useState<ComplaintItem | null>(null);
  const [complaintToDelete, setComplaintToDelete] = useState<ComplaintItem | null>(null);

  // Queries
  const {
    data: complaints = [],
    isLoading,
    refetch: refetchComplaints,
    isRefetching,
  } = useMyComplaints({
    status: activeFilter !== "ALL" ? activeFilter : undefined,
  });

  const { data: statsData, refetch: refetchStats } = useMyComplaintStats();

  const stats = useMemo(() => {
    return (
      statsData || {
        all: complaints.length,
        pending: complaints.filter((c) => c.status === "PENDING").length,
        resolved: complaints.filter((c) => c.status === "RESOLVED").length,
        rejected: complaints.filter((c) => c.status === "REJECTED").length,
      }
    );
  }, [statsData, complaints]);

  const handleRefresh = useCallback(() => {
    refetchComplaints();
    refetchStats();
  }, [refetchComplaints, refetchStats]);

  const handleOpenCompose = useCallback(() => {
    setComplaintToEdit(null);
    setIsComposeVisible(true);
  }, []);

  const handleOpenEdit = useCallback((item: ComplaintItem) => {
    setComplaintToEdit(item);
    setIsComposeVisible(true);
  }, []);

  const handleCloseCompose = useCallback(() => {
    setIsComposeVisible(false);
    setComplaintToEdit(null);
  }, []);

  const handleOpenDelete = useCallback((item: ComplaintItem) => {
    setComplaintToDelete(item);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setComplaintToDelete(null);
  }, []);

  const handleNotificationsPress = useCallback(() => {
    router.push("/notices" as any);
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: ComplaintItem }) => (
      <ComplaintCard
        item={item}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />
    ),
    [handleOpenEdit, handleOpenDelete]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top Header with Action Icons */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>My Complaints</Text>
        </View>

        {/* Top Right Header Action Icons */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerIconBtn, styles.headerAddBtn]}
            onPress={handleOpenCompose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="File new complaint"
            activeOpacity={0.8}
          >
            <Feather name="plus" size={20} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleNotificationsPress}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View notices and notifications"
            activeOpacity={0.7}
          >
            <Feather name="bell" size={19} color={CAMPUS_HUB_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Stats Card / Filter Tabs */}
      <ComplaintHeroStats
        stats={stats}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
      />

      {/* Main List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CAMPUS_HUB_COLORS.complaintAccent} />
          <Text style={styles.loadingText}>Loading complaints...</Text>
        </View>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: listBottomPadding },
            complaints.length === 0 && styles.listEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              colors={[CAMPUS_HUB_COLORS.complaintAccent]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Feather
                  name={activeFilter === "ALL" ? "file-text" : "filter"}
                  size={36}
                  color={CAMPUS_HUB_COLORS.subtleText}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {activeFilter === "ALL"
                  ? "No Complaints Filed Yet"
                  : `No ${activeFilter.toLowerCase()} complaints`}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter === "ALL"
                  ? "Need to report an issue or campus grievance? Submit a ticket directly to administration."
                  : `You do not have any ${activeFilter.toLowerCase()} complaints under this status.`}
              </Text>

              {activeFilter === "ALL" && (
                <TouchableOpacity
                  style={styles.emptyCtaBtn}
                  onPress={handleOpenCompose}
                  activeOpacity={0.8}
                >
                  <Feather name="plus" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.emptyCtaText}>File a Complaint</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Compose & Edit Modal */}
      <ComplaintComposeModal
        visible={isComposeVisible}
        complaintToEdit={complaintToEdit}
        onClose={handleCloseCompose}
      />

      {/* Delete Confirmation Modal */}
      <ComplaintDeleteModal
        visible={Boolean(complaintToDelete)}
        complaint={complaintToDelete}
        onClose={handleCloseDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  headerLeft: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontFamily,
    fontSize: 22,
    fontWeight: "900",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  headerAddBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.complaintAccent,
  },
  listContent: {
    paddingHorizontal: 20,
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAMPUS_HUB_COLORS.complaintAccent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  emptyCtaText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
