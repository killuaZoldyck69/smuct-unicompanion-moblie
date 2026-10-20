import { EventCategory } from "@/services/calendar-service";
import { Feather } from "@expo/vector-icons";
import { universityPrograms } from "@/data/programs";

export interface FacultyDefinition {
  id: string;
  name: string;
  shortName: string;
  rawFaculty: string;
  programs: string[];
}

const facultyConfig: Record<string, { id: string; shortName: string; displayName: string }> = {
  "FACULTY OF ENGINEERING & TECHNOLOGY": {
    id: "ET",
    shortName: "Engineering & Tech",
    displayName: "Faculty of Engineering & Technology (E&T)",
  },
  "FACULTY OF DESIGN & TECHNOLOGY": {
    id: "DT",
    shortName: "Design & Tech",
    displayName: "Faculty of Design & Technology (D&T)",
  },
  "FACULTY OF BUSINESS": {
    id: "FOB",
    shortName: "Business & Management",
    displayName: "Faculty of Business (FOB)",
  },
  "FACULTY OF HUMANITIES & SOCIAL SCIENCES": {
    id: "HSS",
    shortName: "Humanities & Social Sciences",
    displayName: "Faculty of Humanities & Social Sciences (H&SS)",
  },
  "FACULTY OF FINE & PERFORMING ARTS": {
    id: "FPA",
    shortName: "Fine & Performing Arts",
    displayName: "Faculty of Fine & Performing Arts (F&PA)",
  },
};

const facultyOrder = [
  "FACULTY OF ENGINEERING & TECHNOLOGY",
  "FACULTY OF DESIGN & TECHNOLOGY",
  "FACULTY OF BUSINESS",
  "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
  "FACULTY OF FINE & PERFORMING ARTS",
];

export const SMUCT_FACULTIES: FacultyDefinition[] = facultyOrder.map((facKey) => {
  const cfg = facultyConfig[facKey];
  const progs = universityPrograms
    .filter((p) => p.faculty === facKey)
    .map((p) => p.name);

  return {
    id: cfg.id,
    name: cfg.displayName,
    shortName: cfg.shortName,
    rawFaculty: facKey,
    programs: progs,
  };
});

export const ALL_SMUCT_PROGRAMS: string[] = SMUCT_FACULTIES.flatMap((f) => f.programs);

export const BENTO_COLORS = {
  background: "#f8fafc",
  cardBg: "#ffffff",
  deepNavy: "#0f172a",
  navyBorder: "#1e293b",
  heroNavy: "#0b1329",
  white: "#ffffff",
  subtleText: "#64748b",
  lightText: "#94a3b8",
  darkText: "#0f172a",
  border: "#e2e8f0",
  subtleBorder: "rgba(0, 0, 0, 0.05)",
  cardRadius: 20,
  innerRadius: 14,
  pillRadius: 9999,
  emeraldBg: "#ecfdf5",
  emeraldText: "#047857",
  amberBg: "#fffbeb",
  amberText: "#b45309",
  roseBg: "#fff1f2",
  roseText: "#be123c",
  slateBg: "#f1f5f9",
  slateText: "#475569",
  shadow: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  heroShadow: {
    shadowColor: "#0b1329",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

export interface CategoryVisualConfig {
  label: string;
  bg: string;
  surfaceBg: string;
  text: string;
  border: string;
  icon: keyof typeof Feather.glyphMap;
}

export const CATEGORY_VISUALS: Record<EventCategory, CategoryVisualConfig> = {
  CLASS: {
    label: "Class",
    bg: "#e0f2fe",
    surfaceBg: "#f8fafc",
    text: "#0369a1",
    border: "#bae6fd",
    icon: "book-open",
  },
  REGISTRATION: {
    label: "Registration",
    bg: "#ffe4e6",
    surfaceBg: "#fff1f2",
    text: "#e11d48",
    border: "#fecdd3",
    icon: "edit-3",
  },
  DEADLINE: {
    label: "Deadline",
    bg: "#fee2e2",
    surfaceBg: "#fff5f5",
    text: "#dc2626",
    border: "#fca5a5",
    icon: "alert-circle",
  },
  EXAM: {
    label: "Exam",
    bg: "#fef3c7",
    surfaceBg: "#fffdf0",
    text: "#d97706",
    border: "#fde68a",
    icon: "award",
  },
  HOLIDAY: {
    label: "Holiday",
    bg: "#d1fae5",
    surfaceBg: "#f0fdf4",
    text: "#059669",
    border: "#a7f3d0",
    icon: "sun",
  },
  MAKEUP_CLASS: {
    label: "Makeup",
    bg: "#cffafe",
    surfaceBg: "#f0fdfa",
    text: "#0891b2",
    border: "#a5f3fc",
    icon: "repeat",
  },
  RESULT: {
    label: "Result",
    bg: "#ede9fe",
    surfaceBg: "#faf5ff",
    text: "#7c3aed",
    border: "#ddd6fe",
    icon: "check-circle",
  },
  ACADEMIC: {
    label: "Academic",
    bg: "#f1f5f9",
    surfaceBg: "#f8fafc",
    text: "#475569",
    border: "#e2e8f0",
    icon: "bookmark",
  },
  OTHER: {
    label: "Other",
    bg: "#f3f4f6",
    surfaceBg: "#fafafa",
    text: "#4b5563",
    border: "#e5e7eb",
    icon: "tag",
  },
};

export const ALL_EVENT_CATEGORIES: EventCategory[] = [
  "CLASS",
  "REGISTRATION",
  "DEADLINE",
  "EXAM",
  "HOLIDAY",
  "MAKEUP_CLASS",
  "RESULT",
  "ACADEMIC",
  "OTHER",
];
