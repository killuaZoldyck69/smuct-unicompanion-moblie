import { Platform } from "react-native";
import { AssessmentType } from "./types";

export const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  default: "sans-serif",
});

export const BENTO = {
  canvas: "#f7f9fb",
  card: "#ffffff",
  navy: "#131b2e",
  slate: "#64748b",
  subtleText: "#94a3b8",
  border: "rgba(19, 27, 46, 0.08)",
  borderActive: "#131b2e",
  blueSoft: "#eff6ff",
  blueBorder: "#bfdbfe",
  blueText: "#1d4ed8",
  purpleSoft: "#faf5ff",
  purpleBorder: "#e9d5ff",
  purpleText: "#7e22ce",
  amberSoft: "#fffbeb",
  amberBorder: "#fde68a",
  amberText: "#b45309",
  mintSoft: "#f0fdf4",
  mintBorder: "#bbf7d0",
  mintText: "#15803d",
  roseSoft: "#fff1f2",
  roseBorder: "#fecdd3",
  roseText: "#e11d48",
};

export const ASSESSMENT_TYPES: Array<{
  id: AssessmentType;
  label: string;
  icon: "file-text" | "help-circle" | "monitor";
  activeBg: string;
  activeBorder: string;
  activeText: string;
}> = [
  {
    id: "ASSIGNMENT",
    label: "Assignment",
    icon: "file-text",
    activeBg: BENTO.blueSoft,
    activeBorder: BENTO.blueBorder,
    activeText: BENTO.blueText,
  },
  {
    id: "QUIZ",
    label: "CT / Quiz",
    icon: "help-circle",
    activeBg: BENTO.purpleSoft,
    activeBorder: BENTO.purpleBorder,
    activeText: BENTO.purpleText,
  },
  {
    id: "PRESENTATION",
    label: "Presentation",
    icon: "monitor",
    activeBg: BENTO.amberSoft,
    activeBorder: BENTO.amberBorder,
    activeText: BENTO.amberText,
  },
];

export const MARKS_PRESETS = ["10", "20", "25", "50", "100"];

export const DEADLINE_PRESETS = [
  { label: "Tomorrow", days: 1 },
  { label: "In 3 Days", days: 3 },
  { label: "1 Week", days: 7 },
  { label: "2 Weeks", days: 14 },
];
