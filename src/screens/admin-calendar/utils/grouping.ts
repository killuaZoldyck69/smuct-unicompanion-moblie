import { AcademicEventItem } from "@/services/calendar-service";
import { cleanDateYmd, formatFormattedDateRange } from "./date-helpers";

export interface WeekGroup {
  id: string;
  type: "WEEK" | "PHASE";
  weekNumber?: number | null;
  title: string;
  dateRangeLabel: string;
  classDaysSummary?: string | null;
  startDate: string;
  endDate: string;
  events: AcademicEventItem[];
}

/**
 * Extracts class days count from remarks or title (e.g. "06 class days" -> "06 Class Days").
 */
function extractClassDaysSummary(events: AcademicEventItem[]): string | null {
  for (const ev of events) {
    const textToScan = `${ev.remarks || ""} ${ev.title || ""}`;
    const match = textToScan.match(/(\d{1,2})\s*(?:class\s*days|class\s*day)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      return `${String(num).padStart(2, "0")} Class Days`;
    }
  }

  // Fallback scan for generic days count if it's a class category
  for (const ev of events) {
    if (ev.category === "CLASS" && ev.remarks) {
      const match = ev.remarks.match(/(\d{1,2})\s*days/i);
      if (match) {
        const num = parseInt(match[1], 10);
        return `${String(num).padStart(2, "0")} Class Days`;
      }
    }
  }

  return null;
}

function isCommencementEvent(e: AcademicEventItem): boolean {
  const t = (e.title || "").toLowerCase();
  return (
    t.includes("commencement") ||
    t.includes("next sem") ||
    t.includes("next semester")
  );
}

function isSemesterBreakEvent(e: AcademicEventItem): boolean {
  const t = (e.title || "").toLowerCase();
  return (
    t.includes("semester break") ||
    (e.category === "HOLIDAY" && (t.includes("break") || t.includes("recess")))
  );
}

function isMidtermEvent(e: AcademicEventItem): boolean {
  const t = `${e.title || ""} ${e.remarks || ""}`.toLowerCase();
  return t.includes("mid-term") || t.includes("midterm");
}

function isFinalExamEvent(e: AcademicEventItem): boolean {
  const t = `${e.title || ""} ${e.remarks || ""}`.toLowerCase();
  return (
    t.includes("final exam") ||
    t.includes("final examination") ||
    t.includes("overlapped exam") ||
    t.includes("tabulation") ||
    t.includes("marksheet") ||
    (t.includes("result") && !t.includes("midterm") && !t.includes("mid-term"))
  );
}

function isSamePhaseBlock(
  currentEvents: AcademicEventItem[],
  nextEvent: AcademicEventItem,
): boolean {
  // 1. Next Semester Commencement should always be its own separate block
  const hasCommence = currentEvents.some(isCommencementEvent);
  const nextCommence = isCommencementEvent(nextEvent);
  if (hasCommence !== nextCommence) return false;

  // 2. Semester Break should always be its own separate block
  const hasBreak = currentEvents.some(isSemesterBreakEvent);
  const nextBreak = isSemesterBreakEvent(nextEvent);
  if (hasBreak !== nextBreak) return false;

  // 3. Mid-Term Assessment vs Final Examination should NEVER be in the same phase block
  const hasMidterm = currentEvents.some(isMidtermEvent);
  const nextMidterm = isMidtermEvent(nextEvent);
  const hasFinal = currentEvents.some(isFinalExamEvent);
  const nextFinal = isFinalExamEvent(nextEvent);

  if (hasMidterm && nextFinal) return false;
  if (hasFinal && nextMidterm) return false;

  // 4. Date Proximity / Continuity check:
  // If there is a noticeable time gap (> 7 days) between the current group and nextEvent,
  // they belong to completely separate phases in the semester timeline.
  let maxCurrentEnd = cleanDateYmd(currentEvents[0].endDate || currentEvents[0].startDate);
  for (let i = 1; i < currentEvents.length; i++) {
    const e = cleanDateYmd(currentEvents[i].endDate || currentEvents[i].startDate);
    if (e > maxCurrentEnd) maxCurrentEnd = e;
  }
  const nextStart = cleanDateYmd(nextEvent.startDate);

  try {
    const endMs = new Date(maxCurrentEnd).getTime();
    const startMs = new Date(nextStart).getTime();
    if (!isNaN(endMs) && !isNaN(startMs)) {
      const gapDays = Math.round((startMs - endMs) / (1000 * 60 * 60 * 24));
      if (gapDays > 7) {
        return false;
      }
    }
  } catch {
    // fallback
  }

  return true;
}

/**
 * Determines a human-readable title for consecutive null-week event blocks.
 * Dynamically derives the title from the events themselves rather than hardcoded static text.
 */
function determinePhaseTitle(
  events: AcademicEventItem[],
  previousWeekNumber: number | null,
): string {
  if (!events || events.length === 0) return "Academic Milestone";

  // Single event in the phase: Use its exact title directly!
  if (events.length === 1) {
    return events[0].title;
  }

  // Major examination anchor event
  const examEvent = events.find((e) => e.category === "EXAM");
  if (examEvent) {
    const cleanTitle = examEvent.title.replace(/\s*-\s*[A-Za-z0-9\s]+$/, "").trim();
    if (/exam|assessment|test/i.test(cleanTitle)) {
      return cleanTitle.toLowerCase().includes("period") ? cleanTitle : `${cleanTitle} Period`;
    }
    return `${cleanTitle} Period`;
  }

  // Registration anchor event
  const regEvent = events.find((e) => e.category === "REGISTRATION");
  if (regEvent) {
    return regEvent.title.toLowerCase().includes("period") ? regEvent.title : `${regEvent.title} Period`;
  }

  // Holiday or Break anchor event
  const holidayEvent = events.find((e) => e.category === "HOLIDAY" || e.isHoliday);
  if (holidayEvent) {
    return holidayEvent.title;
  }

  // Deadline anchor event
  const deadlineEvent = events.find((e) => e.category === "DEADLINE");
  if (deadlineEvent) {
    return deadlineEvent.title;
  }

  // Fallback: Event with the longest date span
  let longestEvent = events[0];
  let maxSpan = 0;
  for (const e of events) {
    const s = new Date(e.startDate).getTime();
    const end = new Date(e.endDate || e.startDate).getTime();
    const span = isNaN(s) || isNaN(end) ? 0 : end - s;
    if (span >= maxSpan) {
      maxSpan = span;
      longestEvent = e;
    }
  }

  return longestEvent.title;
}

/**
 * Groups and chronologically sorts academic calendar events by Week & Smart Phases.
 */
export function groupEventsChronologically(
  events: AcademicEventItem[] = [],
): WeekGroup[] {
  if (!events || events.length === 0) return [];

  // 1. Build date ranges for explicit weeks
  const weekRanges = new Map<number, { minStart: string; maxEnd: string }>();
  for (const ev of events) {
    if (ev.weekNumber !== null && ev.weekNumber !== undefined && ev.weekNumber > 0) {
      const s = cleanDateYmd(ev.startDate);
      const e = cleanDateYmd(ev.endDate || ev.startDate);
      const existing = weekRanges.get(ev.weekNumber);
      if (!existing) {
        weekRanges.set(ev.weekNumber, { minStart: s, maxEnd: e });
      } else {
        if (s < existing.minStart) existing.minStart = s;
        if (e > existing.maxEnd) existing.maxEnd = e;
      }
    }
  }

  // 2. Resolve implicit week numbers for single events whose dates fall within a week's span
  const resolvedEvents = events.map((ev) => {
    if (ev.weekNumber !== null && ev.weekNumber !== undefined && ev.weekNumber > 0) {
      return ev;
    }
    const lowerTitle = (ev.title || "").toLowerCase();
    const isMajorExam =
      ev.category === "EXAM" ||
      lowerTitle.includes("mid-term") ||
      lowerTitle.includes("final exam") ||
      lowerTitle.includes("semester break") ||
      lowerTitle.includes("commencement");

    if (!isMajorExam) {
      const evStart = cleanDateYmd(ev.startDate);
      for (const [wkNum, range] of weekRanges.entries()) {
        if (evStart >= range.minStart && evStart <= range.maxEnd) {
          return { ...ev, weekNumber: wkNum };
        }
      }
    }
    return ev;
  });

  // 3. Sort strictly chronologically by startDate ascending
  const sorted = [...resolvedEvents].sort((a, b) => {
    const aDate = cleanDateYmd(a.startDate);
    const bDate = cleanDateYmd(b.startDate);
    if (aDate !== bDate) return aDate.localeCompare(bDate);

    // If same startDate, week numbers go first, then stable tiebreak
    const aWk = a.weekNumber ?? 999;
    const bWk = b.weekNumber ?? 999;
    return aWk - bWk;
  });

  const groups: WeekGroup[] = [];
  let currentGroupEvents: AcademicEventItem[] = [];
  let currentWeekNumber: number | null = null;
  let isCurrentGroupPhase = false;
  let lastObservedWeekNumber: number | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const ev = sorted[i];
    const evWk =
      ev.weekNumber !== null && ev.weekNumber !== undefined && ev.weekNumber > 0
        ? ev.weekNumber
        : null;
    const isPhaseEvent = evWk === null;

    if (currentGroupEvents.length === 0) {
      currentGroupEvents.push(ev);
      currentWeekNumber = evWk;
      isCurrentGroupPhase = isPhaseEvent;
      if (evWk !== null) lastObservedWeekNumber = evWk;
    } else {
      const sameGroup =
        (!isCurrentGroupPhase && !isPhaseEvent && currentWeekNumber === evWk) ||
        (isCurrentGroupPhase && isPhaseEvent && isSamePhaseBlock(currentGroupEvents, ev));

      if (sameGroup) {
        currentGroupEvents.push(ev);
        if (evWk !== null) lastObservedWeekNumber = evWk;
      } else {
        // Flush completed group
        groups.push(
          buildWeekGroup(
            currentGroupEvents,
            isCurrentGroupPhase,
            currentWeekNumber,
            lastObservedWeekNumber,
            groups.length,
          ),
        );

        // Start new group
        currentGroupEvents = [ev];
        currentWeekNumber = evWk;
        isCurrentGroupPhase = isPhaseEvent;
        if (evWk !== null) lastObservedWeekNumber = evWk;
      }
    }
  }

  if (currentGroupEvents.length > 0) {
    groups.push(
      buildWeekGroup(
        currentGroupEvents,
        isCurrentGroupPhase,
        currentWeekNumber,
        lastObservedWeekNumber,
        groups.length,
      ),
    );
  }

  return groups;
}

function buildWeekGroup(
  events: AcademicEventItem[],
  isPhase: boolean,
  weekNumber: number | null,
  previousWeekNumber: number | null,
  index: number,
): WeekGroup {
  // Sort events within group chronologically
  events.sort((a, b) => {
    const aDate = cleanDateYmd(a.startDate);
    const bDate = cleanDateYmd(b.startDate);
    return aDate.localeCompare(bDate);
  });

  // Calculate start & end dates of the group
  let minStart = cleanDateYmd(events[0].startDate);
  let maxEnd = cleanDateYmd(events[0].endDate || events[0].startDate);

  for (let i = 1; i < events.length; i++) {
    const s = cleanDateYmd(events[i].startDate);
    const e = cleanDateYmd(events[i].endDate || events[i].startDate);
    if (s < minStart) minStart = s;
    if (e > maxEnd) maxEnd = e;
  }

  const dateRangeLabel = formatFormattedDateRange(minStart, maxEnd);
  const classDaysSummary = extractClassDaysSummary(events);

  if (isPhase) {
    const title = determinePhaseTitle(events, previousWeekNumber);
    return {
      id: `phase-${index}-${minStart}`,
      type: "PHASE",
      weekNumber: null,
      title,
      dateRangeLabel,
      classDaysSummary: null,
      startDate: minStart,
      endDate: maxEnd,
      events,
    };
  }

  const formattedWeek = `WEEK ${String(weekNumber).padStart(2, "0")}`;
  return {
    id: `week-${weekNumber}-${minStart}`,
    type: "WEEK",
    weekNumber,
    title: formattedWeek,
    dateRangeLabel,
    classDaysSummary,
    startDate: minStart,
    endDate: maxEnd,
    events,
  };
}
