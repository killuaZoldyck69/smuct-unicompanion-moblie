import React from "react";
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
} from "@/screens/schedule/constants";
import {
  getDeterministicColorTheme,
  formatTimeDisplay,
} from "@/screens/schedule/utils";
import { LiveBeepDot } from "@/screens/schedule/components/live-beep-indicator";
import { UserRole } from "@/types/auth";
import { colors } from "@/theme/colors";
import { shadows } from "@/theme/layout";
import { FONT_FAMILIES } from "@/theme/typography";
import {
  parseSemesterDisplay,
  SemesterDisplayParts,
} from "@/utils/academic-ordinal";

interface TodaysClassesSectionProps {
  classes: ClassRoutineItem[];
  stats?: TodayStats;
  liveClass?: ClassRoutineItem;
  nextClass?: ClassRoutineItem;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  userRole?: UserRole;
}

const SemesterOrdinalText = ({
  parts,
  baseStyle,
  supStyle,
}: {
  parts: SemesterDisplayParts;
  baseStyle: any;
  supStyle: any;
}) => (
  <View style={styles.semesterOrdinalRow}>
    <Text style={baseStyle}>{parts.numberPart}</Text>
    {!!parts.suffix && <Text style={supStyle}>{parts.suffix}</Text>}
    <Text style={baseStyle}>{parts.trailingText}</Text>
  </View>
);

const formatSection = (sec?: string | null): string | null => {
  if (!sec) return null;
  const trimmed = sec.trim().toUpperCase();
  return trimmed.startsWith("SEC") ? trimmed : `SEC ${trimmed}`;
};

export const TodaysClassesSection = React.memo(
  function TodaysClassesSection({
    classes,
    liveClass,
    nextClass,
    isLoading,
    isError,
    onRetry,
    userRole,
  }: TodaysClassesSectionProps) {
    const router = useRouter();

    const handleOpenLink = (url?: string | null) => {
      if (!url) return;
      const trimmed = url.trim();
      if (!trimmed) return;

      const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;

      try {
        const parsed = new URL(candidate);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
          Alert.alert("Invalid link", "Only HTTP and HTTPS class links are supported.");
          return;
        }
        Linking.openURL(parsed.toString()).catch(() => {
          Alert.alert("Unable to open link", trimmed);
        });
      } catch {
        Alert.alert("Invalid link", "Could not open the class meeting URL.");
      }
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
            ) : !isLoading && !isError ? (
              <View style={styles.freeDayPill}>
                <Feather
                  name="coffee"
                  size={10}
                  color={colors.semantic.emerald.accent}
                  style={{ marginRight: 3 }}
                />
                <Text style={styles.freeDayPillText}>FREE DAY</Text>
              </View>
            ) : null}
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
          </TouchableOpacity>
        </View>

        {/* --- Content Area --- */}
        {isLoading ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonCard} />
            <View style={styles.skeletonCard} />
          </View>
        ) : isError && classes.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={[styles.emptyIconBox, styles.emptyErrorIconBox]}>
              <Feather
                name="wifi-off"
                size={22}
                color={colors.semantic.red.accent}
              />
            </View>
            <Text style={styles.emptyCardTitle}>
              Unable to load today&apos;s classes
            </Text>
            <Text style={styles.emptyCardSub}>
              We couldn&apos;t refresh your schedule right now. Check your connection and try again.
            </Text>
            {onRetry && (
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={onRetry}
                activeOpacity={0.8}
              >
                <Feather
                  name="refresh-cw"
                  size={13}
                  color={colors.semantic.blue.deep}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.emptyActionBtnText}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : classes.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconBox}>
              <Feather
                name="coffee"
                size={24}
                color={colors.semantic.emerald.accent}
              />
            </View>
            <Text style={styles.emptyCardTitle}>
              No classes scheduled for today
            </Text>
            <Text style={styles.emptyCardSub}>
              {userRole === "TEACHER"
                ? "You have no lectures scheduled today. View your weekly teaching routine."
                : "You're completely free today! Take time to rest or review your schedule."}
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => router.push("/(tabs)/my-schedule")}
              activeOpacity={0.8}
            >
              <Feather
                name="calendar"
                size={13}
                color={colors.semantic.blue.deep}
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
              const semesterParts = parseSemesterDisplay(cls.semester);

              const displayRoom =
                isRoomChange && notice?.newRoom ? notice.newRoom : cls.room;
              const formattedRoom = displayRoom
                ? displayRoom.toLowerCase().startsWith("room")
                  ? displayRoom
                  : `Room ${displayRoom}`
                : "Room TBA";

              const accentColor = isCancelled
                ? colors.semantic.red.accent
                : isLive
                  ? colors.semantic.red.solid
                  : isNext
                    ? colors.semantic.sky.accent
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
                          color={colors.slate500}
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
                    {(semesterParts || formattedSec) && (
                      <View style={styles.courseMetaInline}>
                        {semesterParts && (
                          <View
                            style={styles.semesterBadge}
                            accessible={true}
                            accessibilityLabel={`Semester: ${semesterParts.accessibilityLabel}`}
                          >
                            <Feather
                              name="award"
                              size={10}
                              color={colors.semantic.sky.accent}
                              style={{ marginRight: 3 }}
                            />
                            <SemesterOrdinalText
                              parts={semesterParts}
                              baseStyle={styles.semesterBadgeText}
                              supStyle={styles.semesterBadgeSupText}
                            />
                          </View>
                        )}
                        {formattedSec && (
                          <View style={styles.sectionBadge}>
                            <Feather
                              name="layers"
                              size={10}
                              color={colors.semantic.violet.deep}
                              style={{ marginRight: 3 }}
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
                            ? colors.semantic.red.accent
                            : isRoomChange
                              ? colors.semantic.amber.deep
                              : isOnline
                                ? colors.semantic.sky.accent
                                : colors.slate600
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
                              : notice.message || "Class Notice"}
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
                            color={colors.white}
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
                        color={
                          isRoomChange
                            ? colors.semantic.amber.deep
                            : colors.semantic.sky.accent
                        }
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
                        name={
                          userRole === "TEACHER" || cls.userRole === "TEACHER"
                            ? "users"
                            : "user"
                        }
                        size={11.5}
                        color={colors.slate600}
                        style={{ marginRight: 4 }}
                      />
                      {userRole === "TEACHER" || cls.userRole === "TEACHER" ? (
                        semesterParts ? (
                          <View
                            style={styles.teacherCohortContent}
                            accessible={true}
                            accessibilityLabel={
                              formattedSec
                                ? `${semesterParts.accessibilityLabel}, ${formattedSec}`
                                : semesterParts.accessibilityLabel
                            }
                          >
                            <SemesterOrdinalText
                              parts={semesterParts}
                              baseStyle={styles.teacherPillText}
                              supStyle={styles.teacherPillSupText}
                            />
                            {formattedSec ? (
                              <Text
                                style={[
                                  styles.teacherPillText,
                                  styles.teacherSecText,
                                ]}
                                numberOfLines={1}
                              >
                                {" · "}
                                {formattedSec}
                              </Text>
                            ) : null}
                          </View>
                        ) : (
                          <Text style={styles.teacherPillText} numberOfLines={1}>
                            {formattedSec || "Teaching Session"}
                          </Text>
                        )
                      ) : (
                        <Text style={styles.teacherPillText} numberOfLines={1}>
                          {cls.teacherName || "Instructor TBA"}
                        </Text>
                      )}
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
    marginTop: 26,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
    gap: 8,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILIES.titleBold,
    fontSize: 19,
    color: colors.navyDeep,
    fontWeight: "700",
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  liveIndicatorBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.semantic.red.tint,
    borderWidth: 1,
    borderColor: colors.semantic.red.border,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveIndicatorText: {
    fontFamily: FONT_FAMILIES.bodyExtraBold,
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 13,
    color: colors.semantic.red.deep,
    letterSpacing: 0.45,
    includeFontPadding: false,
  },
  countPill: {
    backgroundColor: colors.slate100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  countPillText: {
    fontFamily: FONT_FAMILIES.bodyExtraBold,
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 13,
    color: colors.slate600,
    letterSpacing: 0.45,
    includeFontPadding: false,
  },
  freeDayPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.semantic.emerald.tint,
    borderWidth: 1,
    borderColor: colors.semantic.emerald.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  freeDayPillText: {
    fontFamily: FONT_FAMILIES.bodyExtraBold,
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 13,
    color: colors.semantic.emerald.accent,
    letterSpacing: 0.45,
    includeFontPadding: false,
  },
  seeRoutineBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingLeft: 8,
  },
  seeRoutineText: {
    fontFamily: FONT_FAMILIES.bodyBold,
    fontSize: 13.5,
    lineHeight: 18,
    color: colors.semantic.blue.deep,
    fontWeight: "700",
  },

  // Skeleton
  skeletonContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 14,
  },
  skeletonCard: {
    width: 280,
    height: 164,
    backgroundColor: colors.slate100,
    borderRadius: 18,
  },

  // Empty State
  emptyCard: {
    marginHorizontal: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.level1,
  },
  emptyIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.semantic.emerald.tint,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.semantic.emerald.border,
  },
  emptyErrorIconBox: {
    backgroundColor: colors.semantic.red.tint,
    borderColor: colors.semantic.red.border,
  },
  emptyCardTitle: {
    fontFamily: FONT_FAMILIES.titleBold,
    fontSize: 15.5,
    lineHeight: 21,
    color: colors.navyDeep,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  emptyCardSub: {
    fontFamily: FONT_FAMILIES.bodyMedium,
    fontSize: 13,
    color: colors.slate500,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 14,
    maxWidth: 280,
  },
  emptyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.semantic.blue.tint,
    borderWidth: 1,
    borderColor: colors.semantic.blue.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyActionBtnText: {
    fontFamily: FONT_FAMILIES.bodyBold,
    fontSize: 13,
    lineHeight: 17,
    color: colors.semantic.blue.deep,
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
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
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
    backgroundColor: colors.semantic.red.liveSurface,
    borderColor: colors.semantic.red.alpha25,
  },
  classCardCancelled: {
    backgroundColor: colors.semantic.red.cancelledSurface,
    borderColor: colors.semantic.red.alpha25,
  },

  // Card Header Row
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  cardBadgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    flex: 1,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.semantic.red.tint,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.semantic.red.border,
  },
  liveBadgeText: {
    fontFamily: FONT_FAMILIES.bodyExtraBold,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: colors.semantic.red.deep,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  nextBadge: {
    backgroundColor: colors.semantic.sky.tint,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.semantic.sky.border,
  },
  nextBadgeText: {
    fontFamily: FONT_FAMILIES.bodyExtraBold,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: colors.semantic.sky.deep,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  cancelledBadge: {
    backgroundColor: colors.semantic.red.tint,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.semantic.red.borderStrong,
  },
  cancelledBadgeText: {
    fontFamily: FONT_FAMILIES.bodyExtraBold,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: colors.semantic.red.accent,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  codePill: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  codeText: {
    fontFamily: FONT_FAMILIES.bodyExtraBold,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 0.35,
    includeFontPadding: false,
  },
  durationChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slate50,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.slate100,
  },
  durationText: {
    fontFamily: FONT_FAMILIES.bodySemiBold,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "600",
    color: colors.slate500,
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },

  // Time Row
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  timeMainText: {
    fontFamily: FONT_FAMILIES.bodyExtraBold,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    color: colors.navyDeep,
    fontVariant: ["tabular-nums"],
  },
  timeSeparatorText: {
    fontFamily: FONT_FAMILIES.bodySemiBold,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: colors.slate400,
    marginHorizontal: 5,
  },
  timeSecondaryText: {
    fontFamily: FONT_FAMILIES.bodySemiBold,
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: "600",
    color: colors.slate600,
    fontVariant: ["tabular-nums"],
  },
  timeStrikethrough: {
    textDecorationLine: "line-through",
    color: colors.slate400,
  },
  rescheduledBadge: {
    backgroundColor: colors.semantic.violet.tint,
    borderWidth: 1,
    borderColor: colors.semantic.violet.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  rescheduledBadgeText: {
    fontFamily: FONT_FAMILIES.bodyExtraBold,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: colors.semantic.violet.deep,
    includeFontPadding: false,
  },

  // Course Title & Inline Badges
  courseTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    rowGap: 5,
    columnGap: 6,
    marginBottom: 10,
  },
  courseTitleText: {
    fontFamily: FONT_FAMILIES.titleBold,
    fontSize: 15.5,
    fontWeight: "700",
    color: colors.navyDeep,
    lineHeight: 21,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  courseMetaInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
  },
  semesterOrdinalRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  semesterBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.semantic.sky.tint,
    borderWidth: 1,
    borderColor: colors.semantic.sky.border,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  semesterBadgeText: {
    fontFamily: FONT_FAMILIES.bodyExtraBold,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "800",
    color: colors.semantic.sky.accent,
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
  semesterBadgeSupText: {
    fontFamily: FONT_FAMILIES.bodyExtraBold,
    fontSize: 7.5,
    lineHeight: 9,
    fontWeight: "800",
    color: colors.semantic.sky.accent,
    marginLeft: 0.5,
    marginRight: 2.5,
    includeFontPadding: false,
  },
  sectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.semantic.violet.tint,
    borderWidth: 1,
    borderColor: colors.semantic.violet.border,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sectionBadgeText: {
    fontFamily: FONT_FAMILIES.bodyExtraBold,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "800",
    color: colors.semantic.violet.deep,
    letterSpacing: 0.25,
    includeFontPadding: false,
  },

  // Notice Banner
  noticeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 10,
  },
  noticeBannerCancelled: {
    backgroundColor: colors.semantic.red.tint,
    borderColor: colors.semantic.red.border,
  },
  noticeBannerRoom: {
    backgroundColor: colors.semantic.amber.tint,
    borderColor: colors.semantic.amber.border,
  },
  noticeBannerOnline: {
    backgroundColor: colors.semantic.sky.tint,
    borderColor: colors.semantic.sky.border,
  },
  noticeBannerText: {
    fontFamily: FONT_FAMILIES.bodyBold,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    color: colors.slate600,
    flex: 1,
  },
  noticeTextCancelled: {
    color: colors.semantic.red.accent,
  },
  noticeTextRoom: {
    color: colors.semantic.amber.deep,
  },
  noticeTextOnline: {
    color: colors.semantic.sky.accent,
  },
  meetBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.semantic.sky.accent,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    marginLeft: 6,
  },
  meetBtnText: {
    fontFamily: FONT_FAMILIES.bodyExtraBold,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: colors.white,
    includeFontPadding: false,
  },

  // Card Footer Row
  cardFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 10,
  },
  roomPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.semantic.sky.tint,
    borderWidth: 1,
    borderColor: colors.semantic.sky.soft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    flexShrink: 1,
    maxWidth: "48%",
  },
  roomPillChanged: {
    backgroundColor: colors.semantic.amber.tint,
    borderColor: colors.semantic.amber.border,
  },
  roomPillText: {
    fontFamily: FONT_FAMILIES.bodyBold,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    color: colors.semantic.sky.accent,
    includeFontPadding: false,
  },
  roomPillTextChanged: {
    color: colors.semantic.amber.deep,
  },
  teacherPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    flexShrink: 1,
    maxWidth: "52%",
  },
  teacherCohortContent: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    minWidth: 0,
  },
  teacherPillText: {
    fontFamily: FONT_FAMILIES.bodyBold,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    color: colors.slate600,
    includeFontPadding: false,
  },
  teacherPillSupText: {
    fontFamily: FONT_FAMILIES.bodyBold,
    fontSize: 7.5,
    lineHeight: 9,
    fontWeight: "700",
    color: colors.slate600,
    marginLeft: 0.5,
    marginRight: 2.5,
    includeFontPadding: false,
  },
  teacherSecText: {
    flexShrink: 1,
  },
});
