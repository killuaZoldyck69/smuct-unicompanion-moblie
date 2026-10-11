import { Platform } from "react-native";

export const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export const DIRECTORY_COLORS = {
  // Foundations
  background: "#f8f9fa",
  surface: "#ffffff",
  surfaceMuted: "#f1f5f9",
  cardBorder: "rgba(15, 23, 42, 0.07)",
  divider: "rgba(15, 23, 42, 0.06)",

  // Typography
  deepNavy: "#131b2e",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",

  // Bento Palette Accents
  blueSoft: "#eff6ff",
  blueBorder: "#bfdbfe",
  blueText: "#1d4ed8",
  blueBadge: "#2563eb",

  tealSoft: "#e6f8f2",
  tealBorder: "#99f6e4",
  tealText: "#0f766e",
  tealDark: "#0d9488",

  amberSoft: "#fef3c7",
  amberBorder: "#fde68a",
  amberText: "#b45309",
  amberDark: "#d97706",

  purpleSoft: "#f5f3ff",
  purpleBorder: "#ddd6fe",
  purpleText: "#6d28d9",

  // Radii
  cardRadius: 20,
  pillRadius: 9999,
  innerRadius: 14,

  // Shadows
  shadow: Platform.select({
    web: { boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)" } as any,
    default: {
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
  }),
  cardShadow: Platform.select({
    web: { boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)" } as any,
    default: {
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.07,
      shadowRadius: 12,
      elevation: 3,
    },
  }),
};
