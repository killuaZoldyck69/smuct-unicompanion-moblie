import { useState, useRef, useEffect, useCallback } from "react";
import { TextInput, Keyboard } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { useQueryClient } from "@tanstack/react-query";

import { useNetworkStatus } from "@/hooks/use-network-status";
import { authClient } from "@/services/auth-client";
import { getStudentProfile } from "@/services/student-service";
import {
  clearStoredAuthSession,
  persistAuthSession,
  setStoredOnboardingState,
} from "@/services/session-storage";
import { classifyLoginProfileCheckError } from "@/features/auth/auth-routing-logic";
import { LoginFormState } from "../types";

/**
 * Decoupled authentication and form handling hook for the Login screen.
 */
export function useLoginForm(): LoginFormState {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();
  const params = useLocalSearchParams<{ email?: string }>();
  const initialEmail = Array.isArray(params.email) ? params.email[0] : params.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail((prev: string) => prev || initialEmail);
    }
  }, [initialEmail]);

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordInputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    return () => {
      Keyboard.dismiss();
    };
  }, []);

  const handleLogin = useCallback(async () => {
    Keyboard.dismiss();

    if (!isOnline) {
      Toast.show({
        type: "error",
        text1: "No Internet Connection",
        text2: "Please connect to the internet before signing in.",
      });
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: "Please enter both your email and password.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { data, error } = await authClient.signIn.email({
        email: trimmedEmail,
        password,
      });

      if (error) {
        throw new Error(error.message || "Invalid credentials.");
      }

      const rawToken =
        (data as any)?.token ||
        (data as any)?.session?.token;

      if (rawToken) {
        await persistAuthSession({ token: String(rawToken) });
      }

      // Fetch confirmed session
      const sessionRes = await authClient.getSession();
      const rawUser = sessionRes.data?.user || (data as any)?.user;
      const rawSession = sessionRes.data?.session || (data as any)?.session;
      const sessionToken = (rawSession as any)?.token || rawToken;

      const rawRole = (rawUser as any)?.role;
      const userRole =
        rawRole === "TEACHER" || rawRole === "ADMIN" || rawRole === "STUDENT"
          ? rawRole
          : "STUDENT";

      if (rawUser) {
        queryClient.setQueryData(["currentUser"], {
          user: rawUser,
          session: rawSession,
        });

        await persistAuthSession({
          token: sessionToken ? String(sessionToken) : undefined,
          user: rawUser,
          session: rawSession as Record<string, unknown> | undefined,
          onboarded: userRole === "TEACHER" || userRole === "ADMIN",
        });
      }

      if (userRole === "TEACHER" || userRole === "ADMIN") {
        Keyboard.dismiss();
        Toast.show({ type: "success", text1: "Welcome back!" });
        router.replace("/(tabs)");
        return;
      }

      // Check student onboarding status
      try {
        const studentProfileRes = await getStudentProfile();
        const hasStudentProfile = Boolean(studentProfileRes);
        Keyboard.dismiss();

        if (hasStudentProfile) {
          await setStoredOnboardingState(true);
          Toast.show({ type: "success", text1: "Welcome back!" });
          router.replace("/(tabs)");
        } else {
          await setStoredOnboardingState(false);
          router.replace("/(auth)/onboard");
        }
      } catch (profileError: any) {
        const decision = classifyLoginProfileCheckError(profileError);
        if (decision.action === "route_to_onboard") {
          await setStoredOnboardingState(false);
          Keyboard.dismiss();
          router.replace("/(auth)/onboard");
          return;
        }

        if (decision.shouldClearSession) {
          await clearStoredAuthSession();
          queryClient.setQueryData(["currentUser"], null);
        }

        Toast.show({
          type: "error",
          text1: decision.title,
          text2: decision.message,
        });
      }
    } catch (error: any) {
      const rawMessage = error?.message || "An unexpected error occurred.";
      const lower = rawMessage.toLowerCase();

      if (
        lower.includes("not verified") ||
        lower.includes("email_not_verified") ||
        lower.includes("verify your email")
      ) {
        // Dispatch a fresh verification OTP so the returning user isn't locked on a 2-min countdown with no code
        await authClient.emailOtp
          .sendVerificationOtp({
            email: trimmedEmail,
            type: "email-verification",
          })
          .catch(() => {
            // If a code was just sent within the rate limit window, proceed to Verify Email screen
          });

        Toast.show({
          type: "info",
          text1: "Email Not Verified",
          text2:
            "We sent a 6-digit verification code to your email. Please enter it to activate your account.",
          visibilityTime: 4000,
        });
        router.push({
          pathname: "/(auth)/verify-email",
          params: { email: trimmedEmail },
        });
        return;
      }

      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: rawMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, isOnline, password, queryClient, router]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isEmailFocused,
    setIsEmailFocused,
    isPasswordFocused,
    setIsPasswordFocused,
    isSubmitting,
    passwordInputRef,
    handleLogin,
  };
}
