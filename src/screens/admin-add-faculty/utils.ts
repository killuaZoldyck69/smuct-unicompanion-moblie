/**
 * Utility functions for input sanitization, formatting, and password generation
 * in the Admin Add Faculty module.
 */

/**
 * Sanitizes Teacher ID to ensure it only contains numeric digits (long integer).
 */
export function sanitizeTeacherId(val: string): string {
  return val.replace(/\D/g, "");
}

/**
 * Auto-formats full name by capitalizing the first letter of each word (Title Case).
 * Example: "dr. john doe" -> "Dr. John Doe", "md. rafiqul islam" -> "Md. Rafiqul Islam"
 */
export function capitalizeWords(text: string): string {
  return text.replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
}

/**
 * Sanitizes institutional email address (lowercase and trimmed).
 */
export function sanitizeEmail(val: string): string {
  return val.trim().toLowerCase();
}

/**
 * Validates email address format.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Generates temporary password following the requirement:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 * - Formula: [Last 4 digits of ID] + "@" + [Last 3 characters of last name (formatted with TitleCase)]
 */
export function generateDefaultPassword(teacherId: string, fullName: string): string {
  const digits = teacherId.replace(/\D/g, "");
  const cleanName = fullName.trim();

  if (!digits && !cleanName) return "";

  // Last 4 digits of ID (pad with 0 if fewer than 4 digits entered so far)
  const last4Id = digits.length >= 4 ? digits.slice(-4) : digits.padStart(4, "0");

  // Extract last name from full name
  const words = cleanName.split(/\s+/).filter(Boolean);
  const lastName = words.length > 0 ? words[words.length - 1] : "";
  const lettersOnly = lastName.replace(/[^A-Za-z]/g, "");

  let last3 = "";
  if (lettersOnly.length >= 3) {
    last3 = lettersOnly.slice(-3);
  } else if (lettersOnly.length > 0) {
    last3 = lettersOnly.padEnd(3, "a");
  } else {
    last3 = "Tch";
  }

  // Ensure 1 uppercase and 1+ lowercase in the 3 letters
  const formattedLetters =
    last3.charAt(0).toUpperCase() + last3.slice(1).toLowerCase();

  return `${last4Id}@${formattedLetters}`;
}

/**
 * Validates that a password satisfies all complexity rules.
 */
export function validatePasswordComplexity(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long.",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter (A-Z).",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter (a-z).",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number (0-9).",
    };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return {
      isValid: false,
      message:
        "Password must contain at least one special character (e.g. !@#$%^&*).",
    };
  }
  return { isValid: true };
}

/**
 * Sanitizes input to allow digits/numbers only.
 */
export function sanitizeDigitsOnly(val: string): string {
  return val.replace(/\D/g, "");
}

/**
 * Formats a Date object into "hh:mm AM/PM" format.
 */
export function formatTimeAmPm(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const hoursStr = hours < 10 ? `0${hours}` : `${hours}`;
  return `${hoursStr}:${minutesStr} ${ampm}`;
}
