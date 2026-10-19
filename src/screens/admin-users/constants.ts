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

export const DESIGNATION_OPTIONS = [
  "Lecturer",
  "Senior Lecturer",
  "Assistant Professor",
  "Associate Professor",
  "Professor",
  "Adjunct Faculty",
] as const;

export interface TeacherAdminRoleOption {
  label: string;
  value: string | null;
  description?: string;
}

export const TEACHER_ADMIN_ROLE_OPTIONS: TeacherAdminRoleOption[] = [
  {
    label: "Head of Department (HOD)",
    value: "HOD",
    description: "Departmental academic & administrative lead",
  },
  {
    label: "Program Coordinator",
    value: "Coordinator",
    description: "Curriculum, batch & academic routine coordinator",
  },
  {
    label: "Dean",
    value: "Dean",
    description: "Faculty dean & executive academic head",
  },
  {
    label: "Assistant Dean",
    value: "Assistant Dean",
    description: "Deputy faculty dean",
  },
  {
    label: "None (Remove Leadership Role)",
    value: null,
    description: "Regular faculty member without administrative role",
  },
];

export const BLOOD_GROUP_OPTIONS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const BLOOD_GROUP_UI_TO_API: Record<string, string> = {
  "A+": "A_POSITIVE",
  "A-": "A_NEGATIVE",
  "B+": "B_POSITIVE",
  "B-": "B_NEGATIVE",
  "AB+": "AB_POSITIVE",
  "AB-": "AB_NEGATIVE",
  "O+": "O_POSITIVE",
  "O-": "O_NEGATIVE",
};

export const BLOOD_GROUP_API_TO_UI: Record<string, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
};

export const DAY_OFF_OPTIONS = [
  "Friday",
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "DAY OFF",
] as const;

export const FACULTY_OPTIONS = [
  "Faculty of Science and Information Technology",
  "Faculty of Business Administration",
  "Faculty of Design and Technology",
  "Faculty of Arts and Social Sciences",
] as const;

