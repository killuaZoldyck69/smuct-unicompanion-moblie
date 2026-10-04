import { Platform } from "react-native";

export const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  default: "sans-serif",
});

export const BENTO_COLORS = {
  // Base Surfaces
  background: "#f7f9fb",
  surface: "#ffffff",
  surfaceElevated: "#ffffff",
  surfaceSubtle: "#f1f5f9",

  // Typography
  textPrimary: "#131b2e",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",

  // Brand / Accents
  deepNavy: "#131b2e",
  primary: "#3b5bf5",
  secondary: "#0284c7",

  // Borders
  border: "rgba(19, 27, 46, 0.08)",
  borderColor: "#e2e8f0",
  subtleBorder: "rgba(19, 27, 46, 0.05)",

  // Feedback
  success: "#059669",
  warning: "#d97706",
  danger: "#dc2626",

  // Pastels
  pastelMint: "#d1fae5",
  pastelBlue: "#e0f2fe",
  pastelIndigo: "#e0e7ff",
  pastelLavender: "#f3e8ff",
  pastelPink: "#fce7f3",
  pastelYellow: "#fef08a",
  pastelPeach: "#ffedd5",
  pastelRose: "#ffe4e6",
  pastelSage: "#dcfce7",
  pastelTeal: "#ccfbf1",

  // Geometry
  cardRadius: 24,
  pillRadius: 9999,
  innerRadius: 14,

  // Shadows
  shadow: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  cardShadow: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  heroShadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 4,
  },
} as const;

/**
 * Helper to get ordinal suffix for numbers (e.g. 1 -> 1st, 2 -> 2nd, 3 -> 3rd)
 */
export const getOrdinalSuffix = (num: number | string): string => {
  const n = typeof num === "string" ? parseInt(num, 10) : num;
  if (isNaN(n)) return String(num);
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
