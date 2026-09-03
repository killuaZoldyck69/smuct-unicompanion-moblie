import { Platform } from "react-native";

export const BENTO_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  cardRadius: 28,
  pillRadius: 9999,
  subtleBorder: "rgba(0, 0, 0, 0.04)",
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  heroShadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 6,
  },
} as const;

export interface PastelTheme {
  cardBg: string;
  codePillBg: string;
  codePillText: string;
  tagBg: string;
  tagText: string;
  accent: string;
}

export const PASTEL_THEMES: Record<string, PastelTheme> = {
  blue: {
    cardBg: "#f0f7ff",
    codePillBg: "#c1dcff",
    codePillText: "#0369a1",
    tagBg: "rgba(193, 220, 255, 0.55)",
    tagText: "#0284c7",
    accent: "#0284c7",
  },
  mint: {
    cardBg: "#ecfdf5",
    codePillBg: "#a7f3d0",
    codePillText: "#047857",
    tagBg: "rgba(167, 243, 208, 0.55)",
    tagText: "#059669",
    accent: "#059669",
  },
  yellow: {
    cardBg: "#fefce8",
    codePillBg: "#fde68a",
    codePillText: "#b45309",
    tagBg: "rgba(253, 230, 138, 0.55)",
    tagText: "#d97706",
    accent: "#d97706",
  },
  rose: {
    cardBg: "#fff1f2",
    codePillBg: "#fecdd3",
    codePillText: "#be123c",
    tagBg: "rgba(254, 205, 211, 0.55)",
    tagText: "#e11d48",
    accent: "#e11d48",
  },
  white: {
    cardBg: "#ffffff",
    codePillBg: "#f1f5f9",
    codePillText: "#334155",
    tagBg: "rgba(0, 0, 0, 0.04)",
    tagText: "#475569",
    accent: "#475569",
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
  courseCode: string;
  courseName: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  duration: string | null;
  sortValue: number;
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
