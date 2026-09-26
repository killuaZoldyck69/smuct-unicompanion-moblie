/**
 * Pure utility functions for the Edit Hub form.
 * Mirrors the pattern in create-hub/utils.ts but scoped to edit concerns.
 *
 * All functions are stateless and side-effect free — safe to tree-shake.
 */

import type { ScheduleBlock } from "./types";
import type { ExamState, TermExamPayload, WeeklySchedulePayload } from "./types";
import { formatTimeDisplay } from "@/screens/hubs/components/create-hub";

const pad = (n: number) => String(n).padStart(2, "0");

/** "10:30 AM" | "14:30" → Date (today's date, just time set) */
export function parseTimeString(timeStr?: string): Date {
  const d = new Date();
  d.setSeconds(0, 0);

  if (!timeStr) {
    d.setHours(10, 0);
    return d;
  }

  try {
    const trimmed = timeStr.trim();
    const spaceIdx = trimmed.lastIndexOf(" ");
    const hasAmPm = spaceIdx !== -1;
    const timePart = hasAmPm ? trimmed.slice(0, spaceIdx) : trimmed;
    const modifier = hasAmPm ? trimmed.slice(spaceIdx + 1).toUpperCase() : null;

    const [rawH, rawM] = timePart.split(":");
    let h = parseInt(rawH, 10);
    const m = parseInt(rawM, 10) || 0;

    if (modifier === "PM" && h < 12) h += 12;
    if (modifier === "AM" && h === 12) h = 0;

    d.setHours(h, m);
    return d;
  } catch {
    d.setHours(10, 0);
    return d;
  }
}

/** Date → "HH:MM" for native <input type="time"> on web */
export function toHHMM(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Date → "YYYY-MM-DD" for native <input type="date"> on web */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Date | null → human-readable "Sep 27, 2026" or "Select Date" */
export function formatShortDate(d: Date | null): string {
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return "Select Date";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

/** Convert ScheduleBlock[] to serialisable payload entries */
export function buildSchedulePayload(
  schedules: ScheduleBlock[]
): WeeklySchedulePayload[] {
  return schedules.map((s) => ({
    day: s.day,
    startTime: formatTimeDisplay(s.startTime),
    endTime: formatTimeDisplay(s.endTime),
    room: s.room.trim() || "TBA",
  }));
}

/** Convert exam state to payload entry, returns null when nothing was set */
export function buildExamPayload(
  type: "Midterm" | "Final",
  exam: ExamState
): TermExamPayload | null {
  if (!exam.date && !exam.room.trim()) return null;
  return {
    type,
    date: exam.date ? toISODate(exam.date) : undefined,
    time: exam.date ? formatTimeDisplay(exam.date) : undefined,
    room: exam.room.trim() || undefined,
  };
}

/** Apply a date-only change to a Date (preserves time component) */
export function mergeDatePart(base: Date | null, incoming: Date): Date {
  const d = base ? new Date(base) : new Date();
  d.setFullYear(incoming.getFullYear(), incoming.getMonth(), incoming.getDate());
  return d;
}

/** Apply a time-only change to a Date (preserves date component) */
export function mergeTimePart(base: Date | null, incoming: Date): Date {
  const d = base ? new Date(base) : new Date();
  d.setHours(incoming.getHours(), incoming.getMinutes(), 0, 0);
  return d;
}

/** Derive schedule blocks from raw hub data (weeklyClassSchedule or legacy schedule) */
export function parseScheduleBlocks(hubDetails: any): ScheduleBlock[] {
  const raw =
    (Array.isArray(hubDetails?.weeklyClassSchedule) &&
      hubDetails.weeklyClassSchedule.length > 0 &&
      hubDetails.weeklyClassSchedule) ||
    (Array.isArray(hubDetails?.schedule) &&
      hubDetails.schedule.length > 0 &&
      hubDetails.schedule) ||
    null;

  if (!raw) return [];

  return raw.map((s: any, i: number) => ({
    id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
    day: s.day || "Sunday",
    startTime: parseTimeString(s.startTime),
    endTime: parseTimeString(s.endTime),
    room: s.room || "",
  }));
}

/** Derive ExamState for a given type from hubDetails.termExams */
export function parseExamState(
  hubDetails: any,
  type: "Midterm" | "Final"
): ExamState {
  const entry = hubDetails?.termExams?.find((e: any) => e.type === type);
  if (!entry?.date) return { date: null, room: entry?.room || "" };

  const d = new Date(entry.date);
  if (entry.time) {
    const t = parseTimeString(entry.time);
    d.setHours(t.getHours(), t.getMinutes(), 0, 0);
  }
  return { date: d, room: entry.room || "" };
}

/** Minimal form validity — mirrors what handleSubmit guards */
export function isEditFormValid(
  courseName: string,
  department: string,
  batch: string
): boolean {
  return (
    courseName.trim().length > 0 &&
    department.trim().length > 0 &&
    batch.trim().length > 0
  );
}
