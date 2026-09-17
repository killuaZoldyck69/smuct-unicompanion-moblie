import { Platform } from "react-native";
import { ClassNoticeItem } from "@/services/hub-service";

export const BENTO_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  cardRadius: 20,
  pillRadius: 9999,
  subtleBorder: "rgba(0, 0, 0, 0.05)",
  accentBlue: "#0284c7",
  accentEmerald: "#059669",
  accentAmber: "#d97706",
  accentRose: "#e11d48",
  accentPurple: "#7c3aed",
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  heroShadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
  },
} as const;

export interface PastelTheme {
  cardBg: string;
  codePillBg: string;
  codePillText: string;
  tagBg: string;
  tagText: string;
  accent: string;
  halo: string;
}

export const PASTEL_THEMES: Record<string, PastelTheme> = {
  blue: {
    cardBg: "#ffffff",
    codePillBg: "#e0f2fe",
    codePillText: "#0369a1",
    tagBg: "#f0f9ff",
    tagText: "#0284c7",
    accent: "#0284c7",
    halo: "#bae6fd",
  },
  mint: {
    cardBg: "#ffffff",
    codePillBg: "#dcfce7",
    codePillText: "#047857",
    tagBg: "#f0fdf4",
    tagText: "#059669",
    accent: "#059669",
    halo: "#a7f3d0",
  },
  yellow: {
    cardBg: "#ffffff",
    codePillBg: "#fef3c7",
    codePillText: "#b45309",
    tagBg: "#fffbeb",
    tagText: "#d97706",
    accent: "#d97706",
    halo: "#fde68a",
  },
  rose: {
    cardBg: "#ffffff",
    codePillBg: "#ffe4e6",
    codePillText: "#be123c",
    tagBg: "#fff1f2",
    tagText: "#e11d48",
    accent: "#e11d48",
    halo: "#fecdd3",
  },
  purple: {
    cardBg: "#ffffff",
    codePillBg: "#f3e8ff",
    codePillText: "#6b21a8",
    tagBg: "#faf5ff",
    tagText: "#7c3aed",
    accent: "#7c3aed",
    halo: "#e9d5ff",
  },
  white: {
    cardBg: "#ffffff",
    codePillBg: "#f1f5f9",
    codePillText: "#334155",
    tagBg: "#f8fafc",
    tagText: "#475569",
    accent: "#64748b",
    halo: "#e2e8f0",
  },
};

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

export const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

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
  userRole?: string;
  activeNotice?: ClassNoticeItem;
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
