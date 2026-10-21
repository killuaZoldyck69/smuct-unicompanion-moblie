import { AcademicEventItem } from "@/services/calendar-service";

// ─── Date parsing ───────────────────────────────────────────────────────────

const parseSafeDate = (str: string): Date => {
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m
    ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
    : new Date(str);
};

// ─── Public formatters ───────────────────────────────────────────────────────

export const formatEventDate = (startStr: string, endStr?: string | null): string => {
  if (!startStr) return "TBA";

  const start = parseSafeDate(startStr);
  const startMonth = start.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const startDay = start.getUTCDate();

  if (!endStr) return `${startDay} ${startMonth}`;

  const end = parseSafeDate(endStr);
  const endMonth = end.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const endDay = end.getUTCDate();

  return startMonth === endMonth
    ? `${startDay} – ${endDay} ${startMonth}`
    : `${startDay} ${startMonth} – ${endDay} ${endMonth}`;
};

export const getMonthAndDay = (dateStr: string): { month: string; day: string } => {
  if (!dateStr) return { month: "TBA", day: "00" };

  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    return {
      month: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase(),
      day: String(d.getUTCDate()).padStart(2, "0"),
    };
  }

  const d = new Date(dateStr);
  return {
    month: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase(),
    day: String(d.getUTCDate()).padStart(2, "0"),
  };
};

// ─── Calendar meta resolver ──────────────────────────────────────────────────

export const resolveCurrentWeekNumber = (
  events: AcademicEventItem[],
  targetDate: Date = new Date(),
): number | null => {
  const targetStr = toISODateString(targetDate);
  const weekSpans = new Map<number, { start: string; end: string }>();

  events.forEach((ev) => {
    if (ev.weekNumber == null || ev.weekNumber <= 0 || !ev.startDate) return;
    const evStart = ev.startDate.substring(0, 10);
    const evEnd = ev.endDate ? ev.endDate.substring(0, 10) : evStart;

    const existing = weekSpans.get(ev.weekNumber);
    if (!existing) {
      weekSpans.set(ev.weekNumber, { start: evStart, end: evEnd });
    } else {
      if (evStart < existing.start) existing.start = evStart;
      if (evEnd > existing.end) existing.end = evEnd;
    }
  });

  for (const [weekNum, span] of weekSpans.entries()) {
    let effectiveEnd = span.end;
    if (effectiveEnd === span.start) {
      const [y, m, d] = span.start.split("-").map(Number);
      const endD = new Date(y, m - 1, d + 6);
      effectiveEnd = toISODateString(endD);
    }

    if (targetStr >= span.start && targetStr <= effectiveEnd) {
      return weekNum;
    }
  }

  return null;
};

export const resolveCalendarMeta = (events: AcademicEventItem[]) => {
  if (!events.length) {
    return { allEvents: events, currentWeekNumber: null, totalCount: 0 };
  }

  const currentWeekNumber = resolveCurrentWeekNumber(events, new Date());

  return { allEvents: events, currentWeekNumber, totalCount: events.length };
};

// ─── Calendar day strip types & helpers ─────────────────────────────────────

export interface CalendarDayItem {
  date: Date;
  dateString: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isWeekend: boolean;
}

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export const toISODateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const getWeekDates = (startDate: Date, count = 7): CalendarDayItem[] => {
  const todayStr = toISODateString(new Date());
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateString = toISODateString(d);
    const dow = d.getDay();
    return {
      date: d,
      dateString,
      dayName: DAY_NAMES[dow],
      dayNumber: d.getDate(),
      isToday: dateString === todayStr,
      isWeekend: dow === 5 || dow === 6,
    };
  });
};

export const isEventOnDate = (event: AcademicEventItem, dateStr: string): boolean => {
  if (!event.startDate) return false;
  const start = event.startDate.substring(0, 10);
  const end = event.endDate ? event.endDate.substring(0, 10) : start;
  return dateStr >= start && dateStr <= end;
};

export const getEventDatesSet = (events: AcademicEventItem[]): Set<string> => {
  const set = new Set<string>();
  events.forEach((ev) => {
    if (!ev.startDate) return;
    const startStr = ev.startDate.substring(0, 10);
    const endStr = ev.endDate ? ev.endDate.substring(0, 10) : startStr;
    const cur = new Date(`${startStr}T00:00:00`);
    const end = new Date(`${endStr}T00:00:00`);
    let guard = 0;
    while (cur <= end && guard < 60) {
      set.add(toISODateString(cur));
      cur.setDate(cur.getDate() + 1);
      guard++;
    }
  });
  return set;
};

// ─── Chronological grouping ──────────────────────────────────────────────────

export interface WeekHeadingInfo {
  weekNumber: number;
  isCurrentWeek: boolean;
  hasExam: boolean;
}

export interface ChronologicalDateGroup {
  dateString: string;
  displayDate: string;
  weekHeading?: WeekHeadingInfo;
  isToday: boolean;
  isPast: boolean;
  weekNumber?: number | null;
  events: AcademicEventItem[];
}

export const groupEventsChronologically = (
  events: AcademicEventItem[],
  currentWeekNumber?: number | null,
): ChronologicalDateGroup[] => {
  if (!events.length) return [];

  const seen = new Set<string>();
  const deduped = events.filter((ev) => {
    const key = `${ev.title.toLowerCase().trim()}|${ev.startDate?.substring(0, 10) ?? ""}|${ev.endDate?.substring(0, 10) ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const sorted = [...deduped].sort((a, b) => {
    const aDate = a.startDate?.substring(0, 10) ?? "";
    const bDate = b.startDate?.substring(0, 10) ?? "";
    return aDate !== bDate ? aDate.localeCompare(bDate) : a.title.localeCompare(b.title);
  });

  const todayStr = toISODateString(new Date());
  const groupsMap = new Map<string, AcademicEventItem[]>();

  sorted.forEach((ev) => {
    const key = ev.startDate?.substring(0, 10) ?? "TBA";
    if (!groupsMap.has(key)) groupsMap.set(key, []);
    groupsMap.get(key)!.push(ev);
  });

  const result: ChronologicalDateGroup[] = [];
  let lastWeekNumber: number | null = null;

  groupsMap.forEach((evList, dateKey) => {
    const weekNumber = evList.find(
      (e) => e.weekNumber !== null && e.weekNumber !== undefined,
    )?.weekNumber;

    let weekHeading: WeekHeadingInfo | undefined;
    let displayDate = dateKey;

    const parts = dateKey.split("-");
    if (parts.length === 3) {
      const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      displayDate = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    if (weekNumber != null && weekNumber !== lastWeekNumber) {
      weekHeading = {
        weekNumber,
        isCurrentWeek:
          currentWeekNumber != null && weekNumber === currentWeekNumber,
        hasExam: evList.some((e) => e.category === "EXAM"),
      };
      lastWeekNumber = weekNumber;
    }

    // A group is active today if dateKey is today OR if any of its events span across today
    const isOngoingToday = evList.some((ev) => isEventOnDate(ev, todayStr));
    const isToday = dateKey === todayStr || isOngoingToday;

    // A group is only past if all of its events ended before today
    const isPast =
      !isToday &&
      evList.every((ev) => {
        const end = ev.endDate
          ? ev.endDate.substring(0, 10)
          : ev.startDate?.substring(0, 10);
        return Boolean(end && end < todayStr);
      });

    result.push({
      dateString: dateKey,
      displayDate,
      weekHeading,
      isToday,
      isPast,
      weekNumber,
      events: evList,
    });
  });

  return result;
};

export const findTargetScrollDate = (
  groups: ChronologicalDateGroup[],
  targetDateStr: string,
): string | null => {
  if (!groups.length) return null;

  // 1. Exact match on a group's start date
  const exact = groups.find((g) => g.dateString === targetDateStr);
  if (exact) return exact.dateString;

  // 2. Active / ongoing event on targetDateStr:
  // If targetDateStr falls inside a multi-day event (startDate <= targetDateStr <= endDate),
  // return the group containing that active event.
  // If multiple groups contain active events, pick the most recent one (closest to targetDateStr).
  const activeGroups = groups.filter((g) =>
    g.events.some((ev) => isEventOnDate(ev, targetDateStr)),
  );

  if (activeGroups.length > 0) {
    const pastOrCurrent = activeGroups.filter((g) => g.dateString <= targetDateStr);
    if (pastOrCurrent.length > 0) {
      return pastOrCurrent[pastOrCurrent.length - 1].dateString;
    }
    return activeGroups[0].dateString;
  }

  // 3. Upcoming event: next scheduled group starting on or after targetDateStr
  const upcoming = groups.find((g) => g.dateString >= targetDateStr);
  if (upcoming) return upcoming.dateString;

  // 4. Past fallback: if targetDateStr is after all events, return the last group
  return groups[groups.length - 1].dateString;
};

// ─── Duration helpers ────────────────────────────────────────────────────────

export const calculateDurationDays = (
  startDateStr?: string | null,
  endDateStr?: string | null,
): number => {
  if (!startDateStr) return 1;
  const startRaw = startDateStr.substring(0, 10);
  const endRaw = endDateStr ? endDateStr.substring(0, 10) : startRaw;
  if (startRaw === endRaw) return 1;

  const [ay, am, ad] = startRaw.split("-").map(Number);
  const [by, bm, bd] = endRaw.split("-").map(Number);
  const diffMs =
    new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime();
  return diffMs > 0 ? Math.max(1, Math.round(diffMs / 86_400_000) + 1) : 1;
};

export const calculateSemesterDuration = (
  events: AcademicEventItem[],
): { months: number; days: number; startDate: string; endDate: string } | null => {
  if (!events.length) return null;

  const dates = events
    .flatMap((ev) => [
      ev.startDate?.substring(0, 10),
      ev.endDate?.substring(0, 10),
    ])
    .filter(Boolean) as string[];

  if (!dates.length) return null;

  dates.sort();
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];

  const [fy, fm, fd] = firstDate.split("-").map(Number);
  const [ly, lm, ld] = lastDate.split("-").map(Number);
  const totalDays = Math.max(
    1,
    Math.round(
      (new Date(ly, lm - 1, ld).getTime() - new Date(fy, fm - 1, fd).getTime()) /
        86_400_000,
    ) + 1,
  );

  return {
    months: Math.floor(totalDays / 30),
    days: totalDays % 30,
    startDate: firstDate,
    endDate: lastDate,
  };
};
