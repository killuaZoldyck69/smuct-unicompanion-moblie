import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import api from "../src/services/api";
import { colors } from "../src/theme/colors";
import { typography } from "../src/theme/typography";
import { spacing, rounded, shadows } from "../src/theme/layout";

// --- Date Formatter Helper ---
const formatEventDate = (startStr: string, endStr?: string | null) => {
  const start = new Date(startStr);
  const startMonth = start.toLocaleString("default", { month: "short" });
  const startDay = start.getDate();

  if (!endStr) return `${startMonth} ${startDay}`;

  const end = new Date(endStr);
  const endMonth = end.toLocaleString("default", { month: "short" });
  const endDay = end.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
};

export default function AcademicCalendarScreen() {
  const router = useRouter();

  const flatListRef = useRef<FlatList>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);

  // Fetch Calendar Data
  const {
    data: calendars,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["academicCalendars"],
    queryFn: async () => {
      const response = await api.get("/calendars");
      return response.data?.data || [];
    },
  });

  const activeCalendar = calendars?.[0];

  // The Auto-Scroll & Timeline Fill Logic
  useEffect(() => {
    if (activeCalendar?.events && !hasScrolled) {
      const today = new Date();

      const targetIndex = activeCalendar.events.findIndex((event: any) => {
        const eventDate = event.endDate
          ? new Date(event.endDate)
          : new Date(event.startDate);
        eventDate.setHours(23, 59, 59, 999);
        return eventDate >= today;
      });

      // Calculate where the "filling" should stop
      const activeIndex =
        targetIndex === -1 ? activeCalendar.events.length - 1 : targetIndex;
      setCurrentEventIndex(activeIndex);

      if (targetIndex !== -1) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: targetIndex,
            animated: true,
            viewPosition: 0.5,
          });
          setHasScrolled(true);
        }, 600);
      } else {
        setHasScrolled(true);
      }
    }
  }, [activeCalendar, hasScrolled]);

  const renderEvent = ({ item, index }: { item: any; index: number }) => {
    const isEven = index % 2 === 0;
    const dateDisplay = formatEventDate(item.startDate, item.endDate);

    // Timeline Bar Logic
    const isPastOrCurrent = index <= currentEventIndex; // Dot and Top Line
    const isPast = index < currentEventIndex; // Bottom Line leading to next event
    const isFirst = index === 0;
    const isLast = index === activeCalendar.events.length - 1;

    return (
      <View style={styles.timelineRow}>
        {/* Left Side */}
        <View style={styles.sideContainer}>
          {isEven ? (
            <View
              style={[
                styles.datePill,
                item.isHoliday && styles.datePillHoliday,
                !isPastOrCurrent && styles.datePillInactive,
                { alignSelf: "flex-end" },
              ]}
            >
              <Text style={styles.dateText}>{dateDisplay}</Text>
            </View>
          ) : (
            <View
              style={[
                styles.eventCard,
                item.isHoliday && styles.eventCardHoliday,
              ]}
            >
              <Text
                style={[
                  styles.eventTitle,
                  item.isHoliday && styles.eventTitleHoliday,
                ]}
              >
                {item.title}
              </Text>
              {item.description && (
                <Text style={styles.eventDesc}>{item.description}</Text>
              )}
            </View>
          )}
        </View>

        {/* Center Node & Dynamic Line Segments */}
        <View style={styles.centerNodeContainer}>
          {/* Top Line Segment */}
          {!isFirst && (
            <View
              style={[
                styles.lineTop,
                isPastOrCurrent ? styles.lineActive : styles.lineInactive,
              ]}
            />
          )}

          {/* Center Dot */}
          <View
            style={[
              styles.centerDot,
              !isPastOrCurrent && styles.centerDotInactive,
              item.isHoliday && styles.centerDotHoliday,
            ]}
          />

          {/* Bottom Line Segment */}
          {!isLast && (
            <View
              style={[
                styles.lineBottom,
                isPast ? styles.lineActive : styles.lineInactive,
              ]}
            />
          )}
        </View>

        {/* Right Side */}
        <View style={styles.sideContainer}>
          {isEven ? (
            <View
              style={[
                styles.eventCard,
                item.isHoliday && styles.eventCardHoliday,
              ]}
            >
              <Text
                style={[
                  styles.eventTitle,
                  item.isHoliday && styles.eventTitleHoliday,
                ]}
              >
                {item.title}
              </Text>
              {item.description && (
                <Text style={styles.eventDesc}>{item.description}</Text>
              )}
            </View>
          ) : (
            <View
              style={[
                styles.datePill,
                item.isHoliday && styles.datePillHoliday,
                !isPastOrCurrent && styles.datePillInactive,
                { alignSelf: "flex-start" },
              ]}
            >
              <Text style={styles.dateText}>{dateDisplay}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {activeCalendar?.title || "Academic Calendar"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {activeCalendar?.semester || "Timeline Overview"}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
          <Text style={styles.loadingText}>Syncing Schedule...</Text>
        </View>
      ) : isError || !activeCalendar ? (
        <View style={styles.centerContainer}>
          <Feather
            name="calendar"
            size={48}
            color={colors.surfaceContainerHighest}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>No Calendar Found</Text>
          <Text style={styles.emptyDesc}>
            There is currently no active academic calendar for your department.
          </Text>
        </View>
      ) : (
        <View style={styles.timelineWrapper}>
          <FlatList
            ref={flatListRef}
            data={activeCalendar.events}
            keyExtractor={(item) => item.id}
            renderItem={renderEvent}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={(info) => {
              const wait = new Promise((resolve) => setTimeout(resolve, 500));
              wait.then(() => {
                flatListRef.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                  viewPosition: 0.5,
                });
              });
            }}
          />
        </View>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  backButton: { marginRight: spacing.stackMd, padding: spacing.stackSm },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  headerSubtitle: { ...typography.bodyMd, color: colors.outline, marginTop: 2 },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.marginMobile,
  },
  loadingText: {
    ...typography.labelMd,
    color: colors.outline,
    marginTop: spacing.stackMd,
  },
  emptyTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    marginBottom: spacing.stackSm,
  },
  emptyDesc: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: "center",
    paddingHorizontal: spacing.stackLg,
  },

  timelineWrapper: { flex: 1 },
  listContent: {
    paddingVertical: spacing.sectionBreak,
    paddingHorizontal: spacing.marginMobile,
  },

  // FIX: Change alignItems to stretch so the center container fills the height of the row
  timelineRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: spacing.stackLg,
  },

  // FIX: Add justifyContent center so the cards/pills stay vertically centered
  sideContainer: {
    flex: 1,
    paddingHorizontal: spacing.stackSm,
    justifyContent: "center",
  },

  centerNodeContainer: {
    width: 24,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  // Dynamic Line Segment Styles
  lineTop: { position: "absolute", top: 0, bottom: "50%", width: 2 },
  lineBottom: {
    position: "absolute",
    top: "50%",
    bottom: -spacing.stackLg,
    width: 2,
  }, // Extends through the row margin!
  lineActive: { backgroundColor: colors.primaryContainer },
  lineInactive: { backgroundColor: colors.surfaceContainerHigh },

  // Center Dot Styles
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primaryContainer,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
    zIndex: 2,
  },
  centerDotInactive: { backgroundColor: colors.surfaceContainerHigh },
  centerDotHoliday: { backgroundColor: colors.error },

  // Date Pill & Cards
  datePill: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: rounded.full,
    ...shadows.level1,
  },
  datePillInactive: { backgroundColor: colors.outlineVariant },
  datePillHoliday: { backgroundColor: colors.error },
  dateText: {
    ...typography.labelSm,
    color: colors.onPrimary,
    fontWeight: "600",
  },

  eventCard: {
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.stackLg,
    borderRadius: rounded.lg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    ...shadows.level1,
  },
  eventCardHoliday: {
    borderColor: "rgba(186, 26, 26, 0.2)",
    backgroundColor: "#FFF9F9",
  },
  eventTitle: {
    ...typography.labelMd,
    color: colors.onSurface,
    marginBottom: 4,
  },
  eventTitleHoliday: { color: colors.error },
  eventDesc: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
});
