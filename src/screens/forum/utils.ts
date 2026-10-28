import type { FilterType, ForumCounts, ForumPostItem } from "./types";
import { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } from "./constants";
import { getDepartmentShortName } from "@/data/programs";
import { parseOrdinalParts } from "@/utils/academic-formatters";

export function timeAgo(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

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
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const dateStr = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${dateStr}, ${timeStr}`;
}

export function formatTimeOnly(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatEditedTime(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const dateStr = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateStr}, ${timeStr}`;
}

export function isEdited(createdAt?: string, updatedAt?: string): boolean {
  if (!createdAt || !updatedAt) return false;
  const created = new Date(createdAt).getTime();
  const updated = new Date(updatedAt).getTime();
  // Allow a 5-second grace window to ignore trivial DB differences
  return updated - created > 5000;
}

export function sanitizeForumPost(input: {
  title: string;
  description: string;
}): { title: string; description: string; plainText: string; error?: string } {
  const cleanTitle = (input.title || "").trim().slice(0, MAX_TITLE_LENGTH);
  const cleanDescription = (input.description || "").trim();
  const plainText = cleanDescription
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanTitle) {
    return {
      title: "",
      description: cleanDescription,
      plainText,
      error: "Please enter a question title.",
    };
  }

  if (cleanTitle.length < 5) {
    return {
      title: cleanTitle,
      description: cleanDescription,
      plainText,
      error: "Question title must be at least 5 characters.",
    };
  }

  if (!cleanDescription || !plainText) {
    return {
      title: cleanTitle,
      description: "",
      plainText: "",
      error: "Please provide details and context for your question.",
    };
  }

  if (plainText.length < 10) {
    return {
      title: cleanTitle,
      description: cleanDescription,
      plainText,
      error: "Please provide at least 10 characters of details and context.",
    };
  }

  return {
    title: cleanTitle,
    description: cleanDescription.slice(0, MAX_DESCRIPTION_LENGTH),
    plainText,
  };
}

export function computeForumFeed(
  posts: ForumPostItem[] | undefined,
  activeFilter: FilterType,
  searchQuery: string,
  currentUserId?: string,
): { filteredPosts: ForumPostItem[]; counts: ForumCounts } {
  const list = Array.isArray(posts) ? posts : [];

  let open = 0;
  let resolved = 0;
  let myPosts = 0;

  list.forEach((p) => {
    if (p.isResolved) {
      resolved++;
    } else {
      open++;
    }
    if (currentUserId && p.authorId === currentUserId) {
      myPosts++;
    }
  });

  let filtered = list;
  if (activeFilter === "UNRESOLVED") {
    filtered = filtered.filter((p) => !p.isResolved);
  } else if (activeFilter === "RESOLVED") {
    filtered = filtered.filter((p) => p.isResolved);
  } else if (activeFilter === "MY_POSTS") {
    filtered = filtered.filter((p) => p.authorId === currentUserId);
  }

  const cleanQuery = searchQuery.trim().toLowerCase();
  if (cleanQuery) {
    filtered = filtered.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(cleanQuery) ||
        (p.description || "").toLowerCase().includes(cleanQuery),
    );
  }

  return {
    filteredPosts: filtered,
    counts: {
      total: list.length,
      open,
      resolved,
      myPosts,
    },
  };
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

export function getAuthorAcademicInfo(author?: any): AuthorAcademicInfo {
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
    const sem =
      author.studentProfile.currentSemester ?? author.studentProfile.semester;

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

export function getUserAcademicSubtitle(author?: any): string {
  return getAuthorAcademicInfo(author).fullText;
}

