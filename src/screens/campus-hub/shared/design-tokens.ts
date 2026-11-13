import { colors } from "@/theme/colors";
import { rounded, shadows } from "@/theme/layout";
import { fontFamily, titleFontFamily } from "@/theme/typography";
import { getDepartmentShortName } from "@/data/programs";
import { parseOrdinalParts } from "@/utils/academic-ordinal";

export const CAMPUS_HUB_COLORS = {
  background: colors.homeBackground,
  deepNavy: colors.navyDeep,
  white: colors.white,
  neutralText: colors.onBackground,
  subtleText: colors.slate500,
  subtleBorder: colors.borderSubtle,

  lostFoundAccent: colors.semantic.amber.solid,
  lostFoundAccentLight: colors.semantic.amber.soft,
  lostFoundAccentFill: colors.semantic.amber.deep,
  lostFoundAccentText: colors.semantic.amber.deep,
  lostFoundAccentInk: colors.semantic.amber.darkText,
  skyTint: colors.semantic.sky.tint,
  skyBorder: colors.semantic.sky.border,
  skyAccentInk: colors.semantic.sky.deep,
  emeraldFill: colors.semantic.emerald.darker,
  mutedInk: colors.slate600,
  cardBorder: colors.slate200,
  contentMaxWidth: 720,
  androidRipple: "rgba(15, 23, 42, 0.08)",
  androidRippleLight: "rgba(255, 255, 255, 0.24)",

  marketplaceAccent: colors.semantic.emerald.solid,
  marketplaceAccentLight: colors.semantic.emerald.border,
  marketplaceAccentText: colors.semantic.emerald.darker,

  forumAccent: colors.semantic.blue.deep,
  forumAccentLight: colors.semantic.blue.soft,
  forumAccentText: "#1e40af",

  complaintAccent: colors.semantic.violet.solid,
  complaintAccentLight: "#ede9fe",
  complaintAccentText: colors.semantic.violet.deep,

  memeAccent: "#ec4899",
  memeAccentLight: "#fdf2f8",
  memeAccentText: "#be185d",

  dangerText: colors.semantic.rose.deep,
  dangerBg: colors.semantic.rose.softBorder,

  cardRadius: 22,
  pillRadius: rounded.full,

  shadow: {
    ...shadows.level1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
  },
  heroShadow: {
    shadowColor: colors.navyDeep,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 6,
  },
  // Lost vs Found semantic tones
  lostRose: colors.semantic.rose.solid,
  lostRoseBg: colors.semantic.rose.tint,
  lostRoseText: colors.semantic.rose.deep,
  lostRoseBorder: colors.semantic.rose.border,

  foundTeal: colors.semantic.teal.solid,
  foundTealBg: colors.semantic.teal.tint,
  foundTealText: "#0f766e",
  foundTealBorder: "#99f6e4",

  resolvedGreen: colors.semantic.emerald.solid,
  resolvedGreenBg: colors.semantic.emerald.tint,
  resolvedGreenText: colors.semantic.emerald.darker,
  resolvedGreenBorder: colors.semantic.emerald.mintBorderStrong,

  surfaceMuted: colors.slate100,
} as const;

export { fontFamily, titleFontFamily };

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

export const ORDINAL_SUPERSCRIPTS: Record<string, string> = {
  st: "\u02E2\u1D57", // ˢᵗ
  nd: "\u207F\u1D48", // ⁿᵈ
  rd: "\u02B3\u1D48", // ʳᵈ
  th: "\u1D57\u02B0", // ᵗʰ
};

export function getOrdinalSuperscript(suffix?: string): string {
  if (!suffix) return "";
  return ORDINAL_SUPERSCRIPTS[suffix.toLowerCase()] || suffix;
}

export interface MemePosterSubtitleInfo {
  isStudentWithSemester: boolean;
  semesterNum?: string;
  superSuffix?: string;
  deptShort?: string;
  text: string;
}

/**
 * Standard poster subtitle formatter for Campus Hub Memes:
 * - Student: "{semesterNum}{superSuffix} • {deptShort}" (e.g. 10ᵗʰ • CSE)
 * - Teacher: "{designation} • {deptShort}" (e.g. Lecturer • CSE)
 * - Admin: "Admin" (role only)
 */
export function formatMemePosterSubtitle(
  author?: {
    role?: string | null;
    studentProfile?: {
      department?: string | null;
      currentSemester?: number | string | null;
      semester?: number | string | null;
    } | null;
    teacherProfile?: {
      department?: string | null;
      designation?: string | null;
    } | null;
  } | null
): MemePosterSubtitleInfo {
  if (!author) {
    return { isStudentWithSemester: false, text: "Campus Peer" };
  }

  // 1. Admin: Show role only "Admin"
  if (author.role === "ADMIN") {
    return {
      isStudentWithSemester: false,
      text: "Admin",
    };
  }

  // 2. Teacher: Show designation and department shortname
  const isTeacher =
    author.role === "TEACHER" ||
    (Boolean(author.teacherProfile?.designation || author.teacherProfile?.department) &&
      !author.studentProfile?.currentSemester &&
      !author.studentProfile?.semester);

  if (isTeacher && author.teacherProfile) {
    const designation = author.teacherProfile.designation?.trim();
    const rawDept = author.teacherProfile.department?.trim();
    const deptShort = rawDept ? getDepartmentShortName(rawDept) : "";

    let text = "Faculty";
    if (designation && deptShort) {
      text = `${designation} • ${deptShort}`;
    } else if (designation) {
      text = designation;
    } else if (deptShort) {
      text = `Faculty • ${deptShort}`;
    }

    return {
      isStudentWithSemester: false,
      deptShort,
      text,
    };
  }

  // 3. Student: Show semester like 10th (with superscript) • DeptShort
  const rawSem =
    author.studentProfile?.currentSemester ??
    author.studentProfile?.semester;
  const rawDept = author.studentProfile?.department?.trim();
  const deptShort = rawDept ? getDepartmentShortName(rawDept) : "";

  if (rawSem !== null && rawSem !== undefined && String(rawSem).trim() !== "") {
    const { numberPart, suffix } = parseOrdinalParts(rawSem);
    if (numberPart && numberPart !== "—") {
      const superSuffix = getOrdinalSuperscript(suffix);
      const fullText = deptShort
        ? `${numberPart}${superSuffix} • ${deptShort}`
        : `${numberPart}${superSuffix}`;

      return {
        isStudentWithSemester: true,
        semesterNum: numberPart,
        superSuffix,
        deptShort,
        text: fullText,
      };
    }
  }

  if (deptShort) {
    return {
      isStudentWithSemester: false,
      deptShort,
      text: deptShort,
    };
  }

  if (author.role === "STUDENT" || author.studentProfile) {
    return {
      isStudentWithSemester: false,
      text: "Student",
    };
  }

  // Fallback Teacher if teacherProfile exists
  if (author.teacherProfile) {
    const designation = author.teacherProfile.designation?.trim();
    const rawDept = author.teacherProfile.department?.trim();
    const deptShort = rawDept ? getDepartmentShortName(rawDept) : "";
    let text = "Faculty";
    if (designation && deptShort) {
      text = `${designation} • ${deptShort}`;
    } else if (designation) {
      text = designation;
    } else if (deptShort) {
      text = `Faculty • ${deptShort}`;
    }
    return {
      isStudentWithSemester: false,
      deptShort,
      text,
    };
  }

  return {
    isStudentWithSemester: false,
    text: "Campus Peer",
  };
}
