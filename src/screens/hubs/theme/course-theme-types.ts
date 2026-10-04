import { Feather } from "@expo/vector-icons";

export type CourseGeometryMotif =
  | "grid-terminal"      // CS/Software/Tech: subtle brackets, code nodes, dots
  | "circles-formula"    // Math/Stats: concentric arcs, geometric node rings
  | "circuits-waves"     // Engineering/Physics: wave lines, schematic pulse nodes
  | "growth-charts"      // Business/Economics: ascending subtle bars, geometric angles
  | "creative-organic"   // Arts/Design/Architecture: playful organic blobs, soft diagonal curves
  | "academic-book";     // Humanities/General/Fallback: academic laurel contour, page curves

export interface CourseVisualTheme {
  category: string;
  paletteName: string;
  bg: string;
  cardBorderColor: string;
  accent: string;
  accentSoft: string;
  textPrimary: string;
  textSecondary: string;
  tagBg: string;
  tagText: string;
  caughtUpBg: string;
  caughtUpText: string;
  iconName: keyof typeof Feather.glyphMap;
  motif: CourseGeometryMotif;
  colorIndex: number;
}
