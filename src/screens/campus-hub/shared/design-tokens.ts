import { Platform } from "react-native";
import { getDepartmentShortName } from "@/data/programs";

export const CAMPUS_HUB_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  subtleBorder: "rgba(0, 0, 0, 0.05)",

  lostFoundAccent: "#f59e0b",
  lostFoundAccentLight: "#fef3c7",
  lostFoundAccentText: "#b45309",

  marketplaceAccent: "#10b981",
  marketplaceAccentLight: "#d1fae5",
  marketplaceAccentText: "#047857",

  forumAccent: "#1e3a8a",
  forumAccentLight: "#dbeafe",
  forumAccentText: "#1e40af",

  complaintAccent: "#8b5cf6",
  complaintAccentLight: "#ede9fe",
  complaintAccentText: "#6d28d9",

  memeAccent: "#ec4899",
  memeAccentLight: "#fdf2f8",
  memeAccentText: "#be185d",

  dangerText: "#be123c",
  dangerBg: "#ffe4e6",

  cardRadius: 22,
  pillRadius: 9999,

  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  heroShadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 6,
  },
  // Lost vs Found semantic tones
  lostRose: "#e11d48",
  lostRoseBg: "#fff1f2",
  lostRoseText: "#be123c",
  lostRoseBorder: "#fecdd3",

  foundTeal: "#0d9488",
  foundTealBg: "#f0fdfa",
  foundTealText: "#0f766e",
  foundTealBorder: "#99f6e4",

  resolvedGreen: "#10b981",
  resolvedGreenBg: "#ecfdf5",
  resolvedGreenText: "#047857",
  resolvedGreenBorder: "#a7f3d0",

  surfaceMuted: "#f1f5f9",
} as const;

export const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export function timeAgo(dateString: string): string {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  if (isNaN(diffMs) || diffMs < 0) return "Just now";
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "Just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Formats a comment timestamp as e.g. "25 Sep, 11:00 AM"
 */
export function formatCommentDateTime(dateString?: string | null): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";

  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "short" });

  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesFormatted = minutes < 10 ? `0${minutes}` : String(minutes);

  return `${day} ${month}, ${hours}:${minutesFormatted} ${ampm}`;
}

/**
 * Formats a semester number or string into ordinal superscript representation
 * e.g. 10 -> "10ᵗʰ Semester", 1 -> "1ˢᵗ Semester", 2 -> "2ⁿᵈ Semester", 3 -> "3ʳᵈ Semester".
 */
export function formatSemesterOrdinal(
  sem: number | string | null | undefined
): string {
  if (sem === null || sem === undefined || sem === "") return "";
  const num = typeof sem === "number" ? sem : parseInt(String(sem).trim(), 10);
  if (!isNaN(num) && num > 0) {
    const s = ["ᵗʰ", "ˢᵗ", "ⁿᵈ", "ʳᵈ"];
    const v = num % 100;
    const suffix = s[(v - 20) % 10] || s[v] || s[0];
    return `${num}${suffix} Semester`;
  }
  const str = String(sem).trim();
  return str ? `${str} Semester` : "";
}

/**
 * Standard user subtitle formatter for Campus Hub (author, claimer, counterpart).
 * - If student: "{N}ᵗʰ Semester • {DeptShort}" (e.g. "10ᵗʰ Semester • CSE")
 * - If teacher: "{Designation} • {DeptShort}" (e.g. "Lecturer • CSE")
 * - If admin / fallback: role-based or custom fallback (e.g. "Campus Hub" or "SMUCT Member")
 */
export function formatCampusUserSubtitle(
  user?: {
    role?: string | null;
    studentProfile?: {
      department?: string | null;
      currentSemester?: number | string | null;
      semester?: number | string | null;
      studentId?: string | null;
    } | null;
    teacherProfile?: {
      department?: string | null;
      designation?: string | null;
    } | null;
  } | null,
  fallback = "Campus Hub"
): string {
  if (!user) return fallback;

  // 1. Teacher (check if explicitly TEACHER or only teacherProfile has data)
  const isTeacher =
    user.role === "TEACHER" ||
    (Boolean(user.teacherProfile?.designation || user.teacherProfile?.department) &&
      !user.studentProfile?.currentSemester);

  if (isTeacher && user.teacherProfile) {
    const designation = user.teacherProfile.designation?.trim() || "Faculty";
    const rawDept = user.teacherProfile.department?.trim();
    const dept = rawDept ? getDepartmentShortName(rawDept) : "";

    if (designation && dept) return `${designation} • ${dept}`;
    if (designation) return designation;
    if (dept) return dept;
    return "Faculty";
  }

  // 2. Student
  if (user.studentProfile || user.role === "STUDENT") {
    const sem = formatSemesterOrdinal(
      user.studentProfile?.currentSemester ?? user.studentProfile?.semester
    );
    const rawDept = user.studentProfile?.department?.trim();
    const dept = rawDept ? getDepartmentShortName(rawDept) : "";

    if (sem && dept) return `${sem} • ${dept}`;
    if (sem) return sem;
    if (dept) return dept;
    return "Student";
  }

  // 3. Fallback Teacher if teacherProfile exists
  if (user.teacherProfile) {
    const designation = user.teacherProfile.designation?.trim() || "Faculty";
    const rawDept = user.teacherProfile.department?.trim();
    const dept = rawDept ? getDepartmentShortName(rawDept) : "";

    if (designation && dept) return `${designation} • ${dept}`;
    if (designation) return designation;
    if (dept) return dept;
    return "Faculty";
  }

  // 4. Admin / Fallback
  if (user.role === "ADMIN") return "System Administrator";
  if (user.role === "TEACHER") return "Faculty";
  if (user.role === "STUDENT") return "Student";

  return fallback;
}
