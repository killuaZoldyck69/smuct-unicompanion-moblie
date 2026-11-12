import { colors } from "@/theme/colors";

export const RESET_PASSWORD_COLORS = {
  navyDark: colors.auth.navyDark,
  navyMedium: colors.auth.navyMedium,
  navyLight: colors.auth.navyLight,
  brandBlue: colors.auth.brandBlue,
  brandBlueLight: colors.auth.brandBlueLight,
  textMuted: colors.auth.textMuted,
  textSecondary: colors.auth.textSecondary,
  borderLight: colors.auth.borderResetLight,
  borderFocused: colors.auth.navyDark,
  cardBg: colors.white,
  inputBg: colors.auth.inputBgSubtle,
  screenBg: colors.auth.screenBgSoft,
};

export const RESET_PASSWORD_STRINGS = {
  title: "Create New Password",
  subtitlePrefix: "Enter the 6-digit code sent to",
  subtitleSuffix: "and your new password.",
  codeLabel: "6-Digit Verification Code",
  resendPrefix: "Didn't receive the code? ",
  resendAction: "Resend",
  newPasswordLabel: "New Password",
  newPasswordPlaceholder: "At least 8 characters",
  confirmPasswordLabel: "Confirm Password",
  confirmPasswordPlaceholder: "Re-enter new password",
  ctaButtonText: "Set New Password",
  backToSignIn: "Back to Log In",
};

export const OTP_LENGTH = 6;
export const RESEND_COOLDOWN_SECONDS = 120; // 2 minutes cooldown matching policy
