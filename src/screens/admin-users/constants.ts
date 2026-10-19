// --- Theme Tokens matching uploaded mockup ---
export const THEME = {
  bg: "#F8FAFC",
  headerBg: "#F8FAFC",
  cardBg: "#FFFFFF",
  cardBorder: "#F1F5F9",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  inputBg: "#FFFFFF",
  inputBorder: "#E2E8F0",
  // Students Active Colors
  studentPrimary: "#00875A",
  studentPrimaryBg: "#ECFDF5",
  studentPillActive: "#00875A",
  studentPillInactive: "#EFF6FF",
  // Teachers Active Colors
  teacherPrimary: "#4338CA",
  teacherPrimaryBg: "#EEF2FF",
  teacherPillActive: "#6366F1",
  teacherPillInactive: "#EDE9FE",
  // Badges
  crBadgeBg: "#FEF08A",
  crBadgeText: "#854D0E",
};

// Pastel container palettes for avatars (alternating soft cards)
export const AVATAR_PASTELS = [
  { bg: "#E6F9F2", border: "#C1F0DF" }, // Mint / Emerald
  { bg: "#EFF6FF", border: "#DBEAFE" }, // Soft Sky Blue
  { bg: "#F5F3FF", border: "#EDE9FE" }, // Soft Lavender
  { bg: "#FFFBEB", border: "#FEF3C7" }, // Soft Butter Yellow / Peach
  { bg: "#FFF1F2", border: "#FFE4E6" }, // Soft Rose
];

export const DEPARTMENT_CHIPS = [
  "All",
  "CSE",
  "CSIT",
  "AMMT",
  "FDT",
  "IA",
  "GDM",
  "ARCH",
  "BBA",
  "ENG",
  "LAW",
  "SOC",
  "BAN",
  "G&P",
  "IS",
  "FA",
  "MUS",
  "DAN",
] as const;
