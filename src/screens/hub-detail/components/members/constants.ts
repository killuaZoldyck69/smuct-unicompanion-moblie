import { Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CourseHubMember, HubRole } from "@/types/member.types";

export const BENTO = {
  canvas: "#f8fafc",
  card: "#ffffff",
  navy: "#0f172a",
  slate: "#64748b",
  slateLight: "#94a3b8",
  border: "rgba(15, 23, 42, 0.08)",
  blueSoft: "#eff6ff",
  blueBorder: "#dbeafe",
  blueText: "#1d4ed8",
  mintSoft: "#f0fdf4",
  mintBorder: "#bbf7d0",
  mintText: "#15803d",
  roseSoft: "#fff1f2",
  roseBorder: "#fecdd3",
  roseText: "#e11d48",
  amberSoft: "#fffbeb",
  amberText: "#b45309",
  purpleSoft: "#faf5ff",
  purpleText: "#7e22ce",
};

export const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export const ROLE_CONFIG: Record<
  HubRole,
  {
    title: string;
    badgeLabel: string;
    icon: keyof typeof Feather.glyphMap;
    color: string;
    bg: string;
  }
> = {
  STUDENT: {
    title: "Student",
    badgeLabel: "Student",
    icon: "user",
    color: BENTO.blueText,
    bg: BENTO.blueSoft,
  },
  CR: {
    title: "CR",
    badgeLabel: "CR",
    icon: "star",
    color: BENTO.amberText,
    bg: BENTO.amberSoft,
  },
  TA: {
    title: "TA",
    badgeLabel: "TA",
    icon: "shield",
    color: BENTO.purpleText,
    bg: BENTO.purpleSoft,
  },
  TEACHER: {
    title: "Course Instructor",
    badgeLabel: "Instructor",
    icon: "award",
    color: BENTO.navy,
    bg: "#f1f5f9",
  },
};

export function formatSemester(sem?: number | string | null): string {
  if (!sem) return "";
  const n = Number(sem);
  if (isNaN(n) || n <= 0) return `${sem} Semester`;
  const j = n % 10,
    k = n % 100;
  let suffix = "th";
  if (j === 1 && k !== 11) suffix = "st";
  else if (j === 2 && k !== 12) suffix = "nd";
  else if (j === 3 && k !== 13) suffix = "rd";
  return `${n}${suffix} Semester`;
}

export function getMemberSubtext(member: CourseHubMember): string {
  if (member.role === "TEACHER") {
    return member.user?.email || "Faculty";
  }
  return (
    member.user?.studentProfile?.studentId ||
    member.user?.email ||
    ""
  );
}
