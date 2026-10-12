import { useEffect, useRef, useCallback, useState } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { authClient } from "@/services/auth-client";
import { SplashFlowResult } from "../types";

/**
 * Decoupled hook managing splash screen session verification,
 * the 3-second completion trigger, and secure routing.
 */
export function useSplashFlow(): SplashFlowResult {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // References to track state across async boundaries safely
  const isMountedRef = useRef(true);
  const hasNavigatedRef = useRef(false);
  const authStatusRef = useRef<boolean | null>(null);

  // Concurrently resolve authentication status in background during splash duration
  useEffect(() => {
    isMountedRef.current = true;

    async function checkAuthStatus() {
      try {
        // 1. Direct Better Auth session verification
        const sessionRes = await authClient.getSession();
        if (sessionRes?.data?.user) {
          authStatusRef.current = true;
          return;
        }
      } catch {
        // Fallback to secure cache if network is slow/offline
      }

      // 2. Fallback: check cached session data
      try {
        if (Platform.OS === "web") {
          if (typeof localStorage !== "undefined") {
            const cached = localStorage.getItem("better-auth_session_data");
            const token = localStorage.getItem("better-auth.session_token");
            if (cached || token) {
              authStatusRef.current = true;
              return;
            }
          }
        } else {
          const [cached, token] = await Promise.all([
            SecureStore.getItemAsync("better-auth_session_data"),
            SecureStore.getItemAsync("better-auth.session_token"),
          ]);
          if (cached || token) {
            authStatusRef.current = true;
            return;
          }
        }
      } catch {
        // Fallback default
      }

      authStatusRef.current = false;
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

    const isAuthenticated = authStatusRef.current === true;

    if (isAuthenticated) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/login");
    }
  }, [router]);

  const handleLoadingComplete = useCallback(() => {
    navigateToDestination();
  }, [navigateToDestination]);

  const handleSkip = useCallback(() => {
    navigateToDestination();
  }, [navigateToDestination]);

  return {
    isLoading,
    handleLoadingComplete,
    handleSkip,
  };
}
