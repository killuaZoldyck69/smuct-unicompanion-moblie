import { Linking } from "react-native";
import Toast from "react-native-toast-message";
import { AssessmentTypeConfig } from "./types";

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

    // Direct ISO or standard parse
    let d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;

    // Handle space instead of T in SQL format (e.g. "2026-09-25 23:59:00")
    if (trimmed.includes(" ")) {
      d = new Date(trimmed.replace(" ", "T"));
      if (!isNaN(d.getTime())) return d;
    }

    // Handle "YYYY-MM-DD"
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
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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

export const formatFileSize = (bytes?: number): string => {
  if (!bytes || isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getAssessmentTypeConfig = (type?: string): AssessmentTypeConfig => {
  const t = (type || "ASSIGNMENT").toUpperCase();
  if (t.includes("QUIZ") || t.includes("CT")) {
    return {
      label: "CT / Quiz",
      icon: "clipboard",
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
      icon: "monitor",
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
      icon: "award",
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
    icon: "file-text",
    badgeBg: "#FDF2F8",
    badgeText: "#C026D3",
    iconBg: "#FDF2F8",
    iconColor: "#C026D3",
    iconBorder: "#FCE7F3",
  };
};

export const isValidHttpUrl = (str: string): boolean => {
  if (!str) return false;
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const openSafeUrl = async (url?: string): Promise<void> => {
  if (!url) return;
  const trimmed = url.trim();
  const safeUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  if (!isValidHttpUrl(safeUrl)) {
    Toast.show({
      type: "error",
      text1: "Invalid URL",
      text2: "The provided link is not a valid web URL.",
    });
    return;
  }

  try {
    const supported = await Linking.canOpenURL(safeUrl);
    if (supported) {
      await Linking.openURL(safeUrl);
    } else {
      Toast.show({
        type: "error",
        text1: "Unable to Open Link",
        text2: "No supported application found to open this URL.",
      });
    }
  } catch {
    Toast.show({
      type: "error",
      text1: "Error Opening Link",
      text2: "Could not open link in browser.",
    });
  }
};

export const ALLOWED_FILE_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "zip",
  "rar",
  "jpg",
  "jpeg",
  "png",
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_FILE_COUNT = 5;
