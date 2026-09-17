import { Platform } from "react-native";

export const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export const BENTO_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1e",
  subtleText: "#45607e",
  mutedText: "#8e9196",
  cardRadius: 18,
  pillRadius: 9999,
  subtleBorder: "rgba(15, 23, 42, 0.08)",
  border: "rgba(15, 23, 42, 0.08)",
  shadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 1,
  },
  heroShadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
} as const;

export const BENTO = {
  canvas: "#f7f9fb",
  card: "#ffffff",
  surfaceSecondary: "#f2f4f6",
  surfaceTertiary: "#eceef0",
  navy: "#131b2e",
  navySecondary: "#1e293b",
  slate: "#45607e",
  slateLight: "#8e9196",
  slateSubtle: "#f1f5f9",
  textPrimary: "#191c1e",
  textSecondary: "#45607e",
  textMuted: "#8e9196",
  border: "rgba(15, 23, 42, 0.08)",
  borderHover: "rgba(15, 23, 42, 0.16)",
  borderFocus: "#3b82f6",
  primary: "#131b2e",
  primaryLight: "#eff6ff",
  emerald: "#059669",
  emeraldBg: "#ecfdf5",
  emeraldBorder: "#a7f3d0",
  amber: "#d97706",
  amberBg: "#fffbeb",
  amberBorder: "#fde68a",
  rose: "#dc2626",
  roseBg: "#fef2f2",
  roseBorder: "#fecaca",
  indigo: "#4338ca",
  indigoBg: "#eef2ff",
  indigoBorder: "#c7d2fe",
  purple: "#7c3aed",
  purpleBg: "#f5f3ff",
  purpleBorder: "#ddd6fe",
  teal: "#0d9488",
  tealBg: "#f0fdfa",
  tealBorder: "#99f6e4",
  fontHeading: fontFamily,
  fontBody: fontFamily,
  cardRadius: 18,
  pillRadius: 9999,
};

export const AVATAR_PALETTES = [
  { bg: "#eef2ff", text: "#4338ca", border: "#c7d2fe" }, // CSE
  { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" }, // BBA
  { bg: "#fffbeb", text: "#d97706", border: "#fde68a" }, // Civil
  { bg: "#f5f3ff", text: "#7c3aed", border: "#ddd6fe" }, // EEE
  { bg: "#fdf2f8", text: "#db2777", border: "#fbcfe8" }, // Textile
  { bg: "#f0fdfa", text: "#0d9488", border: "#99f6e4" }, // Law
  { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" }, // Blue
  { bg: "#fff1f2", text: "#e11d48", border: "#fecdd3" }, // Fashion
];

