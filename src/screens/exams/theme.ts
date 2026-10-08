// src/screens/exams/theme.ts
import { Platform } from "react-native";

export const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export function getExamTheme(isDark: boolean) {
  return {
    isDark,

    // Foundations
    background: isDark ? "#0b101c" : "#f8f9fa",
    surface: isDark ? "#131b2e" : "#ffffff",
    surfaceMuted: isDark ? "#18233a" : "#f1f4f8",
    surfaceHighlight: isDark ? "#1d2a45" : "#f8fafc",

    // Borders & Dividers (Subtle 1px)
    cardBorder: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.06)",
    divider: isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(15, 23, 42, 0.05)",

    // Typography
    textPrimary: isDark ? "#f8fafc" : "#0f172a", // deep navy
    textSecondary: isDark ? "#94a3b8" : "#64748b", // muted blue-gray
    textMuted: isDark ? "#64748b" : "#94a3b8",

    // Primary Brand
    deepNavy: isDark ? "#1e293b" : "#0f172a",

    // Segmented Tabs
    tabBarBg: isDark ? "#162137" : "#eef2f6",
    tabActiveBg: isDark ? "#253452" : "#0f172a",
    tabActiveText: "#ffffff",
    tabInactiveText: isDark ? "#94a3b8" : "#64748b",

    // Subtle Bento Accents (85-90% neutral, 10-15% accent)
    mint: isDark ? "#2dd4bf" : "#0d9488",
    mintBg: isDark ? "rgba(45, 212, 191, 0.12)" : "rgba(13, 148, 136, 0.08)",
    mintBorder: isDark ? "rgba(45, 212, 191, 0.25)" : "rgba(13, 148, 136, 0.18)",
    mintText: isDark ? "#5eead4" : "#0f766e",

    softBlue: isDark ? "#60a5fa" : "#2563eb",
    softBlueBg: isDark ? "rgba(96, 165, 250, 0.12)" : "rgba(37, 99, 235, 0.08)",
    softBlueBorder: isDark ? "rgba(96, 165, 250, 0.25)" : "rgba(37, 99, 235, 0.15)",
    softBlueText: isDark ? "#93c5fd" : "#1d4ed8",

    // Midterm semantic accent: soft amber/yellow
    amber: isDark ? "#fbbf24" : "#d97706",
    amberBg: isDark ? "rgba(251, 191, 36, 0.14)" : "rgba(217, 119, 6, 0.09)",
    amberBorder: isDark ? "rgba(251, 191, 36, 0.28)" : "rgba(217, 119, 6, 0.18)",
    amberText: isDark ? "#fde68a" : "#b45309",

    // Final semantic accent: soft lavender/purple
    lavender: isDark ? "#c084fc" : "#7c3aed",
    lavenderBg: isDark ? "rgba(192, 132, 252, 0.12)" : "rgba(124, 58, 237, 0.08)",
    lavenderBorder: isDark ? "rgba(192, 132, 252, 0.25)" : "rgba(124, 58, 237, 0.16)",
    lavenderText: isDark ? "#d8b4fe" : "#6d28d9",

    // Completed & Quiet state
    completedBg: isDark ? "rgba(148, 163, 184, 0.10)" : "#f1f5f9",
    completedText: isDark ? "#64748b" : "#64748b",

    // Geometry & Elevations
    cardRadius: 20,
    heroRadius: 24,
    pillRadius: 9999,
    shadow: {
      shadowColor: isDark ? "#000" : "#0f172a",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.35 : 0.04,
      shadowRadius: 14,
      elevation: 2,
    },
    heroShadow: {
      shadowColor: isDark ? "#000" : "#0f172a",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.45 : 0.06,
      shadowRadius: 20,
      elevation: 3,
    },
  };
}

export type ExamTheme = ReturnType<typeof getExamTheme>;
