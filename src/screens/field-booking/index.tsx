import React, { useState, useCallback } from "react";
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
import {
  useFieldSettings,
  useMyFieldBookings,
  useFieldSchedule,
} from "@/features/field-booking/useFieldBooking";
import type { FieldBookingItem } from "@/services/field-service";
import { BENTO } from "./constants";
import type { TabType } from "./types";
import { BookingHeader } from "./components/booking-header";
import { BookingTabs } from "./components/booking-tabs";
import { BookingCard } from "./components/booking-card";
import { ScheduleCard } from "./components/schedule-card";
import { BookingSkeletonList } from "./components/booking-skeleton";
import { BookingEmptyState } from "./components/booking-empty-state";
import { BookingComposeModal } from "./components/compose/booking-compose-modal";

export function FieldBooking() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>("MY_BOOKINGS");
  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // TanStack Query Hooks with unified feature cache keys
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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["fieldSettings"] }),
        queryClient.invalidateQueries({ queryKey: ["myFieldBookings"] }),
        queryClient.invalidateQueries({ queryKey: ["fieldSchedule"] }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  const openComposeIfAllowed = useCallback(() => {
    if (settings?.isBookingOpen === false) {
      Alert.alert(
        "Reservations Unavailable",
        settings?.closureReason ||
          (settings as any)?.closedNotice ||
          "Campus ground reservations are currently closed by university administration.",
      );
      return;
    }
    setIsComposeVisible(true);
  }, [settings]);

  const keyExtractor = useCallback((item: FieldBookingItem) => item.id, []);

  const renderMyBookingItem = useCallback(
    ({ item }: { item: FieldBookingItem }) => <BookingCard item={item} />,
    [],
  );

  const renderScheduleItem = useCallback(
    ({ item }: { item: FieldBookingItem }) => <ScheduleCard item={item} />,
    [],
  );

  const canBook = settings?.isBookingOpen !== false;
  // Extra clearance for the bottom floating tab bar (height ~72 + margin)
  const listBottomPadding = Math.max(insets.bottom, 16) + 96;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Editorial Page Header with Live Availability, + Book Field Action & Campus Art */}
        <BookingHeader
          isLoadingSettings={isLoadingSettings}
          settings={settings}
          onBookField={openComposeIfAllowed}
          canBook={canBook}
        />

        {/* Compact Segmented Control */}
        <BookingTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          myBookingsCount={myBookings?.length}
          scheduleCount={publicSchedule?.length}
        />

        {/* Tab 1: My Bookings */}
        {activeTab === "MY_BOOKINGS" ? (
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
          /* Tab 2: Public Schedule */
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
        ) : !publicSchedule || publicSchedule.length === 0 ? (
          <BookingEmptyState
            iconName="sun"
            iconColor={BENTO.amber}
            title="Ground is completely free"
            subtitle="No approved reservations currently scheduled. The field is clear and open for practice or new booking requests!"
            actionText={canBook ? "+ Book Field" : undefined}
            actionIcon="calendar"
            onAction={openComposeIfAllowed}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        ) : (
          <FlatList
            data={publicSchedule}
            keyExtractor={keyExtractor}
            renderItem={renderScheduleItem}
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
        )}

        {/* Booking Creation Modal */}
        <BookingComposeModal
          visible={isComposeVisible}
          onClose={() => setIsComposeVisible(false)}
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
