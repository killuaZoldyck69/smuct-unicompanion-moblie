import { Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { EventCategory } from "@/services/calendar-service";

export const BENTO_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  cardRadius: 26,
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

export const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export interface CategoryStyleConfig {
  label: string;
  bg: string;
  surfaceBg: string;
  text: string;
  pillBg: string;
  pillText: string;
  icon: keyof typeof Feather.glyphMap;
}

export const CATEGORY_CONFIG: Record<EventCategory, CategoryStyleConfig> = {
  CLASS: {
    label: "Class",
    bg: "#e0f2fe",
    surfaceBg: "#f0f9ff",
    text: "#0369a1",
    pillBg: "#bae6fd",
    pillText: "#0284c7",
    icon: "book-open",
  },
  REGISTRATION: {
    label: "Registration",
    bg: "#ffe4e6",
    surfaceBg: "#fff1f2",
    text: "#be123c",
    pillBg: "#fecdd3",
    pillText: "#e11d48",
    icon: "edit-3",
  },
  DEADLINE: {
    label: "Deadline",
    bg: "#ffe4e6",
    surfaceBg: "#fff1f2",
    text: "#be123c",
    pillBg: "#fecdd3",
    pillText: "#e11d48",
    icon: "alert-circle",
  },
  EXAM: {
    label: "Exam",
    bg: "#fef3c7",
    surfaceBg: "#fffbeb",
    text: "#b45309",
    pillBg: "#fde68a",
    pillText: "#d97706",
    icon: "award",
  },
  HOLIDAY: {
    label: "Holiday",
    bg: "#d1fae5",
    surfaceBg: "#ecfdf5",
    text: "#047857",
    pillBg: "#a7f3d0",
    pillText: "#059669",
    icon: "sun",
  },
  MAKEUP_CLASS: {
    label: "Makeup",
    bg: "#cffafe",
    surfaceBg: "#ecfeff",
    text: "#0e7490",
    pillBg: "#a5f3fc",
    pillText: "#0891b2",
    icon: "repeat",
  },
  RESULT: {
    label: "Result",
    bg: "#ede9fe",
    surfaceBg: "#f5f3ff",
    text: "#6d28d9",
    pillBg: "#ddd6fe",
    pillText: "#7c3aed",
    icon: "check-circle",
  },
  ACADEMIC: {
    label: "Academic",
    bg: "#f1f5f9",
    surfaceBg: "#f8fafc",
    text: "#334155",
    pillBg: "#e2e8f0",
    pillText: "#475569",
    icon: "bookmark",
  },
  OTHER: {
    label: "Other",
    bg: "#f3f4f6",
    surfaceBg: "#f9fafb",
    text: "#374151",
    pillBg: "#e5e7eb",
    pillText: "#4b5563",
    icon: "tag",
  },
};
