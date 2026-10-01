import { RemainingDaysInfo, SubmissionTypeInfo, AssessmentTypeConfig } from "./types";

export const formatDueDate = (dateString?: string): string => {
  if (!dateString) return "No deadline";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "No deadline";
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
    const hoursStr = hours.toString().padStart(2, "0");
    return `${day} ${month} ${year}, ${hoursStr}:${minutes} ${ampm}`;
  } catch {
    return "No deadline";
  }
};

export const getRemainingDaysInfo = (deadline?: string): RemainingDaysInfo | null => {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return null;

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
    badgeBg: "#FDF2F8",
    badgeText: "#C026D3",
    iconBg: "#FDF2F8",
    iconColor: "#C026D3",
    iconBorder: "#FCE7F3",
  };
};
