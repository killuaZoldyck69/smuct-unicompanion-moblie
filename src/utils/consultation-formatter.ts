export interface ConsultationSlotLike {
  day?: string;
  startTime?: string;
  endTime?: string;
  id?: string;
}

/**
 * Formats structured consultation slots into a clean, human-readable string.
 * Example: "Sunday: 10:00 AM - 12:00 PM, Tuesday: 02:00 PM - 04:00 PM"
 */
export function formatConsultationSlots(
  slots?: ConsultationSlotLike[] | null,
  fallback = "Not specified"
): string {
  if (!Array.isArray(slots) || slots.length === 0) {
    return fallback;
  }

  const formatted = slots
    .filter((slot) => slot && slot.day)
    .map((slot) => {
      const day = slot.day?.trim() || "";
      const start = slot.startTime?.trim() || "";
      const end = slot.endTime?.trim() || "";

      if (start && end) {
        return `${day}: ${start} - ${end}`;
      } else if (start) {
        return `${day}: ${start}`;
      } else {
        return day;
      }
    })
    .filter(Boolean)
    .join(", ");

  return formatted || fallback;
}
