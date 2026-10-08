// src/screens/notices/theme/notice-visual-theme-resolver.ts
import { CATEGORY_THEMES, DEFAULT_CATEGORY_THEME } from "../constants";
import { NoticeCategoryKey, NoticeCategoryTheme } from "../types";

export function resolveNoticeVisualTheme(
  categoryKey?: string | null
): NoticeCategoryTheme {
  if (!categoryKey) return DEFAULT_CATEGORY_THEME;

  const normalized = categoryKey.trim().toUpperCase() as Exclude<
    NoticeCategoryKey,
    "ALL"
  >;

  if (CATEGORY_THEMES[normalized]) {
    return CATEGORY_THEMES[normalized];
  }

  // Graceful fallback for dynamic backend-added categories
  return {
    ...DEFAULT_CATEGORY_THEME,
    label: categoryKey.trim(),
  };
}
