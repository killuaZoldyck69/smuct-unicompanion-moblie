import { useState, useRef, useEffect, useCallback } from "react";
import { TextInput, Keyboard, Platform } from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";

import { authClient } from "@/services/auth-client";
import { getStudentProfile } from "@/services/student-service";
import { LoginFormState } from "../types";

/**
 * Decoupled authentication and form handling hook for the Login screen.
 */
export function useLoginForm(): LoginFormState {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

      // Persist session token immediately to SecureStore / localStorage
      const rawToken =
        (data as any)?.token ||
        (data as any)?.session?.token;

      if (rawToken) {
        if (Platform.OS === "web") {
          if (typeof localStorage !== "undefined") {
            localStorage.setItem("better-auth.session_token", rawToken);
          }
        } else {
          await SecureStore.setItemAsync("better-auth.session_token", rawToken);
          const cookiePayload = JSON.stringify({
            "better-auth.session_token": {
              value: rawToken,
              expires: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000,
              ).toISOString(),
            },
          });
          await SecureStore.setItemAsync("better-auth_cookie", cookiePayload);
        }
      }

      // Fetch confirmed session
      const sessionRes = await authClient.getSession();
      const rawUser = sessionRes.data?.user || (data as any)?.user;
      const rawSession = sessionRes.data?.session || (data as any)?.session;
      const sessionToken = (rawSession as any)?.token || rawToken;

      if (sessionToken) {
        if (Platform.OS === "web") {
          if (typeof localStorage !== "undefined") {
            localStorage.setItem("better-auth.session_token", sessionToken);
          }
        } else {
          await SecureStore.setItemAsync(
            "better-auth.session_token",
            sessionToken,
          );
        }
      }

      if (rawUser) {
        queryClient.setQueryData(["currentUser"], {
          user: rawUser,
          session: rawSession,
        });

        const serializedSession = JSON.stringify({
          user: rawUser,
          session: rawSession,
        });

        if (Platform.OS === "web") {
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(
              "better-auth_session_data",
              serializedSession,
            );
          }
        } else {
          await SecureStore.setItemAsync(
            "better-auth_session_data",
            serializedSession,
          );
        }
      }

      // Determine user role and route accordingly
      const rawRole = (rawUser as any)?.role;
      const userRole =
        rawRole === "TEACHER" || rawRole === "ADMIN" || rawRole === "STUDENT"
          ? rawRole
          : "STUDENT";

      if (userRole === "TEACHER" || userRole === "ADMIN") {
        Keyboard.dismiss();
        Toast.show({ type: "success", text1: "Welcome back!" });
        router.replace("/(tabs)");
        return;
      }

      // Check student onboarding status
      try {
        const studentProfile = await getStudentProfile();
        Keyboard.dismiss();

        if (studentProfile) {
          Toast.show({ type: "success", text1: "Welcome back!" });
          router.replace("/(tabs)");
        } else {
          router.replace("/(auth)/onboard");
        }
      } catch (profileError: any) {
        if (profileError.response && profileError.response.status === 404) {
          Keyboard.dismiss();
          router.replace("/(auth)/onboard");
        } else {
          Toast.show({
            type: "error",
            text1: "Profile Check Failed",
            text2:
              profileError.response?.data?.message ||
              "Could not load student profile. Please try again.",
          });
        }
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, queryClient, router]);

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
