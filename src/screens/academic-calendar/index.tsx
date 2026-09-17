import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  BackHandler,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import {
  useAcademicCalendars,
  useCurrentAcademicCalendar,
} from "@/features/schedule/useSchedule";
import { BENTO_COLORS, fontFamily } from "./constants";
import {
  resolveCalendarMeta,
  toISODateString,
  groupEventsChronologically,
  findTargetScrollDate,
  calculateSemesterDuration,
} from "./utils";
import { TimelineEventCard } from "./components/timeline-event-card";
import { CalendarDateStrip } from "./components/calendar-date-strip";
import { CalendarFilterItem, CalendarFilterPills } from "./components/calendar-filter-pills";
import {
  CalendarLoadingState,
  CalendarErrorState,
  CalendarEmptyState,
} from "./components/calendar-states";
import { ChronologicalDateGroup, WeekHeadingInfo } from "./utils";

export { BENTO_COLORS, CATEGORY_CONFIG } from "./constants";
export { formatEventDate, getMonthAndDay } from "./utils";
export { BentoEventCard } from "./components/bento-event-card";

// ─── Sub-components ──────────────────────────────────────────────────────────

interface WeekBannerProps {
  info: WeekHeadingInfo;
}

const WeekBanner = React.memo(function WeekBanner({ info }: WeekBannerProps) {
  return (
    <View style={subStyles.weekDivider}>
      <View style={[subStyles.weekBanner, info.isCurrentWeek && subStyles.weekBannerCurrent]}>
        <View style={subStyles.weekBannerLeft}>
          <View style={[subStyles.weekIcon, info.isCurrentWeek && subStyles.weekIconCurrent]}>
            <Feather
              name="flag"
              size={12}
              color={info.isCurrentWeek ? "#ffffff" : "#0284c7"}
            />
          </View>
          <Text style={[subStyles.weekTitle, info.isCurrentWeek && subStyles.weekTitleCurrent]}>
            WEEK {String(info.weekNumber).padStart(2, "0")}
          </Text>
        </View>

        <View style={subStyles.weekBannerRight}>
          {info.isCurrentWeek && (
            <View style={subStyles.currentWeekPill}>
              <View style={subStyles.activeDot} />
              <Text style={subStyles.currentWeekText}>CURRENT WEEK</Text>
            </View>
          )}
          {info.hasExam && (
            <View style={subStyles.examPill}>
              <Feather name="alert-circle" size={10} color="#b45309" style={{ marginRight: 3 }} />
              <Text style={subStyles.examPillText}>EXAM WEEK</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
});

interface SemesterBarProps {
  months: number;
  days: number;
  startDate: string;
  endDate: string;
}

const SemesterBar = React.memo(function SemesterBar({
  months,
  days,
  startDate,
  endDate,
}: SemesterBarProps) {
  const duration =
    months > 0
      ? `${months} Month${months !== 1 ? "s" : ""}${days > 0 ? ` ${days} Day${days !== 1 ? "s" : ""}` : ""}`
      : `${days} Day${days !== 1 ? "s" : ""}`;

  const fmt = (d: string) =>
    new Date(`${d}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const fmtEnd = (d: string) =>
    new Date(`${d}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <View style={subStyles.semesterBar}>
      <Feather name="clock" size={12} color="#64748b" />
      <Text style={subStyles.semesterLabel}>Full Semester</Text>
      <View style={subStyles.semesterDot} />
      <Text style={subStyles.semesterDuration}>{duration}</Text>
      <View style={subStyles.semesterSpacer} />
      <Text style={subStyles.semesterRange}>
        {fmt(startDate)} – {fmtEnd(endDate)}
      </Text>
    </View>
  );
});

interface DateGroupHeaderProps {
  displayDate: string;
  isToday: boolean;
  isSelected: boolean;
  eventCount: number;
  weekNumber?: number | null;
}

const DateGroupHeader = React.memo(function DateGroupHeader({
  displayDate,
  isToday,
  isSelected,
  eventCount,
  weekNumber,
}: DateGroupHeaderProps) {
  return (
    <View style={subStyles.dateHeaderRow}>
      <View style={subStyles.dateHeaderLeft}>
        <Text style={[subStyles.dateHeading, (isToday || isSelected) && subStyles.dateHeadingActive]}>
          {displayDate}
        </Text>
        {isToday && (
          <View style={subStyles.todayPill}>
            <Text style={subStyles.todayPillText}>TODAY</Text>
          </View>
        )}
      </View>
      <Text style={subStyles.eventCount}>
        {eventCount} {eventCount === 1 ? "event" : "events"}
      </Text>
    </View>
  );
});

// ─── Styles for sub-components ───────────────────────────────────────────────

const subStyles = StyleSheet.create({
  weekDivider: {
    marginTop: 14,
    marginBottom: 12,
  },
  weekBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  weekBannerCurrent: {
    backgroundColor: "#f0f9ff",
    borderColor: "#bae6fd",
    borderLeftWidth: 3,
    borderLeftColor: "#0284c7",
    ...Platform.select({
      ios: {
        shadowColor: "#0284c7",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  weekBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  weekIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
  },
  weekIconCurrent: {
    backgroundColor: "#0284c7",
  },
  weekTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
    letterSpacing: 0.8,
  },
  weekTitleCurrent: {
    color: "#0369a1",
    fontWeight: "900",
  },
  weekBannerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  currentWeekPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    gap: 5,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16a34a",
  },
  currentWeekText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#15803d",
    letterSpacing: 0.4,
  },
  examPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  examPillText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#b45309",
    letterSpacing: 0.4,
  },
  semesterBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    gap: 5,
  },
  semesterLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
  },
  semesterDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#94a3b8",
  },
  semesterDuration: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
  },
  semesterSpacer: {
    flex: 1,
  },
  semesterRange: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "500",
    color: "#94a3b8",
  },
  dateHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingLeft: 4,
    paddingRight: 4,
  },
  dateHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateHeading: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.2,
  },
  dateHeadingActive: {
    color: "#0284c7",
  },
  todayPill: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  todayPillText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "900",
    color: "#1e40af",
    letterSpacing: 0.5,
  },
  eventCount: {
    fontFamily,
    fontSize: 11.5,
    color: BENTO_COLORS.subtleText,
    fontWeight: "600",
  },
});

// ─── Screen ──────────────────────────────────────────────────────────────────

export function AcademicCalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedDate, setSelectedDate] = useState<string | null>(() =>
    toISODateString(new Date()),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const mainScrollRef = useRef<ScrollView>(null);
  const groupPositions = useRef<{ [dateKey: string]: number }>({});
  const hasAutoScrolled = useRef(false);

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

  const { allEvents, currentWeekNumber, totalCount } = useMemo(
    () => resolveCalendarMeta(activeCalendar?.events ?? []),
    [activeCalendar?.events],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: totalCount };
    allEvents.forEach((ev) => {
      counts[ev.category] = (counts[ev.category] ?? 0) + 1;
    });
    return counts;
  }, [allEvents, totalCount]);

  const semesterDuration = useMemo(
    () => calculateSemesterDuration(allEvents),
    [allEvents],
  );

  const filteredEvents = useMemo(
    () =>
      selectedCategory === "ALL"
        ? allEvents
        : allEvents.filter((ev) => ev.category === selectedCategory),
    [allEvents, selectedCategory],
  );

  const chronologicalGroups = useMemo(
    () => groupEventsChronologically(filteredEvents, currentWeekNumber),
    [filteredEvents, currentWeekNumber],
  );

  const categoryFilterList = useMemo<CalendarFilterItem[]>(
    () => [
      { key: "ALL", label: "All Events", count: categoryCounts.ALL ?? 0 },
      { key: "CLASS", label: "Classes", count: categoryCounts.CLASS ?? 0 },
      { key: "EXAM", label: "Exams", count: categoryCounts.EXAM ?? 0 },
      { key: "HOLIDAY", label: "Holidays", count: categoryCounts.HOLIDAY ?? 0 },
      {
        key: "DEADLINE",
        label: "Deadlines",
        count: (categoryCounts.DEADLINE ?? 0) + (categoryCounts.REGISTRATION ?? 0),
      },
      { key: "RESULT", label: "Results", count: categoryCounts.RESULT ?? 0 },
      { key: "MAKEUP_CLASS", label: "Makeup", count: categoryCounts.MAKEUP_CLASS ?? 0 },
      { key: "ACADEMIC", label: "Academic", count: categoryCounts.ACADEMIC ?? 0 },
    ],
    [categoryCounts],
  );

  const scrollToTargetDate = useCallback(
    (targetDate: string, animated = true) => {
      const bestDate = findTargetScrollDate(chronologicalGroups, targetDate);
      if (!bestDate) return;
      const y = groupPositions.current[bestDate];
      if (typeof y === "number") {
        mainScrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated });
      }
    },
    [chronologicalGroups],
  );

  const handleGroupLayout = useCallback(
    (dateString: string, y: number) => {
      groupPositions.current[dateString] = y;
      if (!hasAutoScrolled.current && selectedDate) {
        const target = findTargetScrollDate(chronologicalGroups, selectedDate);
        if (target && target === dateString) {
          hasAutoScrolled.current = true;
          setTimeout(() => scrollToTargetDate(target, true), 300);
        }
      }
    },
    [selectedDate, chronologicalGroups, scrollToTargetDate],
  );

  const handleSelectDate = useCallback(
    (dateStr: string | null) => {
      setSelectedDate(dateStr);
      if (dateStr) scrollToTargetDate(dateStr, true);
    },
    [scrollToTargetDate],
  );

  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
    hasAutoScrolled.current = false;
    groupPositions.current = {};
  }, []);

  const handleBack = useCallback(() => {
    const todayStr = toISODateString(new Date());
    if (selectedDate && selectedDate !== todayStr) {
      setSelectedDate(todayStr);
      scrollToTargetDate(todayStr, true);
      return;
    }
    router.replace("/(tabs)/menu");
  }, [selectedDate, router, scrollToTargetDate]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    hasAutoScrolled.current = false;
    groupPositions.current = {};
    try {
      await Promise.all([refetchCurrent(), refetchAll()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchCurrent, refetchAll]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, [handleBack]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backBtn}
          accessible
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
            {activeCalendar?.semester ?? "University Schedule"}
          </Text>
        </View>
      </View>

      <View style={styles.fixedTop}>
        <CalendarDateStrip
          events={allEvents}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
        />
        <CalendarFilterPills
          filters={categoryFilterList}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
        {semesterDuration && (
          <SemesterBar
            months={semesterDuration.months}
            days={semesterDuration.days}
            startDate={semesterDuration.startDate}
            endDate={semesterDuration.endDate}
          />
        )}
      </View>

      <ScrollView
        ref={mainScrollRef}
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
            {chronologicalGroups.length > 0 ? (
              <View style={styles.stream}>
                {chronologicalGroups.map((group: ChronologicalDateGroup, groupIndex) => {
                  const isSelected = selectedDate === group.dateString;
                  const isLastGroup = groupIndex === chronologicalGroups.length - 1;

                  return (
                    <View
                      key={group.dateString}
                      onLayout={(e) => handleGroupLayout(group.dateString, e.nativeEvent.layout.y)}
                      style={[styles.dateGroup, group.isPast && styles.dateGroupPast]}
                    >
                      {group.weekHeading && <WeekBanner info={group.weekHeading} />}

                      <DateGroupHeader
                        displayDate={group.displayDate}
                        isToday={group.isToday}
                        isSelected={isSelected}
                        eventCount={group.events.length}
                        weekNumber={group.weekNumber}
                      />

                      {group.events.map((ev, evIdx) => (
                        <TimelineEventCard
                          key={ev.id}
                          event={ev}
                          isLast={isLastGroup && evIdx === group.events.length - 1}
                          highlight={isSelected}
                        />
                      ))}
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyFilter}>
                <View style={styles.emptyFilterIcon}>
                  <Feather name="calendar" size={24} color="#94a3b8" />
                </View>
                <Text style={styles.emptyFilterTitle}>
                  No {selectedCategory} Events
                </Text>
                <Text style={styles.emptyFilterDesc}>
                  There are no scheduled events found under this category.
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedCategory("ALL")}
                  style={styles.showAllBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.showAllBtnText}>Show All Events</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Screen styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: BENTO_COLORS.background,
  },
  backBtn: {
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
  fixedTop: {
    backgroundColor: BENTO_COLORS.background,
    paddingTop: 4,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.08)",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  stream: {
    marginTop: 2,
    paddingBottom: 20,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateGroupPast: {
    opacity: 0.42,
  },
  emptyFilter: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    marginTop: 20,
    ...BENTO_COLORS.shadow,
  },
  emptyFilterIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyFilterTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 4,
  },
  emptyFilterDesc: {
    fontFamily,
    fontSize: 12.5,
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 18,
  },
  showAllBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: "#0284c7",
  },
  showAllBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
});
