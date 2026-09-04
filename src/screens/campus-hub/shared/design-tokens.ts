import { Platform } from "react-native";

export const CAMPUS_HUB_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  subtleBorder: "rgba(0, 0, 0, 0.05)",

  lostFoundAccent: "#f59e0b",
  lostFoundAccentLight: "#fef3c7",
  lostFoundAccentText: "#b45309",

  marketplaceAccent: "#10b981",
  marketplaceAccentLight: "#d1fae5",
  marketplaceAccentText: "#047857",

  forumAccent: "#1e3a8a",
  forumAccentLight: "#dbeafe",
  forumAccentText: "#1e40af",

  complaintAccent: "#8b5cf6",
  complaintAccentLight: "#ede9fe",
  complaintAccentText: "#6d28d9",

  dangerText: "#be123c",
  dangerBg: "#ffe4e6",

  cardRadius: 22,
  pillRadius: 9999,

  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  heroShadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;

export const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export function timeAgo(dateString: string): string {
  if (!dateString) return "";
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );
  if (seconds < 60) return "Just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
