// src/screens/exams/utils.ts
import {
  ExamItem,
  ExamTimingStatus,
  HeroTimingStatus,
  ExamCountdownInfo,
  GroupedExamDate,
  ExamTabType,
} from "./types";

/**
 * STRICT BUSINESS LOGIC RULE (Requirement 7 & 20):
 * The exam duration is determined by the exam type.
 * MIDTERM: Duration = 90 minutes (1 hour 30 minutes)
 * FINAL:   Duration = 120 minutes (2 hours)
 */
export function getExamDuration(type: string | undefined | null): number {
  if (!type) return 90;
  const lower = type.toLowerCase().trim();
  if (lower.includes("mid")) {
    return 90; // 1 hour 30 minutes
  }
  if (lower.includes("fin")) {
    return 120; // 2 hours
  }
  return 90;
}

/**
 * Parses raw start time (e.g. "14:49" or "10:00 AM" or "14:49 - 16:49")
 * Extracts start hour and minute.
 */
export function parseStartTime(timeStr: string | undefined | null) {
  if (!timeStr || timeStr.trim() === "" || timeStr.toUpperCase() === "TBA") {
    return {
      startTime: "TBA",
      startHours: 9,
      startMinutes: 0,
      is12Hour: false,
    };
  }

  // If time string had a range like "14:49 - 16:49", take the start part
  const startPart = timeStr.split("-")[0].trim();

  try {
    const match = startPart.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
    if (!match) {
      return { startTime: startPart, startHours: 9, startMinutes: 0, is12Hour: false };
    }

    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const modifier = match[3]?.toUpperCase();

    if (modifier) {
      if (modifier === "PM" && h < 12) h += 12;
      if (modifier === "AM" && h === 12) h = 0;
      return { startTime: startPart, startHours: h, startMinutes: m, is12Hour: true };
    }

    return { startTime: startPart, startHours: h, startMinutes: m, is12Hour: false };
  } catch {
    return { startTime: startPart, startHours: 9, startMinutes: 0, is12Hour: false };
  }
}

/**
 * Calculates end time dynamically from start time + exam duration.
 * Midterm: 14:49 + 90 min -> 16:19
 * Final:   17:30 + 120 min -> 19:30
 */
export function getExamEndTime(
  startHours: number,
  startMinutes: number,
  durationMinutes: number,
  is12Hour: boolean
): {
  endTimeStr: string;
  endHours: number;
  endMinutes: number;
} {
  const totalStartMinutes = startHours * 60 + startMinutes;
  const totalEndMinutes = totalStartMinutes + durationMinutes;
  const endHours = Math.floor((totalEndMinutes / 60) % 24);
  const endMinutes = totalEndMinutes % 60;

  let endTimeStr: string;

  if (is12Hour) {
    const ampm = endHours >= 12 ? "PM" : "AM";
    const h12 = endHours % 12 === 0 ? 12 : endHours % 12;
    endTimeStr = `${String(h12).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")} ${ampm}`;
  } else {
    endTimeStr = `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
  }

  return {
    endTimeStr,
    endHours,
    endMinutes,
  };
}

/**
 * Normalizes raw hub membership records into strongly-typed ExamItem array.
 * Calculates dynamic end time and duration using business rules.
 */
export function normalizeHubExams(myHubs: any[] | undefined | null): ExamItem[] {
  if (!myHubs || !Array.isArray(myHubs)) return [];

  const exams: ExamItem[] = [];
  const now = new Date();

  myHubs.forEach((membership: any) => {
    const hub = membership?.hub;
    if (!hub || hub.isArchived) return;

    let examsArray = hub.termExams;
    if (typeof examsArray === "string") {
      try {
        examsArray = JSON.parse(examsArray);
      } catch {
        examsArray = [];
      }
    }

    if (!Array.isArray(examsArray)) return;

    examsArray.forEach((rawExam: any) => {
      // Must have a valid date string (e.g. "YYYY-MM-DD")
      if (!rawExam?.date || typeof rawExam.date !== "string") return;

      const dateParts = rawExam.date.trim().split("-");
      if (dateParts.length < 3) return;

      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10);
      const day = parseInt(dateParts[2], 10);
      if (isNaN(year) || isNaN(month) || isNaN(day)) return;

      const examType = rawExam.type && rawExam.type.trim().length > 0
        ? rawExam.type.trim()
        : "Exam";

      // 1. Calculate duration based on exam type (Midterm: 90m, Final: 120m)
      const durationMinutes = getExamDuration(examType);

      // 2. Parse start time & calculate end time dynamically
      const parsedStart = parseStartTime(rawExam.time);
      const calculatedEnd = getExamEndTime(
        parsedStart.startHours,
        parsedStart.startMinutes,
        durationMinutes,
        parsedStart.is12Hour
      );

      // 3. Construct timezone-consistent Date objects
      const startDateTime = new Date(
        year,
        month - 1,
        day,
        parsedStart.startHours,
        parsedStart.startMinutes,
        0,
        0
      );

      const endDateTime = new Date(
        startDateTime.getTime() + durationMinutes * 60000
      );

      // 4. Fallback room handling (Requirement 10 & 25)
      const room = rawExam.room && rawExam.room.trim().length > 0
        ? rawExam.room.trim()
        : "Room not assigned";

      // 5. Course code handling (Hide if missing)
      const courseCode = hub.courseCode && hub.courseCode.trim().length > 0
        ? hub.courseCode.trim()
        : null;

      const courseName = hub.courseName && hub.courseName.trim().length > 0
        ? hub.courseName.trim()
        : hub.title || "Untitled Course";

      // Formatted date representations
      const formattedDateHeader = startDateTime
        .toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        .toUpperCase();

      const formattedHeroDate = startDateTime.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const formattedDuration = durationMinutes === 90 ? "1h 30m" : "2h";

      const id = `${hub.id || "hub"}-${examType}-${rawExam.date}-${parsedStart.startTime}`;

      exams.push({
        id,
        courseCode,
        courseName,
        type: examType,
        date: rawExam.date,
        time: rawExam.time || "TBA",
        room,
        startTime: parsedStart.startTime,
        endTime: calculatedEnd.endTimeStr,
        durationMinutes,
        formattedDuration,
        formattedDateHeader,
        formattedHeroDate,
        startDateTime,
        endDateTime,
        sortTimestamp: startDateTime.getTime(),
        isToday: isSameLocalDate(startDateTime, now),
      });
    });
  });

  // Sort chronologically ascending
  exams.sort((a, b) => a.sortTimestamp - b.sortTimestamp);

  return exams;
}

/**
 * Checks if two dates fall on the same local calendar day.
 */
export function isSameLocalDate(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Determines timing status of an individual exam:
 * upcoming | today | startingSoon | inProgress | completed
 */
export function getExamTimingStatus(exam: ExamItem, now: Date): ExamTimingStatus {
  const nowMs = now.getTime();
  const startMs = exam.startDateTime.getTime();
  const endMs = exam.endDateTime.getTime();

  if (nowMs > endMs) {
    return "completed";
  }

  if (nowMs >= startMs && nowMs <= endMs) {
    return "inProgress";
  }

  const diffMs = startMs - nowMs;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes <= 60 && diffMinutes > 0) {
    return "startingSoon";
  }

  if (isSameLocalDate(exam.startDateTime, now)) {
    return "today";
  }

  return "upcoming";
}

/**
 * STRICT NEXT EXAM ALGORITHM (Requirement 15):
 * 1. Filter to exams where endDateTime >= now (has not finished yet).
 * 2. Sort ascending by startDateTime.
 * 3. Return the earliest upcoming or in-progress exam.
 * 4. NEVER returns a completed exam!
 * 5. Returns null if all exams are completed or list is empty.
 */
export function getNextUpcomingExam(
  exams: ExamItem[],
  now: Date
): ExamItem | null {
  if (!exams || exams.length === 0) return null;

  const nowMs = now.getTime();
  const futureOrCurrentExams = exams.filter(
    (ex) => ex.endDateTime.getTime() >= nowMs
  );

  if (futureOrCurrentExams.length === 0) return null;

  futureOrCurrentExams.sort((a, b) => a.sortTimestamp - b.sortTimestamp);

  return futureOrCurrentExams[0];
}

/**
 * Determines hero status tag (Requirement 14 & 15):
 * - If no upcoming: "ALL CLEAR"
 * - If in progress: "IN PROGRESS"
 * - If starting soon: "STARTING SOON"
 * - If today: "TODAY'S EXAM"
 * - If future: "NEXT EXAM"
 */
export function getHeroStatus(
  nextExam: ExamItem | null,
  now: Date
): HeroTimingStatus {
  if (!nextExam) return "ALL CLEAR";

  const nowMs = now.getTime();
  const startMs = nextExam.startDateTime.getTime();

  if (nowMs >= startMs) {
    return "IN PROGRESS";
  }

  const diffMs = startMs - nowMs;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes <= 60 && diffMinutes > 0) {
    return "STARTING SOON";
  }

  if (isSameLocalDate(nextExam.startDateTime, now)) {
    return "TODAY'S EXAM";
  }

  return "NEXT EXAM";
}

/**
 * Calculates live countdown values for Next Exam Hero.
 */
export function getCountdown(
  exam: ExamItem | null,
  now: Date
): ExamCountdownInfo {
  if (!exam) {
    return {
      status: "completed",
      days: 0,
      hours: 0,
      minutes: 0,
      diffMinutes: 0,
      formattedText: "All clear",
      sublabel: "No upcoming exams scheduled",
    };
  }

  const nowMs = now.getTime();
  const startMs = exam.startDateTime.getTime();
  const endMs = exam.endDateTime.getTime();

  if (nowMs > endMs) {
    return {
      status: "completed",
      days: 0,
      hours: 0,
      minutes: 0,
      diffMinutes: 0,
      formattedText: "Completed",
      sublabel: "Examination finished",
    };
  }

  if (nowMs >= startMs && nowMs <= endMs) {
    const minsLeft = Math.max(1, Math.round((endMs - nowMs) / 60000));
    return {
      status: "inProgress",
      days: 0,
      hours: 0,
      minutes: minsLeft,
      diffMinutes: minsLeft,
      formattedText: "In progress",
      sublabel: "Examination currently in progress",
    };
  }

  const diffMs = startMs - nowMs;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const days = Math.floor(diffMinutes / (24 * 60));
  const hours = Math.floor((diffMinutes % (24 * 60)) / 60);
  const minutes = diffMinutes % 60;

  if (diffMinutes <= 0) {
    return {
      status: "startingSoon",
      days: 0,
      hours: 0,
      minutes: 0,
      diffMinutes: 0,
      formattedText: "Starting now",
      sublabel: "Starts in",
    };
  }

  if (diffMinutes < 60) {
    return {
      status: "startingSoon",
      days: 0,
      hours: 0,
      minutes: diffMinutes,
      diffMinutes,
      formattedText: `${diffMinutes} ${diffMinutes === 1 ? "Minute" : "Minutes"}`,
      sublabel: "Starts in",
    };
  }

  if (days === 0) {
    const hStr = String(hours).padStart(2, "0");
    const mStr = String(minutes).padStart(2, "0");
    return {
      status: "today",
      days: 0,
      hours,
      minutes,
      diffMinutes,
      formattedText: `${hStr} Hours ${mStr} Minutes`,
      sublabel: "Starts in",
    };
  }

  const dStr = String(days).padStart(2, "0");
  const hStr = String(hours).padStart(2, "0");
  const mStr = String(minutes).padStart(2, "0");

  return {
    status: "upcoming",
    days,
    hours,
    minutes,
    diffMinutes,
    formattedText: `${dStr} Days ${hStr} Hours ${mStr} Minutes`,
    sublabel: "Starts in",
  };
}

/**
 * Filters exams strictly by tab type: Midterms or Finals.
 */
export function getExamsByType(
  exams: ExamItem[],
  type: ExamTabType
): ExamItem[] {
  if (!exams) return [];
  if (type === "Midterms") {
    return exams.filter((ex) => ex.type.toLowerCase().includes("mid"));
  }
  return exams.filter((ex) => ex.type.toLowerCase().includes("fin"));
}

/**
 * Groups a filtered list of exams by local calendar date.
 */
export function groupExamsByDate(
  exams: ExamItem[],
  now: Date
): GroupedExamDate[] {
  const map = new Map<string, { dateHeader: string; isToday: boolean; items: ExamItem[] }>();

  exams.forEach((exam) => {
    const dateHeader = exam.formattedDateHeader;

    if (!map.has(dateHeader)) {
      map.set(dateHeader, {
        dateHeader,
        isToday: isSameLocalDate(exam.startDateTime, now),
        items: [],
      });
    }

    map.get(dateHeader)!.items.push(exam);
  });

  return Array.from(map.values());
}
