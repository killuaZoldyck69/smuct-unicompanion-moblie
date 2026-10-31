/**
 * Parses a numeric value or ordinal string (e.g., "5", "5th") into
 * a number part and its lowercase ordinal suffix ("5", "th").
 */
export const parseOrdinalParts = (
  val: number | string | undefined | null,
): { numberPart: string; suffix: string } => {
  if (val === undefined || val === null || val === "") {
    return { numberPart: "—", suffix: "" };
  }
  const str = String(val).trim();
  const match = str.match(/^(\d+)\s*([a-zA-Z]+)?$/);
  if (match) {
    const num = parseInt(match[1], 10);
    let suffix = match[2];
    if (!suffix) {
      const j = num % 10;
      const k = num % 100;
      if (j === 1 && k !== 11) suffix = "st";
      else if (j === 2 && k !== 12) suffix = "nd";
      else if (j === 3 && k !== 13) suffix = "rd";
      else suffix = "th";
    }
    return { numberPart: String(num), suffix: suffix.toLowerCase() };
  }
  return { numberPart: str, suffix: "" };
};
