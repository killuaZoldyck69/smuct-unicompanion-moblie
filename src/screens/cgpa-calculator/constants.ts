import { Platform } from "react-native";

export const BENTO_COLORS = {
  background: "#f8fafc",
  primaryBlue: "#3b5bf5",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#0f172a",
  subtleText: "#64748b",
  mutedText: "#94a3b8",
  cardRadius: 24,
  pillRadius: 9999,
  subtleBorder: "rgba(0, 0, 0, 0.06)",
  borderColor: "#e2e8f0",
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  heroShadow: {
    shadowColor: "#3b5bf5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 3,
  },
} as const;

export const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export interface GradeScaleItem {
  grade: string;
  point: number;
  marks: string;
  color: string;
}

export const GRADE_SCALE: GradeScaleItem[] = [
  { grade: "A+", point: 4.0, marks: "80% and above", color: "#059669" },
  { grade: "A", point: 3.75, marks: "75% to 79%", color: "#059669" },
  { grade: "A-", point: 3.5, marks: "70% to 74%", color: "#2563eb" },
  { grade: "B+", point: 3.25, marks: "65% to 69%", color: "#2563eb" },
  { grade: "B", point: 3.0, marks: "60% to 64%", color: "#0284c7" },
  { grade: "B-", point: 2.75, marks: "55% to 59%", color: "#d97706" },
  { grade: "C+", point: 2.5, marks: "50% to 54%", color: "#d97706" },
  { grade: "C", point: 2.25, marks: "45% to 49%", color: "#d97706" },
  { grade: "D", point: 2.0, marks: "40% to 44%", color: "#e11d48" },
  { grade: "F", point: 0.0, marks: "Less than 40%", color: "#dc2626" },
];

export const GRADE_MAP: Record<string, number> = GRADE_SCALE.reduce(
  (acc, curr) => ({ ...acc, [curr.grade]: curr.point }),
  {}
);

export interface CourseEntry {
  id: string;
  code?: string;
  title?: string;
  name?: string;
  credit: string;
  grade: string;
}

