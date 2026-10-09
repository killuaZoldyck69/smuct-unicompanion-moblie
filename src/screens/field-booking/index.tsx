import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useFieldSettings,
  useMyFieldBookings,
  useFieldSchedule,
  useAllFieldBookingsAdmin,
  useUpdateFieldBookingStatus,
  useUpdateFieldSettings,
  useDeleteFieldBooking,
} from "@/features/field-booking/useFieldBooking";
import type { FieldBookingItem } from "@/services/field-service";
import { BENTO } from "./constants";
import type { TabType } from "./types";
import { BookingHeader } from "./components/booking-header";
import { BookingTabs } from "./components/booking-tabs";
import { BookingCard } from "./components/booking-card";
import { BookingSkeletonList } from "./components/booking-skeleton";
import { BookingEmptyState } from "./components/booking-empty-state";
import { BookingComposeModal } from "./components/compose/booking-compose-modal";
import { DeleteBookingModal } from "./components/delete-booking-modal";
import { PublicScheduleView } from "./components/public-schedule-view";
import { AdminRequestsView } from "./components/admin/admin-requests-view";
import { ManageGroundModal } from "./components/admin/manage-ground-modal";
import { ReserverProfileModal } from "./components/reserver-profile-modal";

interface FieldBookingProps {
  initialTab?: TabType;
}

export function FieldBooking({ initialTab }: FieldBookingProps = {}) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // Current user role check
  const { role, user } = useCurrentUser();
  const isAdmin = role === "ADMIN" || user?.role === "ADMIN";

  // Active tab state: default to REQUESTS for admin (only REQUESTS & SCHEDULE), else MY_BOOKINGS
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (initialTab) {
      if (isAdmin && initialTab === "MY_BOOKINGS") return "REQUESTS";
      return initialTab;
    }
    return isAdmin ? "REQUESTS" : "MY_BOOKINGS";
  });

  React.useEffect(() => {
    if (isAdmin && activeTab === "MY_BOOKINGS") {
      setActiveTab("REQUESTS");
    }
  }, [isAdmin, activeTab]);

  // Modal states
  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [isManageGroundVisible, setIsManageGroundVisible] = useState(false);
  const [selectedReserverBooking, setSelectedReserverBooking] =
    useState<FieldBookingItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingItem, setDeletingItem] = useState<FieldBookingItem | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // TanStack Query Hooks
  const {
    data: settings,
    isLoading: isLoadingSettings,
  } = useFieldSettings();

  const {
    data: myBookings,
    isLoading: isLoadingBookings,
    isError: isErrorBookings,
    refetch: refetchBookings,
  } = useMyFieldBookings();

  const {
    data: publicSchedule,
    isLoading: isLoadingSchedule,
    isError: isErrorSchedule,
    refetch: refetchSchedule,
  } = useFieldSchedule();

  const {
    data: allBookings,
    isLoading: isLoadingAllBookings,
    isError: isErrorAllBookings,
    refetch: refetchAllBookings,
  } = useAllFieldBookingsAdmin({ enabled: isAdmin });

  // Mutations
  const { mutate: deleteBooking, isPending: isDeletingBooking } =
    useDeleteFieldBooking();

  const { mutate: updateStatus } = useUpdateFieldBookingStatus();

  const { mutate: updateSettings, isPending: isUpdatingSettings } =
    useUpdateFieldSettings();

  // Pending count badge for admin tab
  const pendingRequestsCount = useMemo(() => {
    if (!allBookings) return 0;
    return allBookings.filter(
      (b) => (b.status || "").toUpperCase() === "PENDING",
    ).length;
  }, [allBookings]);

  // Modals & Handlers
  const handleOpenDeleteModal = useCallback((item: FieldBookingItem) => {
    setDeletingItem(item);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    if (!isDeletingBooking) {
      setDeletingItem(null);
    }
  }, [isDeletingBooking]);

  const handleConfirmDelete = useCallback(() => {
    if (!deletingItem) return;
    deleteBooking(deletingItem.id, {
      onSuccess: () => {
        setDeletingItem(null);
        Toast.show({
          type: "success",
          text1: "Booking Deleted",
          text2: `Reservation for "${deletingItem.purpose}" was removed.`,
        });
      },
      onError: (err: any) => {
        Alert.alert(
          "Error",
          err?.response?.data?.message ||
            err?.message ||
            "Failed to delete booking.",
        );
      },
    });
  }, [deletingItem, deleteBooking]);

  const handleApprove = useCallback(
    (item: FieldBookingItem) => {
      setUpdatingStatusId(item.id);
      updateStatus(
        { id: item.id, data: { status: "APPROVED" } },
        {
          onSuccess: () => {
            setUpdatingStatusId(null);
            Toast.show({
              type: "success",
              text1: "Booking Approved",
              text2: `"${item.purpose}" is now approved and live on public schedule.`,
            });
          },
          onError: (err: any) => {
            setUpdatingStatusId(null);
            Alert.alert(
              "Approval Failed",
              err?.response?.data?.message ||
                err?.message ||
                "Failed to approve booking request.",
            );
          },
        },
      );
    },
    [updateStatus],
  );

  const handleReject = useCallback(
    (item: FieldBookingItem) => {
      setUpdatingStatusId(item.id);
      updateStatus(
        { id: item.id, data: { status: "REJECTED" } },
        {
          onSuccess: () => {
            setUpdatingStatusId(null);
            Toast.show({
              type: "info",
              text1: "Booking Rejected",
              text2: `"${item.purpose}" was rejected.`,
            });
          },
          onError: (err: any) => {
            setUpdatingStatusId(null);
            Alert.alert(
              "Rejection Failed",
              err?.response?.data?.message ||
                err?.message ||
                "Failed to reject booking request.",
            );
          },
        },
      );
    },
    [updateStatus],
  );

  const handleSaveGroundSettings = useCallback(
    (payload: { isBookingOpen: boolean; closedNotice?: string | null }) => {
      updateSettings(
        {
          isBookingOpen: payload.isBookingOpen,
          closedNotice: payload.closedNotice,
          closureReason: payload.closedNotice,
        },
        {
          onSuccess: () => {
            setIsManageGroundVisible(false);
            Toast.show({
              type: "success",
              text1: "Ground Settings Updated",
              text2: payload.isBookingOpen
                ? "Campus ground is OPEN for new reservations."
                : "Campus ground is CLOSED for reservations.",
            });
          },
          onError: (err: any) => {
            Alert.alert(
              "Settings Update Failed",
              err?.response?.data?.message ||
                err?.message ||
                "Failed to update ground status.",
            );
          },
        },
      );
    },
    [updateSettings],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const promises: Promise<any>[] = [
        queryClient.invalidateQueries({ queryKey: ["fieldSettings"] }),
        queryClient.invalidateQueries({ queryKey: ["myFieldBookings"] }),
        queryClient.invalidateQueries({ queryKey: ["fieldSchedule"] }),
      ];
      if (isAdmin) {
        promises.push(
          queryClient.invalidateQueries({ queryKey: ["allFieldBookings"] }),
        );
      }
      await Promise.all(promises);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, isAdmin]);

  const openComposeIfAllowed = useCallback(() => {
    if (settings?.isBookingOpen === false && !isAdmin) {
      Alert.alert(
        "Reservations Unavailable",
        settings?.closureReason ||
          (settings as any)?.closedNotice ||
          "Campus ground reservations are currently closed by university administration.",
      );
      return;
    }
    setIsComposeVisible(true);
  }, [settings, isAdmin]);

  const keyExtractor = useCallback((item: FieldBookingItem) => item.id, []);

  const renderMyBookingItem = useCallback(
    ({ item }: { item: FieldBookingItem }) => (
      <BookingCard
        item={item}
        onDelete={handleOpenDeleteModal}
        isDeleting={isDeletingBooking && deletingItem?.id === item.id}
      />
    ),
    [handleOpenDeleteModal, isDeletingBooking, deletingItem],
  );

  const canBook = !isAdmin && settings?.isBookingOpen !== false;
  // Extra clearance for bottom floating tab bar
  const listBottomPadding = Math.max(insets.bottom, 16) + 96;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Editorial Page Header with Live Availability & Admin Ground Manager Action */}
        <BookingHeader
          isLoadingSettings={isLoadingSettings}
          settings={settings}
          onBookField={isAdmin ? undefined : openComposeIfAllowed}
          canBook={canBook}
          isAdmin={isAdmin}
          onManageGround={() => setIsManageGroundVisible(true)}
        />

        {/* Compact Segmented Control (2 tabs for Admin: Requests & Schedule, 2 tabs for Members: My Bookings & Schedule) */}
        <BookingTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isAdmin={isAdmin}
          pendingRequestsCount={pendingRequestsCount}
          myBookingsCount={myBookings?.length}
          scheduleCount={publicSchedule?.length}
        />

        {/* --- Tab Content --- */}
        {isAdmin ? (
          /* Admin Mode: Requests or Schedule */
          activeTab === "REQUESTS" ? (
            isLoadingAllBookings ? (
              <BookingSkeletonList />
            ) : isErrorAllBookings ? (
              <View style={styles.centerContainer}>
                <Feather name="alert-circle" size={36} color={BENTO.rose} />
                <Text style={styles.errorTitle}>Unable to load booking requests</Text>
                <Text style={styles.errorSubtitle}>
                  Please check your network connection and administrative privileges.
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => refetchAllBookings()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <AdminRequestsView
                bookings={allBookings || []}
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleOpenDeleteModal}
                onViewProfile={setSelectedReserverBooking}
                updatingId={updatingStatusId}
                deletingId={isDeletingBooking ? deletingItem?.id || null : null}
                contentBottomPadding={listBottomPadding}
              />
            )
          ) : isLoadingSchedule ? (
            <BookingSkeletonList />
          ) : isErrorSchedule ? (
            <View style={styles.centerContainer}>
              <Feather name="alert-circle" size={36} color={BENTO.rose} />
              <Text style={styles.errorTitle}>Unable to load public schedule</Text>
              <Text style={styles.errorSubtitle}>
                Please check your network connection and try again.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => refetchSchedule()}
                activeOpacity={0.8}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <PublicScheduleView
              schedule={publicSchedule || []}
              isRefreshing={isRefreshing}
              onRefresh={handleRefresh}
              onBookField={openComposeIfAllowed}
              canBook={false}
              contentBottomPadding={listBottomPadding}
            />
          )
        ) : activeTab === "MY_BOOKINGS" ? (
          /* Member Mode: My Bookings */
          isLoadingBookings ? (
            <BookingSkeletonList />
          ) : isErrorBookings ? (
            <View style={styles.centerContainer}>
              <Feather name="alert-circle" size={36} color={BENTO.rose} />
              <Text style={styles.errorTitle}>Unable to load your bookings</Text>
              <Text style={styles.errorSubtitle}>
                Please check your network connection and try again.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => refetchBookings()}
                activeOpacity={0.8}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : !myBookings || myBookings.length === 0 ? (
            <BookingEmptyState
              iconName="calendar"
              title="No bookings yet"
              subtitle="Reserve a university field for your next match, practice session, or event."
              actionText={canBook ? "+ Book Field" : undefined}
              onAction={openComposeIfAllowed}
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          ) : (
            <FlatList
              data={myBookings}
              keyExtractor={keyExtractor}
              renderItem={renderMyBookingItem}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: listBottomPadding },
              ]}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={[BENTO.navy]}
                  tintColor={BENTO.navy}
                />
              }
            />
          )
        ) : isLoadingSchedule ? (
          /* Member Mode: Public Schedule */
          <BookingSkeletonList />
        ) : isErrorSchedule ? (
          <View style={styles.centerContainer}>
            <Feather name="alert-circle" size={36} color={BENTO.rose} />
            <Text style={styles.errorTitle}>Unable to load public schedule</Text>
            <Text style={styles.errorSubtitle}>
              Please check your network connection and try again.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetchSchedule()}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <PublicScheduleView
            schedule={publicSchedule || []}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            onBookField={openComposeIfAllowed}
            canBook={canBook}
            contentBottomPadding={listBottomPadding}
          />
        )}

        {/* Booking Creation Modal (Member only) */}
        {!isAdmin && (
          <BookingComposeModal
            visible={isComposeVisible}
            onClose={() => setIsComposeVisible(false)}
          />
        )}

        {/* Booking Deletion Confirmation Modal */}
        <DeleteBookingModal
          visible={!!deletingItem}
          item={deletingItem}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeletingBooking}
        />

        {/* Admin Manage Ground Status & Notice Modal */}
        {isAdmin && (
          <ManageGroundModal
            visible={isManageGroundVisible}
            settings={settings}
            onClose={() => setIsManageGroundVisible(false)}
            onSave={handleSaveGroundSettings}
            isSaving={isUpdatingSettings}
          />
        )}

        {/* Reserver Profile Modal (From Admin Requests or Public Schedule) */}
        <ReserverProfileModal
          visible={!!selectedReserverBooking}
          booking={selectedReserverBooking}
          onClose={() => setSelectedReserverBooking(null)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BENTO.canvas,
  },
  container: {
    flex: 1,
    backgroundColor: BENTO.canvas,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BENTO.navy,
    marginTop: 12,
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: 13,
    color: BENTO.slate,
    marginTop: 4,
    textAlign: "center",
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: BENTO.navy,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
