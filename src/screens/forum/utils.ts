import type { FilterType, ForumCounts, ForumPostItem } from "./types";
import { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } from "./constants";

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
}): { title: string; description: string; error?: string } {
  const cleanTitle = (input.title || "").trim().slice(0, MAX_TITLE_LENGTH);
  const cleanDescription = (input.description || "")
    .trim()
    .slice(0, MAX_DESCRIPTION_LENGTH);

  if (!cleanTitle) {
    return {
      title: "",
      description: cleanDescription,
      error: "Question title is required.",
    };
  }

  if (!cleanDescription) {
    return {
      title: cleanTitle,
      description: "",
      error: "Question details & context are required.",
    };
  }

  return {
    title: cleanTitle,
    description: cleanDescription,
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

export function getUserAcademicSubtitle(author?: any): string {
  if (!author) return "University Member";
  if (author.studentProfile) {
    const { department, currentSemester, section } = author.studentProfile;
    const parts = [
      department,
      currentSemester ? `Sem ${currentSemester}` : null,
      section ? `Sec ${section}` : null,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" • ") : "Student";
  }
  if (author.teacherProfile) {
    const { department, designation } = author.teacherProfile;
    return [designation || "Faculty", department].filter(Boolean).join(" • ");
  }
  if (author.role === "ADMIN") return "Administrator";
  return "University Member";
}

