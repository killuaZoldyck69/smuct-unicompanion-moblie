import { AcademicEventItem } from "@/services/calendar-service";

export const formatEventDate = (startStr: string, endStr?: string | null): string => {
  if (!startStr) return "TBA";

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

export const getMonthAndDay = (dateStr: string): { month: string; day: string } => {
  if (!dateStr) return { month: "TBA", day: "00" };

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

export const groupCalendarEvents = (events: AcademicEventItem[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentWeek = 1;
  let foundWeekDateRange = "";

  const activeOrNext = events.find((ev) => {
    const match = ev.startDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const d = match
      ? new Date(
          Date.UTC(
            parseInt(match[1], 10),
            parseInt(match[2], 10) - 1,
            parseInt(match[3], 10)
          )
        )
      : new Date(ev.startDate);
    return d >= today && ev.weekNumber;
  });

  if (activeOrNext && activeOrNext.weekNumber) {
    currentWeek = activeOrNext.weekNumber;
    foundWeekDateRange = formatEventDate(
      activeOrNext.startDate,
      activeOrNext.endDate
    );
  } else if (events[0]) {
    currentWeek = events[0].weekNumber || 1;
    foundWeekDateRange = formatEventDate(
      events[0].startDate,
      events[0].endDate
    );
  }

  const thisWeek = events.filter(
    (ev) =>
      ev.weekNumber === currentWeek ||
      (ev.category === "CLASS" && ev.weekNumber === currentWeek)
  );

  const exams = events.filter((ev) => ev.category === "EXAM");
  const deadlines = events.filter(
    (ev) => ev.category === "DEADLINE" || ev.category === "REGISTRATION"
  );
  const holidays = events.filter(
    (ev) => ev.category === "HOLIDAY" || ev.isHoliday
  );

  const milestones = events.filter(
    (ev) =>
      ev.category === "EXAM" ||
      ev.category === "REGISTRATION" ||
      ev.category === "RESULT" ||
      ev.title.toLowerCase().includes("classes will start") ||
      ev.title.toLowerCase().includes("commencement") ||
      ev.title.toLowerCase().includes("break")
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
};
