import { Platform } from "react-native";

export const BENTO_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  subtleBorder: "rgba(0, 0, 0, 0.06)",
  primaryBlue: "#1e3a8a",
  emerald: "#047857",
  emeraldBg: "#d1fae5",
  emeraldBorder: "#10b981",
  sky: "#0369a1",
  skyBg: "#e0f2fe",
  skyPulse: "#60a5fa",
  danger: "#be123c",
  dangerBg: "#ffe4e6",
  slateBg: "#f1f5f9",
  cardRadius: 22,
  pillRadius: 9999,
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  heroShadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
};

export const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export const MAX_TITLE_LENGTH = 150;
export const MAX_DESCRIPTION_LENGTH = 3000;
export const MAX_RESPONSE_LENGTH = 2000;
