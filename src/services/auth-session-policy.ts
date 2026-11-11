const PUBLIC_AUTH_PATH_PREFIXES = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/email-otp",
  "/auth/forget-password",
  "/auth/reset-password",
];

/**
 * Determines whether an HTTP error represents an expired, invalidated, or
 * restricted authenticated session that requires clearing local auth state.
 */
export function shouldHandleSessionInvalidation(
  status: number | undefined,
  url: string | undefined,
  responseData: unknown,
): boolean {
  if (!status) return false;
  const normalizedUrl = (url || "").toLowerCase();
  if (
    PUBLIC_AUTH_PATH_PREFIXES.some((prefix) => normalizedUrl.includes(prefix))
  ) {
    return false;
  }

  if (status === 401) return true;

  if (status === 403 && responseData && typeof responseData === "object") {
    const rawMsg =
      (responseData as Record<string, unknown>).error ||
      (responseData as Record<string, unknown>).message ||
      "";
    return typeof rawMsg === "string" && /restricted/i.test(rawMsg);
  }

  return false;
}
