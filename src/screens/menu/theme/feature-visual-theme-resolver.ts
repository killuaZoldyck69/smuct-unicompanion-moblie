import { Feather } from "@expo/vector-icons";

// ─────────────────────────────────────────────────────────────
// FeatureVisualTheme: The resolved visual identity for a feature
// ─────────────────────────────────────────────────────────────
export interface FeatureVisualTheme {
  /** Feather icon name */
  icon: keyof typeof Feather.glyphMap;
  /** Full accent colour (icon stroke, nav affordance) */
  accentColor: string;
  /** Very light tinted background for the icon container */
  iconBackground: string;
  /** Category semantic colour used in section headers */
  categoryAccent: string;
  /** Subtle pattern hint for decorative geometry */
  patternType: "grid" | "arcs" | "dots" | "lines" | "rings" | "none";
}

// ─────────────────────────────────────────────────────────────
// Per-category fallback palettes (restrained, semantic)
// ─────────────────────────────────────────────────────────────
const CATEGORY_PALETTE: Record<
  string,
  Pick<FeatureVisualTheme, "accentColor" | "iconBackground" | "categoryAccent">
> = {
  ACADEMIC: {
    accentColor: "#3b63d9",
    iconBackground: "#eff3ff",
    categoryAccent: "#3b63d9",
  },
  CAMPUS: {
    accentColor: "#0e9f7e",
    iconBackground: "#edfaf5",
    categoryAccent: "#0e9f7e",
  },
  SUPPORT: {
    accentColor: "#e25c5c",
    iconBackground: "#fff0f0",
    categoryAccent: "#e25c5c",
  },
  ADMIN: {
    accentColor: "#6d4fc2",
    iconBackground: "#f4f0ff",
    categoryAccent: "#6d4fc2",
  },
  DEFAULT: {
    accentColor: "#64748b",
    iconBackground: "#f1f5f9",
    categoryAccent: "#64748b",
  },
};

// ─────────────────────────────────────────────────────────────
// Per-feature explicit overrides
// Only define what differs from category default.
// ─────────────────────────────────────────────────────────────
interface FeatureOverride {
  icon: keyof typeof Feather.glyphMap;
  accentColor?: string;
  iconBackground?: string;
  patternType?: FeatureVisualTheme["patternType"];
}

const FEATURE_OVERRIDES: Record<string, FeatureOverride> = {
  // ─ Academic ─
  exam_routines: {
    icon: "edit-3",
    accentColor: "#2563eb",
    iconBackground: "#eff3ff",
    patternType: "grid",
  },
  class_routines: {
    icon: "calendar",
    accentColor: "#5b6cf9",
    iconBackground: "#f0f1ff",
    patternType: "lines",
  },
  academic_calendar: {
    icon: "book-open",
    accentColor: "#0891b2",
    iconBackground: "#ecfeff",
    patternType: "arcs",
  },
  course_eval: {
    icon: "layers",
    accentColor: "#7c3aed",
    iconBackground: "#f5f3ff",
    patternType: "rings",
  },
  cgpa_calculator: {
    icon: "bar-chart-2",
    accentColor: "#b45309",
    iconBackground: "#fffbeb",
    patternType: "dots",
  },

  // ─ Campus ─
  noticeboard: {
    icon: "bell",
    accentColor: "#0e9f7e",
    iconBackground: "#edfaf5",
    patternType: "lines",
  },
  bus_schedule: {
    icon: "navigation",
    accentColor: "#0369a1",
    iconBackground: "#f0f9ff",
    patternType: "arcs",
  },
  campus_events: {
    icon: "star",
    accentColor: "#9333ea",
    iconBackground: "#faf5ff",
    patternType: "rings",
  },
  campus_forum: {
    icon: "message-circle",
    accentColor: "#059669",
    iconBackground: "#ecfdf5",
    patternType: "dots",
  },
  field_booking: {
    icon: "target",
    accentColor: "#0f766e",
    iconBackground: "#f0fdfa",
    patternType: "grid",
  },

  // ─ Support ─
  blood_donation: {
    icon: "heart",
    accentColor: "#dc2626",
    iconBackground: "#fff5f5",
    patternType: "rings",
  },
  alumni: {
    icon: "users",
    accentColor: "#7c3aed",
    iconBackground: "#f5f3ff",
    patternType: "dots",
  },
  complaints: {
    icon: "file-text",
    accentColor: "#c2410c",
    iconBackground: "#fff7ed",
    patternType: "lines",
  },

  // ─ Admin ─
  admin_complaints: { icon: "inbox", patternType: "lines" },
  admin_alumni: { icon: "database", patternType: "dots" },
  admin_field_booking: { icon: "check-square", patternType: "grid" },
  manage_forum: { icon: "message-square", patternType: "rings" },
  manage_buses: { icon: "map", patternType: "arcs" },
  upload_notice: { icon: "upload-cloud", patternType: "lines" },
  manage_blood: { icon: "droplet", patternType: "rings" },
  upload_event: { icon: "calendar", patternType: "dots" },
  manage_calendar: { icon: "grid", patternType: "grid" },
};

// ─────────────────────────────────────────────────────────────
// FeatureVisualThemeResolver — never crashes on unknown features
// ─────────────────────────────────────────────────────────────
export const FeatureVisualThemeResolver = {
  resolve(
    id: string,
    category: string,
    fallbackIcon: keyof typeof Feather.glyphMap = "grid",
  ): FeatureVisualTheme {
    const override = FEATURE_OVERRIDES[id];
    const palette =
      CATEGORY_PALETTE[category] ?? CATEGORY_PALETTE["DEFAULT"];

    return {
      icon: override?.icon ?? fallbackIcon,
      accentColor: override?.accentColor ?? palette.accentColor,
      iconBackground: override?.iconBackground ?? palette.iconBackground,
      categoryAccent: palette.categoryAccent,
      patternType: override?.patternType ?? "none",
    };
  },
};
