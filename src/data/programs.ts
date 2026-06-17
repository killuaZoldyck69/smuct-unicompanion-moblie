export type ProgramLevel = "Undergraduate" | "Postgraduate";

export interface AcademicProgram {
  id: string;
  level: ProgramLevel;
  faculty: string;
  name: string;
}

export const universityPrograms: AcademicProgram[] = [
  // ==========================================
  // UNDERGRADUATE PROGRAMS
  // ==========================================

  // FACULTY OF DESIGN & TECHNOLOGY
  {
    id: "UG-FDT-01",
    level: "Undergraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    name: "BA (Hons) in Fashion Design and Technology",
  },
  {
    id: "UG-FDT-02",
    level: "Undergraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    name: "BA (Hons) in Apparel Manufacturing Management and Technology",
  },
  {
    id: "UG-FDT-03",
    level: "Undergraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    name: "BA (Hons) in Interior Architecture",
  },
  {
    id: "UG-FDT-04",
    level: "Undergraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    name: "BA (Hons) in Graphic Design and Multimedia",
  },
  {
    id: "UG-FDT-05",
    level: "Undergraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    name: "Bachelor of Architecture",
  },

  // FACULTY OF ENGINEERING & TECHNOLOGY
  {
    id: "UG-FET-01",
    level: "Undergraduate",
    faculty: "FACULTY OF ENGINEERING & TECHNOLOGY",
    name: "B.Sc (Hons) in Computer Science and Engineering",
  },
  {
    id: "UG-FET-02",
    level: "Undergraduate",
    faculty: "FACULTY OF ENGINEERING & TECHNOLOGY",
    name: "B.Sc (Hons) in Computer Science and Information Technology",
  },

  // FACULTY OF BUSINESS
  {
    id: "UG-FOB-01",
    level: "Undergraduate",
    faculty: "FACULTY OF BUSINESS",
    name: "Bachelor of Business Administration (BBA)",
  },

  // FACULTY OF HUMANITIES & SOCIAL SCIENCES
  {
    id: "UG-FHS-01",
    level: "Undergraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    name: "BA (Hons) in English (Language & Literature)",
  },
  {
    id: "UG-FHS-02",
    level: "Undergraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    name: "Bachelor of Laws (LLB)",
  },
  {
    id: "UG-FHS-03",
    level: "Undergraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    name: "BSS (Hons) in Sociology & Anthropology",
  },
  {
    id: "UG-FHS-04",
    level: "Undergraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    name: "BA (Hons) in Bangla",
  },
  {
    id: "UG-FHS-05",
    level: "Undergraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    name: "BSS (Hons) in Government & Politics",
  },
  {
    id: "UG-FHS-06",
    level: "Undergraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    name: "BA (Hons) in Islamic Studies",
  },

  // FACULTY OF FINE & PERFORMING ARTS
  {
    id: "UG-FFA-01",
    level: "Undergraduate",
    faculty: "FACULTY OF FINE & PERFORMING ARTS",
    name: "Bachelor of Fine Arts (Hons) Drawing & Painting",
  },
  {
    id: "UG-FFA-02",
    level: "Undergraduate",
    faculty: "FACULTY OF FINE & PERFORMING ARTS",
    name: "Bachelor of Music (Hons) Rabindra, Nazrul, Classical",
  },
  {
    id: "UG-FFA-03",
    level: "Undergraduate",
    faculty: "FACULTY OF FINE & PERFORMING ARTS",
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
    name: "M.A. in Fashion Design",
  },
  {
    id: "PG-FDT-02",
    level: "Postgraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    name: "M.A. in Interior Design",
  },
  {
    id: "PG-FDT-03",
    level: "Postgraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    name: "M.A. in Graphic Design and Multimedia",
  },
  {
    id: "PG-FDT-04",
    level: "Postgraduate",
    faculty: "FACULTY OF DESIGN & TECHNOLOGY",
    name: "MBA in Product & Fashion Merchandizing",
  },

  // FACULTY OF BUSINESS
  {
    id: "PG-FOB-01",
    level: "Postgraduate",
    faculty: "FACULTY OF BUSINESS",
    name: "Masters of Business Administration (MBA)",
  },

  // FACULTY OF HUMANITIES & SOCIAL SCIENCES
  {
    id: "PG-FHS-01",
    level: "Postgraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    name: "MA in English",
  },
  {
    id: "PG-FHS-02",
    level: "Postgraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    name: "Master of Laws (LLM)",
  },
  {
    id: "PG-FHS-03",
    level: "Postgraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    name: "MA in Bangla",
  },
  {
    id: "PG-FHS-04",
    level: "Postgraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    name: "MSS in Sociology & Anthropology",
  },
  {
    id: "PG-FHS-05",
    level: "Postgraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    name: "MSS in Government & Politics",
  },
  {
    id: "PG-FHS-06",
    level: "Postgraduate",
    faculty: "FACULTY OF HUMANITIES & SOCIAL SCIENCES",
    name: "MA in Islamic Studies",
  },

  // FACULTY OF FINE & PERFORMING ARTS
  {
    id: "PG-FFA-01",
    level: "Postgraduate",
    faculty: "FACULTY OF FINE & PERFORMING ARTS",
    name: "Master of Fine Arts",
  },
  {
    id: "PG-FFA-02",
    level: "Postgraduate",
    faculty: "FACULTY OF FINE & PERFORMING ARTS",
    name: "Master of Music in Rabindra, Nazrul, Classical",
  },
  {
    id: "PG-FFA-03",
    level: "Postgraduate",
    faculty: "FACULTY OF FINE & PERFORMING ARTS",
    name: "Master of Music in Dance",
  },
];

// Helper array just for simple flat lists (Dropdowns)
export const programListForDropdown = universityPrograms.map((program) => ({
  label: program.name,
  value: program.name,
  category: program.faculty, // Can be used for grouping in custom UI
}));
