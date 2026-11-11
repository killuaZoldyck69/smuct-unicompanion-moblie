export const DEFAULT_API_BASE_URL =
  "https://smuct-unicompanion-api-8qoc.onrender.com";

let hasLoggedMissingEnv = false;

/**
 * Safely resolves the backend API base URL without crashing at module import
 * if EXPO_PUBLIC_API_BASE_URL is missing in a build environment.
 */
export function resolveApiBaseUrl(
  rawUrl: string | undefined = process.env.EXPO_PUBLIC_API_BASE_URL,
): string {
  const trimmed = rawUrl?.trim();
  if (trimmed) {
    return trimmed.replace(/\/+$/, "");
  }

  if (!hasLoggedMissingEnv) {
    hasLoggedMissingEnv = true;
    console.warn(
      "[api-config] EXPO_PUBLIC_API_BASE_URL is not set; falling back to default API URL.",
    );
  }
  return DEFAULT_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();
export const IS_API_BASE_URL_CONFIGURED = Boolean(
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim(),
);
