const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Strips raw ISO timestamp ("2026-08-22T00:00:00.000Z") down to "YYYY-MM-DD".
 */
export function cleanDateYmd(dateStr?: string | null): string {
  if (!dateStr) return "";
  const match = dateStr.trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (match) {
    const y = match[1];
    const m = match[2].padStart(2, "0");
    const d = match[3].padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const slashMatch = dateStr.trim().match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (slashMatch) {
    const m = slashMatch[1].padStart(2, "0");
    const d = slashMatch[2].padStart(2, "0");
    const y = slashMatch[3];
    return `${y}-${m}-${d}`;
  }
  return dateStr.split("T")[0];
}

/**
 * Returns month abbreviation and 2-digit day for badge rendering.
 */
export function getMonthAndDay(dateStr: string): { month: string; day: string } {
  const cleaned = cleanDateYmd(dateStr);
  const parts = cleaned.split("-");
  if (parts.length >= 3) {
    const mIdx = parseInt(parts[1], 10) - 1;
    return {
      month: MONTH_NAMES[mIdx] || parts[1],
      day: parts[2].padStart(2, "0"),
    };
  }
  return { month: "N/A", day: "--" };
}

/**
 * Formats a single date or date span into clean human-readable text.
 * E.g. "22 Aug – 28 Aug 2026", "4 Sep 2026", or "26 Dec 2026 – 15 Jan 2027"
 */
export function formatFormattedDateRange(
  startDateStr: string,
  endDateStr?: string | null,
): string {
  const start = cleanDateYmd(startDateStr);
  const end = cleanDateYmd(endDateStr);

  const startParts = start.split("-");
  if (startParts.length < 3) return startDateStr;

  const sY = startParts[0];
  const sM = MONTH_NAMES[parseInt(startParts[1], 10) - 1] || startParts[1];
  const sD = parseInt(startParts[2], 10);

  if (!end || end === start) {
    return `${sD} ${sM} ${sY}`;
  }

  const endParts = end.split("-");
  if (endParts.length < 3) return `${sD} ${sM} ${sY}`;

  const eY = endParts[0];
  const eM = MONTH_NAMES[parseInt(endParts[1], 10) - 1] || endParts[1];
  const eD = parseInt(endParts[2], 10);

  if (sY === eY && sM === eM) {
    return `${sD} – ${eD} ${sM} ${sY}`;
  }
  if (sY === eY) {
    return `${sD} ${sM} – ${eD} ${eM} ${sY}`;
  }
  return `${sD} ${sM} ${sY} – ${eD} ${eM} ${eY}`;
}
