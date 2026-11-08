import React from "react";
import * as ReactNative from "react-native";
import { Platform, StyleSheet } from "react-native";

/**
 * Universal Typography Tokens
 *
 * - Main Title Font: Bricolage Grotesque (High-personality display headings)
 * - Secondary / Body / UI Font: Onest (Clean, accessible, modern neo-grotesque for legibility)
 */
export const FONT_FAMILIES = {
  // Main Title Font: Bricolage Grotesque
  title: Platform.select({
    web: "'Bricolage Grotesque', sans-serif",
    default: "BricolageGrotesque_700Bold",
  }),
  titleRegular: Platform.select({
    web: "'Bricolage Grotesque', sans-serif",
    default: "BricolageGrotesque_400Regular",
  }),
  titleMedium: Platform.select({
    web: "'Bricolage Grotesque', sans-serif",
    default: "BricolageGrotesque_500Medium",
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
  bodyExtraBold: Platform.select({
    web: "'Onest', sans-serif",
    default: "Onest_800ExtraBold",
  }),
} as const;

export const titleFontFamily = FONT_FAMILIES.title;
export const secondaryFontFamily = FONT_FAMILIES.body;
export const fontFamily = FONT_FAMILIES.body;

const isAndroid = Platform.OS === "android";

export const typography = {
  display: {
    fontFamily: FONT_FAMILIES.titleExtraBold,
    fontSize: 40,
    ...(isAndroid ? {} : { fontWeight: "800" as const }),
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  headlineLg: {
    fontFamily: FONT_FAMILIES.titleBold,
    fontSize: 32,
    ...(isAndroid ? {} : { fontWeight: "700" as const }),
    lineHeight: 40,
    letterSpacing: -0.32,
  },
  headlineLgMobile: {
    fontFamily: FONT_FAMILIES.titleBold,
    fontSize: 28,
    ...(isAndroid ? {} : { fontWeight: "700" as const }),
    lineHeight: 36,
  },
  headlineMd: {
    fontFamily: FONT_FAMILIES.titleSemiBold,
    fontSize: 24,
    ...(isAndroid ? {} : { fontWeight: "600" as const }),
    lineHeight: 32,
  },
  titleLg: {
    fontFamily: FONT_FAMILIES.titleBold,
    fontSize: 20,
    ...(isAndroid ? {} : { fontWeight: "700" as const }),
    lineHeight: 28,
  },
  titleMd: {
    fontFamily: FONT_FAMILIES.titleSemiBold,
    fontSize: 18,
    ...(isAndroid ? {} : { fontWeight: "600" as const }),
    lineHeight: 26,
  },
  bodyLg: {
    fontFamily: FONT_FAMILIES.bodyRegular,
    fontSize: 18,
    ...(isAndroid ? {} : { fontWeight: "400" as const }),
    lineHeight: 28,
  },
  bodyMd: {
    fontFamily: FONT_FAMILIES.bodyRegular,
    fontSize: 16,
    ...(isAndroid ? {} : { fontWeight: "400" as const }),
    lineHeight: 24,
  },
  labelMd: {
    fontFamily: FONT_FAMILIES.bodyMedium,
    fontSize: 14,
    ...(isAndroid ? {} : { fontWeight: "500" as const }),
    lineHeight: 20,
    letterSpacing: 0.14,
  },
  labelSm: {
    fontFamily: FONT_FAMILIES.bodyMedium,
    fontSize: 12,
    ...(isAndroid ? {} : { fontWeight: "500" as const }),
    lineHeight: 16,
    letterSpacing: 0.48,
  },
};

// ============================================================================
// ANDROID & UNIVERSAL FONT RESOLVER & STYLESHEET NORMALIZER
// ============================================================================
// On Android, expo-font registers all custom font files under Typeface.NORMAL (0).
// When a style specifies both `fontFamily` and a heavy `fontWeight` ('700', '800', 'bold'),
// React Native Android queries `ReactFontManager.getTypeface(family, Typeface.BOLD)`.
// Because expo-font only registered the typeface under Typeface.NORMAL, the lookup
// fails and Android silently falls back to the default system font (Roboto).
//
// This normalizer automatically:
// 1. Inspects all styles created via StyleSheet.create and StyleSheet.flatten.
// 2. Selects the exact pre-weighted custom font variant (Regular, Medium, SemiBold, Bold, ExtraBold).
// 3. Deletes `fontWeight` on Android so native lookup targets Typeface.NORMAL and succeeds.
// 4. Injects the theme typography for text styles that omitted fontFamily.
function normalizeStyleRule(ruleKey: string, rule: any): any {
  if (!rule || typeof rule !== "object" || Array.isArray(rule)) {
    return rule;
  }

  const hasTextProps =
    "fontSize" in rule ||
    "fontWeight" in rule ||
    "fontFamily" in rule ||
    "lineHeight" in rule ||
    "letterSpacing" in rule ||
    "textAlign" in rule;

  if (!hasTextProps) {
    return rule;
  }

  const existingFont =
    typeof rule.fontFamily === "string" ? rule.fontFamily : "";

  // Never alter icon fonts or third-party native font sets
  if (
    existingFont &&
    (existingFont.includes("feather") ||
      existingFont.includes("material") ||
      existingFont.includes("ionic") ||
      existingFont.includes("font-awesome") ||
      existingFont.includes("octicon") ||
      existingFont.includes("anticon"))
  ) {
    return rule;
  }

  const weightStr =
    rule.fontWeight != null ? String(rule.fontWeight).toLowerCase() : "";
  const keyLower = ruleKey.toLowerCase();

  const isTitleExplicit =
    existingFont.includes("Bricolage") ||
    existingFont === FONT_FAMILIES.title ||
    existingFont === FONT_FAMILIES.titleBold ||
    existingFont === FONT_FAMILIES.titleExtraBold ||
    existingFont === FONT_FAMILIES.titleSemiBold ||
    existingFont === FONT_FAMILIES.titleMedium ||
    existingFont === FONT_FAMILIES.titleRegular;

  const isBodyExplicit =
    existingFont.includes("Onest") ||
    existingFont === FONT_FAMILIES.body ||
    existingFont === FONT_FAMILIES.bodyBold ||
    existingFont === FONT_FAMILIES.bodyMedium ||
    existingFont === FONT_FAMILIES.bodySemiBold ||
    existingFont === FONT_FAMILIES.bodyRegular ||
    existingFont === FONT_FAMILIES.bodyExtraBold;

  const isTitleByKey =
    !isBodyExplicit &&
    (keyLower.includes("title") ||
      keyLower.includes("heading") ||
      keyLower.includes("headline") ||
      keyLower.includes("display") ||
      keyLower.includes("hero") ||
      keyLower.includes("statvalue") ||
      (typeof rule.fontSize === "number" &&
        rule.fontSize >= 22 &&
        (weightStr === "700" ||
          weightStr === "800" ||
          weightStr === "900" ||
          weightStr === "bold")));

  const isTitle =
    isTitleExplicit || (!isBodyExplicit && !existingFont && isTitleByKey);

  if (Platform.OS === "android") {
    const updated = { ...rule };
    // Strip fontWeight on Android to eliminate Typeface.BOLD lookup failure
    delete updated.fontWeight;

    if (isTitle) {
      if (
        weightStr === "800" ||
        weightStr === "900" ||
        weightStr === "extrabold" ||
        existingFont.includes("800") ||
        existingFont.includes("ExtraBold")
      ) {
        updated.fontFamily = "BricolageGrotesque_800ExtraBold";
      } else if (
        weightStr === "600" ||
        weightStr === "semibold" ||
        existingFont.includes("600") ||
        existingFont.includes("SemiBold")
      ) {
        updated.fontFamily = "BricolageGrotesque_600SemiBold";
      } else if (
        weightStr === "500" ||
        weightStr === "medium" ||
        existingFont.includes("500") ||
        existingFont.includes("Medium")
      ) {
        updated.fontFamily = "BricolageGrotesque_500Medium";
      } else if (
        weightStr === "400" ||
        weightStr === "normal" ||
        existingFont.includes("400") ||
        existingFont.includes("Regular")
      ) {
        updated.fontFamily = "BricolageGrotesque_400Regular";
      } else {
        updated.fontFamily = "BricolageGrotesque_700Bold";
      }
    } else {
      // Body / UI Font: Onest
      if (
        weightStr === "800" ||
        weightStr === "900" ||
        weightStr === "extrabold" ||
        existingFont.includes("800") ||
        existingFont.includes("ExtraBold")
      ) {
        updated.fontFamily = "Onest_800ExtraBold";
      } else if (
        weightStr === "700" ||
        weightStr === "bold" ||
        existingFont.includes("700") ||
        existingFont.includes("Bold")
      ) {
        updated.fontFamily = "Onest_700Bold";
      } else if (
        weightStr === "600" ||
        weightStr === "semibold" ||
        existingFont.includes("600") ||
        existingFont.includes("SemiBold")
      ) {
        updated.fontFamily = "Onest_600SemiBold";
      } else if (
        weightStr === "500" ||
        weightStr === "medium" ||
        existingFont.includes("500") ||
        existingFont.includes("Medium")
      ) {
        updated.fontFamily = "Onest_500Medium";
      } else {
        updated.fontFamily = "Onest_400Regular";
      }
    }

    return updated;
  }

  // Web fallback: preserve CSS font-weight, set web-safe font-family
  if (Platform.OS === "web") {
    const updated = { ...rule };
    if (isTitle) {
      updated.fontFamily = "'Bricolage Grotesque', sans-serif";
    } else if (isBodyExplicit || (!existingFont && hasTextProps)) {
      updated.fontFamily = "'Onest', sans-serif";
    }
    return updated;
  }

  return rule;
}

// Hook into StyleSheet.create to normalize all defined styles globally
const originalStyleSheetCreate = StyleSheet.create;
(StyleSheet as any).create = function <
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>,
>(styles: T): T {
  if (!styles || typeof styles !== "object") {
    return originalStyleSheetCreate(styles);
  }

  const normalized: any = {};
  for (const key of Object.keys(styles)) {
    normalized[key] = normalizeStyleRule(key, (styles as any)[key]);
  }

  return originalStyleSheetCreate(normalized);
};

// Hook into StyleSheet.flatten to normalize runtime/dynamic style arrays
const originalStyleSheetFlatten = StyleSheet.flatten;
(StyleSheet as any).flatten = function (style: any) {
  const flattened = originalStyleSheetFlatten(style);
  if (flattened && typeof flattened === "object") {
    return normalizeStyleRule("flattened", flattened);
  }
  return flattened;
};

// ============================================================================
// SYSTEM FONT SCALING LOCK (FOR ANDROID & ALL DEVICES)
// ============================================================================
// In React 19, functional components do not read defaultProps.
// By wrapping React Native's Text & TextInput on the common module export,
// every element in the application receives `allowFontScaling={false}` and
// `maxFontSizeMultiplier={1}` at render time, locking font sizes against OS settings.
function applyFontLock(targetRN: any) {
  if (!targetRN) return;

  try {
    const OriginalText = targetRN.Text;
    if (OriginalText && !(OriginalText as any).__smuctLocked) {
      const LockedText = React.forwardRef<any, any>(
        function LockedText(props, ref) {
          return React.createElement(OriginalText, {
            ...props,
            allowFontScaling: false,
            maxFontSizeMultiplier: 1,
            ref,
          });
        },
      );
      Object.setPrototypeOf(LockedText, OriginalText);
      Object.assign(LockedText, OriginalText);
      (LockedText as any).__smuctLocked = true;
      (LockedText as any).displayName = "Text";

      Object.defineProperty(targetRN, "Text", {
        get: () => LockedText,
        set: () => {},
        configurable: true,
        enumerable: true,
      });
    }
  } catch {}

  try {
    const OriginalTextInput = targetRN.TextInput;
    if (OriginalTextInput && !(OriginalTextInput as any).__smuctLocked) {
      const LockedTextInput = React.forwardRef<any, any>(
        function LockedTextInput(props, ref) {
          return React.createElement(OriginalTextInput, {
            ...props,
            allowFontScaling: false,
            maxFontSizeMultiplier: 1,
            ref,
          });
        },
      );
      Object.setPrototypeOf(LockedTextInput, OriginalTextInput);
      Object.assign(LockedTextInput, OriginalTextInput);
      (LockedTextInput as any).__smuctLocked = true;
      (LockedTextInput as any).displayName = "TextInput";

      Object.defineProperty(targetRN, "TextInput", {
        get: () => LockedTextInput,
        set: () => {},
        configurable: true,
        enumerable: true,
      });
    }
  } catch {}

  try {
    if (
      targetRN.PixelRatio &&
      typeof targetRN.PixelRatio.getFontScale === "function"
    ) {
      targetRN.PixelRatio.getFontScale = () => 1;
    }
  } catch {}

  try {
    if (targetRN.Dimensions && typeof targetRN.Dimensions.get === "function") {
      const origGet = targetRN.Dimensions.get.bind(targetRN.Dimensions);
      targetRN.Dimensions.get = function (dim: "window" | "screen") {
        const metrics = origGet(dim);
        return metrics && typeof metrics === "object"
          ? { ...metrics, fontScale: 1 }
          : metrics;
      };
    }
  } catch {}
}

try {
  applyFontLock(require("react-native"));
} catch {}
applyFontLock(ReactNative);
