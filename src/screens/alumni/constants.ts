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
  neutralText: "#191c1d",
  subtleText: "#64748b",
  cardRadius: 24,
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

export const BENTO = {
  canvas: "#f7f9fb",
  card: "#ffffff",
  navy: "#131b2e",
  navySecondary: "#1e293b",
  slate: "#64748b",
  slateLight: "#94a3b8",
  slateSubtle: "#f1f5f9",
  border: "rgba(15, 23, 42, 0.08)",
  borderHover: "rgba(15, 23, 42, 0.16)",
  borderFocus: "#3b82f6",
  primary: "#1e3a8a",
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
};

export const AVATAR_PALETTES = [
  { bg: "#eef2ff", text: "#4338ca", border: "#c7d2fe" },
  { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" },
  { bg: "#fffbeb", text: "#d97706", border: "#fde68a" },
  { bg: "#f5f3ff", text: "#7c3aed", border: "#ddd6fe" },
  { bg: "#fdf2f8", text: "#db2777", border: "#fbcfe8" },
  { bg: "#f0fdfa", text: "#0d9488", border: "#99f6e4" },
  { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
  { bg: "#fff1f2", text: "#e11d48", border: "#fecdd3" },
];
