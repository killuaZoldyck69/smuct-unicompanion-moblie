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

export const getUserAcademicSubtitle = (author?: {
  role?: string;
  studentProfile?: { department?: string; program?: string } | null;
  teacherProfile?: { department?: string; designation?: string } | null;
}): string => {
  if (!author) return "";
  if (author.studentProfile?.department) {
    return author.studentProfile.department;
  }
  if (author.teacherProfile?.department) {
    return author.teacherProfile.department;
  }
  return author.role || "";
};

export const validateBloodPostInput = (
  form: NewBloodPostForm
): { isValid: boolean; error?: string } => {
  if (!form.patientName.trim()) {
    return { isValid: false, error: "Patient name is required." };
  }
  if (!form.patientCondition.trim()) {
    return { isValid: false, error: "Medical condition/reason is required." };
  }
  if (!form.bagsNeeded || form.bagsNeeded < 1) {
    return { isValid: false, error: "At least 1 bag of blood is required." };
  }
  if (!form.location.trim()) {
    return { isValid: false, error: "Hospital / Location is required." };
  }
  if (!form.contactPhone.trim()) {
    return { isValid: false, error: "Contact phone number is required." };
  }
  return { isValid: true };
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
      return bgMatch || locMatch || patientMatch;
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
  postHospName?: string | null
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

  if (!matchedHospital) {
    const keywords: [RegExp, string][] = [
      [/dmch|dhaka med/i, "Dhaka Medical College Hospital (DMCH)"],
      [/uttara adhunik/i, "Uttara Adhunik Medical College Hospital"],
      [/kuwait/i, "Kuwait Bangladesh Friendship Hospital"],
      [/kurmitola/i, "Kurmitola General Hospital"],
      [/evercare/i, "Evercare Hospital Dhaka"],
      [/square/i, "Square Hospital"],
      [/united/i, "United Hospital"],
      [/suhrawardy/i, "Shaheed Suhrawardy Medical College Hospital"],
      [/bsmmu|pg hosp/i, "BSMMU (PG Hospital)"],
      [/labaid/i, "LabAid Specialized Hospital"],
      [/ibn sina/i, "Ibn Sina Medical College Hospital"],
      [/nicvd/i, "National Institute of Cardiovascular Diseases (NICVD)"],
    ];
    for (const [pattern, hospName] of keywords) {
      if (pattern.test(loc) || (postHospName && pattern.test(postHospName))) {
        matchedHospital = POPULAR_HOSPITALS.find((h) => h.name === hospName);
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
    } else if (index > 0 && !matchedHospital) {
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
  } else if (matchedHospital) {
    if (matchedHospital.name.includes("Uttara Adhunik")) {
      shortName = "Uttara Adhunik";
    } else if (matchedHospital.name.includes("Kurmitola")) {
      shortName = "Kurmitola General";
    } else if (matchedHospital.name.includes("Square")) {
      shortName = "Square Emergency";
    } else if (matchedHospital.name.includes("Evercare")) {
      shortName = "Evercare Emergency";
    } else {
      const matchParen = matchedHospital.name.match(/\((.*?)\)/);
      if (matchParen) {
        shortName = `${matchParen[1]} Emergency`;
      } else {
        shortName = matchedHospital.name.split(" ").slice(0, 2).join(" ");
      }
    }
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

  const area = matchedHospital
    ? `${matchedHospital.area}, Dhaka`
    : otherSegments[0] || "Dhaka, Bangladesh";

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
    roomInfo,
    latitude,
    longitude,
    routeNote,
    distanceText,
  };
};

