// src/screens/exams/types.ts

export type ExamTimingStatus =
  | "upcoming"
  | "today"
  | "startingSoon"
  | "inProgress"
  | "completed";

export type HeroTimingStatus =
  | "NEXT EXAM"
  | "TODAY'S EXAM"
  | "STARTING SOON"
  | "IN PROGRESS"
  | "ALL CLEAR";

export type ExamTabType = "Midterms" | "Finals";

export interface ExamItem {
  id: string;
  courseCode: string | null;
  courseName: string;
  type: string; // "Midterm" or "Final"
  date: string; // YYYY-MM-DD
  time: string; // Raw start time from backend
  room: string; // "Room 123" or "Room not assigned"
  startTime: string; // e.g. "14:49" or "10:30 AM"
  endTime: string; // dynamically calculated e.g. "16:19"
  durationMinutes: number; // 90 for Midterm, 120 for Final
  formattedDuration: string; // "1h 30m" or "2h"
  formattedDateHeader: string; // "MON, JUN 22, 2026"
  formattedHeroDate: string; // "Jun 22, 2026"
  startDateTime: Date;
  endDateTime: Date;
  sortTimestamp: number;
  isToday: boolean;
}

export interface ExamCountdownInfo {
  status: ExamTimingStatus;
  days: number;
  hours: number;
  minutes: number;
  diffMinutes: number;
  formattedText: string;
  sublabel: string;
}

export interface GroupedExamDate {
  dateHeader: string;
  isToday: boolean;
  items: ExamItem[];
}
