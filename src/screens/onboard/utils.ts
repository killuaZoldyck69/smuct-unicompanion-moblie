import type { OnboardFormData, SanitizedOnboardData } from "./types";
import { MIN_SEMESTER, MAX_SEMESTER, MAX_SECTION_LENGTH } from "./constants";

/**
 * Validates all onboarding fields strictly.
 * Requirement: All fields are mandatory (no optional fields).
 */
export function sanitizeOnboardForm(form: OnboardFormData): SanitizedOnboardData {
  const imageUri = (form.imageUri || "").trim();
  const studentId = (form.studentId || "").trim();
  const program = (form.program || "").trim();
  const faculty = (form.faculty || "").trim();
  const department = (form.department || "").trim();
  const batch = (form.batch || "").trim();
  const section = (form.section || "")
    .trim()
    .toUpperCase()
    .slice(0, MAX_SECTION_LENGTH);
  const bloodGroup = (form.bloodGroup || "").trim();
  const rawPhone = (form.phoneNumber || "").replace(/[^0-9]/g, "");

  // 1. Profile Picture: Mandatory
  if (!imageUri) {
    return {
      payload: {} as any,
      bloodGroup: "",
      phoneNumber: "",
      error: {
        field: "image",
        title: "Profile Photo Required",
        message:
          "Please tap the photo circle above to select your profile picture.",
      },
    };
  }

  // 2. Student ID: Long integer only
  if (!studentId) {
    return {
      payload: {} as any,
      bloodGroup: "",
      phoneNumber: "",
      error: {
        field: "studentId",
        title: "Student ID Required",
        message: "Please enter your numeric Student ID.",
      },
    };
  }

  if (!/^\d+$/.test(studentId)) {
    return {
      payload: {} as any,
      bloodGroup: "",
      phoneNumber: "",
      error: {
        field: "studentId",
        title: "Invalid Student ID",
        message: "Student ID must contain numbers only (no letters or symbols).",
      },
    };
  }

  // 3. Academic Program: Required string
  if (!program) {
    return {
      payload: {} as any,
      bloodGroup: "",
      phoneNumber: "",
      error: {
        field: "program",
        title: "Program Required",
        message: "Please tap to select your Academic Program from the list.",
      },
    };
  }

  // 4. Batch: Integer only (e.g. 31, not accepted "31th")
  if (!batch) {
    return {
      payload: {} as any,
      bloodGroup: "",
      phoneNumber: "",
      error: {
        field: "batch",
        title: "Batch Number Required",
        message: "Please enter your academic batch number.",
      },
    };
  }

  if (!/^\d+$/.test(batch)) {
    return {
      payload: {} as any,
      bloodGroup: "",
      phoneNumber: "",
      error: {
        field: "batch",
        title: "Invalid Batch",
        message: "Batch must be a number only (e.g. 31, not 31th).",
      },
    };
  }

  // 5. Semester: Integer only (1 to 12, not accepted "9th")
  const semesterStr = (form.currentSemester || "").trim();
  const semesterNum = parseInt(semesterStr, 10);
  if (!semesterStr) {
    return {
      payload: {} as any,
      bloodGroup: "",
      phoneNumber: "",
      error: {
        field: "currentSemester",
        title: "Semester Required",
        message: "Please enter your current semester number (1 to 12).",
      },
    };
  }

  if (
    !/^\d+$/.test(semesterStr) ||
    isNaN(semesterNum) ||
    semesterNum < MIN_SEMESTER ||
    semesterNum > MAX_SEMESTER
  ) {
    return {
      payload: {} as any,
      bloodGroup: "",
      phoneNumber: "",
      error: {
        field: "currentSemester",
        title: "Invalid Semester",
        message: `Semester must be a number between ${MIN_SEMESTER} and ${MAX_SEMESTER} (e.g. 9, not 9th).`,
      },
    };
  }

  // 6. Section: Exactly ONE character uppercase string (e.g. A)
  if (!section) {
    return {
      payload: {} as any,
      bloodGroup: "",
      phoneNumber: "",
      error: {
        field: "section",
        title: "Section Required",
        message: "Please enter your class section (e.g. A).",
      },
    };
  }

  if (section.length !== 1 || !/^[A-Z]$/.test(section)) {
    return {
      payload: {} as any,
      bloodGroup: "",
      phoneNumber: "",
      error: {
        field: "section",
        title: "Invalid Section",
        message: "Section must be a single uppercase character (e.g. A, B, C).",
      },
    };
  }

  // 7. Phone Number: Mandatory, exactly 10 digits after +880
  let tenDigits = rawPhone;
  if (tenDigits.startsWith("880")) {
    tenDigits = tenDigits.slice(3);
  }
  if (tenDigits.startsWith("0")) {
    tenDigits = tenDigits.slice(1);
  }

  if (!rawPhone || !tenDigits) {
    return {
      payload: {} as any,
      bloodGroup: "",
      phoneNumber: "",
      error: {
        field: "phoneNumber",
        title: "Phone Number Required",
        message: "Please enter your 10-digit mobile number.",
      },
    };
  }

  if (tenDigits.length !== 10) {
    return {
      payload: {} as any,
      bloodGroup: "",
      phoneNumber: "",
      error: {
        field: "phoneNumber",
        title: "Invalid Phone Number",
        message:
          "Phone number must be exactly 10 digits after +880 (e.g. 17XXXXXXXX).",
      },
    };
  }

  const formattedPhoneNumber = `+880${tenDigits}`;

  // 8. Blood Group: Optional selection
  const optionalBloodGroup = bloodGroup ? bloodGroup : undefined;

  return {
    payload: {
      studentId,
      faculty,
      department,
      program,
      batch,
      currentSemester: semesterNum,
      section,
    },
    bloodGroup: optionalBloodGroup,
    phoneNumber: formattedPhoneNumber,
  };
}

export interface ParsedApiError {
  title: string;
  message: string;
  isSessionExpired?: boolean;
  isAlreadyOnboarded?: boolean;
}

/**
 * Translates any API, Network, or Server error into user-friendly titles and messages.
 */
export function parseOnboardApiError(error: any): ParsedApiError {
  // 1. Network / Connectivity Failure (No server response)
  if (!error?.response) {
    if (
      error?.code === "ECONNABORTED" ||
      error?.message?.toLowerCase().includes("timeout")
    ) {
      return {
        title: "Connection Timeout",
        message:
          "The university server took too long to respond. Please check your connection and try again.",
      };
    }

    if (
      error?.message === "Network Error" ||
      error?.name === "AxiosError" ||
      error?.code === "ERR_NETWORK"
    ) {
      return {
        title: "Network Offline",
        message:
          "Unable to connect to the server. Please check your Wi-Fi or mobile data connection and try again.",
      };
    }

    return {
      title: "Network Failure",
      message:
        error?.message ||
        "Could not communicate with the server. Please check your internet connection.",
    };
  }

  const status = error.response.status;
  const serverMsg =
    error.response.data?.message ||
    error.response.data?.error ||
    "";

  // 2. Authentication / Session Expired (401 or 403)
  if (status === 401 || status === 403) {
    return {
      title: "Session Expired",
      message:
        "Your login session has expired. Please log in again to complete your profile.",
      isSessionExpired: true,
    };
  }

  // 3. Conflict: Profile Already Created (409)
  if (status === 409) {
    return {
      title: "Profile Already Exists",
      message:
        serverMsg ||
        "A student profile is already registered for this account.",
      isAlreadyOnboarded: true,
    };
  }

  // 4. Rate Limiting (429)
  if (status === 429) {
    return {
      title: "Too Many Requests",
      message:
        "You have submitted too many requests recently. Please wait a moment before trying again.",
    };
  }

  // 5. Server Errors (500, 502, 503, 504)
  if (status >= 500) {
    if (serverMsg && serverMsg.toLowerCase().includes("cloudinary")) {
      return {
        title: "Image Storage Issue",
        message:
          "The profile picture storage service is temporarily busy. Please try again shortly.",
      };
    }
    return {
      title: "Server Unavailable",
      message:
        "The campus server encountered a temporary error. Please try again in a moment.",
    };
  }

  // 6. Bad Request / Validation (400, 422)
  if (status === 400 || status === 422) {
    if (serverMsg) {
      const lower = serverMsg.toLowerCase();
      if (lower.includes("less than 3 mb") || lower.includes("size exceeds")) {
        return {
          title: "Image Size Exceeded",
          message:
            "Your profile image is too large. Profile photos must be smaller than 3 MB.",
        };
      }
      return {
        title: "Invalid Information",
        message: serverMsg,
      };
    }
  }

  // 7. General Fallback
  return {
    title: "Setup Failed",
    message:
      serverMsg ||
      error.message ||
      "An unexpected issue occurred while saving your profile. Please try again.",
  };
}
