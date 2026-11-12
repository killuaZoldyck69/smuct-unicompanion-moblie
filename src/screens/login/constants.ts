import { colors } from "@/theme/colors";

export const LOGIN_STRINGS = {
  TITLE: "Welcome back",
  SUBTITLE: "Login to continue to your campus.",
  EMAIL_PLACEHOLDER: "Email Address",
  PASSWORD_PLACEHOLDER: "Password",
  FORGOT_PASSWORD: "Forgot password?",
  SIGN_IN_BUTTON: "Log In",
  NO_ACCOUNT: "Don't have an account? ",
  REGISTER: "Register",
  PRIVACY_POLICY: "Privacy Policy",
};

export const LOGIN_COLORS = {
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

  // Buttons & links
  primaryButton: colors.auth.navyDark,
  primaryButtonText: colors.white,
  accentBlue: colors.auth.accentBlue,

  // Floating Hero Badges & Dots
  badgeBookBg: colors.auth.badgeBookBg,
  badgeBookBorder: colors.auth.badgeBookBorder,
  badgeBookIcon: colors.auth.badgeBookIcon,

  badgeHatBg: colors.auth.badgeHatBg,
  badgeHatBorder: colors.auth.badgeHatBorder,
  badgeHatIcon: colors.auth.badgeHatIcon,

  dotGreen: colors.auth.dotGreen,
  dotPurple: colors.auth.dotPurple,
  dotSun: colors.auth.dotSun,

  // Corner decorations & sprout motif
  cornerBlue: colors.auth.cornerBlue,
  cornerGreen: colors.auth.cornerGreen,
  cornerPurple: colors.auth.cornerPurple,
  sproutLeaf: colors.auth.sproutLeaf,
  sproutStem: colors.auth.sproutStem,
};
