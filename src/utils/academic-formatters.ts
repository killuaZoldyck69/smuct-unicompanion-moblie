import { Linking } from "react-native";
import Toast from "react-native-toast-message";
import {
  getDepartmentShortName,
  getDepartmentFullName,
  DEPARTMENT_FULL_NAMES,
  universityPrograms,
} from "@/data/programs";

/**
 * Parses a numeric value or ordinal string (e.g., "5", "5th") into
 * a number part and its lowercase ordinal suffix ("5", "th").
 */
export const parseOrdinalParts = (
  val: number | string | undefined | null,
): { numberPart: string; suffix: string } => {
  if (val === undefined || val === null || val === "") {
    return { numberPart: "—", suffix: "" };
  }
  const str = String(val).trim();
  const match = str.match(/^(\d+)\s*([a-zA-Z]+)?$/);
  if (match) {
    const num = parseInt(match[1], 10);
    let suffix = match[2];
    if (!suffix) {
      const j = num % 10;
      const k = num % 100;
      if (j === 1 && k !== 11) suffix = "st";
      else if (j === 2 && k !== 12) suffix = "nd";
      else if (j === 3 && k !== 13) suffix = "rd";
      else suffix = "th";
    }
    return { numberPart: String(num), suffix: suffix.toLowerCase() };
  }
  return { numberPart: str, suffix: "" };
};

/**
 * Formats enum blood group (e.g., "A_POSITIVE") to standard display ("A+").
 */
export const formatBloodGroup = (bg?: string | null): string => {
  if (!bg) return "";
  const map: Record<string, string> = {
    A_POSITIVE: "A+",
    A_NEGATIVE: "A-",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B-",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB-",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O-",
  };
  const upper = bg.trim().toUpperCase();
  return map[upper] || bg;
};

/**
 * Resolves academic program display name.
 */
export const getProgramName = (
  program?: string | null,
  department?: string | null,
): string => {
  if (program && program.trim()) return program.trim();
  if (department) {
    const trimmedDept = department.trim().toLowerCase();
    const prog = universityPrograms.find(
      (p) =>
        p.department.toLowerCase() === trimmedDept ||
        p.departmentShortName?.toLowerCase() === trimmedDept,
    );
    if (prog?.name) return prog.name;
    return `BA (Hons) in ${department}`;
  }
  return "Academic Program";
};

/**
 * Resolves full official department name for display, converting short codes
 * (e.g. "CSE" -> "Computer Science and Engineering").
 */
export const getFullDepartmentDisplayName = (dept?: string | null): string => {
  if (!dept || !dept.trim()) return "N/A";
  const short = getDepartmentShortName(dept);
  const full = getDepartmentFullName(short);
  if (full && full.trim() && full !== short) {
    return full;
  }
  const upper = dept.trim().toUpperCase();
  if (DEPARTMENT_FULL_NAMES[upper]) {
    return DEPARTMENT_FULL_NAMES[upper];
  }
  return dept.trim();
};

/**
 * Safely validates and redirects to an external web URL.
 */
export const handleOpenUrl = async (rawUrl?: string | null): Promise<void> => {
  if (!rawUrl || !rawUrl.trim()) return;
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(url);
    }
  } catch {
    Toast.show({
      type: "error",
      text1: "Cannot open link",
      text2: "The link could not be opened on your device.",
    });
  }
};

export {
  formatSemesterOrdinal,
  formatCampusUserSubtitle,
} from "@/screens/campus-hub/shared/design-tokens";
