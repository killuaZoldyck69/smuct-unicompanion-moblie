import { colors } from "@/theme/colors";

export const VERIFY_EMAIL_COLORS = {
  navyDark: colors.auth.navyDark,
  navyMedium: colors.auth.navyMedium,
  navyLight: colors.auth.navyLight,
  brandBlue: colors.auth.brandBlue,
  brandBlueLight: colors.auth.brandBlueLight,
  textMuted: colors.auth.textMuted,
  textSecondary: colors.auth.textSecondary,
  borderLight: colors.auth.borderLight,
  borderFocused: colors.auth.navyDark,
  cardBg: colors.white,
  inputBg: colors.auth.inputBgSubtle,
  screenBg: colors.auth.screenBgSoft,
  sproutGreen: colors.auth.sproutGreen,
  accentYellow: colors.auth.accentYellow,
  accentPurple: colors.auth.accentPurple,
};

export const VERIFY_EMAIL_STRINGS = {
  title: "Verify Your Email",
  subtitlePrefix: "We have sent a 6-digit verification code to",
  subtitleInstruction: "Please enter the code below to verify your account.",
  ctaButtonText: "Verify & Proceed",
  resendPrefix: "Didn't receive the code? ",
  resendAction: "Resend",
  orSeparator: "or",
  changeEmail: "change email",
  backToLogin: "back to login",
};

export const OTP_LENGTH = 6;
export const RESEND_COOLDOWN_SECONDS = 120; // 2 minutes
