import { Linking } from "react-native";
import Toast from "react-native-toast-message";
import {
  getDepartmentShortName,
  getDepartmentFullName,
  DEPARTMENT_FULL_NAMES,
  universityPrograms,
} from "@/data/programs";
export { parseOrdinalParts } from "@/utils/academic-ordinal";

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
