import { CreateHubFormState } from "./types";

/**
 * 1. Course Name: Capitalize first letter of every word, normalize spaces.
 */
export const formatCourseName = (text: string): string => {
  return text.replace(/(?:^|\s)\S/g, (char) => char.toUpperCase()).slice(0, 100);
};

/**
 * 2. Course Code: Uppercase letters, ensure clean space between alpha prefix and numeric code (e.g. CSE 3311).
 */
export const formatCourseCode = (text: string): string => {
  const upper = text.toUpperCase().replace(/[^A-Z0-9\s-]/g, "");
  return upper.replace(/^([A-Z]+)(\d)/, "$1 $2").replace(/\s+/, " ").slice(0, 15);
};

/**
 * 3. Credits: Float number with single decimal dot (e.g. 3.0, 1.5).
 */
export const formatCredit = (text: string): string => {
  const cleaned = text.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    return (parts[0] + "." + parts.slice(1).join("")).slice(0, 5);
  }
  return cleaned.slice(0, 5);
};

/**
 * 4. Batch: Integer only.
 */
export const formatBatch = (text: string): string => {
  return text.replace(/[^0-9]/g, "").slice(0, 6);
};

/**
 * 5. Section: Uppercase characters only (e.g. A, B, 1A).
 */
export const formatSection = (text: string): string => {
  return text.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
};

/**
 * 6. Term/Offer: Words start with uppercase and spaced between letter and number (e.g. Fall 2026).
 */
export const formatTermOffer = (text: string): string => {
  const val = text.replace(/([a-zA-Z]+)(\d+)/g, "$1 $2").replace(/\s+/, " ");
  return val.replace(/(?:^|\s)\S/g, (char) => char.toUpperCase()).slice(0, 30);
};

/**
 * 7. Semester: Integer number between 1 and 12.
 */
export const formatSemester = (text: string): string => {
  const digits = text.replace(/[^0-9]/g, "").slice(0, 2);
  return digits;
};

/**
 * Safe time display string for Date objects.
 */
export const formatTimeDisplay = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "10:00 AM";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export interface FormValidationResult {
  isValid: boolean;
  errorTitle?: string;
  errorMessage?: string;
}

export const validateHubForm = (
  form: CreateHubFormState,
  isCR: boolean
): FormValidationResult => {
  const courseCode = formatCourseCode(form.courseCode).trim();
  const courseName = formatCourseName(form.courseName).trim();
  const creditNum = parseFloat(form.credit);
  const department = form.department.trim();
  const batch = formatBatch(form.batch).trim();
  const semesterNumber = parseInt(formatSemester(form.semesterNumber), 10);
  const termOffer = formatTermOffer(form.termOffer).trim();

  if (!courseName) {
    return {
      isValid: false,
      errorTitle: "Course Name Required",
      errorMessage: "Please provide a valid course title.",
    };
  }

  if (!courseCode) {
    return {
      isValid: false,
      errorTitle: "Course Code Required",
      errorMessage: "Please enter a valid course code (e.g., CSE 3311).",
    };
  }

  if (isNaN(creditNum) || creditNum <= 0 || creditNum > 15) {
    return {
      isValid: false,
      errorTitle: "Invalid Credits",
      errorMessage: "Credits must be a positive number between 0.5 and 15.0.",
    };
  }

  if (!department) {
    return {
      isValid: false,
      errorTitle: "Department Required",
      errorMessage: "Please enter or select a department.",
    };
  }

  if (!batch) {
    return {
      isValid: false,
      errorTitle: "Batch Required",
      errorMessage: "Please specify the cohort batch number.",
    };
  }

  if (isNaN(semesterNumber) || semesterNumber < 1 || semesterNumber > 12) {
    return {
      isValid: false,
      errorTitle: "Invalid Semester",
      errorMessage: "Semester number must be an integer between 1 and 12.",
    };
  }

  if (!termOffer) {
    return {
      isValid: false,
      errorTitle: "Term/Offer Required",
      errorMessage: "Please specify the academic term (e.g., Fall 2026).",
    };
  }

  if (isCR && !form.teacherId) {
    return {
      isValid: false,
      errorTitle: "Instructor Required",
      errorMessage: "Please assign a faculty teacher to this course.",
    };
  }

  return { isValid: true };
};
