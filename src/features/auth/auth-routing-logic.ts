/**
 * Pure routing & error-classification logic for Splash, Login, and Onboarding gates (Mobile-19).
 * Kept free of React Native / Expo runtime imports so it can be unit-tested directly under Node.
 */

export interface AuthSessionUserSnapshot {
  id?: string;
  role?: string | null;
  emailVerified?: boolean | null;
  isRestricted?: boolean | null;
}

export type RemoteSessionCheckResult =
  | { status: "authenticated"; user: AuthSessionUserSnapshot }
  | { status: "unauthenticated" }
  | { status: "network_error" };

export type StudentProfileCheckStatus =
  | "exists"
  | "not_found"
  | "unauthorized"
  | "transient_error"
  | "not_applicable";

export interface CachedSessionSnapshot {
  hasToken: boolean;
  user?: AuthSessionUserSnapshot | null;
  onboarded?: boolean | null;
}

export interface SplashRouteDecision {
  destination: "/(auth)/login" | "/(auth)/onboard" | "/(tabs)";
  shouldClearSession: boolean;
  onboardedStateToPersist?: boolean;
}

/**
 * Determines the Splash screen target route while preventing:
 * 1. Expired/revoked online sessions from falling back to stale local tokens.
 * 2. Un-onboarded students from bypassing `/(auth)/onboard` on app restart.
 */
export function resolveSplashRoute(params: {
  sessionCheck: RemoteSessionCheckResult;
  studentProfileCheck: StudentProfileCheckStatus;
  cachedSession: CachedSessionSnapshot;
}): SplashRouteDecision {
  const { sessionCheck, studentProfileCheck, cachedSession } = params;

  // 1. Server explicitly responded that no valid session exists
  if (sessionCheck.status === "unauthenticated") {
    return {
      destination: "/(auth)/login",
      shouldClearSession: true,
    };
  }

  // 2. Server confirmed an active session
  if (sessionCheck.status === "authenticated") {
    const { user } = sessionCheck;

    // Restricted or unverified users cannot enter authenticated app
    if (user.isRestricted === true || user.emailVerified === false) {
      return {
        destination: "/(auth)/login",
        shouldClearSession: true,
      };
    }

    const role = (user.role || "STUDENT").toUpperCase();
    if (role === "TEACHER" || role === "ADMIN") {
      return {
        destination: "/(tabs)",
        shouldClearSession: false,
        onboardedStateToPersist: true,
      };
    }

    // Student role: check onboarding status
    if (studentProfileCheck === "exists") {
      return {
        destination: "/(tabs)",
        shouldClearSession: false,
        onboardedStateToPersist: true,
      };
    }

    if (studentProfileCheck === "not_found") {
      return {
        destination: "/(auth)/onboard",
        shouldClearSession: false,
        onboardedStateToPersist: false,
      };
    }

    if (studentProfileCheck === "unauthorized") {
      return {
        destination: "/(auth)/login",
        shouldClearSession: true,
      };
    }

    // Transient error checking profile -> fall back to persisted onboarding flag
    if (cachedSession.onboarded === false) {
      return {
        destination: "/(auth)/onboard",
        shouldClearSession: false,
      };
    }

    return {
      destination: "/(tabs)",
      shouldClearSession: false,
    };
  }

  // 3. Offline / network error during getSession() -> use cached session safely
  if (!cachedSession.hasToken) {
    return {
      destination: "/(auth)/login",
      shouldClearSession: false,
    };
  }

  if (
    cachedSession.user?.isRestricted === true ||
    cachedSession.user?.emailVerified === false
  ) {
    return {
      destination: "/(auth)/login",
      shouldClearSession: true,
    };
  }

  const cachedRole = (cachedSession.user?.role || "STUDENT").toUpperCase();
  if (cachedRole === "STUDENT" && cachedSession.onboarded === false) {
    return {
      destination: "/(auth)/onboard",
      shouldClearSession: false,
    };
  }

  return {
    destination: "/(tabs)",
    shouldClearSession: false,
  };
}

export type LoginProfileErrorDecision =
  | { action: "route_to_onboard" }
  | {
      action: "abort_login";
      shouldClearSession: boolean;
      title: string;
      message: string;
    };

/**
 * Classifies errors from `GET /api/students/profile` during Login so that
 * only a genuine HTTP 404 routes to `/(auth)/onboard`, whereas transient
 * network/5xx/429 errors abort cleanly with a retryable message.
 */
export function classifyLoginProfileCheckError(
  error: any,
): LoginProfileErrorDecision {
  const status: number | undefined =
    error?.response?.status ?? error?.status ?? undefined;
  const serverMessage: string | undefined =
    error?.response?.data?.message ?? undefined;

  if (status === 404) {
    return { action: "route_to_onboard" };
  }

  if (status === 401 || status === 403) {
    return {
      action: "abort_login",
      shouldClearSession: true,
      title: status === 403 ? "Access Restricted" : "Authentication Error",
      message:
        serverMessage ||
        "Your session could not be verified. Please try signing in again.",
    };
  }

  return {
    action: "abort_login",
    shouldClearSession: true,
    title: "Connection Error",
    message:
      serverMessage ||
      "We couldn't verify your student profile right now. Please check your internet connection and try again.",
  };
}
