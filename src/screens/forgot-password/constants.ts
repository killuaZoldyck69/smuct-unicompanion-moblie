import { colors } from "@/theme/colors";

export const FORGOT_PASSWORD_STRINGS = {
  TITLE: "Reset Password",
  SUBTITLE:
    "Enter the email associated with your account and we'll send you a 6-digit verification code to reset your password.",
  EMAIL_LABEL: "Email Address",
  EMAIL_PLACEHOLDER: "student@smuct.edu.bd",
  BUTTON_TEXT: "Send Reset Code",
  REMEMBER_PASSWORD: "Remember your password? ",
  SIGN_IN: "Login",
};

export const FORGOT_PASSWORD_COLORS = {
  background: colors.auth.forgotBackground,
  titleText: colors.auth.titleText,
  subtitleText: colors.auth.subtitleText,

  // Card & inputs
  cardBackground: colors.white,
  cardBorder: colors.auth.cardBorder,
  cardShadow: colors.auth.titleText,
  inputBackground: colors.white,
  inputBorder: colors.auth.inputBorder,
  inputBorderFocused: colors.auth.primaryNavy,
  inputPlaceholder: colors.auth.placeholderSlate,
  inputText: colors.auth.titleText,
  iconMuted: colors.slate500,
  iconFocused: colors.auth.primaryNavy,

  // Primary Action Button (Pill button)
  primaryButton: colors.auth.primaryNavy,
  primaryButtonText: colors.white,
  accentBlue: colors.auth.brandBlue,

  // Animated Hero Passkey Badge & Dots
  badgeKeyBg: colors.white,
  badgeKeyBorder: colors.auth.badgeKeyBorder,
  badgeKeyIcon: colors.auth.titleText,
  badgeGlow: colors.auth.badgeGlow,
  dotMint: colors.auth.dotGreen,
  dotPurple: colors.auth.dotPurple,

  // Corner background decorations
  cornerBlue: colors.auth.cornerBlue,
  cornerPurple: colors.auth.cornerPurple,
  cornerGreen: colors.auth.cornerGreen,
  sproutLeaf: colors.auth.sproutLeaf,
  sproutStem: colors.auth.sproutStem,
};
