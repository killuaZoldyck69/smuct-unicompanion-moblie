import React from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity, Linking, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  BENTO_COLORS,
  ClassRoutineItem,
  fontFamily,
} from "../constants";
import {
  getDeterministicColorTheme,
  isClassLiveNow,
  formatTimeDisplay,
} from "../utils";
import { LiveBeepDot } from "./live-beep-indicator";

interface ClassRoutineCardProps {
  item: ClassRoutineItem;
  isToday: boolean;
  isLast?: boolean;
  nextClassId?: string;
  onOpenNotice?: (item: ClassRoutineItem) => void;
  sequenceNumber?: number;
  totalInDay?: number;
}

export const ClassRoutineCard = React.memo(function ClassRoutineCard({
  item,
  isToday,
  nextClassId,
  onOpenNotice,
  sequenceNumber,
  totalInDay,
}: ClassRoutineCardProps) {
  const isLive = isClassLiveNow(item.day, item.startTime, item.endTime);
  const isNext = !isLive && isToday && nextClassId === item.id;
  const theme = getDeterministicColorTheme(item.courseCode, item.courseName);

  const formattedStart = formatTimeDisplay(item.startTime);
  const formattedEnd = formatTimeDisplay(item.endTime);

  const notice = item.activeNotice;
  const isCancelled = notice?.type === "CANCELLED";
  const isRoomChange = notice?.type === "ROOM_CHANGE";
  const isOnline = notice?.type === "ONLINE_CLASS";
  const isTimeChange = notice?.type === "TIME_CHANGE";

  // Accent color adapts based on notice or live/next state
  const accentColor = isCancelled
    ? "#ef4444"
    : isRoomChange
      ? "#f59e0b"
      : isOnline
        ? "#0284c7"
        : isTimeChange
          ? "#7c3aed"
          : isLive
            ? "#ef4444"
            : isNext
              ? "#0284c7"
              : theme.accent;

  // Format section badge cleanly e.g. "SEC B" or "SEC 6B"
  const formattedSection = item.section
    ? item.section.trim().toUpperCase().startsWith("SEC")
      ? item.section.trim().toUpperCase()
      : `SEC ${item.section.trim().toUpperCase()}`
    : null;

  // Format semester badge cleanly e.g. "6th Sem" or "SEM 6"
  const formattedSemester = React.useMemo(() => {
    if (item.semester === undefined || item.semester === null || item.semester === "") {
      return null;
    }
    const str = String(item.semester).trim();
    if (!str) return null;

    if (/^sem/i.test(str)) {
      return str.toUpperCase();
    }

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
  }, [item.semester]);

  // Format room label cleanly (reflecting room change if active)
  const displayRoom = isRoomChange && notice?.newRoom ? notice.newRoom : item.room;
  const formattedRoom = displayRoom
    ? displayRoom.toLowerCase().startsWith("room")
      ? displayRoom
      : `Room ${displayRoom}`
    : "Room TBA";

  const isStaff = item.userRole === "TEACHER" || item.userRole === "CR";

  const handleOpenLink = (url?: string | null) => {
    if (!url) return;
    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
    Linking.openURL(formattedUrl).catch(() => {
      Alert.alert("Unable to open link", url);
    });
  };

  return (
    <View
      style={[
        styles.card,
        { borderLeftColor: accentColor },
        isLive && styles.cardLive,
        isCancelled && styles.cardCancelled,
      ]}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`${sequenceNumber ? `Class ${sequenceNumber} of ${totalInDay || 1}. ` : ""}${item.courseCode}, ${item.courseName}.${
        formattedSemester ? ` Semester: ${formattedSemester}.` : ""
      } From ${formattedStart} to ${formattedEnd}. Section: ${
        item.section || "Not specified"
      }. Teacher: ${item.teacherName || "Not specified"}. Location: ${formattedRoom}.${
        isCancelled ? " Notice: Class is cancelled." : ""
      }${isLive ? " Live right now." : isNext ? " Next class." : ""}`}
    >
      {/* Top Notice Banner (If active notice exists) */}
      {notice && (
        <View
          style={[
            styles.noticeRibbon,
            isCancelled && styles.noticeRibbonCancelled,
            isRoomChange && styles.noticeRibbonRoom,
            isOnline && styles.noticeRibbonOnline,
            isTimeChange && styles.noticeRibbonTime,
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
                    : isTimeChange
                      ? "clock"
                      : "alert-circle"
            }
            size={13}
            color={
              isCancelled
                ? "#b91c1c"
                : isRoomChange
                  ? "#b45309"
                  : isOnline
                    ? "#0369a1"
                    : isTimeChange
                      ? "#6d28d9"
                      : "#334155"
            }
            style={{ marginRight: 7, marginTop: 1 }}
          />

          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.noticeRibbonTitle,
                isCancelled && styles.noticeTextCancelled,
                isRoomChange && styles.noticeTextRoom,
                isOnline && styles.noticeTextOnline,
                isTimeChange && styles.noticeTextTime,
              ]}
            >
              {isCancelled
                ? "Class Cancelled Today"
                : isRoomChange
                  ? `Room Changed: ${notice.newRoom || "New Room"}`
                  : isOnline
                    ? "Class Held Online Today"
                    : isTimeChange
                      ? `Rescheduled: ${notice.newTime || "Time Updated"}`
                      : "Class Notice"}
            </Text>

            <Text style={styles.noticeRibbonMessage} numberOfLines={3}>
              "{notice.message}"
            </Text>

            {(notice.authorName || notice.author?.name) && (
              <Text style={styles.noticeAuthorText}>
                — Posted by {notice.authorName || notice.author?.name} (
                {notice.authorRole || notice.author?.role || "Staff"})
              </Text>
            )}

            {isOnline && notice.meetUrl && (
              <TouchableOpacity
                onPress={() => handleOpenLink(notice.meetUrl)}
                style={styles.meetJoinBtn}
                activeOpacity={0.8}
              >
                <Feather name="external-link" size={11} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={styles.meetJoinBtnText}>Join Online Class</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Top Meta Row: Badges, Duration & Notice Action */}
      <View style={styles.headerRow}>
        <View style={styles.badgeGroup}>
          {isCancelled ? (
            <View style={styles.cancelledBadge}>
              <Text style={styles.cancelledBadgeText}>CANCELLED</Text>
            </View>
          ) : isLive ? (
            <View style={styles.liveBadge}>
              <LiveBeepDot size={5.5} style={{ marginRight: 2 }} />
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
              {item.courseCode}
            </Text>
          </View>
        </View>

        {/* Right Actions: Duration & Teacher/CR Notice Button */}
        <View style={styles.rightHeaderActions}>
          {item.duration ? (
            <View style={styles.durationChip}>
              <Feather
                name="clock"
                size={11}
                color={BENTO_COLORS.subtleText}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
          ) : null}

          {isStaff && (
            <TouchableOpacity
              onPress={() => onOpenNotice?.(item)}
              style={[
                styles.staffNoticeBtn,
                notice && styles.staffNoticeBtnActive,
              ]}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Update class notice or status"
            >
              <Feather
                name={notice ? "edit-2" : "bell"}
                size={11}
                color={notice ? "#b45309" : "#475569"}
                style={{ marginRight: 3 }}
              />
              <Text
                style={[
                  styles.staffNoticeBtnText,
                  notice && styles.staffNoticeBtnTextActive,
                ]}
              >
                {notice ? "Edit" : "Notice"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Time Interval Row */}
      <View style={styles.timeRow}>
        <Feather
          name="clock"
          size={13}
          color={accentColor}
          style={{ marginRight: 6 }}
        />
        <Text
          style={[
            styles.timeMainText,
            isCancelled && styles.timeTextStrikethrough,
          ]}
        >
          {formattedStart}
        </Text>
        <Text style={styles.timeSeparatorText}>→</Text>
        <Text
          style={[
            styles.timeSecondaryText,
            isCancelled && styles.timeTextStrikethrough,
          ]}
        >
          {formattedEnd}
        </Text>

        {isTimeChange && notice?.newTime && (
          <View style={styles.rescheduledBadge}>
            <Text style={styles.rescheduledBadgeText}>Now {notice.newTime}</Text>
          </View>
        )}
      </View>

      {/* Course Title with Inline Semester & Section Badges */}
      <View style={styles.courseTitleWrapper}>
        <Text style={styles.courseTitleText} numberOfLines={2}>
          {item.courseName}
        </Text>
        {(formattedSemester || formattedSection) && (
          <View style={styles.courseMetaInline}>
            {formattedSemester && (
              <View style={styles.semesterBadge}>
                <Feather
                  name="award"
                  size={10}
                  color="#0284c7"
                  style={{ marginRight: 3 }}
                />
                <Text style={styles.semesterBadgeText}>{formattedSemester}</Text>
              </View>
            )}
            {formattedSection && (
              <View style={styles.sectionBadge}>
                <Feather
                  name="layers"
                  size={10}
                  color="#6d28d9"
                  style={{ marginRight: 3 }}
                />
                <Text style={styles.sectionBadgeText}>{formattedSection}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Footer Meta Row: Room & Teacher Name */}
      <View style={styles.footerRow}>
        <View
          style={[
            styles.locationPill,
            isRoomChange && styles.locationPillChanged,
          ]}
        >
          <Feather
            name="map-pin"
            size={12}
            color={isRoomChange ? "#b45309" : "#0284c7"}
            style={{ marginRight: 5 }}
          />
          <Text
            style={[
              styles.locationText,
              isRoomChange && styles.locationTextChanged,
            ]}
            numberOfLines={1}
          >
            {formattedRoom}
          </Text>
        </View>

        <View style={styles.teacherPill}>
          <Feather
            name="user"
            size={12}
            color="#475569"
            style={{ marginRight: 5 }}
          />
          <Text style={styles.teacherText} numberOfLines={1}>
            {item.teacherName || "Instructor TBA"}
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    borderLeftWidth: 4,
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
  cardLive: {
    backgroundColor: "#fffdfd",
    borderColor: "rgba(239, 68, 68, 0.25)",
  },
  cardCancelled: {
    backgroundColor: "#fffafa",
    borderColor: "rgba(239, 68, 68, 0.25)",
  },
  noticeRibbon: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 9,
    marginBottom: 10,
  },
  noticeRibbonCancelled: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  noticeRibbonRoom: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  noticeRibbonOnline: {
    backgroundColor: "#f0f9ff",
    borderColor: "#bae6fd",
  },
  noticeRibbonTime: {
    backgroundColor: "#f5f3ff",
    borderColor: "#ddd6fe",
  },
  noticeRibbonTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
  },
  noticeTextCancelled: {
    color: "#b91c1c",
  },
  noticeTextRoom: {
    color: "#b45309",
  },
  noticeTextOnline: {
    color: "#0369a1",
  },
  noticeTextTime: {
    color: "#6d28d9",
  },
  noticeRibbonMessage: {
    fontFamily,
    fontSize: 11.5,
    color: "#475569",
    marginTop: 2,
    lineHeight: 16,
  },
  noticeAuthorText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 3,
  },
  meetJoinBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0284c7",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  meetJoinBtnText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: "#ffffff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  badgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    flex: 1,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  liveBadgeText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#b91c1c",
    letterSpacing: 0.5,
  },
  nextBadge: {
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  nextBadgeText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#0369a1",
    letterSpacing: 0.5,
  },
  cancelledBadge: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  cancelledBadgeText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#dc2626",
    letterSpacing: 0.5,
  },
  codePill: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  codeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  rightHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  durationChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  durationText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  staffNoticeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  staffNoticeBtnActive: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  staffNoticeBtnText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
    color: "#475569",
  },
  staffNoticeBtnTextActive: {
    color: "#b45309",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  timeMainText: {
    fontFamily,
    fontSize: 15.5,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  timeSeparatorText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "600",
    color: "#94a3b8",
    marginHorizontal: 6,
  },
  timeSecondaryText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  timeTextStrikethrough: {
    textDecorationLine: "line-through",
    color: "#94a3b8",
  },
  rescheduledBadge: {
    backgroundColor: "#f5f3ff",
    borderWidth: 1,
    borderColor: "#ddd6fe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginLeft: 8,
  },
  rescheduledBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#6d28d9",
  },
  courseTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    rowGap: 5,
    columnGap: 6,
    marginBottom: 10,
  },
  courseTitleText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    lineHeight: 20,
    flexShrink: 1,
  },
  courseMetaInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
  },
  semesterBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    paddingHorizontal: 6.5,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  semesterBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#0284c7",
    letterSpacing: 0.3,
  },
  sectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f3ff",
    borderWidth: 1,
    borderColor: "#ddd6fe",
    paddingHorizontal: 6.5,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  sectionBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#6d28d9",
    letterSpacing: 0.3,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    paddingTop: 9,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 6,
    flexShrink: 1,
    maxWidth: "48%",
  },
  locationPillChanged: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  locationText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#0369a1",
  },
  locationTextChanged: {
    color: "#b45309",
  },
  teacherPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 6,
    flexShrink: 1,
    maxWidth: "52%",
  },
  teacherText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
  },
});
