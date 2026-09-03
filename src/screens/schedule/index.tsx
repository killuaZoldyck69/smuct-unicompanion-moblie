import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useMyHubs } from "@/features/hubs/useHubs";
import { BENTO_COLORS, fontFamily } from "./constants";
import { parseWeeklySchedule } from "./utils";
import { ScheduleHeroCard } from "./components/schedule-hero-card";
import { ScheduleDayFilters } from "./components/schedule-day-filters";
import { ClassRoutineCard } from "./components/class-routine-card";
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
} from "./utils";

export function ScheduleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

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

        <TouchableOpacity
          onPress={() => router.push("/academic_calendar")}
          style={styles.headerIconButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="View Academic Calendar"
          activeOpacity={0.7}
        >
          <Feather name="calendar" size={19} color={BENTO_COLORS.deepNavy} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 104 : 116 },
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
        <ScheduleHeroCard stats={todayStats} />

        <ScheduleDayFilters
          selectedDay={selectedDayFilter}
          onSelectDay={setSelectedDayFilter}
          daysWithClasses={daysWithClasses}
          todayWeekday={todayStats.weekday}
        />

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
                <View style={styles.daySectionHeader}>
                  <View style={styles.dayTitleBox}>
                    <Text style={styles.dayTitleText}>
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

                <View style={styles.dayCardsContainer}>
                  {section.data.map((item) => (
                    <ClassRoutineCard
                      key={item.id}
                      item={item}
                      isToday={isToday}
                      nextClassId={todayStats.nextClass?.id}
                    />
                  ))}
                </View>
              </View>
            );
          })
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
  screenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
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
    ...BENTO_COLORS.shadow,
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
  daySectionContainer: {
    marginBottom: 20,
  },
  daySectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  dayTitleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dayTitleText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: 0.8,
  },
  todayIndicatorDot: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BENTO_COLORS.pillRadius,
    gap: 5,
  },
  todayDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#059669",
  },
  todayIndicatorLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
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
    gap: 2,
  },
});
