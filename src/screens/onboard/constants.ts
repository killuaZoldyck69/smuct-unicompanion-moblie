import type { BloodGroupOption } from "./types";

export const BLOOD_GROUPS: BloodGroupOption[] = [
  { label: "A+", value: "A_POSITIVE" },
  { label: "A-", value: "A_NEGATIVE" },
  { label: "B+", value: "B_POSITIVE" },
  { label: "B-", value: "B_NEGATIVE" },
  { label: "AB+", value: "AB_POSITIVE" },
  { label: "AB-", value: "AB_NEGATIVE" },
  { label: "O+", value: "O_POSITIVE" },
  { label: "O-", value: "O_NEGATIVE" },
];

export const ONBOARD_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1e",
  mutedText: "#45464d",
  placeholderText: "#76777d",
  borderLight: "#e0e3e5",
  blueBox: "#d0e4ff",
  mintBox: "#c3f0d2",
  roseBox: "#ffdad6",
  yellowAvatar: "#f2e580",
};

export const MIN_SEMESTER = 1;
export const MAX_SEMESTER = 12;
export const MAX_SECTION_LENGTH = 4;
