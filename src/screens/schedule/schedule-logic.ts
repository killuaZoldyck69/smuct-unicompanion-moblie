export const DAYS_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const DAY_ABBREVIATIONS: Record<string, string> = {
  Sunday: "SUN",
  Monday: "MON",
  Tuesday: "TUE",
  Wednesday: "WED",
  Thursday: "THU",
  Friday: "FRI",
  Saturday: "SAT",
};

export type ClassNoticeType =
  | "CANCELLED"
  | "ROOM_CHANGE"
  | "TIME_CHANGE"
  | "ONLINE_CLASS"
  | "URGENT_NOTICE";

export interface ClassNoticeSummary {
  id: string;
  hubId: string;
  authorId: string;
  authorName?: string;
  authorRole?: string;
  author?: {
    id: string;
    name: string;
    image?: string | null;
    role?: string;
  };
  type: ClassNoticeType;
  message: string;
  targetDay: string;
  effectiveDate: string;
  newRoom?: string | null;
  newTime?: string | null;
  meetUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ClassRoutineItem {
  id: string;
  hubId: string;
  courseCode: string;
  courseName: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  duration: string | null;
  sortValue: number;
  teacherName?: string;
  section?: string;
  semester?: number | string;
  userRole?: string;
  activeNotice?: ClassNoticeSummary;
}

export interface TodayStats {
  weekday: string;
  dateFormatted: string;
  totalClassesToday: number;
  liveClass?: ClassRoutineItem;
  nextClass?: ClassRoutineItem;
}

export interface DayScheduleSection {
  title: string;
  data: ClassRoutineItem[];
}

export interface RoutineDayFilterItem {
  dayName: string;
  abbrev: string;
  dateNumber: number;
  dateFormatted: string;
  isToday: boolean;
  hasClasses: boolean;
  classCount: number;
}

export interface ClassIntervalInfo {
  diffMinutes: number;
  label: string;
  timeSpan: string;
  isBackToBack: boolean;
  isOverlap: boolean;
}

/**
 * Parses a time string into minutes since midnight (`0..1439`), returning `null`
 * when the string is missing or unparseable (distinguishing invalid input from `00:00`).
 */
export const parseTimeToMinutes = (timeStr?: string): number | null => {
  if (!timeStr) return null;
  try {
    const trimmed = timeStr.trim();
    const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return null;

    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    if (isNaN(h) || isNaN(m) || m < 0 || m > 59) return null;

    const modifier = match[3]?.toUpperCase();
    if (modifier) {
      if (h < 1 || h > 12) return null;
      if (modifier === "AM" && h === 12) h = 0;
      if (modifier === "PM" && h !== 12) h += 12;
    } else if (h < 0 || h > 23) {
      return null;
    }

    return h * 60 + m;
  } catch {
    return null;
  }
};

export const timeToMinutes = (timeStr: string): number =>
  parseTimeToMinutes(timeStr) ?? 0;

export const formatTimeDisplay = (timeStr?: string): string => {
  if (!timeStr) return "TBA";
  const trimmed = timeStr.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return trimmed;

  const h = parseInt(match[1], 10);
  const m = match[2];
  const mod = match[3]?.toUpperCase();

  if (mod) {
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const paddedH = hour12 < 10 ? `0${hour12}` : `${hour12}`;
    return `${paddedH}:${m} ${mod}`;
  }

  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  const paddedH = hour12 < 10 ? `0${hour12}` : `${hour12}`;
  return `${paddedH}:${m} ${period}`;
};

export const calculateDuration = (
  startTime: string,
  endTime: string,
): string | null => {
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);
  if (startMin === null || endMin === null || endMin <= startMin) return null;
  const diffMin = endMin - startMin;
  const hours = Math.floor(diffMin / 60);
  const minutes = diffMin % 60;
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return null;
};

export const getEffectiveClassTimes = (
  item: ClassRoutineItem,
): { startTime: string; endTime: string } => {
  if (item.activeNotice?.type === "TIME_CHANGE" && item.activeNotice.newTime) {
    const clean = item.activeNotice.newTime.replace(/^Now\s*/i, "").trim();
    const parts = clean.split("-");
    if (parts.length === 2) {
      const s = parts[0].trim();
      const e = parts[1].trim();
      if (s && e) {
        return { startTime: s, endTime: e };
      }
    }
  }
  return { startTime: item.startTime, endTime: item.endTime };
};

export const getEffectiveSessionWindow = (cls: ClassRoutineItem) => {
  const effective = getEffectiveClassTimes(cls);
  const baseStart = parseTimeToMinutes(cls.startTime);
  const baseEnd = parseTimeToMinutes(cls.endTime);

  if (
    cls.activeNotice?.type === "TIME_CHANGE" &&
    cls.activeNotice.newTime
  ) {
    const rangeStart = parseTimeToMinutes(effective.startTime);
    const rangeEnd = parseTimeToMinutes(effective.endTime);
    if (
      effective.startTime !== cls.startTime &&
      rangeStart !== null &&
      rangeEnd !== null &&
      rangeEnd > rangeStart
    ) {
      return { startMin: rangeStart, endMin: rangeEnd };
    }

    const shiftedStart = parseTimeToMinutes(cls.activeNotice.newTime);
    if (shiftedStart !== null) {
      const duration =
        baseStart !== null && baseEnd !== null && baseEnd > baseStart
          ? baseEnd - baseStart
          : 90;
      return {
        startMin: shiftedStart,
        endMin: shiftedStart + duration,
      };
    }
  }

  return { startMin: baseStart, endMin: baseEnd };
};

export const calculateClassInterval = (
  prevItem: ClassRoutineItem,
  nextItem: ClassRoutineItem,
): ClassIntervalInfo | null => {
  const prevTimes = getEffectiveClassTimes(prevItem);
  const nextTimes = getEffectiveClassTimes(nextItem);

  const prevEndMin = parseTimeToMinutes(prevTimes.endTime);
  const nextStartMin = parseTimeToMinutes(nextTimes.startTime);

  if (prevEndMin === null || nextStartMin === null) return null;

  const diffMinutes = nextStartMin - prevEndMin;
  const timeSpan = `${formatTimeDisplay(prevTimes.endTime)} → ${formatTimeDisplay(nextTimes.startTime)}`;

  if (diffMinutes === 0) {
    return {
      diffMinutes: 0,
      label: "Back-to-back",
      timeSpan,
      isBackToBack: true,
      isOverlap: false,
    };
  }

  if (diffMinutes < 0) {
    const overlap = Math.abs(diffMinutes);
    return {
      diffMinutes,
      label: `Overlap (${overlap}m)`,
      timeSpan,
      isBackToBack: false,
      isOverlap: true,
    };
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  let label = "";
  if (hours > 0 && minutes > 0) {
    label = `${hours}h ${minutes}m break`;
  } else if (hours > 0) {
    label = `${hours}h break`;
  } else {
    label = `${minutes} min break`;
  }

  return {
    diffMinutes,
    label,
    timeSpan,
    isBackToBack: false,
    isOverlap: false,
  };
};

export const isSameCalendarDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isClassNoticeEffective = (
  effectiveDateValue: string | Date | null | undefined,
  now: Date = new Date(),
): boolean => {
  if (!effectiveDateValue) return true;
  const noticeDate = new Date(effectiveDateValue);
  if (isNaN(noticeDate.getTime())) return false;

  const diffHours = (now.getTime() - noticeDate.getTime()) / (1000 * 60 * 60);
  // Match same calendar day OR posted up to 24h prior for today's slot; block future-dated leaks
  return (
    isSameCalendarDay(noticeDate, now) || (diffHours >= 0 && diffHours <= 24)
  );
};

export const isClassLiveNow = (
  day: string,
  startTime: string,
  endTime: string,
  now: Date = new Date(),
): boolean => {
  const currentWeekday = now.toLocaleDateString("en-US", { weekday: "long" });
  if (day !== currentWeekday) return false;

  const currentMin = now.getHours() * 60 + now.getMinutes();
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);

  if (startMin === null || endMin === null || endMin <= startMin) return false;
  return currentMin >= startMin && currentMin < endMin;
};

export const getCurrentWeekDays = (
  classesCountByDay: Map<string, number>,
  now: Date = new Date(),
): RoutineDayFilterItem[] => {
  const currentDayIndex = now.getDay();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - currentDayIndex);

  return DAYS_ORDER.map((dayName, idx) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + idx);
    const isToday = isSameCalendarDay(d, now);
    const count = classesCountByDay.get(dayName) || 0;

    return {
      dayName,
      abbrev: DAY_ABBREVIATIONS[dayName] || dayName.substring(0, 3),
      dateNumber: d.getDate(),
      dateFormatted: d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      isToday,
      hasClasses: count > 0,
      classCount: count,
    };
  });
};

export const parseWeeklySchedule = (
  myHubs: any[] | null | undefined,
  now: Date = new Date(),
): {
  allClasses: ClassRoutineItem[];
  scheduleSections: DayScheduleSection[];
  todayStats: TodayStats;
} => {
  const list: ClassRoutineItem[] = [];

  if (myHubs && Array.isArray(myHubs)) {
    myHubs.forEach((membership: any) => {
      const hub = membership?.hub;
      if (!hub || hub.isArchived) return;

      const teacherMember =
        hub.members?.find((m: any) => m.role === "TEACHER") ||
        hub.members?.find((m: any) => m.user?.name) ||
        hub.members?.[0];
      const hubTeacherName =
        teacherMember?.user?.name || teacherMember?.name || undefined;
      const hubSection = hub.section ? String(hub.section).trim() : undefined;
      const hubSemester = hub.semesterNumber ?? hub.semester ?? undefined;

      let scheduleArray = hub.weeklyClassSchedule;
      if (typeof scheduleArray === "string") {
        try {
          scheduleArray = JSON.parse(scheduleArray);
        } catch {
          scheduleArray = [];
        }
      }

      if (Array.isArray(scheduleArray)) {
        scheduleArray.forEach((session: any) => {
          if (!session.day || !session.startTime) return;
          const startMin = timeToMinutes(session.startTime);
          const duration = calculateDuration(
            session.startTime,
            session.endTime || "",
          );

          const sessionTeacher =
            session.teacherName || session.instructor || session.teacher;
          const sessionSection = session.section
            ? String(session.section).trim()
            : undefined;
          const sessionSemester =
            session.semesterNumber ?? session.semester ?? hubSemester;

          const activeNotice = Array.isArray(hub.classNotices)
            ? hub.classNotices.find((n: any) => {
                if (!n.isActive) return false;
                if (n.targetDay !== session.day) return false;
                return isClassNoticeEffective(n.effectiveDate, now);
              })
            : undefined;

          const mappedNotice: ClassNoticeSummary | undefined = activeNotice
            ? {
                id: activeNotice.id,
                hubId: activeNotice.hubId || hub.id,
                authorId: activeNotice.authorId,
                authorName: activeNotice.author?.name,
                authorRole: activeNotice.author?.role,
                type: activeNotice.type,
                message: activeNotice.message,
                targetDay: activeNotice.targetDay,
                effectiveDate: String(activeNotice.effectiveDate),
                newRoom: activeNotice.newRoom,
                newTime: activeNotice.newTime,
                meetUrl: activeNotice.meetUrl,
                isActive: activeNotice.isActive,
                createdAt: String(activeNotice.createdAt),
              }
            : undefined;

          list.push({
            id: `${hub.id}-${session.day}-${session.startTime}`,
            hubId: hub.id,
            courseCode: hub.courseCode || "COURSE",
            courseName: hub.courseName || "Untitled Course",
            day: session.day,
            startTime: session.startTime,
            endTime: session.endTime || "",
            room: session.room?.trim() || "TBA",
            duration,
            sortValue: startMin,
            teacherName: sessionTeacher || hubTeacherName,
            section: sessionSection || hubSection,
            semester: sessionSemester,
            userRole: membership.role,
            activeNotice: mappedNotice,
          });
        });
      }
    });
  }

  list.sort((a, b) => a.sortValue - b.sortValue);

  const grouped: DayScheduleSection[] = DAYS_ORDER.map((day) => {
    const classesForDay = list
      .filter((c) => c.day === day)
      .sort((a, b) => a.sortValue - b.sortValue);

    return {
      title: day,
      data: classesForDay,
    };
  }).filter((group) => group.data.length > 0);

  const currentWeekday = now.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const classesToday = list
    .filter((c) => c.day === currentWeekday)
    .sort((a, b) => a.sortValue - b.sortValue);

  const activeClassesToday = classesToday.filter(
    (c) => c.activeNotice?.type !== "CANCELLED",
  );

  const liveClass = activeClassesToday.find((c) => {
    const { startMin, endMin } = getEffectiveSessionWindow(c);
    if (startMin === null || endMin === null || endMin <= startMin) {
      return false;
    }
    return currentMinutes >= startMin && currentMinutes < endMin;
  });

  const liveWindow = liveClass ? getEffectiveSessionWindow(liveClass) : null;
  const searchAfterMin =
    liveWindow && liveWindow.endMin !== null
      ? liveWindow.endMin
      : currentMinutes;

  const nextClass = activeClassesToday.find((c) => {
    const { startMin } = getEffectiveSessionWindow(c);
    return startMin !== null && startMin > searchAfterMin;
  });

  return {
    allClasses: list,
    scheduleSections: grouped,
    todayStats: {
      weekday: currentWeekday,
      dateFormatted: formattedDate,
      totalClassesToday: classesToday.length,
      liveClass,
      nextClass,
    },
  };
};
