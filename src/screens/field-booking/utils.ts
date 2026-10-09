import { FieldBookingItem } from "@/services/field-service";
import { DurationInfo, SportIconData } from "./types";

export function toISODateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatTime12h(time24: string): string {
  if (!time24) return "";
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr || "00";
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${m} ${ampm}`;
}

export function formatDate(isoString?: string | null): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

export function formatRequestedDate(isoString?: string | null): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

export function formatTime(isoOrTime?: string | null): string {
  if (!isoOrTime) return "";
  try {
    if (/^\d{1,2}:\d{2}$/.test(isoOrTime)) {
      return formatTime12h(isoOrTime);
    }
    const d = new Date(isoOrTime);
    if (isNaN(d.getTime())) return isoOrTime;
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoOrTime;
  }
}

export function calculateDurationString(
  dateStr: string,
  startTime: string,
  endTime: string
): DurationInfo {
  if (!dateStr || !startTime || !endTime) {
    return { durationText: "", isValid: false, minutes: 0 };
  }
  const [sy, sm, sd] = dateStr.split("-").map(Number);
  const [sh, smin] = startTime.split(":").map(Number);
  const [eh, emin] = endTime.split(":").map(Number);

  const start = new Date(sy, sm - 1, sd, sh, smin, 0);
  const end = new Date(sy, sm - 1, sd, eh, emin, 0);

  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));

  if (diffMins <= 0) {
    return {
      durationText: "End time must be after start time",
      isValid: false,
      minutes: diffMins,
    };
  }

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  let text = "";
  if (hours > 0 && mins > 0) {
    text = `${hours}h ${mins}m`;
  } else if (hours > 0) {
    text = `${hours}h`;
  } else {
    text = `${mins}m`;
  }

  return { durationText: text, isValid: true, minutes: diffMins };
}

export function getBookingDuration(item: FieldBookingItem): string {
  try {
    const s = new Date(item.startTime).getTime();
    const e = new Date(item.endTime).getTime();
    const diffMins = Math.round((e - s) / (1000 * 60));
    if (diffMins <= 0) return "";
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  } catch {
    return "";
  }
}

export function getSportEmoji(purpose: string): string {
  const p = (purpose || "").toLowerCase();
  if (p.includes("cricket")) return "🏏";
  if (p.includes("football") || p.includes("soccer")) return "⚽";
  if (p.includes("badminton") || p.includes("tennis")) return "🏸";
  if (
    p.includes("fest") ||
    p.includes("cultural") ||
    p.includes("event") ||
    p.includes("concert")
  ) {
    return "🎉";
  }
  if (
    p.includes("sports") ||
    p.includes("athletic") ||
    p.includes("race") ||
    p.includes("run")
  ) {
    return "🏃";
  }
  if (p.includes("photo") || p.includes("shoot") || p.includes("film")) {
    return "📸";
  }
  return "🏟️";
}

export function formatPurposeWithEmoji(purpose?: string | null): string {
  if (!purpose) return "";
  const trimmed = purpose.trim();
  const startsWithEmoji =
    /^(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u.test(trimmed);
  if (startsWithEmoji) {
    return trimmed;
  }
  const emoji = getSportEmoji(trimmed);
  return `${emoji} ${trimmed}`;
}

export function getSportIcon(purpose: string): SportIconData {
  const p = (purpose || "").toLowerCase();
  if (p.includes("cricket")) {
    return { type: "cricket", label: "Cricket" };
  }
  if (p.includes("football") || p.includes("soccer")) {
    return { type: "football", label: "Football" };
  }
  if (p.includes("badminton") || p.includes("tennis")) {
    return { type: "racket", label: "Racket Sports" };
  }
  if (
    p.includes("fest") ||
    p.includes("cultural") ||
    p.includes("event") ||
    p.includes("concert")
  ) {
    return { type: "event", label: "Campus Event" };
  }
  if (
    p.includes("sports") ||
    p.includes("athletic") ||
    p.includes("race") ||
    p.includes("run")
  ) {
    return { type: "athletics", label: "Athletics" };
  }
  if (p.includes("photo") || p.includes("shoot") || p.includes("film")) {
    return { type: "media", label: "Media / Photo" };
  }
  return { type: "general", label: "Sports Field" };
}

export function getBookingDateKey(item: FieldBookingItem): string {
  const raw = item.bookingDate || item.startTime;
  if (!raw) return "";
  if (typeof raw === "string" && raw.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.substring(0, 10);
  }
  try {
    const d = new Date(raw);
    return toISODateString(d);
  } catch {
    return "";
  }
}

export function formatFullHeaderDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const cleanStr =
      typeof dateStr === "string" && dateStr.includes("T")
        ? dateStr.split("T")[0]
        : String(dateStr).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
      const [y, m, d] = cleanStr.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    }

    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return String(dateStr);
  } catch {
    return String(dateStr);
  }
}

export function isPastBooking(item: FieldBookingItem): boolean {
  try {
    // 1. If endTime has full ISO date-time string
    if (item.endTime) {
      const endD = new Date(item.endTime);
      if (!isNaN(endD.getTime()) && item.endTime.includes("T")) {
        return endD.getTime() < Date.now();
      }
    }

    // 2. If bookingDate is present
    const rawDate = item.bookingDate || item.startTime;
    if (rawDate) {
      const datePart =
        typeof rawDate === "string" && rawDate.includes("T")
          ? rawDate.split("T")[0]
          : String(rawDate).substring(0, 10);

      // If time part exists in endTime (e.g. "17:30" or "17:30:00")
      if (item.endTime && /^\d{1,2}:\d{2}/.test(item.endTime)) {
        const [h, m] = item.endTime.split(":").map(Number);
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
          const [y, mon, d] = datePart.split("-").map(Number);
          const bookingEnd = new Date(y, mon - 1, d, h, m, 0);
          if (!isNaN(bookingEnd.getTime())) {
            return bookingEnd.getTime() < Date.now();
          }
        }
      }

      // Check end of the booking calendar day (23:59:59)
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        const [y, mon, d] = datePart.split("-").map(Number);
        const dayEnd = new Date(y, mon - 1, d, 23, 59, 59);
        if (!isNaN(dayEnd.getTime())) {
          return dayEnd.getTime() < Date.now();
        }
      }

      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        return parsed.getTime() < Date.now();
      }
    }

    return false;
  } catch {
    return false;
  }
}

export interface CalendarStripDay {
  date: Date;
  dateString: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isWeekend: boolean;
}

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function getScheduleWeekDates(startDate: Date, count = 14): CalendarStripDay[] {
  const todayStr = toISODateString(new Date());
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateString = toISODateString(d);
    const dow = d.getDay();
    return {
      date: d,
      dateString,
      dayName: DAY_NAMES[dow],
      dayNumber: d.getDate(),
      isToday: dateString === todayStr,
      isWeekend: dow === 5 || dow === 6,
    };
  });
}
