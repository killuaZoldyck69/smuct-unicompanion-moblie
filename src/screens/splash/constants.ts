import { FloatingDotConfig } from "./types";

export const SPLASH_DURATION_MS = 5000;

export const SPLASH_STRINGS = {
  TITLE: "UniCompanion",
  SUBTITLE: "Your campus life,\norganized in one place.",
  ACCESSIBILITY_LABEL: "UniCompanion Splash Screen Loading",
};

export const SPLASH_COLORS = {
  background: "#FAFCFF",
  titleText: "#0D1E42",
  subtitleText: "#5A6B82",

  // Brand logo palette
  capNavy: "#0E2350",
  capNavyDark: "#081736",
  capNavyLight: "#163473",
  bookGreen: "#10B981",
  bookGreenLight: "#34D399",
  bookGreenDark: "#059669",
  bookWhite: "#FFFFFF",
  tasselGold: "#F59E0B",

  // Progress bar
  progressTrack: "#E2E8F0",
  progressBar: "#2563EB",
  progressGlow: "#3B82F6",

  // Corner decorations & signature arcs
  cornerBlue: "#DDF0FF",
  cornerGreen: "#DCFCE7",
  cornerPurple: "#EDE9FE",
  cornerPurpleDark: "rgba(221, 214, 254, 0.45)",
  arcBlue: "#93C5FD",
  arcPurple: "#C084FC",
};

/**
 * Animated Floating Dots configurations matching the design mockup:
 * Circle light red, yellow, blue, green, and purple dots with varied
 * physics-like floating movement intervals and offsets.
 */
export const FLOATING_DOTS: FloatingDotConfig[] = [
  // 1. Light Purple (Top Left)
  {
    id: "dot-purple-tl",
    color: "#D8B4FE",
    size: 22,
    top: "14%",
    left: "8%",
    durationY: 2000,
    distanceY: -10,
    durationX: 2400,
    distanceX: 6,
    opacity: 0.9,
  },
  // 2. Light Yellow (Top Right)
  {
    id: "dot-yellow-tr",
    color: "#FDE047",
    size: 18,
    top: "18%",
    right: "8%",
    durationY: 2200,
    distanceY: 10,
    durationX: 1900,
    distanceX: -5,
    opacity: 0.9,
  },
  // 3. Light Green (Middle Left)
  {
    id: "dot-green-ml",
    color: "#86EFAC",
    size: 14,
    top: "38%",
    left: "6%",
    durationY: 1800,
    distanceY: -8,
    durationX: 2300,
    distanceX: 5,
    opacity: 0.85,
  },
  // 4. Light Blue (Left Edge)
  {
    id: "dot-blue-le",
    color: "#93C5FD",
    size: 26,
    top: "43%",
    left: "-2%",
    durationY: 2500,
    distanceY: 12,
    durationX: 2700,
    distanceX: 7,
    opacity: 0.85,
  },
  // 5. Light Red / Coral (Middle Right)
  {
    id: "dot-red-mr",
    color: "#FDA4AF",
    size: 16,
    top: "42%",
    right: "5%",
    durationY: 2100,
    distanceY: -9,
    durationX: 2000,
    distanceX: -6,
    opacity: 0.9,
  },
  // 6. Light Purple (Right Edge)
  {
    id: "dot-purple-re",
    color: "#E9D5FF",
    size: 30,
    top: "48%",
    right: "-4%",
    durationY: 2600,
    distanceY: 13,
    durationX: 2200,
    distanceX: -8,
    opacity: 0.85,
  },
  // 7. Light Green (Lower Right)
  {
    id: "dot-green-lr",
    color: "#86EFAC",
    size: 15,
    top: "81%",
    right: "8%",
    durationY: 2200,
    distanceY: -10,
    durationX: 1900,
    distanceX: 6,
    opacity: 0.85,
  },
  // 8. Light Yellow (Bottom Left-Center)
  {
    id: "dot-yellow-bl",
    color: "#FDE68A",
    size: 18,
    bottom: "5%",
    left: "38%",
    durationY: 2300,
    distanceY: 8,
    durationX: 2500,
    distanceX: -6,
    opacity: 0.85,
  },
  // 9. Light Red (Lower Left)
  {
    id: "dot-red-ll",
    color: "#FCA5A5",
    size: 14,
    bottom: "22%",
    left: "5%",
    durationY: 2400,
    distanceY: -8,
    durationX: 2100,
    distanceX: 5,
    opacity: 0.85,
  },
  // 10. Light Blue (Bottom Right)
  {
    id: "dot-blue-br",
    color: "#BAE6FD",
    size: 20,
    bottom: "16%",
    right: "12%",
    durationY: 2000,
    distanceY: 9,
    durationX: 2600,
    distanceX: -7,
    opacity: 0.85,
  },
];
