// src/screens/notices/constants.ts
import { Platform } from "react-native";
import { NoticeCategoryKey, NoticeCategoryTheme } from "./types";

export const NOTICE_COLORS = {
  background: "#f7f9fb",
  surface: "#ffffff",
  surfaceMuted: "#f1f5f9",
  deepNavy: "#131b2e",
  neutralText: "#191c1d",
  bodyText: "#334155",
  subtleText: "#64748b",
  mutedBorder: "rgba(15, 23, 42, 0.06)",
  subtleBorder: "rgba(15, 23, 42, 0.06)",
  divider: "rgba(15, 23, 42, 0.06)",
  white: "#ffffff",
  activeDot: "#22c55e",
  cardRadius: 18,
  pillRadius: 9999,
  shadow: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  heroShadow: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
} as const;

// Backward-compatible alias
export const BENTO_COLORS = NOTICE_COLORS;

export const CATEGORY_THEMES: Record<
  Exclude<NoticeCategoryKey, "ALL">,
  NoticeCategoryTheme
> = {
  TRANSPORT: {
    key: "TRANSPORT",
    label: "Transport",
    badgeBg: "#e0f2fe",
    badgeText: "#0284c7",
    badgeBorder: "rgba(2, 132, 199, 0.15)",
    accentBarColor: "#0ea5e9",
    icon: "truck",
    iconBg: "rgba(2, 132, 199, 0.12)",
  },
  HOLIDAY: {
    key: "HOLIDAY",
    label: "Holiday",
    badgeBg: "#d1fae5",
    badgeText: "#059669",
    badgeBorder: "rgba(5, 150, 105, 0.15)",
    accentBarColor: "#10b981",
    icon: "sun",
    iconBg: "rgba(5, 150, 105, 0.12)",
  },
  ACADEMIC: {
    key: "ACADEMIC",
    label: "Academic",
    badgeBg: "#e0e7ff",
    badgeText: "#3730a3",
    badgeBorder: "rgba(55, 48, 163, 0.15)",
    accentBarColor: "#6366f1",
    icon: "book-open",
    iconBg: "rgba(55, 48, 163, 0.12)",
  },
  ADMIN: {
    key: "ADMIN",
    label: "Admin",
    badgeBg: "#f3e8ff",
    badgeText: "#7e22ce",
    badgeBorder: "rgba(126, 34, 206, 0.15)",
    accentBarColor: "#a855f7",
    icon: "shield",
    iconBg: "rgba(126, 34, 206, 0.12)",
  },
  EXAM: {
    key: "EXAM",
    label: "Exam",
    badgeBg: "#fef3c7",
    badgeText: "#b45309",
    badgeBorder: "rgba(180, 83, 9, 0.15)",
    accentBarColor: "#f59e0b",
    icon: "award",
    iconBg: "rgba(180, 83, 9, 0.12)",
  },
  EMERGENCY: {
    key: "EMERGENCY",
    label: "Emergency",
    badgeBg: "#fee2e2",
    badgeText: "#b91c1c",
    badgeBorder: "rgba(185, 28, 28, 0.15)",
    accentBarColor: "#ef4444",
    icon: "alert-circle",
    iconBg: "rgba(185, 28, 28, 0.12)",
  },
};

export const DEFAULT_CATEGORY_THEME: NoticeCategoryTheme = {
  key: "ADMIN",
  label: "Notice",
  badgeBg: "#f1f5f9",
  badgeText: "#475569",
  badgeBorder: "rgba(71, 85, 105, 0.15)",
  accentBarColor: "#64748b",
  icon: "file-text",
  iconBg: "rgba(71, 85, 105, 0.12)",
};

export const ORDERED_CATEGORIES: NoticeCategoryKey[] = [
  "ALL",
  "ACADEMIC",
  "ADMIN",
  "TRANSPORT",
  "HOLIDAY",
  "EXAM",
];

export const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});
