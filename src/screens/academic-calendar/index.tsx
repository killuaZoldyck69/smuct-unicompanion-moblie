import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import {
  useAcademicCalendars,
  useCurrentAcademicCalendar,
} from "@/features/schedule/useSchedule";
import { BENTO_COLORS, fontFamily } from "./constants";
import { groupCalendarEvents } from "./utils";
import { BentoEventCard } from "./components/bento-event-card";
import { CalendarHeroCard } from "./components/calendar-hero-card";
import {
  CalendarFilterItem,
  CalendarFilterPills,
} from "./components/calendar-filter-pills";
import { MilestoneEventCard } from "./components/milestone-event-card";
import {
  CalendarLoadingState,
  CalendarErrorState,
  CalendarEmptyState,
} from "./components/calendar-states";

export { BENTO_COLORS, CATEGORY_CONFIG } from "./constants";
export { formatEventDate, getMonthAndDay } from "./utils";
export { BentoEventCard } from "./components/bento-event-card";

export function AcademicCalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: currentCalendar,
    isLoading: isLoadingCurrent,
    isError: isErrorCurrent,
    refetch: refetchCurrent,
  } = useCurrentAcademicCalendar();

  const {
    data: calendars,
    isLoading: isLoadingAll,
    isError: isErrorAll,
    refetch: refetchAll,
  } = useAcademicCalendars();

  const isLoading = isLoadingCurrent && isLoadingAll;
  const isError = isErrorCurrent && isErrorAll;

  const activeCalendar =
    currentCalendar ||
    calendars?.find((c) => c.status === "PUBLISHED") ||
    calendars?.[0] ||
    null;

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchCurrent(), refetchAll()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchCurrent, refetchAll]);

  const {
    allEvents,
    thisWeekEvents,
    examEvents,
    deadlineEvents,
    holidayEvents,
    milestoneEvents,
    currentWeekNumber,
    currentWeekDateRange,
    totalCount,
  } = useMemo(() => {
    return groupCalendarEvents(activeCalendar?.events || []);
  }, [activeCalendar?.events]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: totalCount };
    allEvents.forEach((ev) => {
      counts[ev.category] = (counts[ev.category] || 0) + 1;
    });
    return counts;
  }, [allEvents, totalCount]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === "ALL") return allEvents;
    return allEvents.filter((ev) => ev.category === selectedCategory);
  }, [allEvents, selectedCategory]);

  const categoryFilterList = useMemo<CalendarFilterItem[]>(() => {
    return [
      { key: "ALL", label: "All Events", count: categoryCounts.ALL || 0 },
      { key: "CLASS", label: "Classes", count: categoryCounts.CLASS || 0 },
      { key: "EXAM", label: "Exams", count: categoryCounts.EXAM || 0 },
      { key: "HOLIDAY", label: "Holidays", count: categoryCounts.HOLIDAY || 0 },
      {
        key: "DEADLINE",
        label: "Deadlines",
        count: (categoryCounts.DEADLINE || 0) + (categoryCounts.REGISTRATION || 0),
      },
      { key: "RESULT", label: "Results", count: categoryCounts.RESULT || 0 },
      {
        key: "MAKEUP_CLASS",
        label: "Makeup",
        count: categoryCounts.MAKEUP_CLASS || 0,
      },
      {
        key: "ACADEMIC",
        label: "Academic",
        count: categoryCounts.ACADEMIC || 0,
      },
    ];
  }, [categoryCounts]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/menu");
    }
  }, [router]);

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={BENTO_COLORS.deepNavy} />
        </TouchableOpacity>

        <View style={styles.navTitleBox}>
          <Text style={styles.navTitle} numberOfLines={1}>
            Academic Calendar
          </Text>
          <Text style={styles.navSubtitle}>
            {activeCalendar?.semester || "University Schedule"}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 40 : 56 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[BENTO_COLORS.deepNavy]}
            tintColor={BENTO_COLORS.deepNavy}
          />
        }
      >
        {isLoading ? (
          <CalendarLoadingState />
        ) : isError ? (
          <CalendarErrorState onRetry={onRefresh} />
        ) : !activeCalendar || allEvents.length === 0 ? (
          <CalendarEmptyState />
        ) : (
          <>
            <CalendarHeroCard
              currentWeekNumber={currentWeekNumber}
              totalCount={totalCount}
              title={activeCalendar.title}
              semester={activeCalendar.semester}
              academicYear={activeCalendar.academicYear}
              currentWeekDateRange={currentWeekDateRange}
            />

            <CalendarFilterPills
              filters={categoryFilterList}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {selectedCategory !== "ALL" ? (
              <View style={styles.bentoSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeading}>
                    {selectedCategory} EVENTS ({filteredEvents.length})
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedCategory("ALL")}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Reset category filter"
                  >
                    <Text style={styles.clearFilterLink}>Show All</Text>
                  </TouchableOpacity>
                </View>

                {filteredEvents.map((ev) => (
                  <BentoEventCard key={ev.id} event={ev} />
                ))}
              </View>
            ) : (
              <>
                {/* 1. This Week's Events */}
                <View style={styles.bentoSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionHeading}>This Week's Events</Text>
                    <View style={styles.weekTagPill}>
                      <Text style={styles.weekTagPillText}>
                        Week {currentWeekNumber}
                      </Text>
                    </View>
                  </View>

                  {thisWeekEvents.map((ev) => (
                    <BentoEventCard key={ev.id} event={ev} highlight={true} />
                  ))}
                </View>

                {/* 2. Examinations */}
                {examEvents.length > 0 && (
                  <View style={styles.bentoSection}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionHeading}>Examinations</Text>
                      <View style={styles.examTagPill}>
                        <Feather name="award" size={11} color="#b45309" />
                        <Text style={styles.examTagPillText}>Exams</Text>
                      </View>
                    </View>

                    {examEvents.map((ev) => (
                      <BentoEventCard key={ev.id} event={ev} />
                    ))}
                  </View>
                )}

                {/* 3. Deadlines */}
                {deadlineEvents.length > 0 && (
                  <View style={styles.bentoSection}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionHeading}>Important Deadlines</Text>
                      <View style={styles.deadlineTagPill}>
                        <Feather name="alert-circle" size={11} color="#be123c" />
                        <Text style={styles.deadlineTagPillText}>Important</Text>
                      </View>
                    </View>

                    {deadlineEvents.map((ev) => (
                      <BentoEventCard key={ev.id} event={ev} />
                    ))}
                  </View>
                )}

                {/* 4. University Holidays */}
                {holidayEvents.length > 0 && (
                  <View style={styles.bentoSection}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionHeading}>University Holidays</Text>
                      <View style={styles.holidayTagPill}>
                        <Feather name="sun" size={11} color="#047857" />
                        <Text style={styles.holidayTagPillText}>Vacations</Text>
                      </View>
                    </View>

                    {holidayEvents.map((ev) => (
                      <BentoEventCard key={ev.id} event={ev} />
                    ))}
                  </View>
                )}

                {/* 5. Semester Milestones */}
                {milestoneEvents.length > 0 && (
                  <View style={styles.bentoSection}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionHeading}>Semester Milestones</Text>
                      <Text style={styles.milestoneSubtext}>Key Timeline Dates</Text>
                    </View>

                    {milestoneEvents.map((ev) => (
                      <MilestoneEventCard key={ev.id} event={ev} />
                    ))}
                  </View>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: BENTO_COLORS.background,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    marginRight: 14,
    ...BENTO_COLORS.shadow,
  },
  navTitleBox: {
    flex: 1,
  },
  navTitle: {
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  navSubtitle: {
    fontFamily,
    fontSize: 12,
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  bentoSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionHeading: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  clearFilterLink: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0284c7",
  },
  weekTagPill: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  weekTagPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#0369a1",
  },
  examTagPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: BENTO_COLORS.pillRadius,
    gap: 4,
  },
  examTagPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#b45309",
  },
  deadlineTagPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe4e6",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: BENTO_COLORS.pillRadius,
    gap: 4,
  },
  deadlineTagPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#be123c",
  },
  holidayTagPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: BENTO_COLORS.pillRadius,
    gap: 4,
  },
  holidayTagPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#047857",
  },
  milestoneSubtext: {
    fontFamily,
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
    fontWeight: "600",
  },
});
