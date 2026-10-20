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

/**
 * Determines a human-readable title for consecutive null-week event blocks.
 */
function determinePhaseTitle(
  events: AcademicEventItem[],
  previousWeekNumber: number | null,
): string {
  const allText = events
    .map((e) => `${e.title} ${e.remarks || ""} ${e.category}`)
    .join(" ")
    .toLowerCase();

  if (
    allText.includes("final exam") ||
    allText.includes("overlapped exam") ||
    allText.includes("marksheet") ||
    allText.includes("semester break") ||
    allText.includes("commencement") ||
    (previousWeekNumber !== null && previousWeekNumber >= 12)
  ) {
    return "Final Examination & Closing Period";
  }

  if (
    allText.includes("mid-term") ||
    allText.includes("midterm") ||
    allText.includes("durga puja") ||
    (previousWeekNumber !== null && previousWeekNumber >= 6 && previousWeekNumber <= 8)
  ) {
    return "Mid-Term Assessment & Break Period";
  }

  if (previousWeekNumber === null || previousWeekNumber === 0) {
    return "Pre-Semester & Orientation Period";
  }

  return "Interim Assessment & Recess Period";
}

/**
 * Groups and chronologically sorts academic calendar events by Week & Smart Phases.
 */
export function groupEventsChronologically(
  events: AcademicEventItem[] = [],
): WeekGroup[] {
  if (!events || events.length === 0) return [];

  // 1. Sort strictly chronologically by startDate ascending
  const sorted = [...events].sort((a, b) => {
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
        (isCurrentGroupPhase && isPhaseEvent);

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
      classDaysSummary,
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
