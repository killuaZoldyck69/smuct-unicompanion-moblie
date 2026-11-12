import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { authClient } from "@/services/auth-client";
import { getStudentProfile } from "@/services/student-service";
import {
  clearStoredAuthSession,
  getStoredOnboardingState,
  getStoredSessionData,
  getStoredSessionToken,
  setStoredOnboardingState,
  setStoredSessionData,
} from "@/services/session-storage";
import {
  RemoteSessionCheckResult,
  SplashRouteDecision,
  StudentProfileCheckStatus,
  resolveSplashRoute,
} from "@/features/auth/auth-routing-logic";
import { SplashFlowResult } from "../types";

function isSessionNetworkError(err: any): boolean {
  if (!err) return false;
  const status = err?.status ?? err?.response?.status;
  if (typeof status === "number" && status > 0) {
    return status >= 500;
  }
  const msg = String(err?.message || err?.statusText || "").toLowerCase();
  return (
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("offline") ||
    msg.includes("timeout") ||
    msg.includes("failed to connect") ||
    status === 0 ||
    status === undefined
  );
}

/**
 * Decoupled hook managing splash screen session verification,
 * onboarding status enforcement, and secure routing (Mobile-19, Mobile-20).
 */
export function useSplashFlow(): SplashFlowResult {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const isMountedRef = useRef(true);
  const hasNavigatedRef = useRef(false);
  const destinationRef = useRef<SplashRouteDecision["destination"]>("/(auth)/login");

  useEffect(() => {
    isMountedRef.current = true;

    async function checkAuthStatus() {
      const [storedToken, storedSession, storedOnboarded] = await Promise.all([
        getStoredSessionToken(),
        getStoredSessionData<{ user?: any; session?: any }>(),
        getStoredOnboardingState(),
      ]);

      const cachedSession = {
        hasToken: Boolean(storedToken || storedSession?.user),
        user: storedSession?.user ?? null,
        onboarded: storedOnboarded,
      };

      let sessionCheck: RemoteSessionCheckResult = { status: "unauthenticated" };
      let studentProfileCheck: StudentProfileCheckStatus = "not_applicable";

      try {
        const sessionRes = await authClient.getSession();
        const remoteUser = sessionRes?.data?.user as any;

        if (remoteUser) {
          sessionCheck = {
            status: "authenticated",
            user: {
              id: remoteUser.id,
              role: remoteUser.role,
              emailVerified: remoteUser.emailVerified,
              isRestricted: remoteUser.isRestricted,
            },
          };

          await setStoredSessionData({
            user: remoteUser,
            session: sessionRes?.data?.session,
          });

          const role = String(remoteUser.role || "STUDENT").toUpperCase();
          if (
            role === "STUDENT" &&
            remoteUser.emailVerified !== false &&
            !remoteUser.isRestricted
          ) {
            try {
              const profileRes = await getStudentProfile();
              studentProfileCheck = profileRes ? "exists" : "not_found";
            } catch (profileErr: any) {
              const status = profileErr?.response?.status;
              if (status === 404) {
                studentProfileCheck = "not_found";
              } else if (status === 401 || status === 403) {
                studentProfileCheck = "unauthorized";
              } else {
                studentProfileCheck = "transient_error";
              }
            }
          }
        } else if (sessionRes?.error && isSessionNetworkError(sessionRes.error)) {
          sessionCheck = { status: "network_error" };
        } else {
          sessionCheck = { status: "unauthenticated" };
        }
      } catch {
        sessionCheck = { status: "network_error" };
      }

      const decision = resolveSplashRoute({
        sessionCheck,
        studentProfileCheck,
        cachedSession,
      });

      if (decision.shouldClearSession) {
        await clearStoredAuthSession();
      } else if (typeof decision.onboardedStateToPersist === "boolean") {
        await setStoredOnboardingState(decision.onboardedStateToPersist);
      }

      destinationRef.current = decision.destination;
    }

    checkAuthStatus();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const navigateToDestination = useCallback(() => {
    if (hasNavigatedRef.current || !isMountedRef.current) return;
    hasNavigatedRef.current = true;

    if (isMountedRef.current) {
      setIsLoading(false);
    }

    router.replace(destinationRef.current);
  }, [router]);

  const handleLoadingComplete = useCallback(() => {
    navigateToDestination();
  }, [navigateToDestination]);

  const handleSkip = useCallback(() => {
    setTimeout(navigateToDestination, 100);
  }, [navigateToDestination]);

  return {
    isLoading,
    handleLoadingComplete,
    handleSkip,
  };
}
