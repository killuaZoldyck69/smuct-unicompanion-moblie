import { Feather } from "@expo/vector-icons";
import { CourseVisualTheme, CourseGeometryMotif } from "./course-theme-types";

// Canonical 8 Bento Pastel Color Palettes aligned with CARD_THEMES in hub-themes.ts
const CANONICAL_THEMES: CourseVisualTheme[] = [
  // 0: Mint / Tech / Algorithms
  {
    category: "Computer Science",
    paletteName: "Mint",
    bg: "#d1fae5",
    cardBorderColor: "rgba(16, 185, 129, 0.18)",
    accent: "#059669",
    accentSoft: "#a7f3d0",
    textPrimary: "#064e3b",
    textSecondary: "#047857",
    tagBg: "#ffffff",
    tagText: "#065f46",
    caughtUpBg: "#a7f3d0",
    caughtUpText: "#065f46",
    iconName: "code",
    motif: "grid-terminal",
    colorIndex: 0,
  },
  // 1: Pink / Design / Creative
  {
    category: "Design & Arts",
    paletteName: "Pink",
    bg: "#fce7f3",
    cardBorderColor: "rgba(236, 72, 153, 0.18)",
    accent: "#db2777",
    accentSoft: "#fbcfe8",
    textPrimary: "#701a75",
    textSecondary: "#9d174d",
    tagBg: "#ffffff",
    tagText: "#831843",
    caughtUpBg: "#fbcfe8",
    caughtUpText: "#831843",
    iconName: "layout",
    motif: "creative-organic",
    colorIndex: 1,
  },
  // 2: Indigo / Mathematics / Theory
  {
    category: "Mathematics & Theory",
    paletteName: "Indigo",
    bg: "#e0e7ff",
    cardBorderColor: "rgba(99, 102, 241, 0.18)",
    accent: "#4f46e5",
    accentSoft: "#c7d2fe",
    textPrimary: "#1e1b4b",
    textSecondary: "#4338ca",
    tagBg: "#ffffff",
    tagText: "#3730a3",
    caughtUpBg: "#c7d2fe",
    caughtUpText: "#3730a3",
    iconName: "hash",
    motif: "circles-formula",
    colorIndex: 2,
  },
  // 3: Yellow / Business & Economics
  {
    category: "Business & Commerce",
    paletteName: "Yellow",
    bg: "#fef08a",
    cardBorderColor: "rgba(234, 179, 8, 0.22)",
    accent: "#ca8a04",
    accentSoft: "#fde047",
    textPrimary: "#422006",
    textSecondary: "#713f12",
    tagBg: "#ffffff",
    tagText: "#854d0e",
    caughtUpBg: "#fde047",
    caughtUpText: "#854d0e",
    iconName: "trending-up",
    motif: "growth-charts",
    colorIndex: 3,
  },
  // 4: Sky Blue / Systems & Networks
  {
    category: "Systems & Engineering",
    paletteName: "Sky Blue",
    bg: "#e0f2fe",
    cardBorderColor: "rgba(14, 165, 233, 0.18)",
    accent: "#0284c7",
    accentSoft: "#bae6fd",
    textPrimary: "#082f49",
    textSecondary: "#0369a1",
    tagBg: "#ffffff",
    tagText: "#0369a1",
    caughtUpBg: "#bae6fd",
    caughtUpText: "#0369a1",
    iconName: "cpu",
    motif: "circuits-waves",
    colorIndex: 4,
  },
  // 5: Peach / Humanities & Language
  {
    category: "Humanities & Language",
    paletteName: "Peach",
    bg: "#ffedd5",
    cardBorderColor: "rgba(249, 115, 22, 0.18)",
    accent: "#ea580c",
    accentSoft: "#fed7aa",
    textPrimary: "#431407",
    textSecondary: "#9a3412",
    tagBg: "#ffffff",
    tagText: "#9a3412",
    caughtUpBg: "#fed7aa",
    caughtUpText: "#9a3412",
    iconName: "book-open",
    motif: "academic-book",
    colorIndex: 5,
  },
  // 6: Lavender / Sciences & Research
  {
    category: "Sciences & Research",
    paletteName: "Lavender",
    bg: "#f3e8ff",
    cardBorderColor: "rgba(168, 85, 247, 0.18)",
    accent: "#9333ea",
    accentSoft: "#e9d5ff",
    textPrimary: "#3b0764",
    textSecondary: "#6b21a8",
    tagBg: "#ffffff",
    tagText: "#581c87",
    caughtUpBg: "#e9d5ff",
    caughtUpText: "#581c87",
    iconName: "activity",
    motif: "circles-formula",
    colorIndex: 6,
  },
  // 7: Rose / Interdisciplinary & Seminars
  {
    category: "General Academic",
    paletteName: "Rose",
    bg: "#ffe4e6",
    cardBorderColor: "rgba(244, 63, 94, 0.18)",
    accent: "#e11d48",
    accentSoft: "#fecdd3",
    textPrimary: "#4c0519",
    textSecondary: "#9f1239",
    tagBg: "#ffffff",
    tagText: "#9f1239",
    caughtUpBg: "#fecdd3",
    caughtUpText: "#9f1239",
    iconName: "award",
    motif: "academic-book",
    colorIndex: 7,
  },
];

/**
 * Deterministically maps any identifier to an index 0..7
 */
function hashStringToIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

/**
 * Procedurally resolves a rich CourseVisualTheme based on course metadata.
 * Prioritizes subject context (code, name, department), then gracefully falls back
 * to deterministic pastel themes.
 */
export function resolveCourseTheme(
  hub: any,
  indexFallback = 0,
): CourseVisualTheme {
  if (!hub) {
    return CANONICAL_THEMES[indexFallback % CANONICAL_THEMES.length];
  }

  const code = (hub.courseCode || hub.code || "").toUpperCase().trim();
  const name = (hub.courseName || hub.name || hub.title || "").toLowerCase().trim();
  const dept = (hub.department || "").toUpperCase().trim();

  // 1. Mobile Development specific
  if (
    name.includes("mobile") ||
    name.includes("android") ||
    name.includes("ios") ||
    name.includes("react native") ||
    name.includes("flutter")
  ) {
    const base = CANONICAL_THEMES[4]; // Sky Blue
    return {
      ...base,
      category: "Mobile Engineering",
      iconName: "smartphone",
      motif: "grid-terminal",
    };
  }

  // 2. Data Structures & Algorithms
  if (
    name.includes("data structure") ||
    name.includes("algorithm") ||
    name.includes("database") ||
    name.includes("sql") ||
    name.includes("nosql")
  ) {
    const base = CANONICAL_THEMES[0]; // Mint
    return {
      ...base,
      category: "Computer Science",
      iconName: "database",
      motif: "grid-terminal",
    };
  }

  // 3. Programming languages (Python, Java, JavaFX, C++, Web)
  if (
    name.includes("python") ||
    name.includes("java") ||
    name.includes("c++") ||
    name.includes("c programming") ||
    name.includes("web") ||
    name.includes("software") ||
    name.includes("compiler") ||
    name.includes("operating system")
  ) {
    const base = CANONICAL_THEMES[0]; // Mint
    return {
      ...base,
      category: "Software Development",
      iconName: "terminal",
      motif: "grid-terminal",
    };
  }

  // 4. Computer Science Prefix check (CSE, SWE, CIS, CS, IT, NET)
  if (
    code.startsWith("CSE") ||
    code.startsWith("SWE") ||
    code.startsWith("CIS") ||
    code.startsWith("CS") ||
    code.startsWith("IT") ||
    dept.includes("CSE") ||
    dept.includes("COMPUTER")
  ) {
    const base = CANONICAL_THEMES[0]; // Mint
    return {
      ...base,
      category: "Computer Science",
      iconName: "code",
      motif: "grid-terminal",
    };
  }

  // 5. Mathematics & Statistics (MAT, MATH, STA, calculus, discrete, linear)
  if (
    code.startsWith("MAT") ||
    code.startsWith("MATH") ||
    code.startsWith("STA") ||
    dept.includes("MATH") ||
    name.includes("calculus") ||
    name.includes("discrete") ||
    name.includes("algebra") ||
    name.includes("statistic") ||
    name.includes("numerical") ||
    name.includes("matrix")
  ) {
    const base = CANONICAL_THEMES[2]; // Indigo
    return {
      ...base,
      category: "Mathematics",
      iconName: "hash",
      motif: "circles-formula",
    };
  }

  // 6. Engineering & Hardware (EEE, ETE, PHY, circuits, electronic)
  if (
    code.startsWith("EEE") ||
    code.startsWith("ETE") ||
    code.startsWith("PHY") ||
    dept.includes("ENGINEERING") ||
    dept.includes("EEE") ||
    name.includes("circuit") ||
    name.includes("electronic") ||
    name.includes("physics") ||
    name.includes("telecom") ||
    name.includes("digital logic") ||
    name.includes("signal") ||
    name.includes("robot")
  ) {
    const base = CANONICAL_THEMES[4]; // Sky Blue
    return {
      ...base,
      category: "Engineering & Hardware",
      iconName: "cpu",
      motif: "circuits-waves",
    };
  }

  // 7. Business, Commerce & Economics (BBA, ACT, FIN, MKT, MGT, ECO)
  if (
    code.startsWith("BBA") ||
    code.startsWith("ACT") ||
    code.startsWith("FIN") ||
    code.startsWith("MKT") ||
    code.startsWith("MGT") ||
    code.startsWith("ECO") ||
    dept.includes("BUSINESS") ||
    dept.includes("BBA") ||
    name.includes("accounting") ||
    name.includes("finance") ||
    name.includes("marketing") ||
    name.includes("management") ||
    name.includes("economic") ||
    name.includes("business") ||
    name.includes("entrepreneur")
  ) {
    const base = CANONICAL_THEMES[3]; // Yellow
    return {
      ...base,
      category: "Business & Commerce",
      iconName: "trending-up",
      motif: "growth-charts",
    };
  }

  // 8. Humanities, Languages & Social Sciences (ENG, HUM, SOC, LAW)
  if (
    code.startsWith("ENG") ||
    code.startsWith("HUM") ||
    code.startsWith("SOC") ||
    code.startsWith("LAW") ||
    dept.includes("ENGLISH") ||
    name.includes("english") ||
    name.includes("communication") ||
    name.includes("literature") ||
    name.includes("writing") ||
    name.includes("history") ||
    name.includes("society") ||
    name.includes("ethics")
  ) {
    const base = CANONICAL_THEMES[5]; // Peach
    return {
      ...base,
      category: "Humanities & Language",
      iconName: "book-open",
      motif: "academic-book",
    };
  }

  // 9. Design, Fashion & Fine Arts (FAD, ARC, textile, design, graphic)
  if (
    code.startsWith("FAD") ||
    code.startsWith("ARC") ||
    code.startsWith("AMT") ||
    code.startsWith("KMT") ||
    dept.includes("FASHION") ||
    dept.includes("DESIGN") ||
    name.includes("fashion") ||
    name.includes("design") ||
    name.includes("drawing") ||
    name.includes("graphic") ||
    name.includes("pattern") ||
    name.includes("apparel") ||
    name.includes("textile")
  ) {
    const base = CANONICAL_THEMES[1]; // Pink
    return {
      ...base,
      category: "Design & Arts",
      iconName: "layout",
      motif: "creative-organic",
    };
  }

  // 10. Graceful Fallback: Deterministic index from hub.id, code or list index
  const fallbackIdentifier = hub.id || hub.courseCode || hub.courseName || String(indexFallback);
  const themeIndex = hashStringToIndex(fallbackIdentifier, CANONICAL_THEMES.length);
  return CANONICAL_THEMES[themeIndex];
}
