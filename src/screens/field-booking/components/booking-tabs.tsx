import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO } from "../constants";
import type { TabType } from "../types";

interface BookingTabsProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isAdmin?: boolean;
  pendingRequestsCount?: number;
  myBookingsCount?: number;
  scheduleCount?: number;
}

export const BookingTabs = memo(function BookingTabs({
  activeTab,
  onSelectTab,
  isAdmin = false,
  pendingRequestsCount,
  myBookingsCount,
  scheduleCount,
}: BookingTabsProps) {
  const isRequests = activeTab === "REQUESTS";
  const isSchedule = activeTab === "SCHEDULE";
  const isMyBookings = activeTab === "MY_BOOKINGS";

  if (isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.segmentedTrack}>
          {/* Admin Tab 1: Requests */}
          <TouchableOpacity
            style={[styles.segment, isRequests && styles.segmentActive]}
            onPress={() => onSelectTab("REQUESTS")}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel="All Requests tab"
            accessibilityState={{ selected: isRequests }}
          >
            <Feather
              name="inbox"
              size={13.5}
              color={isRequests ? BENTO.navy : BENTO.slate}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.segmentText,
                isRequests && styles.segmentTextActive,
              ]}
              numberOfLines={1}
            >
              Requests
            </Text>
            {typeof pendingRequestsCount === "number" && pendingRequestsCount > 0 && (
              <View
                style={[
                  styles.countBadge,
                  styles.countBadgePending,
                ]}
              >
                <Text style={styles.countTextPending}>
                  {pendingRequestsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Admin Tab 2: Public Schedule */}
          <TouchableOpacity
            style={[styles.segment, isSchedule && styles.segmentActive]}
            onPress={() => onSelectTab("SCHEDULE")}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel="Public Schedule tab"
            accessibilityState={{ selected: isSchedule }}
          >
            <Feather
              name="globe"
              size={13.5}
              color={isSchedule ? BENTO.navy : BENTO.slate}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.segmentText,
                isSchedule && styles.segmentTextActive,
              ]}
              numberOfLines={1}
            >
              Schedule
            </Text>
            {typeof scheduleCount === "number" && scheduleCount > 0 && (
              <View
                style={[
                  styles.countBadge,
                  isSchedule ? styles.countBadgeActive : styles.countBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    isSchedule ? styles.countTextActive : styles.countTextInactive,
                  ]}
                >
                  {scheduleCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.segmentedTrack}>
        {/* My Bookings Segment */}
        <TouchableOpacity
          style={[styles.segment, isMyBookings && styles.segmentActive]}
          onPress={() => onSelectTab("MY_BOOKINGS")}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="tab"
          accessibilityLabel={`My Bookings tab${
            typeof myBookingsCount === "number" ? `, ${myBookingsCount} bookings` : ""
          }`}
          accessibilityState={{ selected: isMyBookings }}
        >
          <Feather
            name="calendar"
            size={14}
            color={isMyBookings ? BENTO.navy : BENTO.slate}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.segmentText,
              isMyBookings && styles.segmentTextActive,
            ]}
          >
            My Bookings
          </Text>
          {typeof myBookingsCount === "number" && myBookingsCount > 0 && (
            <View
              style={[
                styles.countBadge,
                isMyBookings ? styles.countBadgeActive : styles.countBadgeInactive,
              ]}
            >
              <Text
                style={[
                  styles.countText,
                  isMyBookings ? styles.countTextActive : styles.countTextInactive,
                ]}
              >
                {myBookingsCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Public Schedule Segment */}
        <TouchableOpacity
          style={[styles.segment, isSchedule && styles.segmentActive]}
          onPress={() => onSelectTab("SCHEDULE")}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="tab"
          accessibilityLabel={`Public Schedule tab${
            typeof scheduleCount === "number" ? `, ${scheduleCount} slots` : ""
          }`}
          accessibilityState={{ selected: isSchedule }}
        >
          <Feather
            name="globe"
            size={14}
            color={isSchedule ? BENTO.navy : BENTO.slate}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.segmentText,
              isSchedule && styles.segmentTextActive,
            ]}
          >
            Public Schedule
          </Text>
          {typeof scheduleCount === "number" && scheduleCount > 0 && (
            <View
              style={[
                styles.countBadge,
                isSchedule ? styles.countBadgeActive : styles.countBadgeInactive,
              ]}
            >
              <Text
                style={[
                  styles.countText,
                  isSchedule ? styles.countTextActive : styles.countTextInactive,
                ]}
              >
                {scheduleCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: BENTO.canvas,
  },
  segmentedTrack: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.05)",
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  segmentActive: {
    backgroundColor: BENTO.card,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabIcon: {
    marginRight: 6,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: BENTO.slate,
  },
  segmentTextActive: {
    color: BENTO.navy,
    fontWeight: "700",
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeActive: {
    backgroundColor: BENTO.navy,
  },
  countBadgeInactive: {
    backgroundColor: "#cbd5e1",
  },
  countText: {
    fontSize: 10.5,
    fontWeight: "800",
  },
  countTextActive: {
    color: "#ffffff",
  },
  countBadgePending: {
    backgroundColor: BENTO.amber,
  },
  countTextPending: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
  },
  countTextInactive: {
    color: BENTO.slate,
  },
});
