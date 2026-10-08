export const BENTO = {
  canvas: "#f8fafc",
  card: "#ffffff",
  navy: "#0f172a",
  navySecondary: "#1e293b",
  navyMuted: "#334155",
  slate: "#64748b",
  slateLight: "#94a3b8",
  slateSubtle: "#f1f5f9",
  border: "rgba(15, 23, 42, 0.08)",
  borderFocus: "#3b82f6",
  primary: "#0f172a",
  primaryLight: "#eff6ff",

  // Semantic Status Tokens
  emerald: "#059669",
  emeraldBg: "#ecfdf5",
  emeraldBorder: "#a7f3d0",

  amber: "#d97706",
  amberBg: "#fffbeb",
  amberBorder: "#fde68a",

  rose: "#e11d48",
  roseBg: "#fff1f2",
  roseBorder: "#fecdd3",

  indigo: "#4338ca",
  indigoBg: "#eef2ff",
  indigoBorder: "#c7d2fe",

  lavenderBg: "#f5f3ff",
  lavenderText: "#5b21b6",
  lavenderBorder: "#ddd6fe",
} as const;

export const PURPOSE_SUGGESTIONS = [
  "🏏 Cricket Match",
  "⚽ Football Match",
  "🏸 Badminton",
  "🎉 Cultural / Fest",
  "🏃 Sports Day",
  "📸 Photography",
] as const;

export const TIME_SLOT_PRESETS = [
  { label: "Morning", start: "08:00", end: "11:00", icon: "sun" as const },
  { label: "Afternoon", start: "14:00", end: "16:30", icon: "sunset" as const },
  { label: "Evening", start: "16:30", end: "19:00", icon: "cloud" as const },
  { label: "Night Lights", start: "19:00", end: "21:30", icon: "moon" as const },
] as const;
