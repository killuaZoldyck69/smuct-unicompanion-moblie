import { RemainingDaysInfo, SubmissionTypeInfo, AssessmentTypeConfig } from "./types";

const ICONS = {
  assignment: require("../../../../assets/icons/assignment.png"),
  quiz: require("../../../../assets/icons/quiz.png"),
  presentation: require("../../../../assets/icons/presentation.png"),
} as const;

export const parseDateSafe = (dateInput?: any): Date | null => {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  if (typeof dateInput === "number") {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    if (!trimmed) return null;

    let d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;

    if (trimmed.includes(" ")) {
      d = new Date(trimmed.replace(" ", "T"));
      if (!isNaN(d.getTime())) return d;
    }

    const parts = trimmed.split(/[-T :]/);
    if (parts.length >= 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const hour = parts.length > 3 ? parseInt(parts[3], 10) : 23;
      const min = parts.length > 4 ? parseInt(parts[4], 10) : 59;
      d = new Date(year, month, day, hour, min);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
};

export const formatDueDate = (dateString?: any): string => {
  const d = parseDateSafe(dateString);
  if (!d) return "No deadline";
  try {
    const day = d.getDate();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  } catch {
    return "No deadline";
  }
};

export const getRemainingDaysInfo = (deadline?: any): RemainingDaysInfo | null => {
  const d = parseDateSafe(deadline);
  if (!d) return null;

  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffMs < 0) {
    const pastDays = Math.max(1, Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24)));
    return {
      text: pastDays === 1 ? "Overdue (1d ago)" : `Overdue (${pastDays}d ago)`,
      isOverdue: true,
      isUrgent: false,
    };
  }
  if (diffHours <= 24) {
    if (diffHours <= 1) {
      return {
        text: "Due in < 1h",
        isOverdue: false,
        isUrgent: true,
      };
    }
    return {
      text: `Due in ${diffHours}h`,
      isOverdue: false,
      isUrgent: true,
    };
  }
  if (diffDays === 1) {
    return {
      text: "1 day left",
      isOverdue: false,
      isUrgent: true,
    };
  }
  return {
    text: `${diffDays} days left`,
    isOverdue: false,
    isUrgent: diffDays <= 2,
  };
};

export const getSubmissionTypeInfo = (submissionType?: string): SubmissionTypeInfo => {
  const type = (submissionType || "ONLINE").toUpperCase();
  const isHand = type === "HAND" || type === "OFFLINE";
  return {
    isHand,
    label: isHand ? "In-Hand" : "Online",
    icon: isHand ? "clipboard" : "globe",
  };
};

export const getAssessmentTypeConfig = (type?: string): AssessmentTypeConfig => {
  const t = (type || "ASSIGNMENT").toUpperCase();
  if (t.includes("QUIZ") || t.includes("CT")) {
    return {
      label: "CT / Quiz",
      icon: "clipboard" as const,
      assetIcon: ICONS.quiz,
      badgeBg: "#EFF6FF",
      badgeText: "#2563EB",
      iconBg: "#EFF6FF",
      iconColor: "#2563EB",
      iconBorder: "#DBEAFE",
    };
  }
  if (t.includes("PRESENTATION")) {
    return {
      label: "Presentation",
      icon: "monitor" as const,
      assetIcon: ICONS.presentation,
      badgeBg: "#ECFDF5",
      badgeText: "#059669",
      iconBg: "#ECFDF5",
      iconColor: "#059669",
      iconBorder: "#A7F3D0",
    };
  }
  if (t.includes("EXAM") || t.includes("MID") || t.includes("FINAL")) {
    return {
      label: "Exam",
      icon: "award" as const,
      badgeBg: "#FAF5FF",
      badgeText: "#7E22CE",
      iconBg: "#FAF5FF",
      iconColor: "#7E22CE",
      iconBorder: "#E9D5FF",
    };
  }
  // Default: Assignment
  return {
    label: "Assignment",
    icon: "file-text" as const,
    assetIcon: ICONS.assignment,
    badgeBg: "#FDF2F8",
    badgeText: "#C026D3",
    iconBg: "#FDF2F8",
    iconColor: "#C026D3",
    iconBorder: "#FCE7F3",
  };
};
