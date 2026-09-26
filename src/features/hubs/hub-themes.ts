export interface HubCardTheme {
  bg: string;
  tagBg: string;
  caughtUpBg: string;
  caughtUpText: string;
}

// 🎨 Expanded Soft Campus Bento Color Themes (8 Colors)
export const CARD_THEMES: HubCardTheme[] = [
  {
    bg: "#d1fae5",
    tagBg: "#ffffff",
    caughtUpBg: "#a7f3d0",
    caughtUpText: "#065f46",
  }, // Mint
  {
    bg: "#fce7f3",
    tagBg: "#ffffff",
    caughtUpBg: "#fbcfe8",
    caughtUpText: "#831843",
  }, // Pink
  {
    bg: "#e0e7ff",
    tagBg: "#ffffff",
    caughtUpBg: "#c7d2fe",
    caughtUpText: "#3730a3",
  }, // Indigo
  {
    bg: "#fef08a",
    tagBg: "#ffffff",
    caughtUpBg: "#fde047",
    caughtUpText: "#854d0e",
  }, // Yellow
  {
    bg: "#e0f2fe",
    tagBg: "#ffffff",
    caughtUpBg: "#bae6fd",
    caughtUpText: "#0369a1",
  }, // Sky Blue
  {
    bg: "#ffedd5",
    tagBg: "#ffffff",
    caughtUpBg: "#fed7aa",
    caughtUpText: "#9a3412",
  }, // Peach
  {
    bg: "#f3e8ff",
    tagBg: "#ffffff",
    caughtUpBg: "#e9d5ff",
    caughtUpText: "#581c87",
  }, // Lavender
  {
    bg: "#ffe4e6",
    tagBg: "#ffffff",
    caughtUpBg: "#fecdd3",
    caughtUpText: "#9f1239",
  }, // Rose
];

/**
 * Returns a consistent HubCardTheme based on an explicit index,
 * or by deterministically hashing an identifier (e.g. hubId).
 */
export function getHubTheme(
  identifier?: string | number | null,
  colorIndex?: string | number | null
): HubCardTheme {
  // 1. Explicit colorIndex provided
  if (
    colorIndex !== undefined &&
    colorIndex !== null &&
    !isNaN(Number(colorIndex))
  ) {
    const idx = Math.abs(Number(colorIndex)) % CARD_THEMES.length;
    return CARD_THEMES[idx];
  }

  // 2. Numeric identifier (e.g. list index)
  if (typeof identifier === "number") {
    const idx = Math.abs(identifier) % CARD_THEMES.length;
    return CARD_THEMES[idx];
  }

  // 3. String identifier (e.g. hubId hash)
  if (typeof identifier === "string" && identifier.trim().length > 0) {
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      hash = (hash << 5) - hash + identifier.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % CARD_THEMES.length;
    return CARD_THEMES[idx];
  }

  // 4. Default to first theme
  return CARD_THEMES[0];
}
