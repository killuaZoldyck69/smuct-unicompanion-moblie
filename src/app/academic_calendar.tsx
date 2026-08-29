import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import {
  useAcademicCalendars,
  useCurrentAcademicCalendar,
} from "@/features/schedule/useSchedule";
import {
  AcademicEventItem,
  EventCategory,
} from "@/services/calendar-service";

// ==========================================
// SOFT CAMPUS BENTO SEMANTIC CATEGORY PALETTE
// ==========================================
export const BENTO_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  cardRadius: 26,
  pillRadius: 9999,
  subtleBorder: "rgba(0, 0, 0, 0.04)",
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
};

export const CATEGORY_CONFIG: Record<
  EventCategory,
  {
    label: string;
    bg: string;
    surfaceBg: string;
    text: string;
    pillBg: string;
    pillText: string;
    icon: keyof typeof Feather.glyphMap;
  }
> = {
  CLASS: {
    label: "Class",
    bg: "#e0f2fe",
    surfaceBg: "#f0f9ff",
    text: "#0369a1",
    pillBg: "#bae6fd",
    pillText: "#0284c7",
    icon: "book-open",
  },
  REGISTRATION: {
    label: "Registration",
    bg: "#ffe4e6",
    surfaceBg: "#fff1f2",
    text: "#be123c",
    pillBg: "#fecdd3",
    pillText: "#e11d48",
    icon: "edit-3",
  },
  DEADLINE: {
    label: "Deadline",
    bg: "#ffe4e6",
    surfaceBg: "#fff1f2",
    text: "#be123c",
    pillBg: "#fecdd3",
    pillText: "#e11d48",
    icon: "alert-circle",
  },
  EXAM: {
    label: "Exam",
    bg: "#fef3c7",
    surfaceBg: "#fffbeb",
    text: "#b45309",
    pillBg: "#fde68a",
    pillText: "#d97706",
    icon: "award",
  },
  HOLIDAY: {
    label: "Holiday",
    bg: "#d1fae5",
    surfaceBg: "#ecfdf5",
    text: "#047857",
    pillBg: "#a7f3d0",
    pillText: "#059669",
    icon: "sun",
  },
  MAKEUP_CLASS: {
    label: "Makeup",
    bg: "#cffafe",
    surfaceBg: "#ecfeff",
    text: "#0e7490",
    pillBg: "#a5f3fc",
    pillText: "#0891b2",
    icon: "repeat",
  },
  RESULT: {
    label: "Result",
    bg: "#ede9fe",
    surfaceBg: "#f5f3ff",
    text: "#6d28d9",
    pillBg: "#ddd6fe",
    pillText: "#7c3aed",
    icon: "check-circle",
  },
  ACADEMIC: {
    label: "Academic",
    bg: "#f1f5f9",
    surfaceBg: "#f8fafc",
    text: "#334155",
    pillBg: "#e2e8f0",
    pillText: "#475569",
    icon: "bookmark",
  },
  OTHER: {
    label: "Other",
    bg: "#f3f4f6",
    surfaceBg: "#f9fafb",
    text: "#374151",
    pillBg: "#e5e7eb",
    pillText: "#4b5563",
    icon: "tag",
  },
};

// Safe date parser & formatter
export const formatEventDate = (startStr: string, endStr?: string | null) => {
  const parseSafeDate = (str: string) => {
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return new Date(Date.UTC(year, month, day));
    }
    return new Date(str);
  };

  const start = parseSafeDate(startStr);
  const startMonth = start.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  const startDay = start.getUTCDate();

  if (!endStr) return `${startDay} ${startMonth}`;

  const end = parseSafeDate(endStr);
  const endMonth = end.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  const endDay = end.getUTCDate();

  if (startMonth === endMonth) {
    return `${startDay} – ${endDay} ${startMonth}`;
  }
  return `${startDay} ${startMonth} – ${endDay} ${endMonth}`;
};

export const getMonthAndDay = (dateStr: string) => {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    const dateObj = new Date(Date.UTC(year, month, day));
    return {
      month: dateObj
        .toLocaleString("en-US", { month: "short", timeZone: "UTC" })
        .toUpperCase(),
      day: String(day).padStart(2, "0"),
    };
  }
  const dateObj = new Date(dateStr);
  return {
    month: dateObj
      .toLocaleString("en-US", { month: "short", timeZone: "UTC" })
      .toUpperCase(),
    day: String(dateObj.getUTCDate()).padStart(2, "0"),
  };
};

export default function AcademicCalendarScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Queries
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

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchCurrent(), refetchAll()]);
    setIsRefreshing(false);
  };

  // Structured Grouping of Events
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
    const events = activeCalendar?.events || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find current active/upcoming week
    let currentWeek = 1;
    let foundWeekDateRange = "";

    const activeOrNext = events.find((ev) => {
      const match = ev.startDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
      const d = match
        ? new Date(
            Date.UTC(
              parseInt(match[1]),
              parseInt(match[2]) - 1,
              parseInt(match[3]),
            ),
          )
        : new Date(ev.startDate);
      return d >= today && ev.weekNumber;
    });

    if (activeOrNext && activeOrNext.weekNumber) {
      currentWeek = activeOrNext.weekNumber;
      foundWeekDateRange = formatEventDate(
        activeOrNext.startDate,
        activeOrNext.endDate,
      );
    } else if (events[0]) {
      currentWeek = events[0].weekNumber || 1;
      foundWeekDateRange = formatEventDate(
        events[0].startDate,
        events[0].endDate,
      );
    }

    // Categorize
    const thisWeek = events.filter(
      (ev) =>
        ev.weekNumber === currentWeek ||
        (ev.category === "CLASS" && ev.weekNumber === currentWeek),
    );

    const exams = events.filter((ev) => ev.category === "EXAM");
    const deadlines = events.filter(
      (ev) => ev.category === "DEADLINE" || ev.category === "REGISTRATION",
    );
    const holidays = events.filter(
      (ev) => ev.category === "HOLIDAY" || ev.isHoliday,
    );

    // Key milestone events across the semester
    const milestones = events.filter(
      (ev) =>
        ev.category === "EXAM" ||
        ev.category === "REGISTRATION" ||
        ev.category === "RESULT" ||
        ev.title.toLowerCase().includes("classes will start") ||
        ev.title.toLowerCase().includes("commencement") ||
        ev.title.toLowerCase().includes("break"),
    );

    return {
      allEvents: events,
      thisWeekEvents: thisWeek.length > 0 ? thisWeek : events.slice(0, 3),
      examEvents: exams,
      deadlineEvents: deadlines,
      holidayEvents: holidays,
      milestoneEvents: milestones,
      currentWeekNumber: currentWeek,
      currentWeekDateRange: foundWeekDateRange || "Semester Active",
      totalCount: events.length,
    };
  }, [activeCalendar?.events]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: totalCount };
    allEvents.forEach((ev) => {
      counts[ev.category] = (counts[ev.category] || 0) + 1;
    });
    return counts;
  }, [allEvents, totalCount]);

  // Filtered list when category filter is selected
  const filteredEvents = useMemo(() => {
    if (selectedCategory === "ALL") return allEvents;
    return allEvents.filter((ev) => ev.category === selectedCategory);
  }, [allEvents, selectedCategory]);

  const categoryFilterList = [
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

  return (
    <View style={styles.container}>
      {/* --- Top Navigation Header --- */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={22} color={BENTO_COLORS.deepNavy} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle} numberOfLines={1}>
            Academic Calendar
          </Text>
          <Text style={styles.navSubtitle}>
            {activeCalendar?.semester || "University Schedule"}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[BENTO_COLORS.deepNavy]}
          />
        }
      >
        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={BENTO_COLORS.deepNavy} />
            <Text style={styles.loadingLabel}>Loading Academic Schedule...</Text>
          </View>
        ) : isError ? (
          <View style={styles.centerBox}>
            <Feather
              name="alert-circle"
              size={44}
              color="#ba1a1a"
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.stateTitle}>Unable to Load Schedule</Text>
            <Text style={styles.stateDesc}>
              Please check your network connection and try again.
            </Text>
            <TouchableOpacity style={styles.retryPill} onPress={onRefresh}>
              <Feather
                name="refresh-cw"
                size={14}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.retryPillText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : !activeCalendar || allEvents.length === 0 ? (
          <View style={styles.centerBox}>
            <Feather
              name="calendar"
              size={48}
              color={BENTO_COLORS.subtleText}
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.stateTitle}>No Active Calendar</Text>
            <Text style={styles.stateDesc}>
              There is currently no published academic calendar for your
              department.
            </Text>
          </View>
        ) : (
          <>
            {/* ========================================== */}
            {/* 1. SEMESTER HERO BENTO CARD */}
            {/* ========================================== */}
            <View style={styles.heroBentoCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroWeekBadge}>
                  <Feather name="clock" size={12} color="#ffffff" />
                  <Text style={styles.heroWeekBadgeText}>
                    WEEK {String(currentWeekNumber).padStart(2, "0")}
                  </Text>
                </View>

                <Text style={styles.heroTotalEventsText}>
                  {totalCount} Total Events
                </Text>
              </View>

              <Text style={styles.heroTitle}>{activeCalendar.title}</Text>
              <Text style={styles.heroSemester}>
                {activeCalendar.semester} • Academic Year{" "}
                {activeCalendar.academicYear}
              </Text>

              <View style={styles.heroFooter}>
                <View style={styles.heroDateRangeBox}>
                  <Feather name="calendar" size={14} color="#c1dcff" />
                  <Text style={styles.heroDateRangeText}>
                    {currentWeekDateRange}
                  </Text>
                </View>
                <View style={styles.heroStatusPill}>
                  <View style={styles.heroStatusDot} />
                  <Text style={styles.heroStatusText}>Active Term</Text>
                </View>
              </View>
            </View>

            {/* ========================================== */}
            {/* 2. CATEGORY PILL FILTER ROW */}
            {/* ========================================== */}
            <View style={styles.filterSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
              >
                {categoryFilterList.map((cat) => {
                  const isSelected = selectedCategory === cat.key;
                  if (cat.key !== "ALL" && cat.count === 0) return null;

                  return (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.categoryPill,
                        isSelected && styles.categoryPillActive,
                      ]}
                      onPress={() => setSelectedCategory(cat.key)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.categoryPillLabel,
                          isSelected && styles.categoryPillLabelActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                      <View
                        style={[
                          styles.categoryPillCount,
                          isSelected && styles.categoryPillCountActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryPillCountText,
                            isSelected && styles.categoryPillCountTextActive,
                          ]}
                        >
                          {cat.count}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* If a category filter is active (other than ALL), show filtered list */}
            {selectedCategory !== "ALL" ? (
              <View style={styles.bentoSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeading}>
                    {selectedCategory} EVENTS ({filteredEvents.length})
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedCategory("ALL")}>
                    <Text style={styles.clearFilterLink}>Show All</Text>
                  </TouchableOpacity>
                </View>

                {filteredEvents.map((ev) => (
                  <BentoEventCard key={ev.id} event={ev} />
                ))}
              </View>
            ) : (
              /* ========================================== */
              /* BENTO-STRUCTURED SECTIONS (When viewing ALL) */
              /* ========================================== */
              <>
                {/* 3. THIS WEEK'S EVENTS */}
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
                    <BentoEventCard key={ev.id} event={ev} highlight />
                  ))}
                </View>

                {/* 4. EXAMINATIONS BENTO SECTION */}
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

                {/* 5. IMPORTANT DEADLINES BENTO SECTION */}
                {deadlineEvents.length > 0 && (
                  <View style={styles.bentoSection}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionHeading}>
                        Important Deadlines
                      </Text>
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

                {/* 6. UNIVERSITY HOLIDAYS BENTO SECTION */}
                {holidayEvents.length > 0 && (
                  <View style={styles.bentoSection}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionHeading}>
                        University Holidays
                      </Text>
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

                {/* 7. SEMESTER MILESTONES SECTION */}
                {milestoneEvents.length > 0 && (
                  <View style={styles.bentoSection}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionHeading}>
                        Semester Milestones
                      </Text>
                      <Text style={styles.milestoneSubtext}>
                        Key Timeline Dates
                      </Text>
                    </View>

                    <View style={styles.milestonesGrid}>
                      {milestoneEvents.map((ev) => {
                        const { month, day } = getMonthAndDay(ev.startDate);
                        const catConfig =
                          CATEGORY_CONFIG[ev.category] ||
                          CATEGORY_CONFIG.ACADEMIC;

                        return (
                          <View key={ev.id} style={styles.milestoneCard}>
                            <View
                              style={[
                                styles.milestoneDatePill,
                                { backgroundColor: catConfig.bg },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.milestoneDay,
                                  { color: catConfig.text },
                                ]}
                              >
                                {day}
                              </Text>
                              <Text
                                style={[
                                  styles.milestoneMonth,
                                  { color: catConfig.text },
                                ]}
                              >
                                {month}
                              </Text>
                            </View>

                            <View style={{ flex: 1 }}>
                              <Text
                                style={styles.milestoneTitle}
                                numberOfLines={1}
                              >
                                {ev.title}
                              </Text>
                              <Text style={styles.milestoneDateText}>
                                {formatEventDate(ev.startDate, ev.endDate)}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ==========================================
// REUSABLE BENTO EVENT CARD
// ==========================================
export function BentoEventCard({
  event,
  highlight,
  onEdit,
  onDelete,
}: {
  event: AcademicEventItem;
  highlight?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const catConfig =
    CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.ACADEMIC;
  const { month, day } = getMonthAndDay(event.startDate);
  const dateRangeStr = formatEventDate(event.startDate, event.endDate);

  return (
    <View
      style={[
        styles.bentoCard,
        { backgroundColor: catConfig.surfaceBg },
        highlight && styles.bentoCardHighlight,
      ]}
    >
      {/* Top Row: Date block + Category pill */}
      <View style={styles.bentoCardTop}>
        {/* Left Date Block */}
        <View style={[styles.bentoDateBlock, { backgroundColor: catConfig.bg }]}>
          <Text style={[styles.bentoDateMonth, { color: catConfig.text }]}>
            {month}
          </Text>
          <Text style={[styles.bentoDateDay, { color: catConfig.text }]}>
            {day}
          </Text>
        </View>

        {/* Right Header: Category Chip + Week */}
        <View style={styles.bentoCardRightCol}>
          <View style={styles.bentoCategoryRow}>
            <View
              style={[
                styles.bentoCategoryPill,
                { backgroundColor: catConfig.pillBg },
              ]}
            >
              <Feather
                name={catConfig.icon}
                size={11}
                color={catConfig.pillText}
              />
              <Text
                style={[
                  styles.bentoCategoryPillText,
                  { color: catConfig.pillText },
                ]}
              >
                {catConfig.label}
              </Text>
            </View>

            {event.weekNumber !== null && event.weekNumber !== undefined && (
              <View style={styles.bentoWeekChip}>
                <Text style={styles.bentoWeekChipText}>
                  WK {event.weekNumber}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.bentoDateRangeText}>{dateRangeStr}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.bentoEventTitle}>{event.title}</Text>

      {/* Description */}
      {event.description ? (
        <Text style={styles.bentoEventDesc} numberOfLines={2}>
          {event.description}
        </Text>
      ) : null}

      {/* Footer Chips (Remarks, Holiday, Actions) */}
      <View style={styles.bentoCardFooter}>
        <View style={styles.bentoRemarksGroup}>
          {event.isHoliday && (
            <View style={styles.holidayBadgePill}>
              <Feather name="sun" size={10} color="#047857" />
              <Text style={styles.holidayBadgePillText}>Holiday</Text>
            </View>
          )}

          {event.remarks ? (
            <View style={styles.remarksBadgePill}>
              <Feather name="info" size={10} color="#475569" />
              <Text style={styles.remarksBadgePillText}>{event.remarks}</Text>
            </View>
          ) : null}
        </View>

        {/* Optional Admin Action Buttons */}
        {(onEdit || onDelete) && (
          <View style={styles.adminActionGroup}>
            {onEdit && (
              <TouchableOpacity style={styles.adminIconBtn} onPress={onEdit}>
                <Feather
                  name="edit-2"
                  size={15}
                  color={BENTO_COLORS.deepNavy}
                />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity style={styles.adminIconBtn} onPress={onDelete}>
                <Feather name="trash" size={15} color="#ba1a1a" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: BENTO_COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    ...BENTO_COLORS.shadow,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  navSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  centerBox: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingLabel: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 6,
  },
  stateDesc: {
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  retryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BENTO_COLORS.pillRadius,
    marginTop: 16,
  },
  retryPillText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },

  // 1. Semester Hero Bento Card
  heroBentoCard: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 22,
    marginTop: 6,
    marginBottom: 16,
    ...BENTO_COLORS.shadow,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  heroWeekBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  heroWeekBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  heroTotalEventsText: {
    color: "#c1dcff",
    fontSize: 12,
    fontWeight: "600",
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 26,
    marginBottom: 4,
  },
  heroSemester: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 16,
  },
  heroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  heroDateRangeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroDateRangeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  heroStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#059669",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  heroStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },
  heroStatusText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },

  // 2. Category Filter Pills
  filterSection: {
    marginBottom: 16,
  },
  filterScroll: {
    gap: 8,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: BENTO_COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BENTO_COLORS.pillRadius,
    ...BENTO_COLORS.shadow,
  },
  categoryPillActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
  },
  categoryPillLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: BENTO_COLORS.deepNavy,
  },
  categoryPillLabelActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  categoryPillCount: {
    backgroundColor: BENTO_COLORS.background,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  categoryPillCountActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  categoryPillCountText: {
    fontSize: 11,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
  },
  categoryPillCountTextActive: {
    color: "#ffffff",
  },

  // Bento Section Layout
  bentoSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  clearFilterLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0369a1",
  },
  weekTagPill: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  weekTagPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0369a1",
  },
  examTagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  examTagPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#b45309",
  },
  deadlineTagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ffe4e6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  deadlineTagPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#be123c",
  },
  holidayTagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  holidayTagPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#047857",
  },
  milestoneSubtext: {
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
  },

  // Bento Event Card
  bentoCard: {
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 16,
    marginBottom: 10,
    ...BENTO_COLORS.shadow,
  },
  bentoCardHighlight: {},
  bentoCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  bentoDateBlock: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  bentoDateMonth: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  bentoDateDay: {
    fontSize: 16,
    fontWeight: "900",
  },
  bentoCardRightCol: {
    flex: 1,
  },
  bentoCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  bentoCategoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  bentoCategoryPillText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  bentoWeekChip: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bentoWeekChipText: {
    fontSize: 9,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
  },
  bentoDateRangeText: {
    fontSize: 12,
    fontWeight: "600",
    color: BENTO_COLORS.deepNavy,
  },
  bentoEventTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 4,
  },
  bentoEventDesc: {
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    lineHeight: 16,
    marginBottom: 6,
  },
  bentoCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  bentoRemarksGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  holidayBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#d1fae5",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  holidayBadgePillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#047857",
  },
  remarksBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  remarksBadgePillText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#475569",
  },
  adminActionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adminIconBtn: {
    padding: 4,
  },

  // Milestones Grid
  milestonesGrid: {
    gap: 8,
  },
  milestoneCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: BENTO_COLORS.white,
    padding: 12,
    borderRadius: 18,
    ...BENTO_COLORS.shadow,
  },
  milestoneDatePill: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneDay: {
    fontSize: 15,
    fontWeight: "800",
  },
  milestoneMonth: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  milestoneTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 2,
  },
  milestoneDateText: {
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
  },
});
