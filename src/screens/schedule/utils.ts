import {
  ClassRoutineItem,
  DayScheduleSection,
  DAYS_ORDER,
  DAY_ABBREVIATIONS,
  PASTEL_THEMES,
  PastelTheme,
  RoutineDayFilterItem,
  TodayStats,
} from "./constants";

export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  try {
    const trimmed = timeStr.trim();
    const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const modifier = match[3]?.toUpperCase();
      if (modifier === "AM" && h === 12) h = 0;
      if (modifier === "PM" && h !== 12) h += 12;
      return h * 60 + m;
    }
    return 0;
  } catch {
    return 0;
  }
};

export const formatTimeDisplay = (timeStr?: string): string => {
  if (!timeStr) return "TBA";
  const trimmed = timeStr.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return trimmed;

  let h = parseInt(match[1], 10);
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
  endTime: string
): string | null => {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  if (!startMin || !endMin || endMin <= startMin) return null;
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

export const isClassLiveNow = (
  day: string,
  startTime: string,
  endTime: string
): boolean => {
  const now = new Date();
  const currentWeekday = now.toLocaleDateString("en-US", { weekday: "long" });
  if (day !== currentWeekday) return false;

  const currentMin = now.getHours() * 60 + now.getMinutes();
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);

  if (!startMin || !endMin) return false;
  return currentMin >= startMin && currentMin < endMin;
};

export const getDeterministicColorTheme = (
  courseCode: string,
  courseName: string
): PastelTheme => {
  const combined = `${courseCode} ${courseName}`.toLowerCase();

  if (
    combined.includes("structure") ||
    combined.includes("algorithm") ||
    combined.includes("database") ||
    combined.includes("data") ||
    combined.includes("network")
  ) {
    return PASTEL_THEMES.blue;
  }

  if (
    combined.includes("mobile") ||
    combined.includes("android") ||
    combined.includes("web") ||
    combined.includes("app") ||
    combined.includes("software")
  ) {
    return PASTEL_THEMES.mint;
  }

  if (
    combined.includes("java") ||
    combined.includes("oop") ||
    combined.includes("programming") ||
    combined.includes("python") ||
    combined.includes("math") ||
    combined.includes("calculus")
  ) {
    return PASTEL_THEMES.yellow;
  }

  if (
    combined.includes("design") ||
    combined.includes("art") ||
    combined.includes("multimedia") ||
    combined.includes("ui") ||
    combined.includes("graphics") ||
    combined.includes("english")
  ) {
    return PASTEL_THEMES.rose;
  }

  if (combined.includes("system") || combined.includes("security") || combined.includes("ai")) {
    return PASTEL_THEMES.purple;
  }

  let sum = 0;
  for (let i = 0; i < combined.length; i++) {
    sum += combined.charCodeAt(i);
  }
  const themes = [
    PASTEL_THEMES.blue,
    PASTEL_THEMES.mint,
    PASTEL_THEMES.yellow,
    PASTEL_THEMES.rose,
    PASTEL_THEMES.purple,
    PASTEL_THEMES.white,
  ];
  return themes[sum % themes.length];
};

export const getCurrentWeekDays = (
  classesCountByDay: Map<string, number>
): RoutineDayFilterItem[] => {
  const now = new Date();
  const currentDayIndex = now.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - currentDayIndex);

  return DAYS_ORDER.map((dayName, idx) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + idx);
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const count = classesCountByDay.get(dayName) || 0;

    return {
      dayName,
      abbrev: DAY_ABBREVIATIONS[dayName] || dayName.substring(0, 3),
      dateNumber: d.getDate(),
      dateFormatted: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      isToday,
      hasClasses: count > 0,
      classCount: count,
    };
  });
};

export const parseWeeklySchedule = (
  myHubs: any[] | null | undefined
): {
  allClasses: ClassRoutineItem[];
  scheduleSections: DayScheduleSection[];
  todayStats: TodayStats;
} => {
  const list: ClassRoutineItem[] = [];

  if (myHubs && Array.isArray(myHubs)) {
    myHubs.forEach((membership: any) => {
      const hub = membership.hub;
      if (!hub || hub.isArchived) return;

      const teacherMember =
        hub.members?.find((m: any) => m.role === "TEACHER") ||
        hub.members?.find((m: any) => m.user?.name) ||
        hub.members?.[0];
      const hubTeacherName =
        teacherMember?.user?.name || teacherMember?.name || undefined;
      const hubSection = hub.section ? String(hub.section).trim() : undefined;

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
          const duration = calculateDuration(session.startTime, session.endTime || "");

          const sessionTeacher =
            session.teacherName || session.instructor || session.teacher;
          const sessionSection = session.section
            ? String(session.section).trim()
            : undefined;

          // Find active notice matching this day and not expired
          const now = new Date();
          const activeNotice = Array.isArray(hub.classNotices)
            ? hub.classNotices.find((n: any) => {
                if (!n.isActive) return false;
                if (n.targetDay !== session.day) return false;
                if (n.effectiveDate) {
                  const noticeDate = new Date(n.effectiveDate);
                  const diffHours =
                    (now.getTime() - noticeDate.getTime()) / (1000 * 60 * 60);
                  if (diffHours > 24) return false;
                }
                return true;
              })
            : undefined;

          const mappedNotice = activeNotice
            ? {
                id: activeNotice.id,
                hubId: activeNotice.hubId || hub.id,
                authorId: activeNotice.authorId,
                authorName: activeNotice.author?.name,
                authorRole: activeNotice.author?.role,
                type: activeNotice.type,
                title: activeNotice.title,
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

  const now = new Date();
  const currentWeekday = now.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const classesToday = list
    .filter((c) => c.day === currentWeekday)
    .sort((a, b) => a.sortValue - b.sortValue);

  const liveClass = classesToday.find((c) =>
    isClassLiveNow(c.day, c.startTime, c.endTime)
  );

  const nextClass = !liveClass
    ? classesToday.find((c) => c.sortValue > currentMinutes)
    : classesToday.find((c) => c.sortValue > timeToMinutes(liveClass.endTime));

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
