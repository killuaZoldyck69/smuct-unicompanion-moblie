import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  RefreshControl,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import api from "@/services/api";

// ==================================================
// 1. SOFT CAMPUS BENTO DESIGN SYSTEM CONSTANTS
// ==================================================
const BENTO_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  cardRadius: 24,
  pillRadius: 9999,
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  heroShadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 6,
  },
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

// Helper to convert "10:30 AM" or "14:49" to minutes for chronological sorting
const timeToMinutes = (timeStr: string) => {
  if (!timeStr || timeStr === "TBA") return 0;
  try {
    const parts = timeStr.trim().split(" ");
    const time = parts[0];
    const modifier = parts[1];
    const [hours, minutes] = time.split(":");
    let h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    if (modifier) {
      if (h === 12 && modifier.toUpperCase() === "AM") h = 0;
      if (h !== 12 && modifier.toUpperCase() === "PM") h += 12;
    }

    return h * 60 + m;
  } catch {
    return 0;
  }
};

interface ExamItem {
  id: string;
  courseCode: string;
  courseName: string;
  type: string; // "Midterm" or "Final"
  date: string; // "YYYY-MM-DD"
  time: string;
  room: string;
  sortDate: number;
  sortTime: number;
  isToday: boolean;
}

// ==================================================
// 2. MAIN COMPONENT
// ==================================================
export default function ExamRoutineScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "MIDTERM" | "FINAL">("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch my joined hubs
  const {
    data: myHubs,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["myHubs"],
    queryFn: async () => {
      const response = await api.get("/hubs/my");
      return response.data?.data || [];
    },
  });

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Parse and group the exam data chronologically
  const { allExamsList, groupedSections, midtermCount, finalCount, nextExam } = useMemo(() => {
    if (!myHubs || myHubs.length === 0) {
      return {
        allExamsList: [],
        groupedSections: [],
        midtermCount: 0,
        finalCount: 0,
        nextExam: null as ExamItem | null,
      };
    }

    const exams: ExamItem[] = [];
    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Extract all exams from active hubs
    myHubs.forEach((membership: any) => {
      const hub = membership.hub;
      if (!hub || hub.isArchived) return;

      let examsArray = hub.termExams;
      if (typeof examsArray === "string") {
        try {
          examsArray = JSON.parse(examsArray);
        } catch {
          examsArray = [];
        }
      }

      if (Array.isArray(examsArray)) {
        examsArray.forEach((exam: any) => {
          if (exam.date) {
            exams.push({
              id: `${hub.id}-${exam.type}`,
              courseCode: hub.courseCode,
              courseName: hub.courseName,
              type: exam.type || "Exam",
              date: exam.date,
              time: exam.time || "TBA",
              room: exam.room || "TBA",
              sortDate: new Date(`${exam.date}T00:00:00`).getTime(),
              sortTime: timeToMinutes(exam.time),
              isToday: exam.date === todayStr,
            });
          }
        });
      }
    });

    // 2. Sort chronologically
    exams.sort((a, b) => {
      if (a.sortDate !== b.sortDate) return a.sortDate - b.sortDate;
      return a.sortTime - b.sortTime;
    });

    let mCount = 0;
    let fCount = 0;
    exams.forEach((ex) => {
      if (ex.type.toLowerCase().includes("mid")) mCount++;
      else if (ex.type.toLowerCase().includes("fin")) fCount++;
    });

    // Next upcoming exam
    const nowTimestamp = new Date().setHours(0, 0, 0, 0);
    const upcoming = exams.find((ex) => ex.sortDate >= nowTimestamp) || exams[0] || null;

    // 3. Filter by type
    const filtered = exams.filter((ex) => {
      if (selectedFilter === "MIDTERM") return ex.type.toLowerCase().includes("mid");
      if (selectedFilter === "FINAL") return ex.type.toLowerCase().includes("fin");
      return true;
    });

    // 4. Group by date
    const groupedMap = new Map<string, ExamItem[]>();
    filtered.forEach((exam) => {
      const dateHeader = new Date(exam.sortDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      if (!groupedMap.has(dateHeader)) {
        groupedMap.set(dateHeader, []);
      }
      groupedMap.get(dateHeader)!.push(exam);
    });

    const sections = Array.from(groupedMap, ([date, items]) => ({
      date,
      items,
      isToday: items.some((i) => i.isToday),
    }));

    return {
      allExamsList: exams,
      groupedSections: sections,
      midtermCount: mCount,
      finalCount: fCount,
      nextExam: upcoming,
    };
  }, [myHubs, selectedFilter]);

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerIconButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={BENTO_COLORS.deepNavy} />
        </TouchableOpacity>

        <View style={styles.headerTitlesContainer}>
          <Text style={styles.screenTitle}>Exam Routines</Text>
          <Text style={styles.screenSubtitle}>Upcoming Midterms & Finals</Text>
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
        {/* --- 1. HERO BENTO CARD --- */}
        <View style={styles.heroBentoCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTagPill}>
              <Text style={styles.heroTagText}>EXAMINATION SCHEDULE</Text>
            </View>
            {nextExam && (
              <View style={styles.nextExamPill}>
                <View style={styles.pulseDot} />
                <Text style={styles.nextExamText}>
                  Next: {nextExam.courseCode}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.heroTitle}>
            {allExamsList.length > 0
              ? `${allExamsList.length} Exams Scheduled`
              : "No Scheduled Exams"}
          </Text>

          <Text style={styles.heroSubtitle}>
            {nextExam
              ? `Next upcoming ${nextExam.type.toLowerCase()} is on ${new Date(
                  nextExam.sortDate
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })} at ${nextExam.time}.`
              : "Review your upcoming examination timetable, exam halls, and room allocations."}
          </Text>

          {/* Quick Stats Overview */}
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{allExamsList.length}</Text>
              <Text style={styles.heroStatLabel}>Total Exams</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{midtermCount}</Text>
              <Text style={styles.heroStatLabel}>Midterms</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{finalCount}</Text>
              <Text style={styles.heroStatLabel}>Finals</Text>
            </View>
          </View>
        </View>

        {/* --- 2. FILTER PILLS --- */}
        <View style={styles.filterPillsRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedFilter === "ALL" && styles.filterPillActive,
            ]}
            onPress={() => setSelectedFilter("ALL")}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Show all exams"
          >
            <Text
              style={[
                styles.filterPillText,
                selectedFilter === "ALL" && styles.filterPillTextActive,
              ]}
            >
              All Exams ({allExamsList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedFilter === "MIDTERM" && styles.filterPillActive,
            ]}
            onPress={() => setSelectedFilter("MIDTERM")}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Show midterms only"
          >
            <Text
              style={[
                styles.filterPillText,
                selectedFilter === "MIDTERM" && styles.filterPillTextActive,
              ]}
            >
              Midterms ({midtermCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedFilter === "FINAL" && styles.filterPillActive,
            ]}
            onPress={() => setSelectedFilter("FINAL")}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Show finals only"
          >
            <Text
              style={[
                styles.filterPillText,
                selectedFilter === "FINAL" && styles.filterPillTextActive,
              ]}
            >
              Finals ({finalCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* --- 3. EXAM CONTENT --- */}
        {isLoading ? (
          // Bento Skeleton Loaders
          <View style={styles.stateContainer}>
            <View style={styles.skeletonCard}>
              <View style={styles.skeletonRow}>
                <View style={styles.skeletonTimePill} />
                <View style={styles.skeletonTypePill} />
              </View>
              <View style={styles.skeletonTitleBar} />
              <View style={[styles.skeletonTitleBar, { width: "60%" }]} />
              <View style={styles.skeletonRoomBar} />
            </View>
            <View style={[styles.skeletonCard, { marginTop: 14 }]}>
              <View style={styles.skeletonRow}>
                <View style={styles.skeletonTimePill} />
                <View style={styles.skeletonTypePill} />
              </View>
              <View style={styles.skeletonTitleBar} />
              <View style={[styles.skeletonTitleBar, { width: "50%" }]} />
              <View style={styles.skeletonRoomBar} />
            </View>
          </View>
        ) : isError ? (
          // Bento Error State
          <View style={styles.errorBentoCard}>
            <View style={styles.errorIconCircle}>
              <Feather name="alert-circle" size={32} color="#ba1a1a" />
            </View>
            <Text style={styles.errorTitle}>Failed to Load Exams</Text>
            <Text style={styles.errorDesc}>
              An error occurred while retrieving your exam routines. Please try
              again.
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => refetch()}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Retry loading exam routines"
            >
              <Feather
                name="refresh-cw"
                size={14}
                color="#ffffff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : groupedSections.length === 0 ? (
          // Friendly Bento Empty State
          <View style={styles.emptyBentoCard}>
            <View style={styles.emptyIconCircle}>
              <Feather name="award" size={36} color={BENTO_COLORS.subtleText} />
            </View>
            <Text style={styles.emptyTitle}>No Exams Scheduled</Text>
            <Text style={styles.emptyDesc}>
              Your instructors have not published any exam schedules for your
              enrolled courses yet.
            </Text>
            {selectedFilter !== "ALL" && (
              <TouchableOpacity
                style={styles.emptyResetBtn}
                onPress={() => setSelectedFilter("ALL")}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Show all exams"
              >
                <Text style={styles.emptyResetBtnText}>View All Exams</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          // Grouped Sections List
          groupedSections.map((section, sIndex) => (
            <View key={sIndex} style={styles.sectionContainer}>
              {/* Section Header */}
              <View style={styles.dateHeaderRow}>
                <View style={styles.dateBadge}>
                  <Feather
                    name="calendar"
                    size={12}
                    color={section.isToday ? "#dc2626" : BENTO_COLORS.deepNavy}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.dateHeaderText,
                      section.isToday && styles.dateHeaderTextToday,
                    ]}
                  >
                    {section.date.toUpperCase()}
                  </Text>
                </View>
                {section.isToday && (
                  <View style={styles.todayPill}>
                    <Text style={styles.todayPillText}>TODAY</Text>
                  </View>
                )}
              </View>

              {/* Exam Bento Cards in Section */}
              <View style={styles.cardsWrapper}>
                {section.items.map((exam) => {
                  const isFinal = exam.type.toLowerCase().includes("fin");

                  return (
                    <View key={exam.id} style={styles.examCard}>
                      {/* Top Row: Time & Type Badge */}
                      <View style={styles.cardHeaderRow}>
                        <View style={styles.timeBadge}>
                          <Feather
                            name="clock"
                            size={12}
                            color={BENTO_COLORS.deepNavy}
                            style={{ marginRight: 5 }}
                          />
                          <Text style={styles.timeText}>{exam.time}</Text>
                        </View>

                        <View
                          style={[
                            styles.typeBadge,
                            isFinal
                              ? styles.typeBadgeFinal
                              : styles.typeBadgeMidterm,
                          ]}
                        >
                          <Text
                            style={[
                              styles.typeBadgeText,
                              isFinal
                                ? styles.typeBadgeTextFinal
                                : styles.typeBadgeTextMidterm,
                            ]}
                          >
                            {exam.type.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      {/* Course Code & Name */}
                      <View style={styles.courseCodeRow}>
                        <View style={styles.courseCodePill}>
                          <Text style={styles.courseCodeText}>
                            {exam.courseCode}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.courseNameText} numberOfLines={2}>
                        {exam.courseName}
                      </Text>

                      {/* Divider */}
                      <View style={styles.cardDivider} />

                      {/* Bottom Footer: Location Room Pill */}
                      <View style={styles.cardFooterRow}>
                        <View style={styles.roomPill}>
                          <Feather
                            name="map-pin"
                            size={12}
                            color={BENTO_COLORS.subtleText}
                            style={{ marginRight: 5 }}
                          />
                          <Text style={styles.roomPillText}>
                            Room: {exam.room}
                          </Text>
                        </View>

                        <View style={styles.hallTicketNote}>
                          <Feather
                            name="shield"
                            size={12}
                            color={BENTO_COLORS.subtleText}
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.hallTicketText}>ID Required</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ==================================================
// 3. STYLES
// ==================================================
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
    ...BENTO_COLORS.shadow,
  },
  headerTitlesContainer: {
    marginLeft: 14,
    flex: 1,
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

  // --- HERO BENTO CARD ---
  heroBentoCard: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
    ...BENTO_COLORS.heroShadow,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  heroTagPill: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  heroTagText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.8,
  },
  nextExamPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(193, 220, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#60a5fa",
  },
  nextExamText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#c1dcff",
  },
  heroTitle: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.72)",
    lineHeight: 18,
    marginBottom: 18,
  },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
    paddingTop: 14,
  },
  heroStatItem: {
    alignItems: "center",
    flex: 1,
  },
  heroStatValue: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
  },
  heroStatLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#c1dcff",
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },

  // --- FILTER PILLS ---
  filterPillsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    ...BENTO_COLORS.shadow,
  },
  filterPillActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
  },
  filterPillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
  },
  filterPillTextActive: {
    color: "#ffffff",
  },

  // --- SECTION & CARDS ---
  sectionContainer: {
    marginBottom: 20,
  },
  dateHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateHeaderText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: 0.4,
  },
  dateHeaderTextToday: {
    color: "#dc2626",
  },
  todayPill: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  todayPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#dc2626",
    letterSpacing: 0.3,
  },

  cardsWrapper: {
    gap: 12,
  },
  examCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    ...BENTO_COLORS.shadow,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  timeText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  typeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  typeBadgeMidterm: {
    backgroundColor: "#fef3c7",
  },
  typeBadgeFinal: {
    backgroundColor: "#ffe4e6",
  },
  typeBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  typeBadgeTextMidterm: {
    color: "#b45309",
  },
  typeBadgeTextFinal: {
    color: "#be123c",
  },

  courseCodeRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  courseCodePill: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  courseCodeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#0284c7",
    letterSpacing: 0.3,
  },
  courseNameText: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    lineHeight: 23,
    marginBottom: 14,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginBottom: 12,
  },
  cardFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  roomPillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
  },
  hallTicketNote: {
    flexDirection: "row",
    alignItems: "center",
  },
  hallTicketText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },

  // --- SKELETON LOADING ---
  stateContainer: {
    paddingVertical: 8,
  },
  skeletonCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    ...BENTO_COLORS.shadow,
  },
  skeletonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  skeletonTimePill: {
    width: 80,
    height: 22,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: "#edf2f7",
  },
  skeletonTypePill: {
    width: 60,
    height: 22,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: "#edf2f7",
  },
  skeletonTitleBar: {
    width: "80%",
    height: 18,
    borderRadius: 6,
    backgroundColor: "#e2e8f0",
    marginBottom: 8,
  },
  skeletonRoomBar: {
    width: 100,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#edf2f7",
    marginTop: 10,
  },

  // --- EMPTY & ERROR STATES ---
  emptyBentoCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 34,
    alignItems: "center",
    marginTop: 10,
    ...BENTO_COLORS.shadow,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 6,
    textAlign: "center",
  },
  emptyDesc: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  emptyResetBtn: {
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  emptyResetBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },

  errorBentoCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 34,
    alignItems: "center",
    marginTop: 10,
    ...BENTO_COLORS.shadow,
  },
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  errorTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 6,
    textAlign: "center",
  },
  errorDesc: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  retryBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
