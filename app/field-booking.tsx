import React, { useState } from "react";
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
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import api from "../src/services/api";
import { colors } from "../src/theme/colors";
import { typography } from "../src/theme/typography";
import { spacing, rounded, shadows } from "../src/theme/layout";

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

type TabType = "MY_BOOKINGS" | "SCHEDULE";

export default function FieldBookingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>("MY_BOOKINGS");
  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [newBooking, setNewBooking] = useState({
    purpose: "",
    date: "", // Format: YYYY-MM-DD
    startTime: "", // Format: HH:MM (24h)
    endTime: "", // Format: HH:MM (24h)
  });

  // --- Fetch Data ---
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["fieldSettings"],
    queryFn: async () => {
      const response = await api.get("/field/settings");
      return response.data?.data;
    },
  });

  const { data: myBookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["myFieldBookings"],
    queryFn: async () => {
      const response = await api.get("/field/my-bookings");
      return response.data?.data || [];
    },
  });

  // NEW: Fetch Public Approved Schedule
  const { data: publicSchedule, isLoading: isLoadingSchedule } = useQuery({
    queryKey: ["fieldSchedule"],
    queryFn: async () => {
      const response = await api.get("/field/schedule");
      return response.data?.data || [];
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (payload: any) => await api.post("/field/book", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myFieldBookings"] });
      Toast.show({
        type: "success",
        text1: "Request Submitted",
        text2: "Waiting for admin approval.",
      });
      setIsComposeVisible(false);
      setNewBooking({ purpose: "", date: "", startTime: "", endTime: "" });
      setActiveTab("MY_BOOKINGS");
    },
    onError: (err: any) => {
      // Extract the actual error message sent by the Express backend
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "This time slot is already reserved.";

      Toast.show({
        type: "error",
        text1: "Booking Failed",
        text2: errorMessage,
      });
    },
  });

  const handleSubmit = () => {
    // Basic format validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (
      !newBooking.purpose.trim() ||
      !newBooking.date ||
      !newBooking.startTime ||
      !newBooking.endTime
    ) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill out all fields.",
      });
      return;
    }
    if (!dateRegex.test(newBooking.date)) {
      Toast.show({
        type: "error",
        text1: "Invalid Date format",
        text2: "Please use YYYY-MM-DD.",
      });
      return;
    }
    if (
      !timeRegex.test(newBooking.startTime) ||
      !timeRegex.test(newBooking.endTime)
    ) {
      Toast.show({
        type: "error",
        text1: "Invalid Time format",
        text2: "Please use HH:MM (24-hour).",
      });
      return;
    }

    const bookingDate = new Date(`${newBooking.date}T00:00:00.000Z`);
    const startTime = new Date(
      `${newBooking.date}T${newBooking.startTime}:00.000Z`,
    );
    const endTime = new Date(
      `${newBooking.date}T${newBooking.endTime}:00.000Z`,
    );

    if (startTime >= endTime) {
      Toast.show({
        type: "error",
        text1: "Invalid Time",
        text2: "End time must be after start time.",
      });
      return;
    }

    createBookingMutation.mutate({
      purpose: newBooking.purpose,
      bookingDate,
      startTime,
      endTime,
    });
  };

  const openComposeIfAllowed = () => {
    if (settings?.isBookingOpen === false) {
      Alert.alert(
        "Booking Closed",
        settings?.closedNotice ||
          "Field bookings are currently disabled by the administration.",
      );
      return;
    }
    setIsComposeVisible(true);
  };

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

  const renderMyBookingCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.dateTextBig}>{formatDate(item.bookingDate)}</Text>
        {renderStatusBadge(item.status)}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.purposeText}>{item.purpose}</Text>
        <View style={styles.timeRow}>
          <Feather
            name="clock"
            size={16}
            color={colors.outline}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.timeText}>
            {formatTime(item.startTime)} - {formatTime(item.endTime)}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.ticketId}>
          Requested on {formatDate(item.createdAt)}
        </Text>
      </View>
    </View>
  );

  const renderScheduleCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.dateTextBig}>{formatDate(item.bookingDate)}</Text>
        <View style={styles.bookedBadge}>
          <Text style={styles.bookedText}>RESERVED</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.purposeText}>{item.purpose}</Text>
        <View style={styles.timeRow}>
          <Feather
            name="clock"
            size={16}
            color={colors.primary}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.timeText, { color: colors.primary }]}>
            {formatTime(item.startTime)} - {formatTime(item.endTime)}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Feather
            name="user"
            size={14}
            color={colors.outline}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.ticketId}>Booked by {item.user?.name}</Text>
        </View>
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>Field Booking</Text>
          <Text style={styles.headerSubtitle}>
            Reserve the ground for events
          </Text>
        </View>
      </View>

      {/* Global Notice Banner */}
      {!isLoadingSettings && settings?.isBookingOpen === false && (
        <View style={styles.noticeBanner}>
          <View style={styles.noticeHeaderRow}>
            <Feather name="alert-triangle" size={20} color={colors.error} />
            <Text style={styles.noticeTitle}>Booking Suspended</Text>
          </View>
          <Text style={styles.noticeDesc}>
            {settings?.closedNotice ||
              "The administration has temporarily disabled field bookings."}
          </Text>
        </View>
      )}

      {/* TABS */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "MY_BOOKINGS" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("MY_BOOKINGS")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "MY_BOOKINGS" && styles.tabTextActive,
            ]}
          >
            My Bookings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "SCHEDULE" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("SCHEDULE")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "SCHEDULE" && styles.tabTextActive,
            ]}
          >
            Public Schedule
          </Text>
        </TouchableOpacity>
      </View>

      {/* List Rendering based on Active Tab */}
      {activeTab === "MY_BOOKINGS" ? (
        isLoadingBookings ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primaryContainer} />
          </View>
        ) : myBookings.length === 0 ? (
          <View style={styles.centerContainer}>
            <Feather
              name="calendar"
              size={48}
              color={colors.surfaceContainerHighest}
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.emptyTitle}>No Bookings Found</Text>
            <Text style={styles.emptySubtitle}>
              You haven't requested the field yet.
            </Text>
          </View>
        ) : (
          <FlatList
            data={myBookings}
            keyExtractor={(item) => item.id}
            renderItem={renderMyBookingCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : isLoadingSchedule ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
        </View>
      ) : publicSchedule.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="sun"
            size={48}
            color={colors.surfaceContainerHighest}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>Field is Free</Text>
          <Text style={styles.emptySubtitle}>
            No upcoming approved bookings.
          </Text>
        </View>
      ) : (
        <FlatList
          data={publicSchedule}
          keyExtractor={(item) => item.id}
          renderItem={renderScheduleCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      {settings?.isBookingOpen !== false && (
        <TouchableOpacity style={styles.fab} onPress={openComposeIfAllowed}>
          <Feather name="plus" size={24} color={colors.onPrimary} />
        </TouchableOpacity>
      )}

      {/* Booking Form Modal */}
      <Modal
        visible={isComposeVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsComposeVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Request Field</Text>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={styles.postTextBtn}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.label}>Purpose / Event Name</Text>
              <TextInput
                style={styles.input}
                value={newBooking.purpose}
                onChangeText={(text) =>
                  setNewBooking({ ...newBooking, purpose: text })
                }
                placeholder="e.g. CSE Dept Football Match"
                placeholderTextColor={colors.outlineVariant}
              />

              <Text style={styles.label}>Booking Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={newBooking.date}
                onChangeText={(text) =>
                  setNewBooking({ ...newBooking, date: text })
                }
                placeholder="e.g. 2026-06-25"
                placeholderTextColor={colors.outlineVariant}
                keyboardType="numeric"
                maxLength={10}
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Start Time (HH:MM)</Text>
                  <TextInput
                    style={styles.input}
                    value={newBooking.startTime}
                    onChangeText={(text) =>
                      setNewBooking({ ...newBooking, startTime: text })
                    }
                    placeholder="14:30"
                    placeholderTextColor={colors.outlineVariant}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>End Time (HH:MM)</Text>
                  <TextInput
                    style={styles.input}
                    value={newBooking.endTime}
                    onChangeText={(text) =>
                      setNewBooking({ ...newBooking, endTime: text })
                    }
                    placeholder="16:00"
                    placeholderTextColor={colors.outlineVariant}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>

              <Text style={styles.helpText}>
                * Please use 24-hour format (e.g. 14:00 for 2:00 PM).
              </Text>
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
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: spacing.stackLg,
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
  },
  backButton: { marginRight: spacing.stackMd, padding: spacing.stackSm },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  headerSubtitle: { ...typography.bodyMd, color: colors.outline, marginTop: 2 },

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

  noticeBanner: {
    backgroundColor: colors.errorContainer,
    padding: spacing.stackLg,
    margin: spacing.marginMobile,
    marginBottom: 0,
    borderRadius: rounded.lg,
    borderWidth: 1,
    borderColor: colors.error + "50",
  },
  noticeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.stackSm,
  },
  noticeTitle: {
    ...typography.titleLg,
    color: colors.error,
    fontWeight: "800",
    marginLeft: 8,
  },
  noticeDesc: { ...typography.bodyMd, color: colors.error, lineHeight: 22 },

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
  emptySubtitle: { ...typography.bodyMd, color: colors.outline },

  listContent: { padding: spacing.marginMobile, paddingBottom: 120 },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    marginBottom: spacing.stackMd,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.stackLg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  dateTextBig: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontWeight: "700",
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
  bookedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: rounded.full,
    backgroundColor: colors.primaryContainer + "20",
  },
  bookedText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: "800",
    textTransform: "uppercase",
    fontSize: 10,
  },

  cardBody: { padding: spacing.stackLg },
  purposeText: {
    ...typography.bodyLg,
    fontSize: 18,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: spacing.stackSm,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.stackSm,
    borderRadius: rounded.sm,
    alignSelf: "flex-start",
  },
  timeText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    fontWeight: "600",
  },

  cardFooter: {
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.stackMd,
    borderBottomLeftRadius: rounded.xl,
    borderBottomRightRadius: rounded.xl,
  },
  ticketId: { ...typography.labelSm, color: colors.outline },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.level1,
  },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: colors.surfaceContainerLowest },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  cancelText: { ...typography.bodyLg, fontSize: 16, color: colors.outline },
  modalTitle: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "700",
  },
  postTextBtn: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.primaryContainer,
    fontWeight: "700",
  },

  modalContent: { flex: 1, padding: spacing.marginMobile },
  label: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.bodyMd,
    color: colors.onSurface,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  rowInputs: { flexDirection: "row", justifyContent: "space-between" },
  helpText: {
    ...typography.labelSm,
    color: colors.outline,
    marginTop: spacing.stackSm,
    fontStyle: "italic",
  },
});
