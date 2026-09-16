import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO } from "../constants";
import type { TabType } from "../types";

interface BookingTabsProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  myBookingsCount?: number;
  scheduleCount?: number;
}

export const BookingTabs = memo(function BookingTabs({
  activeTab,
  onSelectTab,
  myBookingsCount,
  scheduleCount,
}: BookingTabsProps) {
  const isMyBookings = activeTab === "MY_BOOKINGS";
  const isSchedule = activeTab === "SCHEDULE";

  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.segmentedContainer}>
        <TouchableOpacity
          style={[styles.segmentedTab, isMyBookings && styles.segmentedTabActive]}
          onPress={() => onSelectTab("MY_BOOKINGS")}
          activeOpacity={0.75}
          accessible={true}
          accessibilityRole="tab"
          accessibilityLabel="My Bookings tab"
        >
          <Feather
            name="calendar"
            size={14}
            color={isMyBookings ? BENTO.navy : BENTO.slate}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.segmentedTabText,
              isMyBookings && styles.segmentedTabTextActive,
            ]}
          >
            My Bookings
          </Text>
          {typeof myBookingsCount === "number" && myBookingsCount > 0 && (
            <View
              style={[
                styles.countPill,
                isMyBookings && styles.countPillActive,
              ]}
            >
              <Text
                style={[
                  styles.countPillText,
                  isMyBookings && styles.countPillTextActive,
                ]}
              >
                {myBookingsCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentedTab, isSchedule && styles.segmentedTabActive]}
          onPress={() => onSelectTab("SCHEDULE")}
          activeOpacity={0.75}
          accessible={true}
          accessibilityRole="tab"
          accessibilityLabel="Public Schedule tab"
        >
          <Feather
            name="globe"
            size={14}
            color={isSchedule ? BENTO.navy : BENTO.slate}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.segmentedTabText,
              isSchedule && styles.segmentedTabTextActive,
            ]}
          >
            Public Schedule
          </Text>
          {typeof scheduleCount === "number" && scheduleCount > 0 && (
            <View
              style={[
                styles.countPill,
                isSchedule && styles.countPillActive,
              ]}
            >
              <Text
                style={[
                  styles.countPillText,
                  isSchedule && styles.countPillTextActive,
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
  tabBarWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: BENTO.slateSubtle,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  segmentedTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentedTabActive: {
    backgroundColor: BENTO.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabIcon: {
    marginRight: 6,
  },
  segmentedTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: BENTO.slate,
  },
  segmentedTabTextActive: {
    fontWeight: "800",
    color: BENTO.navy,
  },
  countPill: {
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  countPillActive: {
    backgroundColor: BENTO.navy,
  },
  countPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: BENTO.slate,
  },
  countPillTextActive: {
    color: "#ffffff",
  },
});
