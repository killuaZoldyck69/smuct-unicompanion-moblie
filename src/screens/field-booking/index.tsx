import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFieldSettings,
  getMyFieldBookings,
  getFieldSchedule,
  type FieldBookingItem,
  type FieldBookingSettings,
} from "@/services/field-service";
import { BENTO } from "./constants";
import type { TabType } from "./types";
import { BookingHeader } from "./components/booking-header";
import { BookingTabs } from "./components/booking-tabs";
import { BookingEmptyState } from "./components/booking-empty-state";
import { MyBookingCard } from "./components/my-booking-card";
import { ScheduleCard } from "./components/schedule-card";
import { BookingComposeModal } from "./components/compose/booking-compose-modal";

export function FieldBooking() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>("MY_BOOKINGS");
  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: settings, isLoading: isLoadingSettings } =
    useQuery<FieldBookingSettings>({
      queryKey: ["field-settings"],
      queryFn: getFieldSettings,
    });
  const { data: myBookings, isLoading: isLoadingBookings } = useQuery<
    FieldBookingItem[]
  >({
    queryKey: ["field-bookings", "my"],
    queryFn: getMyFieldBookings,
  });
  const { data: publicSchedule, isLoading: isLoadingSchedule } = useQuery<
    FieldBookingItem[]
  >({
    queryKey: ["field-schedule"],
    queryFn: getFieldSchedule,
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["field-settings"] }),
        queryClient.invalidateQueries({ queryKey: ["field-bookings", "my"] }),
        queryClient.invalidateQueries({ queryKey: ["field-schedule"] }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  const openComposeIfAllowed = useCallback(() => {
    if (settings?.isBookingOpen === false) {
      Alert.alert(
        "Bookings Unavailable",
        settings?.closureReason ||
          (settings as any)?.closedNotice ||
          "The campus field is currently closed for bookings by administrator decision.",
      );
      return;
    }
    setIsComposeVisible(true);
  }, [settings]);

  const keyExtractor = useCallback((item: FieldBookingItem) => item.id, []);

  const renderMyBookingItem = useCallback(
    ({ item }: { item: FieldBookingItem }) => <MyBookingCard item={item} />,
    [],
  );

  const renderScheduleItem = useCallback(
    ({ item }: { item: FieldBookingItem }) => <ScheduleCard item={item} />,
    [],
  );

  const canBook = settings?.isBookingOpen !== false;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        <BookingHeader
          onBack={() => router.back()}
          isLoadingSettings={isLoadingSettings}
          settings={settings}
        />

        <BookingTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          myBookingsCount={myBookings?.length}
          scheduleCount={publicSchedule?.length}
        />

        {activeTab === "MY_BOOKINGS" ? (
          isLoadingBookings ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={BENTO.navy} />
              <Text style={styles.loadingText}>Loading bookings...</Text>
            </View>
          ) : !myBookings || myBookings.length === 0 ? (
            <BookingEmptyState
              iconName="calendar"
              title="No Field Bookings Yet"
              subtitle="Reserve the university ground for your upcoming sports match, department tournament, or campus celebration."
              actionText={canBook ? "Request Ground Slot" : undefined}
              onAction={openComposeIfAllowed}
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          ) : (
            <FlatList
              data={myBookings}
              keyExtractor={keyExtractor}
              renderItem={renderMyBookingItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={[BENTO.navy]}
                />
              }
            />
          )
        ) : isLoadingSchedule ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={BENTO.navy} />
            <Text style={styles.loadingText}>Loading public schedule...</Text>
          </View>
        ) : !publicSchedule || publicSchedule.length === 0 ? (
          <BookingEmptyState
            iconName="sun"
            iconColor={BENTO.amber}
            title="Ground is Completely Free"
            subtitle="No approved reservations currently scheduled. The field is clear and open for practice or new booking requests!"
            actionText={canBook ? "Book This Ground" : undefined}
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
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[BENTO.navy]}
              />
            }
          />
        )}

        {canBook && (
          <TouchableOpacity
            style={styles.fabPill}
            onPress={openComposeIfAllowed}
            activeOpacity={0.85}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Request field booking"
          >
            <Feather
              name="plus"
              size={18}
              color="#ffffff"
              style={styles.fabIcon}
            />
            <Text style={styles.fabPillText}>Book Field</Text>
          </TouchableOpacity>
        )}

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
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    fontSize: 13,
    color: BENTO.slate,
    marginTop: 10,
  },
  fabPill: {
    position: "absolute",
    bottom: 24,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.navy,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: BENTO.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabIcon: {
    marginRight: 6,
  },
  fabPillText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
});
