/**
 * Password complexity validator.
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special character (!@#$%^&* etc.)
 */
export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PasswordCriteria {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  allValid: boolean;
}

export function getPasswordCriteria(password: string): PasswordCriteria {
  const p = password || "";
  const hasMinLength = p.length >= 8;
  const hasUppercase = /[A-Z]/.test(p);
  const hasLowercase = /[a-z]/.test(p);
  const hasNumber = /[0-9]/.test(p);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(p);

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    allValid:
      hasMinLength &&
      hasUppercase &&
      hasLowercase &&
      hasNumber &&
      hasSpecialChar,
  };
}

export function validatePassword(password: string): PasswordValidationResult {
  if (!password || typeof password !== "string") {
    return {
      isValid: false,
      error: "Password is required.",
    };
  }

  const criteria = getPasswordCriteria(password);

  if (!criteria.hasMinLength) {
    return {
      isValid: false,
      error: "Password must be at least 8 characters long.",
    };
  }

  if (!criteria.hasUppercase) {
    return {
      isValid: false,
      error: "Password must include at least one uppercase letter (A-Z).",
    };
  }

  if (!criteria.hasLowercase) {
    return {
      isValid: false,
      error: "Password must include at least one lowercase letter (a-z).",
    };
  }

  if (!criteria.hasNumber) {
    return {
      isValid: false,
      error: "Password must include at least one number (0-9).",
    };
  }

  if (!criteria.hasSpecialChar) {
    return {
      isValid: false,
      error:
        "Password must include at least one special character (e.g. !@#$%^&*).",
    };
  }

  return { isValid: true };
}
