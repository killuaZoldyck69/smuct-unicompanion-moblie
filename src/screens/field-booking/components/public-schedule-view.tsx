import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { FieldBookingItem } from "@/services/field-service";
import { BENTO } from "../constants";
import {
  toISODateString,
  getBookingDateKey,
  formatFullHeaderDate,
} from "../utils";
import { ScheduleDateStrip } from "./schedule-date-strip";
import { ScheduleTimelineCard } from "./schedule-timeline-card";
import { ReserverProfileModal } from "./reserver-profile-modal";

interface PublicScheduleViewProps {
  schedule: FieldBookingItem[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onBookField: () => void;
  canBook: boolean;
  contentBottomPadding: number;
}

export const PublicScheduleView = React.memo(function PublicScheduleView({
  schedule,
  isRefreshing,
  onRefresh,
  onBookField,
  canBook,
  contentBottomPadding,
}: PublicScheduleViewProps) {
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    toISODateString(new Date()),
  );
  const [selectedProfileBooking, setSelectedProfileBooking] =
    useState<FieldBookingItem | null>(null);

  // Set of all dates with approved bookings
  const scheduledDatesSet = useMemo(() => {
    const set = new Set<string>();
    schedule.forEach((item) => {
      const dateKey = getBookingDateKey(item);
      if (dateKey) {
        set.add(dateKey);
      }
    });
    return set;
  }, [schedule]);

  // Approved bookings on the selected date, chronologically sorted by startTime
  const daySchedules = useMemo(() => {
    return schedule
      .filter((item) => getBookingDateKey(item) === selectedDate)
      .sort((a, b) => {
        const timeA = a.startTime || "";
        const timeB = b.startTime || "";
        return timeA.localeCompare(timeB);
      });
  }, [schedule, selectedDate]);

  const formattedHeaderDate = useMemo(() => {
    return formatFullHeaderDate(selectedDate);
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      {/* 1. Academic Calendar Style Strip Calendar */}
      <ScheduleDateStrip
        scheduledDatesSet={scheduledDatesSet}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        selectedDayBookingsCount={daySchedules.length}
      />

      {/* 2. Main Scrollable Timeline Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentBottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[BENTO.navy]}
            tintColor={BENTO.navy}
          />
        }
      >
        {/* Timeline Items OR Day-Specific Empty State */}
        {daySchedules.length > 0 ? (
          <View style={styles.timelineContainer}>
            {daySchedules.map((item, index) => (
              <ScheduleTimelineCard
                key={item.id}
                item={item}
                isFirst={index === 0}
                isLast={index === daySchedules.length - 1}
                onPressReserver={(booking) => setSelectedProfileBooking(booking)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.freeDayCard}>
            <View style={styles.freeDayIconCircle}>
              <Feather name="shield" size={24} color={BENTO.emerald} />
            </View>
            <Text style={styles.freeDayTitle}>Field is Free All Day</Text>
            <Text style={styles.freeDaySubtitle}>
              No university matches or approved reservations scheduled for{" "}
              <Text style={{ fontWeight: "700", color: BENTO.navySecondary }}>
                {formattedHeaderDate}
              </Text>
              . The field is clear and open!
            </Text>

            {canBook && (
              <TouchableOpacity
                style={styles.bookThisDayBtn}
                onPress={onBookField}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Book field for this day"
              >
                <Feather
                  name="calendar"
                  size={14}
                  color="#ffffff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.bookThisDayBtnText}>+ Book This Date</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Reserver Profile Details Modal */}
      <ReserverProfileModal
        visible={Boolean(selectedProfileBooking)}
        booking={selectedProfileBooking}
        onClose={() => setSelectedProfileBooking(null)}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO.canvas,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  timelineContainer: {
    paddingTop: 6,
  },
  freeDayCard: {
    backgroundColor: BENTO.card,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO.border,
    marginTop: 8,
    ...Platform.select({
      web: {
        boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
      } as any,
      default: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
        elevation: 1,
      },
    }),
  },
  freeDayIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: BENTO.emeraldBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BENTO.emeraldBorder,
  },
  freeDayTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: BENTO.navy,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  freeDaySubtitle: {
    fontSize: 13,
    color: BENTO.slate,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
    maxWidth: 290,
  },
  bookThisDayBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.navy,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bookThisDayBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
