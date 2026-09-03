import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import { CampusEventItem } from "@/services/event-service";
import { EventTabCounts, EventTabType } from "./constants";

export const getEventTimestamp = (item: CampusEventItem): number => {
  const dateStr = item.eventDate || item.date || item.createdAt;
  const time = new Date(dateStr).getTime();
  return isNaN(time) ? Date.now() : time;
};

export const formatEventDate = (
  dateStr: string | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!dateStr) return "TBA";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "TBA";
  return d.toLocaleDateString(
    "en-US",
    options || {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
};

export const formatEventTime = (dateStr: string | undefined): string => {
  if (!dateStr) return "TBA";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "TBA";
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const safeShareEvent = async (event: CampusEventItem): Promise<void> => {
  try {
    const formattedDate = formatEventDate(
      event.eventDate || event.date || event.createdAt,
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );
    const formattedTime = formatEventTime(
      event.eventDate || event.date || event.createdAt
    );

    const message = `🎉 ${event.title}\n\n📅 Date: ${formattedDate}\n🕒 Time: ${formattedTime}\n📍 Venue: ${
      event.location || "Permanent Campus"
    }\n\n${event.description || ""}\n\nShared via SMUCT UniCompanion`;

    await Share.share({ message });
  } catch {
    Toast.show({
      type: "error",
      text1: "Sharing Failed",
      text2: "Unable to open system share dialog.",
    });
  }
};

export const safeCopyEvent = async (event: CampusEventItem): Promise<void> => {
  try {
    const formattedDate = formatEventDate(
      event.eventDate || event.date || event.createdAt
    );
    const formattedTime = formatEventTime(
      event.eventDate || event.date || event.createdAt
    );

    await Clipboard.setStringAsync(
      `${event.title} - ${formattedDate} at ${formattedTime}, ${
        event.location || "Campus"
      }\n\n${event.description || ""}`
    );
    Toast.show({
      type: "success",
      text1: "Event Details Copied",
      text2: "Information copied to clipboard.",
    });
  } catch {
    Toast.show({
      type: "error",
      text1: "Copy Failed",
      text2: "Unable to copy information to clipboard.",
    });
  }
};

export const filterAndSortEvents = (
  events: CampusEventItem[] | null | undefined,
  activeTab: EventTabType,
  searchQuery: string
): {
  filteredEvents: CampusEventItem[];
  counts: EventTabCounts;
  nextUpcomingEvent: CampusEventItem | null;
} => {
  const list: CampusEventItem[] = Array.isArray(events) ? events : [];

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  ).getTime();

  const sortedList = [...list].sort((a, b) => {
    return getEventTimestamp(a) - getEventTimestamp(b);
  });

  let todayCount = 0;
  let upcomingCount = 0;
  let pastCount = 0;

  sortedList.forEach((e) => {
    const time = getEventTimestamp(e);
    if (time >= todayStart && time <= todayEnd) {
      todayCount++;
    } else if (time > todayEnd) {
      upcomingCount++;
    } else {
      pastCount++;
    }
  });

  const upcomingList = sortedList.filter(
    (e) => getEventTimestamp(e) >= todayStart
  );
  const nextEvent = upcomingList[0] || null;

  const tabFiltered = sortedList.filter((e) => {
    const time = getEventTimestamp(e);
    if (activeTab === "today") {
      return time >= todayStart && time <= todayEnd;
    } else if (activeTab === "upcoming") {
      return time > todayEnd;
    } else if (activeTab === "past") {
      return time < todayStart;
    }
    return true;
  });

  if (activeTab === "past") {
    tabFiltered.reverse();
  }

  const query = searchQuery.toLowerCase().trim();
  const searchFiltered = tabFiltered.filter((e) => {
    if (!query) return true;
    const matchTitle = (e.title || "").toLowerCase().includes(query);
    const matchDesc = (e.description || "").toLowerCase().includes(query);
    const matchLoc = (e.location || "").toLowerCase().includes(query);
    return matchTitle || matchDesc || matchLoc;
  });

  return {
    filteredEvents: searchFiltered,
    counts: {
      all: list.length,
      today: todayCount,
      upcoming: upcomingCount,
      past: pastCount,
    },
    nextUpcomingEvent: nextEvent,
  };
};
