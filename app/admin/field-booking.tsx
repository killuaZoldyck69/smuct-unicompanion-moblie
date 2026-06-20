import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Switch,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import api from "../../src/services/api";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded, shadows } from "../../src/theme/layout";

export const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatTime = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString)
    .toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
};

type FilterType = "ALL" | "PENDING" | "APPROVED" | "REJECTED";
type ActionType = "APPROVE" | "REJECT" | null;

export default function AdminFieldBookingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<FilterType>("PENDING");

  // Modals State
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [actionData, setActionData] = useState<{
    id: string;
    purpose: string;
    type: ActionType;
  } | null>(null);

  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    isBookingOpen: true,
    closedNotice: "",
  });

  // --- Fetch Data ---
  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["adminFieldBookings"],
    queryFn: async () => {
      const response = await api.get("/field/bookings");
      return response.data?.data || [];
    },
  });

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["adminFieldSettings"],
    queryFn: async () => {
      const response = await api.get("/field/settings");
      return response.data?.data;
    },
  });

  // Populate settings form when settings load
  useEffect(() => {
    if (settings) {
      setSettingsForm({
        isBookingOpen: settings.isBookingOpen,
        closedNotice: settings.closedNotice || "",
      });
    }
  }, [settings]);

  // --- Mutations ---
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED";
    }) => await api.patch(`/field/bookings/${id}/status`, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminFieldBookings"] });
      Toast.show({ type: "success", text1: `Booking ${variables.status}` });
      closeConfirmModal();
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to update",
        text2: err.message,
      }),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: typeof settingsForm) =>
      await api.patch("/field/settings", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminFieldSettings"] });
      queryClient.invalidateQueries({ queryKey: ["fieldSettings"] }); // Invalidate public settings too
      Toast.show({ type: "success", text1: "Global Settings Updated" });
      setIsSettingsModalVisible(false);
    },
    onError: (err: any) =>
      Toast.show({ type: "error", text1: "Update Failed", text2: err.message }),
  });

  // --- Action Handlers ---
  const openConfirmModal = (id: string, purpose: string, type: ActionType) => {
    setActionData({ id, purpose, type });
    setIsConfirmModalVisible(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalVisible(false);
    setActionData(null);
  };

  const executeAction = () => {
    if (!actionData) return;
    if (actionData.type === "APPROVE")
      updateStatusMutation.mutate({ id: actionData.id, status: "APPROVED" });
    if (actionData.type === "REJECT")
      updateStatusMutation.mutate({ id: actionData.id, status: "REJECTED" });
  };

  const saveSettings = () => {
    updateSettingsMutation.mutate(settingsForm);
  };

  // --- Filtering Logic ---
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    if (activeFilter === "ALL") return bookings;
    return bookings.filter((b: any) => b.status === activeFilter);
  }, [bookings, activeFilter]);

  // --- Render Functions ---
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <View style={[styles.statusBadge, { backgroundColor: "#E8F5E9" }]}>
            <Text style={[styles.statusText, { color: "#2E7D32" }]}>
              Approved
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

  const renderBookingCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
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

      <View style={styles.cardBody}>
        <Text style={styles.purposeText}>{item.purpose}</Text>
        <View style={styles.timeBox}>
          <Text style={styles.dateTextBig}>{formatDate(item.bookingDate)}</Text>
          <View style={styles.timeRow}>
            <Feather
              name="clock"
              size={14}
              color={colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.timeText}>
              {formatTime(item.startTime)} - {formatTime(item.endTime)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.ticketId}>
          Requested: {new Date(item.createdAt).toLocaleDateString()}
        </Text>

        {item.status === "PENDING" && (
          <View style={styles.actionGroup}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => openConfirmModal(item.id, item.purpose, "REJECT")}
            >
              <Feather
                name="x"
                size={14}
                color={colors.error}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.actionTextRed}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => openConfirmModal(item.id, item.purpose, "APPROVE")}
            >
              <Feather
                name="check"
                size={14}
                color="#FFF"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.actionTextWhite}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}
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
            <Text style={styles.headerTitle}>Field Requests</Text>
            <Text style={styles.headerSubtitle}>Manage campus ground</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => setIsSettingsModalVisible(true)}
        >
          <Feather name="settings" size={20} color={colors.onSurface} />
          {settings?.isBookingOpen === false && (
            <View style={styles.settingsBadgeDot} />
          )}
        </TouchableOpacity>
      </View>

      {/* Global Notice Warning Banner */}
      {!isLoadingSettings && settings?.isBookingOpen === false && (
        <View style={styles.globalWarningBanner}>
          <Feather
            name="alert-triangle"
            size={16}
            color={colors.error}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.globalWarningText}>
            Bookings are currently disabled.
          </Text>
        </View>
      )}

      {/* Filters */}
      <View style={styles.tabsContainer}>
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((filter) => (
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
      {isLoadingBookings ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
        </View>
      ) : filteredBookings.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="calendar"
            size={48}
            color={colors.surfaceContainerHighest}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>No Requests Found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* --- CONFIRMATION MODAL --- */}
      <Modal visible={isConfirmModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View
              style={[
                styles.modalIconContainer,
                actionData?.type === "REJECT"
                  ? { backgroundColor: colors.errorContainer }
                  : { backgroundColor: "#E8F5E9" },
              ]}
            >
              <Feather
                name={
                  actionData?.type === "APPROVE" ? "check-circle" : "x-circle"
                }
                size={28}
                color={actionData?.type === "REJECT" ? colors.error : "#2E7D32"}
              />
            </View>

            <Text style={styles.modalTitle}>
              {actionData?.type === "REJECT"
                ? "Reject Request"
                : "Approve Request"}
            </Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to {actionData?.type?.toLowerCase()} the
              booking for "{actionData?.purpose}"?
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
                  actionData?.type === "REJECT"
                    ? { backgroundColor: colors.error }
                    : { backgroundColor: "#2E7D32" },
                ]}
                onPress={executeAction}
              >
                {updateStatusMutation.isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- SETTINGS MODAL --- */}
      <Modal
        visible={isSettingsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.fullModalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.fullModalHeader}>
              <TouchableOpacity
                onPress={() => setIsSettingsModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.fullModalTitle}>Global Settings</Text>
              <TouchableOpacity
                onPress={saveSettings}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={styles.saveTextBtn}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.fullModalContent}>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>Enable Field Bookings</Text>
                  <Text style={styles.switchDesc}>
                    Allow students to request the field.
                  </Text>
                </View>
                <Switch
                  value={settingsForm.isBookingOpen}
                  onValueChange={(val) =>
                    setSettingsForm({ ...settingsForm, isBookingOpen: val })
                  }
                  trackColor={{
                    false: colors.outline,
                    true: colors.primaryContainer,
                  }}
                  thumbColor="#FFF"
                />
              </View>

              {!settingsForm.isBookingOpen && (
                <View style={styles.noticeInputBox}>
                  <Text style={styles.label}>Closure Notice Message</Text>
                  <Text style={styles.helpText}>
                    Explain why bookings are disabled.
                  </Text>
                  <TextInput
                    style={styles.textArea}
                    value={settingsForm.closedNotice}
                    onChangeText={(text) =>
                      setSettingsForm({ ...settingsForm, closedNotice: text })
                    }
                    placeholder="e.g. Field is under maintenance until next week."
                    placeholderTextColor={colors.outlineVariant}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
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

  settingsBtn: {
    padding: spacing.stackSm,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.full,
    position: "relative",
  },
  settingsBadgeDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
  },

  globalWarningBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.errorContainer,
    paddingVertical: spacing.stackSm,
    borderBottomWidth: 1,
    borderBottomColor: colors.error + "30",
  },
  globalWarningText: {
    ...typography.labelMd,
    color: colors.error,
    fontWeight: "700",
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
    alignItems: "center",
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
  purposeText: {
    ...typography.bodyLg,
    fontSize: 18,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: spacing.stackMd,
  },

  timeBox: {
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.stackMd,
    borderRadius: rounded.md,
  },
  dateTextBig: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: 4,
  },
  timeRow: { flexDirection: "row", alignItems: "center" },
  timeText: { ...typography.bodyMd, color: colors.primary, fontWeight: "600" },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.stackSm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
  },
  ticketId: { ...typography.labelSm, color: colors.outline },

  actionGroup: { flexDirection: "row", gap: spacing.stackSm },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: rounded.md,
  },
  approveBtn: { backgroundColor: "#2E7D32" },
  rejectBtn: { backgroundColor: colors.errorContainer },
  actionTextWhite: { ...typography.labelMd, color: "#FFF", fontWeight: "700" },
  actionTextRed: {
    ...typography.labelMd,
    color: colors.error,
    fontWeight: "700",
  },

  // Confirm Modal
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

  // Settings Modal
  fullModalContainer: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },
  fullModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  cancelText: { ...typography.bodyLg, fontSize: 16, color: colors.outline },
  fullModalTitle: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "700",
  },
  saveTextBtn: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.primaryContainer,
    fontWeight: "700",
  },

  fullModalContent: { flex: 1, padding: spacing.marginMobile },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.stackLg,
    borderRadius: rounded.lg,
    marginBottom: spacing.stackLg,
  },
  switchLabel: {
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: 4,
  },
  switchDesc: { ...typography.bodyMd, color: colors.onSurfaceVariant },

  noticeInputBox: {
    backgroundColor: colors.errorContainer + "30",
    padding: spacing.stackLg,
    borderRadius: rounded.lg,
    borderWidth: 1,
    borderColor: colors.error + "50",
  },
  label: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: 4,
  },
  helpText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.stackMd,
  },
  textArea: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.bodyMd,
    color: colors.onSurface,
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
});
