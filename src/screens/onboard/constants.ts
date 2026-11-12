import { colors } from "@/theme/colors";
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
  background: colors.auth.onboardBackground,
  deepNavy: colors.auth.navyDark,
  white: colors.white,
  neutralText: colors.auth.neutralText,
  mutedText: colors.auth.mutedText,
  placeholderText: colors.auth.inputPlaceholder,
  borderLight: colors.auth.onboardBorderLight,
  blueBox: colors.auth.blueBox,
  mintBox: colors.auth.mintBox,
  roseBox: colors.auth.roseBox,
  yellowAvatar: colors.auth.yellowAvatar,
  cornerPurple: colors.auth.cornerPurple,
  warningBg: colors.auth.warningBg,
  warningText: colors.auth.warningText,
  warningBorder: colors.auth.warningBorder,
  errorBorder: colors.semantic.red.solid,
  errorBg: colors.semantic.red.tint,
};

export { MIN_SEMESTER, MAX_SEMESTER, MAX_SECTION_LENGTH } from "./utils";
