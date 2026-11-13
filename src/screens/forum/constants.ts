import { colors } from "@/theme/colors";
import { rounded, shadows } from "@/theme/layout";
import { FORUM_LIMITS } from "@/features/forum/forum-logic";
import { fontFamily, titleFontFamily } from "@/theme/typography";

export const BENTO_COLORS = {
  background: colors.homeBackground,
  deepNavy: colors.navyDeep,
  white: colors.white,
  neutralText: colors.onBackground,
  subtleText: colors.slate500,
  subtleBorder: colors.borderCard,
  primaryBlue: colors.semantic.blue.deep,
  emerald: colors.semantic.emerald.darker,
  emeraldBg: colors.semantic.emerald.border,
  emeraldBorder: colors.semantic.emerald.solid,
  sky: colors.semantic.sky.deep,
  skyBg: colors.semantic.sky.soft,
  skyPulse: "#60a5fa",
  danger: colors.semantic.rose.deep,
  dangerBg: colors.semantic.rose.softBorder,
  slateBg: colors.slate100,
  cardRadius: 22,
  pillRadius: rounded.full,
  shadow: {
    ...shadows.level1,
    shadowColor: colors.black,
    shadowRadius: 16,
  },
  heroShadow: {
    shadowColor: colors.navyDeep,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
};

export { fontFamily, titleFontFamily };

export const MAX_TITLE_LENGTH = FORUM_LIMITS.MAX_TITLE_LENGTH;
export const MAX_DESCRIPTION_LENGTH = FORUM_LIMITS.MAX_DESCRIPTION_LENGTH;
export const MAX_DESCRIPTION_HTML_LENGTH =
  FORUM_LIMITS.MAX_DESCRIPTION_HTML_LENGTH;
export const MAX_RESPONSE_LENGTH = FORUM_LIMITS.MAX_RESPONSE_LENGTH;
