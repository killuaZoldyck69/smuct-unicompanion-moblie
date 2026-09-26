import { Platform } from "react-native";
import { CreateHubFormState, ScheduleBlock } from "./types";

export const BENTO_THEME = {
  canvas: "#f7f9fb",
  card: "#ffffff",
  navy: "#131b2e",
  slate: "#475569",
  slateMuted: "#64748b",
  slateLight: "#94a3b8",
  border: "rgba(19, 27, 46, 0.08)",
  borderSubtle: "rgba(19, 27, 46, 0.05)",
  neutralSoft: "#f1f5f9",
  pillRadius: 9999,
  cardRadius: 20,

  // Section 1: Course Details (Soft Blue)
  blueCardBg: "#f0f7ff",
  blueBorder: "#bfdbfe",
  blueHeaderBg: "#dbeafe",
  blueIcon: "#1d4ed8",
  blueLabel: "#1e40af",
  blueSub: "#2563eb",

  // Section 2: Cohort & Term (Soft Mint / Green)
  mintCardBg: "#f0fdf4",
  mintBorder: "#bbf7d0",
  mintHeaderBg: "#dcfce7",
  mintIcon: "#15803d",
  mintLabel: "#166534",
  mintSub: "#16a34a",

  // Section 3: Schedule (Soft Amber / Honey)
  amberCardBg: "#fffbeb",
  amberBorder: "#fde68a",
  amberHeaderBg: "#fef3c7",
  amberIcon: "#b45309",
  amberLabel: "#92400e",
  amberSub: "#d97706",

  // Section 4: Instructor (Soft Purple / Violet)
  purpleCardBg: "#faf5ff",
  purpleBorder: "#e9d5ff",
  purpleHeaderBg: "#ede9fe",
  purpleIcon: "#7c3aed",
  purpleLabel: "#6b21a8",
  purpleSub: "#8b5cf6",

  // Danger / Alert
  roseSoft: "#fff5f5",
  roseBorder: "#fecdd3",
  roseIcon: "#e11d48",

  shadow: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
} as const;

export const BENTO_FONT_FAMILY = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  default: "sans-serif",
});

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const INITIAL_FORM_STATE: CreateHubFormState = {
  courseName: "",
  courseCode: "",
  credit: "",
  department: "",
  batch: "",
  section: "",
  semesterNumber: "",
  termOffer: "",
  teacherId: "",
};

export const createDefaultScheduleBlock = (
  day: string = "Sunday"
): ScheduleBlock => ({
  id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  day,
  startTime: new Date(),
  endTime: new Date(),
  room: "",
});
