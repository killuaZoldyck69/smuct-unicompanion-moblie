import { Platform } from "react-native";
import { Feather } from "@expo/vector-icons";

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

export type CategoryKey = "TRANSPORT" | "HOLIDAY" | "EXAM" | "ACADEMIC" | "ADMIN";

export interface CategoryTheme {
  label: string;
  bg: string;
  surfaceBg: string;
  text: string;
  pillBg: string;
  pillText: string;
  icon: keyof typeof Feather.glyphMap;
}

export const CATEGORY_THEMES: Record<CategoryKey, CategoryTheme> = {
  TRANSPORT: {
    label: "Transport",
    bg: "#e0f2fe",
    surfaceBg: "#f0f9ff",
    text: "#0369a1",
    pillBg: "#bae6fd",
    pillText: "#0284c7",
    icon: "truck",
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
  EXAM: {
    label: "Exam",
    bg: "#fef3c7",
    surfaceBg: "#fffbeb",
    text: "#b45309",
    pillBg: "#fde68a",
    pillText: "#d97706",
    icon: "award",
  },
  ACADEMIC: {
    label: "Academic",
    bg: "#e0f2fe",
    surfaceBg: "#f0f9ff",
    text: "#0284c7",
    pillBg: "#c1dcff",
    pillText: "#0369a1",
    icon: "book-open",
  },
  ADMIN: {
    label: "Admin",
    bg: "#ffe4e6",
    surfaceBg: "#fff1f2",
    text: "#be123c",
    pillBg: "#fecdd3",
    pillText: "#e11d48",
    icon: "shield",
  },
};

export const CATEGORY_FILTERS = [
  "ALL",
  "ACADEMIC",
  "ADMIN",
  "EXAM",
  "HOLIDAY",
  "TRANSPORT",
] as const;

export type CategoryFilterKey = (typeof CATEGORY_FILTERS)[number];

export const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});
