import { BloodFeedCounts, BloodFilterType, NewBloodPostForm } from "./constants";

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
