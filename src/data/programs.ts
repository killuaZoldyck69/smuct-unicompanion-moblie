export type ProgramLevel = "Undergraduate" | "Postgraduate";

export interface AcademicProgram {
  id: string;
  level: ProgramLevel;
  faculty: string;
  department: string;
  departmentShortName?: string;
  name: string;
}

export const DEPARTMENT_SHORT_NAMES: Record<string, string> = {
  "Computer Science and Engineering": "CSE",
  "Computer Science and Information Technology": "CSIT",
  "Apparel Manufacturing Management and Technology": "AMMT",
  "Fashion Design and Technology": "FDT",
  "Interior Architecture": "IA",
  "Graphic Design and Multimedia": "GDM",
  "Architecture": "ARCH",
  "Business Administration": "BBA",
  "English": "ENG",
  "Law": "LAW",
  "Sociology & Anthropology": "SOC",
  "Bangla": "BAN",
  "Government & Politics": "G&P",
  "Islamic Studies": "IS",
  "Fine Arts": "FA",
  "Music": "MUS",
  "Dance": "DAN",
};

/**
 * Returns the official short form abbreviation for SMUCT university departments.
 */
export const getDepartmentShortName = (department?: string | null): string => {
  if (!department) return "General";
  const trimmed = department.trim();
  if (DEPARTMENT_SHORT_NAMES[trimmed]) {
    return DEPARTMENT_SHORT_NAMES[trimmed];
  }

  // Case-insensitive lookup
  const lower = trimmed.toLowerCase();
  for (const [key, val] of Object.entries(DEPARTMENT_SHORT_NAMES)) {
    if (key.toLowerCase() === lower) {
      return val;
    }
  }

  // Common pattern matching for SMUCT official departments
  if (lower.includes("computer science and engineering") || lower === "cse") return "CSE";
  if (lower.includes("information technology") || lower === "csit") return "CSIT";
  if (lower.includes("computer science")) return "CSE";
  if (lower.includes("apparel") || lower === "ammt") return "AMMT";
  if (lower.includes("fashion design") || lower === "fdt") return "FDT";
  if (lower.includes("interior") || lower === "ia") return "IA";
  if (lower.includes("graphic design") || lower.includes("multimedia") || lower === "gdm") return "GDM";
  if (lower.includes("architecture") || lower === "arch") return "ARCH";
  if (lower.includes("business") || lower === "bba" || lower === "mba") return "BBA";
  if (lower.includes("english") || lower === "eng") return "ENG";
  if (lower.includes("law") || lower === "llb" || lower === "llm") return "LAW";
  if (lower.includes("sociology") || lower.includes("anthropology") || lower === "soc") return "SOC";
  if (lower.includes("bangla") || lower === "ban") return "BAN";
  if (lower.includes("government") || lower.includes("politics") || lower === "g&p" || lower === "gp") return "G&P";
  if (lower.includes("islamic") || lower === "is") return "IS";
  if (lower.includes("fine art") || lower === "fa") return "FA";
  if (lower.includes("music") || lower === "mus") return "MUS";
  if (lower.includes("dance") || lower === "dan") return "DAN";

  return trimmed;
};

export const DEPARTMENT_FULL_NAMES: Record<string, string> = Object.entries(
  DEPARTMENT_SHORT_NAMES,
).reduce((acc, [fullName, shortName]) => {
  acc[shortName] = fullName;
  return acc;
}, {} as Record<string, string>);

/**
 * Returns the full official department name for a short code.
 */
export const getDepartmentFullName = (shortName?: string | null): string => {
  if (!shortName) return "";
  const upper = shortName.trim().toUpperCase();
  return DEPARTMENT_FULL_NAMES[upper] || shortName;
};


export const universityPrograms: AcademicProgram[] = [
  // ==========================================
  // UNDERGRADUATE PROGRAMS
  // ==========================================

  // FACULTY OF DESIGN & TECHNOLOGY
  {
    id: "UG-FDT-01",
    level: "Undergraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    department: "Fashion Design and Technology",
    departmentShortName: "FDT",
    name: "BA (Hons) in Fashion Design and Technology",
  },
  {
    id: "UG-FDT-02",
    level: "Undergraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    department: "Apparel Manufacturing Management and Technology",
    departmentShortName: "AMMT",
    name: "BA (Hons) in Apparel Manufacturing Management and Technology",
  },
  {
    id: "UG-FDT-03",
    level: "Undergraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    department: "Interior Architecture",
    departmentShortName: "IA",
    name: "BA (Hons) in Interior Architecture",
  },
  {
    id: "UG-FDT-04",
    level: "Undergraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    department: "Graphic Design and Multimedia",
    departmentShortName: "GDM",
    name: "BA (Hons) in Graphic Design and Multimedia",
  },
  {
    id: "UG-FDT-05",
    level: "Undergraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    department: "Architecture",
    departmentShortName: "ARCH",
    name: "Bachelor of Architecture",
  },

  // FACULTY OF ENGINEERING & TECHNOLOGY
  {
    id: "UG-FET-01",
    level: "Undergraduate",
    faculty: "FACULTY OF ENGINEERING & TECHNOLOGY",
    department: "Computer Science and Engineering",
    departmentShortName: "CSE",
    name: "B.Sc (Hons) in Computer Science and Engineering",
  },
  {
    id: "UG-FET-02",
    level: "Undergraduate",
    faculty: "FACULTY OF ENGINEERING & TECHNOLOGY",
    department: "Computer Science and Information Technology",
    departmentShortName: "CSIT",
    name: "B.Sc (Hons) in Computer Science and Information Technology",
  },

  // FACULTY OF BUSINESS
  {
    id: "UG-FOB-01",
    level: "Undergraduate",
    faculty: "FACULTY OF BUSINESS",
    department: "Business Administration",
    departmentShortName: "BBA",
    name: "Bachelor of Business Administration (BBA)",
  },

  // FACULTY OF HUMANITIES & SOCIAL SCIENCES
  {
    id: "UG-FHS-01",
    level: "Undergraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "English",
    departmentShortName: "ENG",
    name: "BA (Hons) in English (Language & Literature)",
  },
  {
    id: "UG-FHS-02",
    level: "Undergraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Law",
    departmentShortName: "LAW",
    name: "Bachelor of Laws (LLB)",
  },
  {
    id: "UG-FHS-03",
    level: "Undergraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Sociology & Anthropology",
    departmentShortName: "SOC",
    name: "BSS (Hons) in Sociology & Anthropology",
  },
  {
    id: "UG-FHS-04",
    level: "Undergraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Bangla",
    departmentShortName: "BAN",
    name: "BA (Hons) in Bangla",
  },
  {
    id: "UG-FHS-05",
    level: "Undergraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Government & Politics",
    departmentShortName: "G&P",
    name: "BSS (Hons) in Government & Politics",
  },
  {
    id: "UG-FHS-06",
    level: "Undergraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Islamic Studies",
    departmentShortName: "IS",
    name: "BA (Hons) in Islamic Studies",
  },

  // FACULTY OF FINE & PERFORMING ARTS
  {
    id: "UG-FFA-01",
    level: "Undergraduate",
    faculty: "FACULTY OF FINE & PERFORMING ARTS",
    department: "Fine Arts",
    departmentShortName: "FA",
    name: "Bachelor of Fine Arts (Hons) Drawing & Painting",
  },
  {
    id: "UG-FFA-02",
    level: "Undergraduate",
    faculty: "FACULTY OF FINE & PERFORMING ARTS",
    department: "Music",
    departmentShortName: "MUS",
    name: "Bachelor of Music (Hons) Rabindra, Nazrul, Classical",
  },
  {
    id: "UG-FFA-03",
    level: "Undergraduate",
    faculty: "FACULTY OF FINE & PERFORMING ARTS",
    department: "Dance",
    departmentShortName: "DAN",
    name: "Bachelor of Music (Hons) in Dance",
  },

  // ==========================================
  // POSTGRADUATE PROGRAMS
  // ==========================================

  // FACULTY OF DESIGN & TECHNOLOGY
  {
    id: "PG-FDT-01",
    level: "Postgraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    department: "Fashion Design and Technology",
    departmentShortName: "FDT",
    name: "M.A. in Fashion Design",
  },
  {
    id: "PG-FDT-02",
    level: "Postgraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    department: "Interior Architecture",
    departmentShortName: "IA",
    name: "M.A. in Interior Design",
  },
  {
    id: "PG-FDT-03",
    level: "Postgraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    department: "Graphic Design and Multimedia",
    departmentShortName: "GDM",
    name: "M.A. in Graphic Design and Multimedia",
  },
  {
    id: "PG-FDT-04",
    level: "Postgraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    department: "Apparel Manufacturing Management and Technology",
    departmentShortName: "AMMT",
    name: "MBA in Product & Fashion Merchandizing",
  },

  // FACULTY OF BUSINESS
  {
    id: "PG-FOB-01",
    level: "Postgraduate",
    faculty: "FACULTY OF BUSINESS",
    department: "Business Administration",
    departmentShortName: "BBA",
    name: "Masters of Business Administration (MBA)",
  },

  // FACULTY OF HUMANITIES & SOCIAL SCIENCES
  {
    id: "PG-FHS-01",
    level: "Postgraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "English",
    departmentShortName: "ENG",
    name: "MA in English",
  },
  {
    id: "PG-FHS-02",
    level: "Postgraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Law",
    departmentShortName: "LAW",
    name: "Master of Laws (LLM)",
  },
  {
    id: "PG-FHS-03",
    level: "Postgraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Bangla",
    departmentShortName: "BAN",
    name: "MA in Bangla",
  },
  {
    id: "PG-FHS-04",
    level: "Postgraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Sociology & Anthropology",
    departmentShortName: "SOC",
    name: "MSS in Sociology & Anthropology",
  },
  {
    id: "PG-FHS-05",
    level: "Postgraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Government & Politics",
    departmentShortName: "G&P",
    name: "MSS in Government & Politics",
  },
  {
    id: "PG-FHS-06",
    level: "Postgraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Islamic Studies",
    departmentShortName: "IS",
    name: "MA in Islamic Studies",
  },

  // FACULTY OF FINE & PERFORMING ARTS
  {
    id: "PG-FFA-01",
    level: "Postgraduate",
    faculty: "FACULTY OF FINE & PERFORMING ARTS",
    department: "Fine Arts",
    departmentShortName: "FA",
    name: "Master of Fine Arts",
  },
  {
    id: "PG-FFA-02",
    level: "Postgraduate",
    faculty: "FACULTY OF FINE & PERFORMING ARTS",
    department: "Music",
    departmentShortName: "MUS",
    name: "Master of Music in Rabindra, Nazrul, Classical",
  },
  {
    id: "PG-FFA-03",
    level: "Postgraduate",
    faculty: "FACULTY OF FINE & PERFORMING ARTS",
    department: "Dance",
    departmentShortName: "DAN",
    name: "Master of Music in Dance",
  },
];

// Helper array just for simple flat lists (Dropdowns)
export const programListForDropdown = universityPrograms.map((program) => ({
  label: program.name,
  value: program.name,
  category: program.faculty,
  department: program.department,
  departmentShortName: program.departmentShortName,
}));

/**
 * Returns a human-friendly clean faculty title, e.g. "Design & Technology" instead of "FACULTY OF DESIGN & TECHNOLOGY"
 */
export const getCleanFacultyName = (
  faculty?: string | null,
  department?: string | null,
): string => {
  if (faculty && faculty.trim()) {
    const cleaned = faculty.replace(/^faculty of\s+/i, "").trim();
    if (cleaned === cleaned.toUpperCase()) {
      return cleaned
        .split(" ")
        .map((w) =>
          w === "&"
            ? "&"
            : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
        )
        .join(" ");
    }
    return cleaned;
  }

  if (department) {
    const trimmedDept = department.trim().toLowerCase();
    const prog = universityPrograms.find(
      (p) =>
        p.department.toLowerCase() === trimmedDept ||
        p.departmentShortName?.toLowerCase() === trimmedDept,
    );
    if (prog?.faculty) {
      return getCleanFacultyName(prog.faculty);
    }
  }

  return "Design & Technology";
};
