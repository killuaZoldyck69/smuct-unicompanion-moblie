import { CourseVisualTheme } from "./course-theme-types";

// Canonical 5 Soft Bento UI Campus Color Themes: Light Green, Blue, Purple, Yellow, Orange
export const CANONICAL_THEMES: CourseVisualTheme[] = [
  // 0: Light Green / Mint (Algorithms, Data Structures, Computer Science)
  {
    category: "Computer Science",
    paletteName: "Light Green",
    bg: "#dcfce7",
    cardBorderColor: "rgba(16, 185, 129, 0.22)",
    accent: "#059669",
    accentSoft: "#a7f3d0",
    squircleBg: "#10b981",
    textPrimary: "#064e3b",
    textSecondary: "#047857",
    tagBg: "#ffffff",
    tagText: "#065f46",
    codeBadgeBg: "#dcfce7",
    codeBadgeText: "#065f46",
    caughtUpBg: "#d1fae5",
    caughtUpText: "#059669",
    iconFamily: "MaterialCommunityIcons",
    iconName: "database",
    motif: "grid-terminal",
    colorIndex: 0,
  },
  // 1: Blue / Sky Blue (Mobile Engineering, Systems, Networks)
  {
    category: "Mobile & Systems",
    paletteName: "Blue",
    bg: "#e0f2fe",
    cardBorderColor: "rgba(14, 165, 233, 0.22)",
    accent: "#0284c7",
    accentSoft: "#bae6fd",
    squircleBg: "#0284c7",
    textPrimary: "#082f49",
    textSecondary: "#0369a1",
    tagBg: "#ffffff",
    tagText: "#0369a1",
    codeBadgeBg: "#e0f2fe",
    codeBadgeText: "#0369a1",
    caughtUpBg: "#bae6fd",
    caughtUpText: "#0284c7",
    iconFamily: "Feather",
    iconName: "smartphone",
    motif: "circuits-waves",
    colorIndex: 1,
  },
  // 2: Purple / Lavender (Design, Software, Theory)
  {
    category: "Design & Theory",
    paletteName: "Purple",
    bg: "#f3e8ff",
    cardBorderColor: "rgba(168, 85, 247, 0.22)",
    accent: "#7c3aed",
    accentSoft: "#e9d5ff",
    squircleBg: "#8b5cf6",
    textPrimary: "#3b0764",
    textSecondary: "#6b21a8",
    tagBg: "#ffffff",
    tagText: "#581c87",
    codeBadgeBg: "#f3e8ff",
    codeBadgeText: "#6b21a8",
    caughtUpBg: "#e9d5ff",
    caughtUpText: "#7c3aed",
    iconFamily: "Feather",
    iconName: "layout",
    motif: "creative-organic",
    colorIndex: 2,
  },
  // 3: Yellow (Business, Commerce, Economics)
  {
    category: "Business & Commerce",
    paletteName: "Yellow",
    bg: "#fef9c3",
    cardBorderColor: "rgba(234, 179, 8, 0.25)",
    accent: "#ca8a04",
    accentSoft: "#fef08a",
    squircleBg: "#eab308",
    textPrimary: "#422006",
    textSecondary: "#713f12",
    tagBg: "#ffffff",
    tagText: "#854d0e",
    codeBadgeBg: "#fef3c7",
    codeBadgeText: "#92400e",
    caughtUpBg: "#fef08a",
    caughtUpText: "#854d0e",
    iconFamily: "Feather",
    iconName: "terminal",
    motif: "growth-charts",
    colorIndex: 3,
  },
  // 4: Orange / Peach (Humanities, Languages, Social Sciences)
  {
    category: "Humanities & Language",
    paletteName: "Orange",
    bg: "#ffedd5",
    cardBorderColor: "rgba(249, 115, 22, 0.22)",
    accent: "#ea580c",
    accentSoft: "#fed7aa",
    squircleBg: "#f97316",
    textPrimary: "#431407",
    textSecondary: "#9a3412",
    tagBg: "#ffffff",
    tagText: "#9a3412",
    codeBadgeBg: "#ffedd5",
    codeBadgeText: "#9a3412",
    caughtUpBg: "#fed7aa",
    caughtUpText: "#ea580c",
    iconFamily: "MaterialCommunityIcons",
    iconName: "school",
    motif: "academic-book",
    colorIndex: 4,
  },
];

/**
 * Deterministically maps any identifier to an index 0..4
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
 * Uses the 5 campus colors (Light Green, Blue, Purple, Yellow, Orange) distributed
 * evenly across cards, while dynamically detecting subject-specific icons.
 */
export function resolveCourseTheme(
  hub: any,
  indexFallback = 0,
): CourseVisualTheme {
  // 1. Determine the base campus color palette (0: Light Green, 1: Blue, 2: Purple, 3: Yellow, 4: Orange)
  let paletteIndex: number;
  if (
    hub?.colorIndex !== undefined &&
    hub?.colorIndex !== null &&
    !isNaN(Number(hub.colorIndex))
  ) {
    paletteIndex = Math.abs(Number(hub.colorIndex)) % CANONICAL_THEMES.length;
  } else if (typeof indexFallback === "number" && indexFallback >= 0) {
    paletteIndex = Math.abs(indexFallback) % CANONICAL_THEMES.length;
  } else {
    const fallbackIdentifier =
      hub?.id || hub?.courseCode || hub?.courseName || "0";
    paletteIndex = hashStringToIndex(fallbackIdentifier, CANONICAL_THEMES.length);
  }

  const base = CANONICAL_THEMES[paletteIndex];

  if (!hub) {
    return base;
  }

  const code = (hub.courseCode || hub.code || "").toUpperCase().trim();
  const name = (hub.courseName || hub.name || hub.title || "").toLowerCase().trim();

  // 2. Resolve dynamic subject icon & category while preserving the card's assigned campus color!
  let category = base.category;
  let iconFamily: "Feather" | "MaterialCommunityIcons" =
    base.iconFamily || "Feather";
  let iconName: string = base.iconName;
  let motif = base.motif;

  if (
    name.includes("data structure") ||
    name.includes("algorithm") ||
    name.includes("database") ||
    name.includes("sql") ||
    name.includes("nosql")
  ) {
    category = "Computer Science";
    iconFamily = "MaterialCommunityIcons";
    iconName = "database";
    motif = "grid-terminal";
  } else if (
    name.includes("mobile") ||
    name.includes("android") ||
    name.includes("ios") ||
    name.includes("react native") ||
    name.includes("flutter") ||
    code.includes("4114")
  ) {
    category = "Mobile Engineering";
    iconFamily = "Feather";
    iconName = "smartphone";
    motif = "circuits-waves";
  } else if (
    name.includes("javafx") ||
    name.includes("ui") ||
    name.includes("ux") ||
    name.includes("interface") ||
    name.includes("design")
  ) {
    category = "Software & UI";
    iconFamily = "Feather";
    iconName = "layout";
    motif = "creative-organic";
  } else if (
    name.includes("python") ||
    name.includes("terminal") ||
    name.includes("script")
  ) {
    category = "Programming";
    iconFamily = "Feather";
    iconName = "terminal";
    motif = "grid-terminal";
  } else if (
    name.includes("thesis") ||
    name.includes("research") ||
    name.includes("project") ||
    name.includes("capstone") ||
    name.includes("dissertation")
  ) {
    category = "Academic Research";
    iconFamily = "MaterialCommunityIcons";
    iconName = "school";
    motif = "academic-book";
  } else if (
    name.includes("network") ||
    name.includes("security") ||
    name.includes("cloud") ||
    name.includes("telecom") ||
    name.includes("system") ||
    name.includes("operating system")
  ) {
    category = "Systems & Networks";
    iconFamily = "Feather";
    iconName = "cpu";
    motif = "circuits-waves";
  } else if (
    name.includes("math") ||
    name.includes("calculus") ||
    name.includes("discrete") ||
    name.includes("linear") ||
    name.includes("stat")
  ) {
    category = "Mathematics";
    iconFamily = "Feather";
    iconName = "hash";
    motif = "circles-formula";
  } else if (
    name.includes("java") ||
    name.includes("c++") ||
    name.includes("compiler") ||
    name.includes("programming") ||
    name.includes("software") ||
    code.startsWith("CSE")
  ) {
    category = "Computer Science";
    iconFamily = "Feather";
    iconName = "code";
    motif = "grid-terminal";
  } else if (
    name.includes("business") ||
    name.includes("account") ||
    name.includes("finance") ||
    name.includes("market") ||
    name.includes("manage") ||
    code.startsWith("BBA")
  ) {
    category = "Business & Commerce";
    iconFamily = "Feather";
    iconName = "trending-up";
    motif = "growth-charts";
  } else if (
    name.includes("english") ||
    name.includes("communication") ||
    name.includes("literature") ||
    name.includes("law") ||
    code.startsWith("ENG")
  ) {
    category = "Humanities & Language";
    iconFamily = "Feather";
    iconName = "book-open";
    motif = "academic-book";
  }

  return {
    ...base,
    category,
    iconFamily,
    iconName,
    motif,
  };
}
