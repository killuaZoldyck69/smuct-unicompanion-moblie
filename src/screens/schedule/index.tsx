import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useMyHubs } from "@/features/hubs/useHubs";
import { BENTO_COLORS, fontFamily } from "./constants";
import { parseWeeklySchedule, formatTimeDisplay } from "./utils";
import { ScheduleDayFilters } from "./components/schedule-day-filters";
import { ClassRoutineCard } from "./components/class-routine-card";
import { ClassNoticeModal } from "./components/class-notice-modal";
import { ClassRoutineItem } from "./constants";
import {
  ScheduleSkeleton,
  ScheduleError,
  ScheduleEmpty,
} from "./components/schedule-states";

export { BENTO_COLORS, PASTEL_THEMES } from "./constants";
export {
  timeToMinutes,
  calculateDuration,
  isClassLiveNow,
  getDeterministicColorTheme,
  formatTimeDisplay,
} from "./utils";

export function ScheduleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const todayWeekday = useMemo(() => {
    return new Date().toLocaleDateString("en-US", { weekday: "long" });
  }, []);

  const todayFullDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  // Auto-select today's day of week on initial load
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>(todayWeekday);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [noticeModalItem, setNoticeModalItem] = useState<ClassRoutineItem | null>(null);
  const [isNoticeModalVisible, setIsNoticeModalVisible] = useState<boolean>(false);

  const { data: myHubs, isLoading, isError, refetch } = useMyHubs();

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const { scheduleSections, todayStats } = useMemo(
    () => parseWeeklySchedule(myHubs),
    [myHubs]
  );

  const daysWithClasses = useMemo(() => {
    return new Set(scheduleSections.map((s) => s.title));
  }, [scheduleSections]);

  const classesCountByDay = useMemo(() => {
    const map = new Map<string, number>();
    scheduleSections.forEach((s) => {
      map.set(s.title, s.data.length);
    });
    return map;
  }, [scheduleSections]);

  const filteredSections = useMemo(() => {
    if (selectedDayFilter === "ALL") return scheduleSections;
    return scheduleSections.filter((s) => s.title === selectedDayFilter);
  }, [scheduleSections, selectedDayFilter]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/home");
    }
  }, [router]);

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      {/* Header Bar */}
      <View style={styles.screenHeader}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.headerIconButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={BENTO_COLORS.deepNavy} />
        </TouchableOpacity>

        <View style={styles.headerTitlesContainer}>
          <Text style={styles.screenTitle} numberOfLines={1}>
            My Schedule
          </Text>
          <Text style={styles.screenSubtitle}>Weekly class routine</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 120 : 130 },
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
        {/* Clean Today's Day & Date Heading (Replaces Black Hero Card) */}
        <View style={styles.todayDateSection}>
          <View style={styles.todayDateTextCol}>
            <Text style={styles.todayDayHeading}>{todayStats.weekday}</Text>
            <Text style={styles.todayFullDateText}>{todayFullDate}</Text>
          </View>
          <View style={styles.todayBadgePill}>
            <View style={styles.todayBadgeDot} />
            <Text style={styles.todayBadgePillText}>TODAY</Text>
          </View>
        </View>

        {/* Academic Calendar Style Day Strip */}
        <ScheduleDayFilters
          selectedDay={selectedDayFilter}
          onSelectDay={setSelectedDayFilter}
          daysWithClasses={daysWithClasses}
          todayWeekday={todayStats.weekday}
          classesCountByDay={classesCountByDay}
        />

        {/* Today's Total Class Overview Banner (Bottom of the strip calendar) */}
        <View style={styles.todaySummaryBanner}>
          <View
            style={[
              styles.todaySummaryIconCircle,
              todayStats.totalClassesToday === 0
                ? styles.iconCircleFree
                : styles.iconCircleActive,
            ]}
          >
            <Feather
              name={todayStats.totalClassesToday === 0 ? "coffee" : "book-open"}
              size={16}
              color={todayStats.totalClassesToday === 0 ? "#64748b" : "#2563eb"}
            />
          </View>

          <View style={styles.todaySummaryTextContainer}>
            <Text style={styles.todaySummaryTitle}>
              {todayStats.totalClassesToday === 0
                ? "No classes scheduled today"
                : todayStats.totalClassesToday === 1
                  ? "1 class scheduled today"
                  : `${todayStats.totalClassesToday} classes scheduled today`}
            </Text>
            <Text style={styles.todaySummarySubtitle} numberOfLines={1}>
              {todayStats.liveClass ? (
                `Live now: ${todayStats.liveClass.courseCode} (${todayStats.liveClass.room ? `Room ${todayStats.liveClass.room}` : "Room TBA"})`
              ) : todayStats.nextClass ? (
                `Next: ${formatTimeDisplay(todayStats.nextClass.startTime)} · ${todayStats.nextClass.courseCode}`
              ) : todayStats.totalClassesToday === 0 ? (
                "Free day · Enjoy your time off"
              ) : (
                "All sessions completed for today"
              )}
            </Text>
          </View>

          <View
            style={[
              styles.todaySummaryCountBadge,
              todayStats.totalClassesToday === 0 && styles.countBadgeFree,
              todayStats.liveClass && styles.countBadgeLive,
            ]}
          >
            <Text
              style={[
                styles.todaySummaryCountText,
                todayStats.totalClassesToday === 0 && styles.countTextFree,
                todayStats.liveClass && styles.countTextLive,
              ]}
            >
              {todayStats.liveClass
                ? "LIVE"
                : todayStats.totalClassesToday === 0
                  ? "Free Day"
                  : `${todayStats.totalClassesToday} ${todayStats.totalClassesToday === 1 ? "Class" : "Classes"}`}
            </Text>
          </View>
        </View>

        {/* Routine Content */}
        {isLoading ? (
          <ScheduleSkeleton />
        ) : isError ? (
          <ScheduleError onRetry={refetch} />
        ) : filteredSections.length === 0 ? (
          <ScheduleEmpty
            selectedDay={selectedDayFilter}
            onResetDay={() => setSelectedDayFilter("ALL")}
          />
        ) : (
          filteredSections.map((section) => {
            const isToday = section.title === todayStats.weekday;
            const countLabel =
              section.data.length === 1
                ? "1 CLASS"
                : `${section.data.length} CLASSES`;

            return (
              <View key={section.title} style={styles.daySectionContainer}>
                {/* Date Group Header */}
                <View style={styles.daySectionHeader}>
                  <View style={styles.dayTitleBox}>
                    <Text
                      style={[
                        styles.dayTitleText,
                        isToday && styles.dayTitleTextToday,
                      ]}
                    >
                      {section.title.toUpperCase()}
                    </Text>
                    {isToday && (
                      <View style={styles.todayIndicatorDot}>
                        <View style={styles.todayDotInner} />
                        <Text style={styles.todayIndicatorLabel}>Today</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.dayCountPill}>
                    <Text style={styles.dayCountPillText}>{countLabel}</Text>
                  </View>
                </View>

                {/* Cards Container */}
                <View style={styles.dayCardsContainer}>
                  {section.data.map((item, idx) => (
                    <ClassRoutineCard
                      key={item.id}
                      item={item}
                      isToday={isToday}
                      isLast={idx === section.data.length - 1}
                      nextClassId={todayStats.nextClass?.id}
                      onOpenNotice={(target) => {
                        setNoticeModalItem(target);
                        setIsNoticeModalVisible(true);
                      }}
                    />
                  ))}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Class Notice Compose & Manage Modal for Teachers and CRs */}
      <ClassNoticeModal
        visible={isNoticeModalVisible}
        item={noticeModalItem}
        onClose={() => {
          setIsNoticeModalVisible(false);
          setNoticeModalItem(null);
        }}
        onSuccess={() => {
          refetch();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  screenHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: BENTO_COLORS.background,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTitlesContainer: {
    flex: 1,
    marginLeft: 14,
  },
  screenTitle: {
    fontFamily,
    fontSize: 26,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  todayDateSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  todayDateTextCol: {
    flex: 1,
  },
  todayDayHeading: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.4,
  },
  todayFullDateText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  todayBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
    gap: 5,
  },
  todayBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#059669",
  },
  todayBadgePillText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: "#059669",
    letterSpacing: 0.5,
  },
  todaySummaryBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  todaySummaryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconCircleActive: {
    backgroundColor: "#eff6ff",
  },
  iconCircleFree: {
    backgroundColor: "#f1f5f9",
  },
  todaySummaryTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  todaySummaryTitle: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  todaySummarySubtitle: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 2,
  },
  todaySummaryCountBadge: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  countBadgeFree: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },
  countBadgeLive: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  todaySummaryCountText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  countTextFree: {
    color: "#64748b",
  },
  countTextLive: {
    color: "#dc2626",
  },
  daySectionContainer: {
    marginBottom: 20,
  },
  daySectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  dayTitleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dayTitleText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: 0.8,
  },
  dayTitleTextToday: {
    color: "#059669",
  },
  todayIndicatorDot: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: BENTO_COLORS.pillRadius,
    gap: 4,
  },
  todayDotInner: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#059669",
  },
  todayIndicatorLabel: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: "#059669",
  },
  dayCountPill: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  dayCountPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 0.5,
  },
  dayCardsContainer: {
    marginTop: 2,
  },
});
