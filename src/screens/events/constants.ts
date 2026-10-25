import { Platform } from "react-native";

export const BENTO_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  cardRadius: 24,
  pillRadius: 9999,
  searchRadius: 14,
  subtleBorder: "rgba(0, 0, 0, 0.04)",
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  heroShadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 6,
  },
} as const;

export const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export type EventTabType = "upcoming" | "today" | "past" | "all";

export interface EventTabCounts {
  all: number;
  today: number;
  upcoming: number;
  past: number;
}

export interface EventCategoryConfig {
  key: string;
  label: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const EVENT_CATEGORIES: EventCategoryConfig[] = [
  {
    key: "WORKSHOP",
    label: "Workshop",
    icon: "tool",
    badgeBg: "#eff6ff",
    badgeText: "#2563eb",
    badgeBorder: "rgba(37, 99, 235, 0.2)",
  },
  {
    key: "TECH",
    label: "Tech & Coding",
    icon: "code",
    badgeBg: "#e0e7ff",
    badgeText: "#4338ca",
    badgeBorder: "rgba(67, 56, 202, 0.2)",
  },
  {
    key: "ACADEMIC",
    label: "Academic",
    icon: "book-open",
    badgeBg: "#ecfdf5",
    badgeText: "#059669",
    badgeBorder: "rgba(5, 150, 105, 0.2)",
  },
  {
    key: "CULTURAL",
    label: "Cultural Fest",
    icon: "music",
    badgeBg: "#fdf2f8",
    badgeText: "#db2777",
    badgeBorder: "rgba(219, 39, 119, 0.2)",
  },
  {
    key: "SEMINAR",
    label: "Seminar",
    icon: "mic",
    badgeBg: "#fef3c7",
    badgeText: "#b45309",
    badgeBorder: "rgba(217, 119, 6, 0.2)",
  },
  {
    key: "SPORTS",
    label: "Sports",
    icon: "activity",
    badgeBg: "#ffedd5",
    badgeText: "#ea580c",
    badgeBorder: "rgba(234, 88, 12, 0.2)",
  },
  {
    key: "CLUB",
    label: "Club & Society",
    icon: "users",
    badgeBg: "#f5f3ff",
    badgeText: "#7c3aed",
    badgeBorder: "rgba(124, 58, 237, 0.2)",
  },
  {
    key: "GENERAL",
    label: "General",
    icon: "calendar",
    badgeBg: "#f1f5f9",
    badgeText: "#475569",
    badgeBorder: "rgba(71, 85, 105, 0.2)",
  },
];

export const getCategoryConfig = (key?: string | null): EventCategoryConfig => {
  const normalized = (key || "GENERAL").toUpperCase().trim();
  const found = EVENT_CATEGORIES.find((c) => c.key === normalized);
  return (
    found || {
      key: normalized,
      label: key || "General",
      icon: "calendar",
      badgeBg: "#f1f5f9",
      badgeText: "#475569",
      badgeBorder: "rgba(71, 85, 105, 0.2)",
    }
  );
};
