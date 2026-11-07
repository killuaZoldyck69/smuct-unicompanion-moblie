import { Platform } from "react-native";

/**
 * Universal Typography Tokens
 * 
 * - Main Title Font: Bricolage Grotesque (Bold, High-personality display headings)
 * - Secondary / Body / UI Font: Onest (Clean, accessible, modern neo-grotesque for legibility)
 */
export const FONT_FAMILIES = {
  // Main Title Font: Bricolage Grotesque
  title: Platform.select({
    web: "'Bricolage Grotesque', sans-serif",
    default: "BricolageGrotesque_700Bold",
  }),
  titleSemiBold: Platform.select({
    web: "'Bricolage Grotesque', sans-serif",
    default: "BricolageGrotesque_600SemiBold",
  }),
  titleBold: Platform.select({
    web: "'Bricolage Grotesque', sans-serif",
    default: "BricolageGrotesque_700Bold",
  }),
  titleExtraBold: Platform.select({
    web: "'Bricolage Grotesque', sans-serif",
    default: "BricolageGrotesque_800ExtraBold",
  }),

  // Secondary / Body / UI Font: Onest
  body: Platform.select({
    web: "'Onest', sans-serif",
    default: "Onest_400Regular",
  }),
  bodyRegular: Platform.select({
    web: "'Onest', sans-serif",
    default: "Onest_400Regular",
  }),
  bodyMedium: Platform.select({
    web: "'Onest', sans-serif",
    default: "Onest_500Medium",
  }),
  bodySemiBold: Platform.select({
    web: "'Onest', sans-serif",
    default: "Onest_600SemiBold",
  }),
  bodyBold: Platform.select({
    web: "'Onest', sans-serif",
    default: "Onest_700Bold",
  }),
} as const;

export const titleFontFamily = FONT_FAMILIES.title;
export const secondaryFontFamily = FONT_FAMILIES.body;
export const fontFamily = FONT_FAMILIES.body;

export const typography = {
  display: {
    fontFamily: FONT_FAMILIES.titleExtraBold,
    fontSize: 40,
    fontWeight: "800" as const,
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  headlineLg: {
    fontFamily: FONT_FAMILIES.titleBold,
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 40,
    letterSpacing: -0.32,
  },
  headlineLgMobile: {
    fontFamily: FONT_FAMILIES.titleBold,
    fontSize: 28,
    fontWeight: "700" as const,
    lineHeight: 36,
  },
  headlineMd: {
    fontFamily: FONT_FAMILIES.titleSemiBold,
    fontSize: 24,
    fontWeight: "600" as const,
    lineHeight: 32,
  },
  titleLg: {
    fontFamily: FONT_FAMILIES.titleBold,
    fontSize: 20,
    fontWeight: "700" as const,
    lineHeight: 28,
  },
  titleMd: {
    fontFamily: FONT_FAMILIES.titleSemiBold,
    fontSize: 18,
    fontWeight: "600" as const,
    lineHeight: 26,
  },
  bodyLg: {
    fontFamily: FONT_FAMILIES.bodyRegular,
    fontSize: 18,
    fontWeight: "400" as const,
    lineHeight: 28,
  },
  bodyMd: {
    fontFamily: FONT_FAMILIES.bodyRegular,
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
  },
  labelMd: {
    fontFamily: FONT_FAMILIES.bodyMedium,
    fontSize: 14,
    fontWeight: "500" as const,
    lineHeight: 20,
    letterSpacing: 0.14,
  },
  labelSm: {
    fontFamily: FONT_FAMILIES.bodyMedium,
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 16,
    letterSpacing: 0.48,
  },
};
