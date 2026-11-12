import { colors } from "@/theme/colors";

export const REGISTER_STRINGS = {
  TITLE: "Create your account",
  SUBTITLE: "Join your university campus community.",
  NAME_PLACEHOLDER: "Full Name",
  EMAIL_PLACEHOLDER: "University Email",
  PASSWORD_PLACEHOLDER: "Password",
  CONFIRM_PASSWORD_PLACEHOLDER: "Confirm Password",
  BUTTON_TEXT: "Create Account",
  ALREADY_ACCOUNT: "Already have an account? ",
  SIGN_IN: "Login",
  PRIVACY_POLICY: "Privacy Policy",
};

export const REGISTER_COLORS = {
  background: colors.auth.background,
  titleText: colors.auth.navyDark,
  subtitleText: colors.auth.textSecondary,

  // Card & inputs
  cardBackground: colors.white,
  cardBorder: colors.auth.cardBorder,
  inputBorder: colors.auth.inputBorder,
  inputBorderFocused: colors.auth.navyDark,
  inputPlaceholder: colors.auth.inputPlaceholder,
  inputText: colors.auth.navyDark,
  iconMuted: colors.slate500,
  iconFocused: colors.auth.navyDark,

  // Primary action button (unified Deep Navy across all Auth CTA buttons)
  primaryButton: colors.auth.navyDark,
  primaryButtonHover: colors.auth.navyMedium,
  primaryButtonText: colors.white,
  accentBlue: colors.auth.accentBlue,

  // Floating Hero Badges & Dots
  badgeHatBg: colors.auth.badgeHatAmberBg,
  badgeHatBorder: colors.auth.badgeHatAmberBorder,
  badgeHatIcon: colors.auth.tealPrimary,

  badgeBookBg: colors.auth.cornerGreen,
  badgeBookBorder: colors.auth.badgeBookBorder,
  badgeBookIcon: colors.auth.badgeBookIcon,

  dotMint: colors.auth.dotMint,
  dotGreen: colors.auth.dotGreenAlt,
  dotSun: colors.auth.dotSun,
  dotPurple: colors.auth.dotPurple,

  // Corner decorations & sprout motif
  cornerPurple: colors.auth.cornerPurple,
  cornerYellow: colors.auth.cornerYellow,
  cornerBlue: colors.auth.cornerBlue,
  sproutLeaf: colors.auth.sproutLeaf,
  sproutStem: colors.auth.sproutStem,

  // Bottom stage dots
  dotActive: colors.auth.tealPrimary,
  dotInactive: colors.auth.dotInactive,
};
