export type ProgramLevel = "Undergraduate" | "Postgraduate";

export interface AcademicProgram {
  id: string;
  level: ProgramLevel;
  faculty: string;
  department: string;
  departmentShortName?: string;
  name: string;
  shortName: string;
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

export const PROGRAM_SHORT_NAMES: Record<string, string> = {
  // Undergraduate
  "BA (Hons) in Fashion Design and Technology": "B.A. FDT",
  "BA (Hons) in Apparel Manufacturing Management and Technology": "B.A. AMMT",
  "BA (Hons) in Interior Architecture": "B.A. IA",
  "BA (Hons) in Graphic Design and Multimedia": "B.A. GDM",
  "Bachelor of Architecture": "B.Arch",
  "B.Sc (Hons) in Computer Science and Engineering": "B.Sc CSE",
  "B.Sc (Hons) in Computer Science and Information Technology": "B.Sc CSIT",
  "Bachelor of Business Administration (BBA)": "BBA",
  "BA (Hons) in English (Language & Literature)": "B.A. ENG",
  "Bachelor of Laws (LLB)": "LL.B",
  "BSS (Hons) in Sociology & Anthropology": "BSS SOC",
  "BA (Hons) in Bangla": "B.A. BAN",
  "BSS (Hons) in Government & Politics": "BSS G&P",
  "BA (Hons) in Islamic Studies": "B.A. IS",
  "Bachelor of Fine Arts (Hons) Drawing & Painting": "BFA",
  "Bachelor of Music (Hons) Rabindra, Nazrul, Classical": "B.Mus",
  "Bachelor of Music (Hons) in Dance": "B.Dance",
  // Postgraduate
  "M.A. in Fashion Design": "M.A. FD",
  "M.A. in Interior Design": "M.A. ID",
  "M.A. in Graphic Design and Multimedia": "M.A. GDM",
  "MBA in Product & Fashion Merchandizing": "MBA (PFM)",
  "Masters of Business Administration (MBA)": "MBA",
  "MA in English": "M.A. ENG",
  "Master of Laws (LLM)": "LL.M",
  "MA in Bangla": "M.A. BAN",
  "MSS in Sociology & Anthropology": "MSS SOC",
  "MSS in Government & Politics": "MSS G&P",
  "MA in Islamic Studies": "M.A. IS",
  "Master of Fine Arts": "MFA",
  "Master of Music in Rabindra, Nazrul, Classical": "M.Mus",
  "Master of Music in Dance": "M.Dance",
};

/**
 * Returns the short form abbreviation for a program name (e.g. "B.Sc CSE", "B.Arch").
 */
export const getProgramShortName = (programName?: string | null): string => {
  if (!programName) return "";
  const trimmed = programName.trim();
  if (PROGRAM_SHORT_NAMES[trimmed]) {
    return PROGRAM_SHORT_NAMES[trimmed];
  }
  const prog = universityPrograms.find(
    (p) => p.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (prog?.shortName) return prog.shortName;

  const lower = trimmed.toLowerCase();

  // Postgraduate programs
  if (lower.includes("mba") && (lower.includes("product") || lower.includes("merchandiz") || lower.includes("pfm"))) return "MBA (PFM)";
  if (lower.includes("masters of business") || (lower.includes("mba") && !lower.includes("product"))) return "MBA";
  if (lower.includes("llm") || lower.includes("master of laws")) return "LL.M";
  if (lower.includes("m.a.") || lower.includes("ma in") || lower.includes("master of arts")) {
    if (lower.includes("fashion")) return "M.A. FD";
    if (lower.includes("interior")) return "M.A. ID";
    if (lower.includes("graphic") || lower.includes("multimedia") || lower.includes("gdm")) return "M.A. GDM";
    if (lower.includes("english")) return "M.A. ENG";
    if (lower.includes("bangla")) return "M.A. BAN";
    if (lower.includes("islamic")) return "M.A. IS";
  }
  if (lower.includes("mss") || lower.includes("master of social")) {
    if (lower.includes("sociology") || lower.includes("anthropology")) return "MSS SOC";
    if (lower.includes("government") || lower.includes("politics")) return "MSS G&P";
  }
  if (lower.includes("master of fine art") || lower.includes("mfa")) return "MFA";
  if (lower.includes("master of music") || lower.includes("mmus")) {
    if (lower.includes("dance")) return "M.Dance";
    return "M.Mus";
  }

  // Undergraduate programs
  if (lower.includes("csit") || (lower.includes("computer science") && lower.includes("information technology"))) return "B.Sc CSIT";
  if (lower.includes("cse") || (lower.includes("computer science") && lower.includes("engineering"))) return "B.Sc CSE";
  if (lower.includes("arch") || lower.includes("architecture")) return "B.Arch";
  if (lower.includes("fdt") || lower.includes("fashion design")) return "B.A. FDT";
  if (lower.includes("ammt") || lower.includes("apparel")) return "B.A. AMMT";
  if (lower.includes("ia") || lower.includes("interior")) return "B.A. IA";
  if (lower.includes("gdm") || lower.includes("graphic design") || lower.includes("multimedia")) return "B.A. GDM";
  if (lower.includes("bba") || lower.includes("business administration")) return "BBA";
  if (lower.includes("llb") || lower.includes("ll.b") || lower.includes("law")) return "LL.B";
  if (lower.includes("english") || lower.includes("eng")) return "B.A. ENG";
  if (lower.includes("sociology") || lower.includes("anthropology") || lower.includes("soc")) return "BSS SOC";
  if (lower.includes("bangla") || lower.includes("ban")) return "B.A. BAN";
  if (lower.includes("government") || lower.includes("politics") || lower.includes("g&p")) return "BSS G&P";
  if (lower.includes("islamic")) return "B.A. IS";
  if (lower.includes("fine art") || lower.includes("drawing") || lower.includes("bfa")) return "BFA";
  if (lower.includes("music")) return "B.Mus";
  if (lower.includes("dance")) return "B.Dance";

  return trimmed;
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
    shortName: "B.A. FDT",
  },
  {
    id: "UG-FDT-02",
    level: "Undergraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    department: "Apparel Manufacturing Management and Technology",
    departmentShortName: "AMMT",
    name: "BA (Hons) in Apparel Manufacturing Management and Technology",
    shortName: "B.A. AMMT",
  },
  {
    id: "UG-FDT-03",
    level: "Undergraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    department: "Interior Architecture",
    departmentShortName: "IA",
    name: "BA (Hons) in Interior Architecture",
    shortName: "B.A. IA",
  },
  {
    id: "UG-FDT-04",
    level: "Undergraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    department: "Graphic Design and Multimedia",
    departmentShortName: "GDM",
    name: "BA (Hons) in Graphic Design and Multimedia",
    shortName: "B.A. GDM",
  },
  {
    id: "UG-FDT-05",
    level: "Undergraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    department: "Architecture",
    departmentShortName: "ARCH",
    name: "Bachelor of Architecture",
    shortName: "B.Arch",
  },

  // FACULTY OF ENGINEERING & TECHNOLOGY
  {
    id: "UG-FET-01",
    level: "Undergraduate",
    faculty: "FACULTY OF ENGINEERING & TECHNOLOGY",
    department: "Computer Science and Engineering",
    departmentShortName: "CSE",
    name: "B.Sc (Hons) in Computer Science and Engineering",
    shortName: "B.Sc CSE",
  },
  {
    id: "UG-FET-02",
    level: "Undergraduate",
    faculty: "FACULTY OF ENGINEERING & TECHNOLOGY",
    department: "Computer Science and Information Technology",
    departmentShortName: "CSIT",
    name: "B.Sc (Hons) in Computer Science and Information Technology",
    shortName: "B.Sc CSIT",
  },

  // FACULTY OF BUSINESS
  {
    id: "UG-FOB-01",
    level: "Undergraduate",
    faculty: "FACULTY OF BUSINESS",
    department: "Business Administration",
    departmentShortName: "BBA",
    name: "Bachelor of Business Administration (BBA)",
    shortName: "BBA",
  },

  // FACULTY OF HUMANITIES & SOCIAL SCIENCES
  {
    id: "UG-FHS-01",
    level: "Undergraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "English",
    departmentShortName: "ENG",
    name: "BA (Hons) in English (Language & Literature)",
    shortName: "B.A. ENG",
  },
  {
    id: "UG-FHS-02",
    level: "Undergraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Law",
    departmentShortName: "LAW",
    name: "Bachelor of Laws (LLB)",
    shortName: "LL.B",
  },
  {
    id: "UG-FHS-03",
    level: "Undergraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Sociology & Anthropology",
    departmentShortName: "SOC",
    name: "BSS (Hons) in Sociology & Anthropology",
    shortName: "BSS SOC",
  },
  {
    id: "UG-FHS-04",
    level: "Undergraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Bangla",
    departmentShortName: "BAN",
    name: "BA (Hons) in Bangla",
    shortName: "B.A. BAN",
  },
  {
    id: "UG-FHS-05",
    level: "Undergraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Government & Politics",
    departmentShortName: "G&P",
    name: "BSS (Hons) in Government & Politics",
    shortName: "BSS G&P",
  },
  {
    id: "UG-FHS-06",
    level: "Undergraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Islamic Studies",
    departmentShortName: "IS",
    name: "BA (Hons) in Islamic Studies",
    shortName: "B.A. IS",
  },

  // FACULTY OF FINE & PERFORMING ARTS
  {
    id: "UG-FFA-01",
    level: "Undergraduate",
    faculty: "FACULTY OF FINE & PERFORMING ARTS",
    department: "Fine Arts",
    departmentShortName: "FA",
    name: "Bachelor of Fine Arts (Hons) Drawing & Painting",
    shortName: "BFA",
  },
  {
    id: "UG-FFA-02",
    level: "Undergraduate",
    faculty: "FACULTY OF FINE & PERFORMING ARTS",
    department: "Music",
    departmentShortName: "MUS",
    name: "Bachelor of Music (Hons) Rabindra, Nazrul, Classical",
    shortName: "B.Mus",
  },
  {
    id: "UG-FFA-03",
    level: "Undergraduate",
    faculty: "FACULTY OF FINE & PERFORMING ARTS",
    department: "Dance",
    departmentShortName: "DAN",
    name: "Bachelor of Music (Hons) in Dance",
    shortName: "B.Dance",
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
    shortName: "M.A. FD",
  },
  {
    id: "PG-FDT-02",
    level: "Postgraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    department: "Interior Architecture",
    departmentShortName: "IA",
    name: "M.A. in Interior Design",
    shortName: "M.A. ID",
  },
  {
    id: "PG-FDT-03",
    level: "Postgraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    department: "Graphic Design and Multimedia",
    departmentShortName: "GDM",
    name: "M.A. in Graphic Design and Multimedia",
    shortName: "M.A. GDM",
  },
  {
    id: "PG-FDT-04",
    level: "Postgraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    department: "Apparel Manufacturing Management and Technology",
    departmentShortName: "AMMT",
    name: "MBA in Product & Fashion Merchandizing",
    shortName: "MBA (PFM)",
  },

  // FACULTY OF BUSINESS
  {
    id: "PG-FOB-01",
    level: "Postgraduate",
    faculty: "FACULTY OF BUSINESS",
    department: "Business Administration",
    departmentShortName: "BBA",
    name: "Masters of Business Administration (MBA)",
    shortName: "MBA",
  },

  // FACULTY OF HUMANITIES & SOCIAL SCIENCES
  {
    id: "PG-FHS-01",
    level: "Postgraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "English",
    departmentShortName: "ENG",
    name: "MA in English",
    shortName: "M.A. ENG",
  },
  {
    id: "PG-FHS-02",
    level: "Postgraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Law",
    departmentShortName: "LAW",
    name: "Master of Laws (LLM)",
    shortName: "LL.M",
  },
  {
    id: "PG-FHS-03",
    level: "Postgraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Bangla",
    departmentShortName: "BAN",
    name: "MA in Bangla",
    shortName: "M.A. BAN",
  },
  {
    id: "PG-FHS-04",
    level: "Postgraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Sociology & Anthropology",
    departmentShortName: "SOC",
    name: "MSS in Sociology & Anthropology",
    shortName: "MSS SOC",
  },
  {
    id: "PG-FHS-05",
    level: "Postgraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Government & Politics",
    departmentShortName: "G&P",
    name: "MSS in Government & Politics",
    shortName: "MSS G&P",
  },
  {
    id: "PG-FHS-06",
    level: "Postgraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    department: "Islamic Studies",
    departmentShortName: "IS",
    name: "MA in Islamic Studies",
    shortName: "M.A. IS",
  },

  // FACULTY OF FINE & PERFORMING ARTS
  {
    id: "PG-FFA-01",
    level: "Postgraduate",
    faculty: "FACULTY OF FINE & PERFORMING ARTS",
    department: "Fine Arts",
    departmentShortName: "FA",
    name: "Master of Fine Arts",
    shortName: "MFA",
  },
  {
    id: "PG-FFA-02",
    level: "Postgraduate",
    faculty: "FACULTY OF FINE & PERFORMING ARTS",
    department: "Music",
    departmentShortName: "MUS",
    name: "Master of Music in Rabindra, Nazrul, Classical",
    shortName: "M.Mus",
  },
  {
    id: "PG-FFA-03",
    level: "Postgraduate",
    faculty: "FACULTY OF FINE & PERFORMING ARTS",
    department: "Dance",
    departmentShortName: "DAN",
    name: "Master of Music in Dance",
    shortName: "M.Dance",
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
