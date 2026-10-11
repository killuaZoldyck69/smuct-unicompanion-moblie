export interface HubCardTheme {
  bg: string;
  tagBg: string;
  caughtUpBg: string;
  caughtUpText: string;
}

// 🎨 Soft Bento UI Campus Color Themes (5 Colors: Light Green, Blue, Purple, Yellow, Orange)
export const CARD_THEMES: HubCardTheme[] = [
  {
    bg: "#d1fae5",
    tagBg: "#ffffff",
    caughtUpBg: "#a7f3d0",
    caughtUpText: "#065f46",
  }, // 0: Light Green / Mint
  {
    bg: "#e0f2fe",
    tagBg: "#ffffff",
    caughtUpBg: "#bae6fd",
    caughtUpText: "#0369a1",
  }, // 1: Blue / Sky Blue
  {
    bg: "#f3e8ff",
    tagBg: "#ffffff",
    caughtUpBg: "#e9d5ff",
    caughtUpText: "#581c87",
  }, // 2: Purple / Lavender
  {
    bg: "#fef08a",
    tagBg: "#ffffff",
    caughtUpBg: "#fde047",
    caughtUpText: "#854d0e",
  }, // 3: Yellow
  {
    bg: "#ffedd5",
    tagBg: "#ffffff",
    caughtUpBg: "#fed7aa",
    caughtUpText: "#9a3412",
  }, // 4: Orange / Peach
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
