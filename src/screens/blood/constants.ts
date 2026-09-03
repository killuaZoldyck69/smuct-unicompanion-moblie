import { Platform } from "react-native";

export const BENTO_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  crimson: "#be123c",
  roseBg: "#fff1f2",
  cardRadius: 24,
  pillRadius: 9999,
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

export const BLOOD_GROUPS = [
  { label: "A+", value: "A_POSITIVE" },
  { label: "A-", value: "A_NEGATIVE" },
  { label: "B+", value: "B_POSITIVE" },
  { label: "B-", value: "B_NEGATIVE" },
  { label: "O+", value: "O_POSITIVE" },
  { label: "O-", value: "O_NEGATIVE" },
  { label: "AB+", value: "AB_POSITIVE" },
  { label: "AB-", value: "AB_NEGATIVE" },
] as const;

export const URGENCY_LEVELS = ["High", "Medium", "Standard"] as const;

export type BloodFilterType = "URGENT" | "ALL" | "FULFILLED";

export interface BloodFeedCounts {
  urgent: number;
  active: number;
  fulfilled: number;
  total: number;
}

export interface NewBloodPostForm {
  patientName: string;
  patientCondition: string;
  bloodGroup: string;
  location: string;
  urgency: string;
  contactPhone: string;
}
