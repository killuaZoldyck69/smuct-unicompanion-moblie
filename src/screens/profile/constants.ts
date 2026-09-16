import { Platform } from "react-native";

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  cardGap: 14,
} as const;

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const BLOOD_GROUP_TO_DB: Record<string, string> = {
  "A+": "A_POSITIVE",
  "A-": "A_NEGATIVE",
  "B+": "B_POSITIVE",
  "B-": "B_NEGATIVE",
  "AB+": "AB_POSITIVE",
  "AB-": "AB_NEGATIVE",
  "O+": "O_POSITIVE",
  "O-": "O_NEGATIVE",
};

export const BLOOD_GROUP_TO_UI: Record<string, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
};

export const SECTION_THEMES = {
  // Identity: Neutral surface with deep navy anchors
  IDENTITY: {
    badgeBg: "#f1f5f9",
    badgeBorder: "rgba(15, 23, 42, 0.08)",
    accentText: "#131b2e",
    accentColor: "#131b2e",
  },
  // Academic Record: Reuses Academic Blue from Explore Features (#1d4ed8 / #eff6ff)
  ACADEMIC: {
    primaryText: "#1d4ed8",
    headerBg: "rgba(37, 99, 235, 0.06)",
    badgeBg: "#eff6ff",
    badgeBorder: "rgba(37, 99, 235, 0.14)",
    tileBg: "#f8fafc",
    tileBorder: "rgba(37, 99, 235, 0.10)",
    iconColor: "#2563eb",
    divider: "rgba(37, 99, 235, 0.08)",
  },
  // Professional Skills: Reuses Campus Life Emerald (#047857 / #ecfdf5)
  SKILLS: {
    primaryText: "#047857",
    badgeBg: "#ecfdf5",
    badgeBorder: "rgba(5, 150, 105, 0.14)",
    iconColor: "#059669",
    chipBg: "#ffffff",
    chipBorder: "rgba(5, 150, 105, 0.20)",
    chipText: "#065f46",
    addBtnBg: "#059669",
  },
  // Contact & Safety: Reuses Support & Aid Crimson (#be123c / #fff1f2)
  CONTACT: {
    primaryText: "#be123c",
    badgeBg: "#fff1f2",
    badgeBorder: "rgba(225, 29, 72, 0.14)",
    iconColor: "#dc2626",
    iconCircleBg: "#fee2e2",
    tileBg: "#ffffff",
  },
  // External Links: Digital web cyan (#0284c7 / #f0f9ff)
  LINKS: {
    primaryText: "#0284c7",
    badgeBg: "#f0f9ff",
    badgeBorder: "rgba(2, 132, 199, 0.14)",
    iconColor: "#0284c7",
    iconCircleBg: "#e0f2fe",
  },
} as const;

export const PROFILE_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  mutedText: "#94a3b8",
  cardRadius: 22,
  innerRadius: 14,
  pillRadius: 9999,
  subtleBorder: "rgba(19, 27, 46, 0.06)",
  border: "rgba(19, 27, 46, 0.08)",
  shadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
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
