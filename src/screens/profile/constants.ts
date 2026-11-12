import { colors } from "@/theme/colors";
import { fontFamily, titleFontFamily } from "@/theme/typography";

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
    badgeBg: colors.slate100,
    badgeBorder: colors.inkAlpha08,
    accentText: colors.navyDeep,
    accentColor: colors.navyDeep,
  },

  // Student Academic Record: Calm academic blue
  ACADEMIC: {
    primaryText: colors.semantic.blue.darker,
    headerBg: colors.semantic.blue.alpha06,
    badgeBg: colors.semantic.blue.tint,
    badgeBorder: colors.semantic.blue.alpha14,
    tileBg: colors.slate50,
    tileBorder: colors.semantic.blue.alpha10,
    iconColor: colors.semantic.blue.accent,
    divider: colors.semantic.blue.alpha08,
  },

  // Faculty Academic Position: Amber/Yellow
  FACULTY_ACADEMIC: {
    primaryText: colors.semantic.yellow.darkText,
    headerBg: colors.semantic.yellow.alpha08,
    badgeBg: colors.semantic.yellow.tint,
    badgeBorder: colors.semantic.yellow.alpha18,
    tileBg: colors.semantic.amber.tint,
    tileBorder: colors.semantic.yellow.alpha14,
    iconColor: colors.semantic.yellow.darkText,
    iconCircleBg: colors.semantic.yellow.soft,
    divider: colors.semantic.yellow.alpha10,
  },

  // Professional Skills: Sage/Teal — calm, technical
  SKILLS: {
    primaryText: colors.semantic.teal.solid,
    badgeBg: colors.semantic.teal.tint,
    badgeBorder: colors.semantic.teal.alpha14,
    iconColor: colors.semantic.teal.solid,
    chipBg: colors.white,
    chipBorder: colors.semantic.teal.alpha18,
    chipText: colors.semantic.teal.darkText,
    addBtnBg: colors.semantic.teal.solid,
  },

  // Contact & Safety: muted coral (blood) + warm amber (phone)
  BLOOD: {
    primaryText: colors.semantic.rose.deep,
    badgeBg: colors.semantic.rose.tint,
  },
  PHONE: {
    primaryText: colors.semantic.amber.accent,
    badgeBg: colors.semantic.amber.tint,
  },
  CONTACT: {
    primaryText: colors.semantic.rose.deep,
    badgeBg: colors.semantic.rose.tint,
    badgeBorder: colors.semantic.rose.alpha14,
    iconColor: colors.semantic.red.accent,
    iconCircleBg: colors.semantic.red.softBorder,
    phoneText: colors.semantic.amber.darkText,
    phoneBg: colors.semantic.amber.tint,
    phoneBorder: colors.semantic.amber.brownAlpha14,
    phoneIconColor: colors.semantic.amber.accent,
    phoneIconCircleBg: colors.semantic.amber.soft,
    tileBg: colors.white,
  },

  // Portfolio / Social: Soft indigo
  SOCIAL: {
    primaryText: colors.semantic.indigo.solid,
    badgeBg: colors.semantic.indigo.tint,
  },
  LINKS: {
    primaryText: colors.semantic.indigo.solid,
    badgeBg: colors.semantic.indigo.tint,
    badgeBorder: colors.semantic.indigo.alpha14,
    iconColor: colors.semantic.indigo.solid,
    iconCircleBg: colors.semantic.indigo.border,
  },
} as const;

export const PROFILE_COLORS = {
  background: colors.homeBackground,
  surface: colors.profileSurface,
  deepNavy: colors.navyDeep,
  white: colors.white,
  neutralText: colors.onSurface,
  subtleText: colors.slate500,
  mutedText: colors.slate400,
  cardRadius: 22,
  innerRadius: 14,
  pillRadius: 9999,
  subtleBorder: colors.navyAlpha06,
  border: colors.navyAlpha08,
  shadow: {
    shadowColor: colors.navyDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  heroShadow: {
    shadowColor: colors.navyDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
} as const;

export { fontFamily, titleFontFamily };

export const PROFILE_CACHE_CONFIG = {
  staleTime: Infinity,
  gcTime: 1000 * 60 * 60 * 24,
  refetchOnMount: false as const,
  refetchOnWindowFocus: false as const,
  refetchOnReconnect: false as const,
} as const;
