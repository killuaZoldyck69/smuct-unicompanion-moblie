export interface ConsultationSlotValue {
  day: string;
  startTime: string;
  endTime: string;
}

export interface AcademicQualificationValue {
  id?: string;
  degree?: string;
  field?: string | null;
  institution?: string | null;
  passingYear?: string | number | null;
  year?: string | number | null;
  honors?: string | null;
}

const DEGREE_PRIORITY: Record<string, number> = {
  phd: 1,
  "ph.d": 1,
  doctorate: 1,
  mphil: 2,
  "m.phil": 2,
  masters: 3,
  msc: 3,
  "m.sc": 3,
  ma: 3,
  mba: 3,
  bachelors: 4,
  bsc: 4,
  "b.sc": 4,
  ba: 4,
  bba: 4,
  hsc: 5,
  ssc: 6,
};

const getDegreeRank = (degree: string): number => {
  const normalized = degree.trim().toLowerCase();
  for (const [key, rank] of Object.entries(DEGREE_PRIORITY)) {
    if (normalized.includes(key)) {
      return rank;
    }
  }
  return 99;
};

/**
 * Validates and normalizes an http/https URL. Blocks javascript:, data:, file:, tel:, etc.
 * Returns empty string if input is empty, or null if input is invalid/unsafe.
 */
export function normalizeSafeHttpUrl(raw?: string | null): string | null {
  if (raw == null) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const explicitSchemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (
    explicitSchemeMatch &&
    explicitSchemeMatch[1].toLowerCase() !== "http" &&
    explicitSchemeMatch[1].toLowerCase() !== "https"
  ) {
    return null;
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Converts backend canonical academicQualifications arrays (or legacy objects) into
 * a flat `{ degree: institution }` map for the mobile timeline editor.
 */
export function toQualificationRecord(
  qualifications?: AcademicQualificationValue[] | Record<string, string> | null
): Record<string, string> {
  if (!qualifications) return {};
  if (!Array.isArray(qualifications)) {
    const out: Record<string, string> = {};
    for (const [deg, inst] of Object.entries(qualifications)) {
      if (deg.trim()) {
        out[deg.trim()] = typeof inst === "string" ? inst.trim() : "";
      }
    }
    return out;
  }

  const record: Record<string, string> = {};
  for (const item of qualifications) {
    const degree = item?.degree?.trim();
    if (!degree) continue;
    record[degree] = item?.institution?.trim() || "";
  }
  return record;
}

/**
 * Converts UI `{ degree: institution }` pairs into sorted canonical API qualification items,
 * preserving optional metadata from existing records matched by degree name.
 */
export function serializeQualificationRecord(
  record: Record<string, string>,
  existingItems?: AcademicQualificationValue[] | null
): AcademicQualificationValue[] {
  const existingByDegree = new Map<string, AcademicQualificationValue>();
  if (Array.isArray(existingItems)) {
    for (const item of existingItems) {
      if (item?.degree?.trim()) {
        existingByDegree.set(item.degree.trim().toLowerCase(), item);
      }
    }
  }

  return Object.entries(record)
    .filter(([degree]) => degree.trim().length > 0)
    .map(([degree, institution]) => {
      const trimmedDegree = degree.trim();
      const trimmedInstitution = institution.trim();
      const previous = existingByDegree.get(trimmedDegree.toLowerCase());
      return {
        ...(previous?.id ? { id: previous.id } : {}),
        degree: trimmedDegree,
        institution: trimmedInstitution,
        ...(previous?.field !== undefined ? { field: previous.field } : {}),
        ...(previous?.passingYear !== undefined ? { passingYear: previous.passingYear } : {}),
        ...(previous?.year !== undefined ? { year: previous.year } : {}),
        ...(previous?.honors !== undefined ? { honors: previous.honors } : {}),
      };
    })
    .sort((a, b) => getDegreeRank(a.degree ?? "") - getDegreeRank(b.degree ?? ""));
}

export function areStringListsEqual(a?: string[] | null, b?: string[] | null): boolean {
  const listA = (a ?? []).map((item) => item.trim()).filter(Boolean);
  const listB = (b ?? []).map((item) => item.trim()).filter(Boolean);
  if (listA.length !== listB.length) return false;
  return listA.every((val, idx) => val === listB[idx]);
}

export function areQualificationRecordsEqual(
  a: Record<string, string>,
  b: Record<string, string>
): boolean {
  const entriesA = Object.entries(a)
    .map(([k, v]) => [k.trim(), v.trim()] as const)
    .filter(([k]) => k.length > 0)
    .sort(([k1], [k2]) => k1.localeCompare(k2));
  const entriesB = Object.entries(b)
    .map(([k, v]) => [k.trim(), v.trim()] as const)
    .filter(([k]) => k.length > 0)
    .sort(([k1], [k2]) => k1.localeCompare(k2));

  if (entriesA.length !== entriesB.length) return false;
  return entriesA.every(
    ([k, v], idx) => k === entriesB[idx][0] && v === entriesB[idx][1]
  );
}

export function areConsultationSlotsEqual(
  a?: ConsultationSlotValue[] | null,
  b?: ConsultationSlotValue[] | null
): boolean {
  const listA = a ?? [];
  const listB = b ?? [];
  if (listA.length !== listB.length) return false;
  return listA.every(
    (slot, idx) =>
      slot.day.trim() === listB[idx].day.trim() &&
      slot.startTime.trim() === listB[idx].startTime.trim() &&
      slot.endTime.trim() === listB[idx].endTime.trim()
  );
}

/**
 * Strips leading +880/0 and returns up to 10 national Bangladesh digits for form input.
 */
export function normalizeBangladeshPhone(phone?: string | null): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  const nationalNumber = digits.startsWith("880")
    ? digits.slice(3)
    : digits.startsWith("0")
      ? digits.slice(1)
      : digits;
  return nationalNumber.slice(-10);
}

/**
 * Resolves a student/teacher phone number edit into a validated `+880...` string or `""` when cleared.
 */
export function resolveBdPhoneUpdate(
  draftNationalDigits: string,
  persistedPhone?: string | null
): { changed: false } | { changed: true; valid: false } | { changed: true; valid: true; value: string } {
  const cleanDigits = draftNationalDigits.replace(/\D/g, "").slice(-10);
  const currentDigits = normalizeBangladeshPhone(persistedPhone);
  if (cleanDigits === currentDigits) {
    return { changed: false };
  }
  if (cleanDigits.length === 0) {
    return { changed: true, valid: true, value: "" };
  }
  if (cleanDigits.length !== 10) {
    return { changed: true, valid: false };
  }
  return { changed: true, valid: true, value: `+880${cleanDigits}` };
}

/**
 * Resolves the 10 national digits rendered inside ProfileContactCards.
 * While editing, preserves an intentionally cleared empty string instead of
 * snapping back to persistedProfilePhone.
 */
export function resolveContactPhoneDigits(params: {
  isEditing: boolean;
  draftPhone?: string | null;
  persistedPhone?: string | null;
}): string {
  const digitsSource = params.isEditing
    ? params.draftPhone || ""
    : params.persistedPhone || "";
  const rawDigits = digitsSource.replace(/\D/g, "");
  return rawDigits.startsWith("880")
    ? rawDigits.slice(3, 13)
    : rawDigits.slice(-10);
}

/**
 * Validates edited Student academic fields (`section` and `currentSemester`)
 * before building the PATCH payload so empty values fail fast with feedback.
 */
export function validateStudentAcademicUpdate(
  draft: { section: string; currentSemester: string },
  persisted: { section?: string | null; currentSemester?: number | null }
):
  | { valid: false; title: string; message: string }
  | { valid: true; section?: string; currentSemester?: number } {
  const cleanSection = draft.section.trim().toUpperCase().slice(0, 4);
  if (!cleanSection) {
    return {
      valid: false,
      title: "Invalid section",
      message: "Section cannot be empty (for example, A, B, or C).",
    };
  }

  const digitsOnly = draft.currentSemester.replace(/\D/g, "");
  const parsedSemester = digitsOnly ? parseInt(digitsOnly, 10) : NaN;
  if (!Number.isInteger(parsedSemester) || parsedSemester < 1 || parsedSemester > 12) {
    return {
      valid: false,
      title: "Invalid semester",
      message: "Enter a semester number between 1 and 12.",
    };
  }

  const result: { valid: true; section?: string; currentSemester?: number } = { valid: true };
  if (cleanSection !== (persisted.section || "")) {
    result.section = cleanSection;
  }
  if (parsedSemester !== persisted.currentSemester) {
    result.currentSemester = parsedSemester;
  }
  return result;
}

/**
 * Returns the 0-based index of the first consultation slot missing a day, startTime, or endTime,
 * or -1 when all slots are complete.
 */
export function findIncompleteConsultationSlotIndex(
  slots: ConsultationSlotValue[]
): number {
  return slots.findIndex(
    (slot) =>
      !slot.day.trim() || !slot.startTime.trim() || !slot.endTime.trim()
  );
}
