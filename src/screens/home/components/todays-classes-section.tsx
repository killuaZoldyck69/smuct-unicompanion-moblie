import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import {
  ClassRoutineItem,
  TodayStats,
  BENTO_COLORS,
  fontFamily,
} from "@/screens/schedule/constants";
import {
  getDeterministicColorTheme,
  formatTimeDisplay,
  isClassLiveNow,
} from "@/screens/schedule/utils";
import { LiveBeepDot } from "@/screens/schedule/components/live-beep-indicator";
import { shadows } from "@/theme/layout";

interface TodaysClassesSectionProps {
  classes: ClassRoutineItem[];
  stats?: TodayStats;
  liveClass?: ClassRoutineItem;
  nextClass?: ClassRoutineItem;
  isLoading?: boolean;
}

const formatSemester = (sem?: number | string | null): string | null => {
  if (sem === undefined || sem === null || sem === "") return null;
  const str = String(sem).trim();
  if (!str) return null;
  if (/^sem/i.test(str)) return str.toUpperCase();
  const num = parseInt(str, 10);
  if (!isNaN(num) && num > 0) {
    const j = num % 10;
    const k = num % 100;
    let suffix = "th";
    if (j === 1 && k !== 11) suffix = "st";
    else if (j === 2 && k !== 12) suffix = "nd";
    else if (j === 3 && k !== 13) suffix = "rd";
    return `${num}${suffix} Sem`;
  }
  return `${str} Sem`;
};

const formatSection = (sec?: string | null): string | null => {
  if (!sec) return null;
  const trimmed = sec.trim().toUpperCase();
  return trimmed.startsWith("SEC") ? trimmed : `SEC ${trimmed}`;
};

export const TodaysClassesSection = React.memo(
  function TodaysClassesSection({
    classes,
    stats,
    liveClass,
    nextClass,
    isLoading,
  }: TodaysClassesSectionProps) {
    const router = useRouter();

    const handleOpenLink = (url?: string | null) => {
      if (!url) return;
      const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
      Linking.openURL(formattedUrl).catch(() => {
        Alert.alert("Unable to open link", url);
      });
    };

    const countLabel =
      classes.length === 1 ? "1 CLASS" : `${classes.length} CLASSES`;

    return (
      <View style={styles.container}>
        {/* --- Header Row --- */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.titleGroup}>
            <Text style={styles.sectionTitle}>Today's Classes</Text>
            {liveClass ? (
              <View style={styles.liveIndicatorBadge}>
                <LiveBeepDot size={5} style={{ marginRight: 2 }} />
                <Text style={styles.liveIndicatorText}>LIVE NOW</Text>
              </View>
            ) : classes.length > 0 ? (
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{countLabel}</Text>
              </View>
            ) : (
              <View style={styles.freeDayPill}>
                <Feather
                  name="coffee"
                  size={10}
                  color="#059669"
                  style={{ marginRight: 3 }}
                />
                <Text style={styles.freeDayPillText}>FREE DAY</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.seeRoutineBtn}
            onPress={() => router.push("/(tabs)/my-schedule")}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="See full routine"
            activeOpacity={0.7}
          >
            <Text style={styles.seeRoutineText}>See Routine</Text>
            <Feather
              name="chevron-right"
              size={14}
              color="#1e3a8a"
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
        </View>

        {/* --- Content Area --- */}
        {isLoading ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonCard} />
            <View style={styles.skeletonCard} />
          </View>
        ) : classes.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconBox}>
              <Feather name="coffee" size={24} color="#059669" />
            </View>
            <Text style={styles.emptyCardTitle}>
              No classes scheduled for today
            </Text>
            <Text style={styles.emptyCardSub}>
              You're completely free today! Take time to rest or review your
              schedule.
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => router.push("/(tabs)/my-schedule")}
              activeOpacity={0.8}
            >
              <Feather
                name="calendar"
                size={13}
                color="#1e3a8a"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.emptyActionBtnText}>View Full Routine</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {classes.map((cls) => {
              const theme = getDeterministicColorTheme(
                cls.courseCode,
                cls.courseName
              );
              const isLive = cls.id === liveClass?.id;
              const isNext = !isLive && cls.id === nextClass?.id;
              const notice = cls.activeNotice;
              const isCancelled = notice?.type === "CANCELLED";
              const isRoomChange = notice?.type === "ROOM_CHANGE";
              const isOnline = notice?.type === "ONLINE_CLASS";
              const isTimeChange = notice?.type === "TIME_CHANGE";

              const formattedStart = formatTimeDisplay(cls.startTime);
              const formattedEnd = formatTimeDisplay(cls.endTime);
              const formattedSec = formatSection(cls.section);
              const formattedSem = formatSemester(cls.semester);

              const displayRoom =
                isRoomChange && notice?.newRoom ? notice.newRoom : cls.room;
              const formattedRoom = displayRoom
                ? displayRoom.toLowerCase().startsWith("room")
                  ? displayRoom
                  : `Room ${displayRoom}`
                : "Room TBA";

              const accentColor = isCancelled
                ? "#dc2626"
                : isLive
                  ? "#ef4444"
                  : isNext
                    ? "#0284c7"
                    : theme.accent;

              return (
                <TouchableOpacity
                  key={cls.id}
                  style={[
                    styles.classCard,
                    { borderLeftColor: accentColor },
                    isLive && styles.classCardLive,
                    isCancelled && styles.classCardCancelled,
                  ]}
                  onPress={() => router.push("/(tabs)/my-schedule")}
                  activeOpacity={0.85}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`${cls.courseCode}: ${cls.courseName}, from ${formattedStart} to ${formattedEnd}, ${formattedRoom}`}
                >
                  {/* Top Header Row: Status & Code & Duration */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.cardBadgeGroup}>
                      {isCancelled ? (
                        <View style={styles.cancelledBadge}>
                          <Text style={styles.cancelledBadgeText}>
                            CANCELLED
                          </Text>
                        </View>
                      ) : isLive ? (
                        <View style={styles.liveBadge}>
                          <LiveBeepDot size={5} style={{ marginRight: 2 }} />
                          <Text style={styles.liveBadgeText}>LIVE NOW</Text>
                        </View>
                      ) : isNext ? (
                        <View style={styles.nextBadge}>
                          <Text style={styles.nextBadgeText}>NEXT CLASS</Text>
                        </View>
                      ) : null}

                      {/* Course Code Pill */}
                      <View
                        style={[
                          styles.codePill,
                          { backgroundColor: theme.codePillBg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.codeText,
                            { color: theme.codePillText },
                          ]}
                        >
                          {cls.courseCode}
                        </Text>
                      </View>
                    </View>

                    {cls.duration ? (
                      <View style={styles.durationChip}>
                        <Feather
                          name="clock"
                          size={10.5}
                          color={BENTO_COLORS.subtleText}
                          style={{ marginRight: 3.5 }}
                        />
                        <Text style={styles.durationText}>{cls.duration}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Time Interval Row */}
                  <View style={styles.timeRow}>
                    <Feather
                      name="clock"
                      size={12.5}
                      color={accentColor}
                      style={{ marginRight: 5 }}
                    />
                    <Text
                      style={[
                        styles.timeMainText,
                        isCancelled && styles.timeStrikethrough,
                      ]}
                    >
                      {formattedStart}
                    </Text>
                    <Text style={styles.timeSeparatorText}>→</Text>
                    <Text
                      style={[
                        styles.timeSecondaryText,
                        isCancelled && styles.timeStrikethrough,
                      ]}
                    >
                      {formattedEnd}
                    </Text>

                    {isTimeChange && notice?.newTime && (
                      <View style={styles.rescheduledBadge}>
                        <Text style={styles.rescheduledBadgeText}>
                          Now {notice.newTime}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Course Title + Inline Badges (Semester & Section) */}
                  <View style={styles.courseTitleWrapper}>
                    <Text style={styles.courseTitleText} numberOfLines={2}>
                      {cls.courseName}
                    </Text>
                    {(formattedSem || formattedSec) && (
                      <View style={styles.courseMetaInline}>
                        {formattedSem && (
                          <View style={styles.semesterBadge}>
                            <Feather
                              name="award"
                              size={9.5}
                              color="#0284c7"
                              style={{ marginRight: 2.5 }}
                            />
                            <Text style={styles.semesterBadgeText}>
                              {formattedSem}
                            </Text>
                          </View>
                        )}
                        {formattedSec && (
                          <View style={styles.sectionBadge}>
                            <Feather
                              name="layers"
                              size={9.5}
                              color="#6d28d9"
                              style={{ marginRight: 2.5 }}
                            />
                            <Text style={styles.sectionBadgeText}>
                              {formattedSec}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  {/* Notice Ribbon (If room changed, online, cancelled, etc.) */}
                  {notice && (
                    <View
                      style={[
                        styles.noticeBanner,
                        isCancelled && styles.noticeBannerCancelled,
                        isRoomChange && styles.noticeBannerRoom,
                        isOnline && styles.noticeBannerOnline,
                      ]}
                    >
                      <Feather
                        name={
                          isCancelled
                            ? "slash"
                            : isRoomChange
                              ? "map-pin"
                              : isOnline
                                ? "video"
                                : "alert-circle"
                        }
                        size={11}
                        color={
                          isCancelled
                            ? "#dc2626"
                            : isRoomChange
                              ? "#b45309"
                              : isOnline
                                ? "#0284c7"
                                : "#475569"
                        }
                        style={{ marginRight: 5 }}
                      />
                      <Text
                        style={[
                          styles.noticeBannerText,
                          isCancelled && styles.noticeTextCancelled,
                          isRoomChange && styles.noticeTextRoom,
                          isOnline && styles.noticeTextOnline,
                        ]}
                        numberOfLines={1}
                      >
                        {isCancelled
                          ? "Class Cancelled Today"
                          : isRoomChange
                            ? `Room: ${notice.newRoom || "Changed"}`
                            : isOnline
                              ? "Held Online Today"
                              : notice.title || "Notice"}
                      </Text>

                      {isOnline && notice.meetUrl && (
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleOpenLink(notice.meetUrl);
                          }}
                          style={styles.meetBtn}
                          activeOpacity={0.8}
                        >
                          <Feather
                            name="external-link"
                            size={9.5}
                            color="#ffffff"
                            style={{ marginRight: 3 }}
                          />
                          <Text style={styles.meetBtnText}>Join</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* Footer Row: Room & Teacher Name */}
                  <View style={styles.cardFooterRow}>
                    <View
                      style={[
                        styles.roomPill,
                        isRoomChange && styles.roomPillChanged,
                      ]}
                    >
                      <Feather
                        name="map-pin"
                        size={11.5}
                        color={isRoomChange ? "#b45309" : "#0284c7"}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.roomPillText,
                          isRoomChange && styles.roomPillTextChanged,
                        ]}
                        numberOfLines={1}
                      >
                        {formattedRoom}
                      </Text>
                    </View>

                    <View style={styles.teacherPill}>
                      <Feather
                        name="user"
                        size={11.5}
                        color="#475569"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.teacherPillText} numberOfLines={1}>
                        {cls.teacherName || "Instructor TBA"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 20,
    color: "#131b2e",
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  liveIndicatorBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  liveIndicatorText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#b91c1c",
    letterSpacing: 0.4,
  },
  countPill: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  countPillText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 0.4,
  },
  freeDayPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#d1fae5",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  freeDayPillText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#059669",
    letterSpacing: 0.4,
  },
  seeRoutineBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingLeft: 8,
  },
  seeRoutineText: {
    fontFamily,
    fontSize: 13.5,
    color: "#1e3a8a",
    fontWeight: "700",
  },

  // Skeleton
  skeletonContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 14,
  },
  skeletonCard: {
    width: 270,
    height: 160,
    backgroundColor: "#f1f5f9",
    borderRadius: 18,
  },

  // Empty State
  emptyCard: {
    marginHorizontal: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...shadows.level1,
  },
  emptyIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  emptyCardTitle: {
    fontFamily,
    fontSize: 15.5,
    color: "#131b2e",
    fontWeight: "800",
    marginBottom: 5,
    textAlign: "center",
  },
  emptyCardSub: {
    fontFamily,
    fontSize: 12.5,
    color: "#64748b",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 14,
    maxWidth: 280,
  },
  emptyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  emptyActionBtnText: {
    fontFamily,
    fontSize: 12.5,
    color: "#1e3a8a",
    fontWeight: "700",
  },

  // Carousel
  horizontalList: {
    paddingHorizontal: 20,
    gap: 14,
    paddingBottom: 4,
  },
  classCard: {
    width: 280,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  classCardLive: {
    backgroundColor: "#fffdfd",
    borderColor: "rgba(239, 68, 68, 0.25)",
  },
  classCardCancelled: {
    backgroundColor: "#fffafa",
    borderColor: "rgba(239, 68, 68, 0.25)",
  },

  // Card Header Row
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  cardBadgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
    flex: 1,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  liveBadgeText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: "#b91c1c",
    letterSpacing: 0.4,
  },
  nextBadge: {
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  nextBadgeText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: "#0369a1",
    letterSpacing: 0.4,
  },
  cancelledBadge: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  cancelledBadgeText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: "#dc2626",
    letterSpacing: 0.4,
  },
  codePill: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  codeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  durationChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  durationText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },

  // Time Row
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  timeMainText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  timeSeparatorText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: "#94a3b8",
    marginHorizontal: 5,
  },
  timeSecondaryText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "600",
    color: "#475569",
  },
  timeStrikethrough: {
    textDecorationLine: "line-through",
    color: "#94a3b8",
  },
  rescheduledBadge: {
    backgroundColor: "#f5f3ff",
    borderWidth: 1,
    borderColor: "#ddd6fe",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginLeft: 6,
  },
  rescheduledBadgeText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#6d28d9",
  },

  // Course Title & Inline Badges
  courseTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    rowGap: 4,
    columnGap: 5,
    marginBottom: 8,
  },
  courseTitleText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    lineHeight: 19,
    flexShrink: 1,
  },
  courseMetaInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  semesterBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    paddingHorizontal: 5.5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  semesterBadgeText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#0284c7",
    letterSpacing: 0.2,
  },
  sectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f3ff",
    borderWidth: 1,
    borderColor: "#ddd6fe",
    paddingHorizontal: 5.5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  sectionBadgeText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#6d28d9",
    letterSpacing: 0.2,
  },

  // Notice Banner
  noticeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    marginBottom: 8,
  },
  noticeBannerCancelled: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  noticeBannerRoom: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  noticeBannerOnline: {
    backgroundColor: "#f0f9ff",
    borderColor: "#bae6fd",
  },
  noticeBannerText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
    color: "#475569",
    flex: 1,
  },
  noticeTextCancelled: {
    color: "#dc2626",
  },
  noticeTextRoom: {
    color: "#b45309",
  },
  noticeTextOnline: {
    color: "#0284c7",
  },
  meetBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0284c7",
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
    marginLeft: 6,
  },
  meetBtnText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#ffffff",
  },

  // Card Footer Row
  cardFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    paddingTop: 8,
  },
  roomPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#e0f2fe",
    paddingHorizontal: 6.5,
    paddingVertical: 3.5,
    borderRadius: 5,
    flexShrink: 1,
    maxWidth: "50%",
  },
  roomPillChanged: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  roomPillText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
    color: "#0284c7",
  },
  roomPillTextChanged: {
    color: "#b45309",
  },
  teacherPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    paddingHorizontal: 6.5,
    paddingVertical: 3.5,
    borderRadius: 5,
    flexShrink: 1,
    maxWidth: "50%",
  },
  teacherPillText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
    color: "#475569",
  },
});
