import { getDepartmentShortName } from "@/data/programs";
import { parseOrdinalParts } from "@/utils/academic-formatters";
import type { ForumAuthor } from "@/features/forum/types";
import {
  stripHtmlToPlainText,
  countTotalThreadResponses,
  formatShareMessage,
} from "@/features/forum/forum-logic";

export { stripHtmlToPlainText, countTotalThreadResponses, formatShareMessage };

function parseValidDate(dateString?: string): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function timeAgo(dateString?: string): string {
  const date = parseValidDate(dateString);
  if (!date) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return "Just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatPostedTime(dateString?: string): string {
  const date = parseValidDate(dateString);
  if (!date) return "";
  const dateStr = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${dateStr}, ${formatTimeOnly(dateString)}`;
}

export function formatTimeOnly(dateString?: string): string {
  const date = parseValidDate(dateString);
  if (!date) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function isEdited(createdAt?: string, updatedAt?: string): boolean {
  const created = parseValidDate(createdAt);
  const updated = parseValidDate(updatedAt);
  if (!created || !updated) return false;
  // Ignore sub-5s persistence timestamps between initial insert and post-hook writes
  return updated.getTime() - created.getTime() > 5000;
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

export interface AuthorAcademicInfo {
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  semesterNum?: string;
  suffix?: string;
  superSuffix?: string;
  deptShort?: string;
  designation?: string;
  fullText: string;
}

export function getAuthorAcademicInfo(
  author?: Partial<ForumAuthor> | null,
): AuthorAcademicInfo {
  if (!author) {
    return {
      isStudent: false,
      isTeacher: false,
      isAdmin: false,
      fullText: "University Member",
    };
  }

  if (author.teacherProfile) {
    const rawDept = author.teacherProfile.department;
    const deptShort = rawDept ? getDepartmentShortName(rawDept) : "";
    const designation = author.teacherProfile.designation?.trim() || "Faculty";
    const parts = [designation, deptShort].filter(Boolean);
    const fullText = parts.length > 0 ? parts.join(" • ") : "Faculty";

    return {
      isStudent: false,
      isTeacher: true,
      isAdmin: false,
      designation,
      deptShort,
      fullText,
    };
  }

  if (author.studentProfile) {
    const rawDept = author.studentProfile.department;
    const deptShort = rawDept ? getDepartmentShortName(rawDept) : "";
    const sem = author.studentProfile.currentSemester;

    if (sem != null && String(sem).trim() !== "") {
      const { numberPart, suffix } = parseOrdinalParts(sem);
      const superSuffix = getOrdinalSuperscript(suffix);
      const semLabel = `${numberPart}${superSuffix} Semester`;
      const fullText = deptShort ? `${semLabel} • ${deptShort}` : semLabel;

      return {
        isStudent: true,
        isTeacher: false,
        isAdmin: false,
        semesterNum: numberPart,
        suffix,
        superSuffix,
        deptShort,
        fullText,
      };
    }

    const fullText = deptShort ? `Student • ${deptShort}` : "Student";
    return {
      isStudent: true,
      isTeacher: false,
      isAdmin: false,
      deptShort,
      fullText,
    };
  }

  if (author.role === "ADMIN") {
    return {
      isStudent: false,
      isTeacher: false,
      isAdmin: true,
      fullText: "Administrator",
    };
  }

  return {
    isStudent: false,
    isTeacher: false,
    isAdmin: false,
    fullText: "University Member",
  };
}

