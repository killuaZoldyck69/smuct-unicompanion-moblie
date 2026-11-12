interface ApiErrorShape {
  message?: string;
  code?: string;
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
}

/**
 * Returns true when an Axios/HTTP error represents an HTTP 404 Not Found response.
 */
export function isNotFoundError(error: unknown): boolean {
  return (error as ApiErrorShape | null)?.response?.status === 404;
}

/**
 * Returns true when an HTTP error represents an authorization/restriction block (403).
 */
export function isForbiddenError(error: unknown): boolean {
  return (error as ApiErrorShape | null)?.response?.status === 403;
}

/**
 * Returns true when an error was caused by a dropped or missing network connection.
 */
export function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as ApiErrorShape;
  if (err.response) return false;
  if (err.code === "ERR_NETWORK" || err.code === "ECONNABORTED") return true;
  return typeof err.message === "string" && /network error|failed to fetch|timeout/i.test(err.message);
}

/**
 * Extracts a safe, user-facing error message from an API or runtime error.
 */
export function extractApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
  isOffline = false
): string {
  if (isOffline || isNetworkError(error)) {
    return "You appear to be offline. Check your internet connection and try again.";
  }

  if (error && typeof error === "object") {
    const err = error as ApiErrorShape;
    const serverMessage = err.response?.data?.message || err.response?.data?.error;
    if (typeof serverMessage === "string" && serverMessage.trim().length > 0) {
      return serverMessage.trim();
    }
    if (typeof err.message === "string" && err.message.trim().length > 0) {
      return err.message.trim();
    }
  }

  return fallbackMessage;
}
