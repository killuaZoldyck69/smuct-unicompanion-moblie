import { getDepartmentShortName } from "@/data/programs";
import {
  BloodFeedCounts,
  BloodFilterType,
  NewBloodPostForm,
  HospitalLocationItem,
  POPULAR_HOSPITALS,
} from "./constants";

export const formatBloodGroup = (group: string | undefined): string => {
  if (!group) return "N/A";
  return group.replace(/_/g, " ");
};

export const formatBloodGroupSymbol = (group: string | undefined): string => {
  if (!group) return "N/A";
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
  return map[group] || group.replace(/_/g, " ");
};

export const formatRole = (
  role?: string | null,
  hasStudentProfile?: boolean,
  hasTeacherProfile?: boolean,
): string => {
  if (role && role.trim()) {
    const upper = role.toUpperCase();
    if (upper === "STUDENT") return "Student";
    if (upper === "TEACHER" || upper === "FACULTY") return "Faculty";
    if (upper === "ADMIN") return "Admin";
    if (upper === "ALUMNI") return "Alumni";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }
  if (hasStudentProfile) return "Student";
  if (hasTeacherProfile) return "Faculty";
  return "";
};

export const getAuthorRoleAndDept = (author?: {
  role?: string | null;
  studentProfile?: { department?: string | null; program?: string | null } | null;
  teacherProfile?: { department?: string | null; designation?: string | null } | null;
  department?: string | null;
  major?: string | null;
} | null): string => {
  if (!author) return "Campus Member";
  const roleName = formatRole(
    author.role,
    !!author.studentProfile,
    !!author.teacherProfile,
  );
  const rawDept =
    author.studentProfile?.department ||
    author.teacherProfile?.department ||
    author.department ||
    author.major;
  const deptShort =
    rawDept && rawDept.trim() ? getDepartmentShortName(rawDept) : "";
  return [roleName, deptShort].filter(Boolean).join(" • ") || "University Member";
};

export const getUserAcademicSubtitle = (author?: {
  role?: string;
  studentProfile?: { department?: string; program?: string } | null;
  teacherProfile?: { department?: string; designation?: string } | null;
}): string => {
  return getAuthorRoleAndDept(author);
};

export interface BloodFormValidationResult {
  isValid: boolean;
  error?: string;
  fieldErrors: Record<string, string>;
}

export const validateBloodPostInput = (
  form: NewBloodPostForm
): BloodFormValidationResult => {
  const fieldErrors: Record<string, string> = {};

  const name = (form.patientName || "").trim();
  if (!name) {
    fieldErrors.patientName = "Patient full name is required.";
  } else if (name.length < 2) {
    fieldErrors.patientName = "Patient name must be at least 2 characters.";
  }

  const condition = (form.patientCondition || "").trim();
  if (!condition) {
    fieldErrors.patientCondition = "Medical condition or reason is required.";
  } else if (condition.length < 3) {
    fieldErrors.patientCondition =
      "Condition must be at least 3 characters (e.g. Surgery, Dengue).";
  }

  const bg = (form.bloodGroup || "").trim();
  if (!bg) {
    fieldErrors.bloodGroup = "Please select the required blood group.";
  }

  const bags = form.bagsNeeded || 1;
  if (bags < 1) {
    fieldErrors.bagsNeeded = "At least 1 bag of blood is required.";
  } else if (bags > 20) {
    fieldErrors.bagsNeeded = "Maximum 20 bags can be requested at a time.";
  }

  const loc = (form.location || "").trim();
  if (!loc) {
    fieldErrors.location =
      "Hospital location is required. Please type name or select on map.";
  }

  const phone = (form.contactPhone || "").trim();
  if (!phone) {
    fieldErrors.contactPhone = "Emergency contact phone number is required.";
  } else {
    const digitsOnly = phone.replace(/[^0-9+]/g, "");
    if (digitsOnly.length < 7) {
      fieldErrors.contactPhone =
        "Please enter a valid phone number (e.g. 01700-000000).";
    }
  }

  const errors = Object.values(fieldErrors);
  return {
    isValid: errors.length === 0,
    error: errors[0],
    fieldErrors,
  };
};

export const extractErrorMessage = (
  err: any,
  fallback = "Network error. Please check your connection and try again."
): string => {
  if (!err) return fallback;

  if (err.response?.data) {
    const data = err.response.data;
    if (Array.isArray(data.errorSources) && data.errorSources.length > 0) {
      const messages = data.errorSources
        .map((s: any) => s.message)
        .filter(Boolean);
      if (messages.length > 0) {
        return messages.join(". ");
      }
    }
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message.trim();
    }
    if (typeof data.error === "string" && data.error.trim()) {
      return data.error.trim();
    }
  }

  if (typeof err.message === "string" && err.message.trim()) {
    if (
      err.message.includes("Network Error") ||
      err.message.includes("Network error")
    ) {
      return "Cannot connect to server. Please check your network connection.";
    }
    if (!err.message.includes("status code")) {
      return err.message.trim();
    }
  }

  return fallback;
};

export const filterAndCountBloodPosts = (
  posts: any[] | null | undefined,
  activeFilter: BloodFilterType,
  searchQuery: string
): {
  filteredPosts: any[];
  counts: BloodFeedCounts;
} => {
  const list = Array.isArray(posts) ? posts : [];

  let urgent = 0;
  let active = 0;
  let fulfilled = 0;

  list.forEach((p: any) => {
    if (p.isFulfilled) {
      fulfilled++;
    } else {
      active++;
      if (p.urgency === "High") {
        urgent++;
      }
    }
  });

  let filtered = list;
  if (activeFilter === "URGENT") {
    filtered = filtered.filter((p: any) => !p.isFulfilled && p.urgency === "High");
  } else if (activeFilter === "ALL") {
    filtered = filtered.filter((p: any) => !p.isFulfilled);
  } else if (activeFilter === "FULFILLED") {
    filtered = filtered.filter((p: any) => p.isFulfilled);
  }

  const query = searchQuery.toLowerCase().trim();
  if (query) {
    filtered = filtered.filter((p: any) => {
      const bgMatch = (p.bloodGroup || "")
        .replace(/_/g, " ")
        .toLowerCase()
        .includes(query);
      const locMatch = (p.location || "").toLowerCase().includes(query);
      const patientMatch = (p.patientName || "").toLowerCase().includes(query);
      const conditionMatch = (p.patientCondition || "").toLowerCase().includes(query);
      const detailsMatch = (p.details || "").toLowerCase().includes(query);
      return bgMatch || locMatch || patientMatch || conditionMatch || detailsMatch;
    });
  }

  return {
    filteredPosts: filtered,
    counts: {
      urgent,
      active,
      fulfilled,
      total: list.length,
    },
  };
};

export interface ParsedHospitalLocation {
  name: string;
  shortName: string;
  area: string;
  address?: string;
  roomInfo: string;
  latitude: number;
  longitude: number;
  routeNote: string;
  distanceText: string;
}

export const SMUCT_CAMPUS_LOCATION = {
  name: "SMUCT Campus Hub",
  latitude: 23.8697,
  longitude: 90.3888,
  address: "Sector 17, Uttara, Dhaka",
};

export const parseHospitalLocation = (
  rawLocation?: string,
  postLat?: number | null,
  postLng?: number | null,
  postHospName?: string | null,
  postHospAddress?: string | null
): ParsedHospitalLocation => {
  const loc = (rawLocation || "").trim();

  const hasValidCoords =
    typeof postLat === "number" &&
    typeof postLng === "number" &&
    !isNaN(postLat) &&
    !isNaN(postLng) &&
    postLat !== 0 &&
    postLng !== 0;

  if (!loc && !postHospName && !hasValidCoords) {
    return {
      name: "Dhaka Medical College Hospital (DMCH)",
      shortName: "DMCH Emergency",
      area: "Bakshibazar, Dhaka",
      address: postHospAddress?.trim() || "Secretariat Road, Bakshibazar, Dhaka",
      roomInfo: "Emergency Ward",
      latitude: 23.7258,
      longitude: 90.3976,
      routeNote: "Central Ave",
      distanceText: "2.4 km • ~12 mins",
    };
  }

  const segments = loc
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let matchedHospital: HospitalLocationItem | undefined;
  if (!postHospName || !hasValidCoords) {
    for (const h of POPULAR_HOSPITALS) {
      const hLower = h.name.toLowerCase();
      if (
        loc.toLowerCase().includes(hLower) ||
        (postHospName && postHospName.toLowerCase().includes(hLower)) ||
        (h.area && loc.toLowerCase().includes(h.area.toLowerCase()))
      ) {
        matchedHospital = h;
        break;
      }
    }
  }

  const roomSegments: string[] = [];
  const otherSegments: string[] = [];

  segments.forEach((seg, index) => {
    const lower = seg.toLowerCase();
    if (
      lower.includes("floor") ||
      lower.includes("ward") ||
      lower.includes("bed") ||
      lower.includes("cabin") ||
      lower.includes("icu") ||
      lower.includes("ccu") ||
      lower.includes("unit")
    ) {
      roomSegments.push(seg);
    } else if (index > 0 && !matchedHospital && !postHospAddress) {
      otherSegments.push(seg);
    }
  });

  const primaryName = postHospName?.trim()
    ? postHospName.trim()
    : matchedHospital
    ? matchedHospital.name
    : segments[0] || "Hospital";

  let shortName = "";
  if (primaryName.includes("(DMCH)") || /dmch/i.test(primaryName)) {
    shortName = "DMCH Emergency";
  } else if (primaryName.includes(",")) {
    shortName = primaryName.split(",")[0].trim();
  } else if (matchedHospital) {
    shortName = matchedHospital.name.split(" ").slice(0, 2).join(" ");
  } else {
    const words = primaryName.split(" ").filter(Boolean);
    shortName =
      words.length <= 3
        ? primaryName
        : words.slice(0, 3).join(" ") || "Target Hospital";
  }

  const roomInfo =
    roomSegments.length > 0
      ? roomSegments.join(", ")
      : "Emergency Ward";

  let area = matchedHospital?.area;
  if (!area) {
    if (postHospAddress?.trim()) {
      const parts = postHospAddress
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length >= 3) {
        area = `${parts[1]}, ${parts[2]}`;
      } else if (parts.length >= 2) {
        area = parts[1];
      } else {
        area = parts[0];
      }
    } else if (otherSegments.length >= 3) {
      area = `${otherSegments[1]}, ${otherSegments[2]}`;
    } else if (otherSegments.length >= 2) {
      area = otherSegments[1];
    } else {
      area = otherSegments[0] || "Dhaka, Bangladesh";
    }
  }

  let address = postHospAddress?.trim();
  if (!address) {
    if (otherSegments.length > 0) {
      address = otherSegments.join(", ");
    } else if (matchedHospital?.address) {
      address = matchedHospital.address;
    } else if (matchedHospital?.area) {
      address = `${matchedHospital.area}, Dhaka`;
    } else {
      address = area.toLowerCase().includes("dhaka")
        ? `${area}, Bangladesh`
        : `${area}, Dhaka, Bangladesh`;
    }
  }

  const latitude = hasValidCoords
    ? (postLat as number)
    : matchedHospital?.latitude || 23.8748;

  const longitude = hasValidCoords
    ? (postLng as number)
    : matchedHospital?.longitude || 90.3967;

  let routeNote = "Central Ave";
  if (latitude > 23.84) {
    routeNote = "Airport Rd";
  } else if (latitude > 23.76) {
    routeNote = "Elevated Expressway";
  } else {
    routeNote = "Central Ave";
  }

  let distanceText = "2.4 km • ~12 mins";
  if (latitude && longitude) {
    const R = 6371;
    const dLat = ((latitude - SMUCT_CAMPUS_LOCATION.latitude) * Math.PI) / 180;
    const dLon = ((longitude - SMUCT_CAMPUS_LOCATION.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((SMUCT_CAMPUS_LOCATION.latitude * Math.PI) / 180) *
        Math.cos((latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;

    if (dist < 4) {
      const d = Math.max(0.8, Math.round(dist * 10) / 10);
      const m = Math.max(5, Math.round(d * 4 + 3));
      distanceText = `${d} km • ~${m} mins`;
    } else if (primaryName.includes("(DMCH)") || /dmch/i.test(primaryName)) {
      distanceText = "2.4 km • ~12 mins";
    } else {
      const d = Math.round(dist * 10) / 10;
      const m = Math.round(d * 2.5 + 8);
      distanceText = `${d} km • ~${m} mins`;
    }
  }

  return {
    name: primaryName,
    shortName,
    area,
    address,
    roomInfo,
    latitude,
    longitude,
    routeNote,
    distanceText,
  };
};

