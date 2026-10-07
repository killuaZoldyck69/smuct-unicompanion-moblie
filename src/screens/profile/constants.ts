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

  // Student Academic Record: Calm academic blue (#1d4ed8 / #eff6ff)
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

  // Faculty Academic Position: Amber/Yellow
  FACULTY_ACADEMIC: {
    primaryText: "#854d0e",
    headerBg: "rgba(202, 138, 4, 0.08)",
    badgeBg: "#fefce8",
    badgeBorder: "rgba(202, 138, 4, 0.18)",
    tileBg: "#fffbeb",
    tileBorder: "rgba(202, 138, 4, 0.14)",
    iconColor: "#854d0e",
    iconCircleBg: "#fef9c3",
    divider: "rgba(202, 138, 4, 0.10)",
  },

  // Professional Skills: Sage/Teal — calm, technical
  SKILLS: {
    primaryText: "#0D9488",
    badgeBg: "#F0FDFA",
    badgeBorder: "rgba(13, 148, 136, 0.14)",
    iconColor: "#0D9488",
    chipBg: "#ffffff",
    chipBorder: "rgba(13, 148, 136, 0.18)",
    chipText: "#065F46",
    addBtnBg: "#0D9488",
  },

  // Contact & Safety: muted coral (blood) + warm peach (phone)
  BLOOD: {
    primaryText: "#be123c",
    badgeBg: "#fff1f2",
  },
  PHONE: {
    primaryText: "#d97706",
    badgeBg: "#fffbeb",
  },
  CONTACT: {
    // Blood group
    primaryText: "#be123c",
    badgeBg: "#fff1f2",
    badgeBorder: "rgba(225, 29, 72, 0.14)",
    iconColor: "#dc2626",
    iconCircleBg: "#fee2e2",
    // Phone
    phoneText: "#92400e",
    phoneBg: "#fffbeb",
    phoneBorder: "rgba(180, 83, 9, 0.14)",
    phoneIconColor: "#d97706",
    phoneIconCircleBg: "#fef3c7",
    tileBg: "#ffffff",
  },

  // Portfolio / Social: Soft indigo
  SOCIAL: {
    primaryText: "#4F46E5",
    badgeBg: "#EEF2FF",
  },
  LINKS: {
    primaryText: "#4F46E5",
    badgeBg: "#EEF2FF",
    badgeBorder: "rgba(79, 70, 229, 0.14)",
    iconColor: "#4F46E5",
    iconCircleBg: "#E0E7FF",
  },
} as const;

export const PROFILE_COLORS = {
  // Soft Editorial Campus palette (Bento theme matched)
  background: "#f7f9fb",       // bento theme background
  surface: "#FAFAF7",          // card surface (slightly brighter)
  deepNavy: "#131b2e",         // primary text / headings
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  heroShadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 4,
  },
} as const;

// Unified font: Aligns with Bento theme / ExploreHeader
export const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
}) as string;

export const PROFILE_CACHE_CONFIG = {
  staleTime: Infinity,
  gcTime: 1000 * 60 * 60 * 24, // 24 hours
  refetchOnMount: false as const,
  refetchOnWindowFocus: false as const,
  refetchOnReconnect: false as const,
} as const;
