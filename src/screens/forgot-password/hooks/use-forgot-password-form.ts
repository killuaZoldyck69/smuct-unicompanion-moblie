import { useState, useEffect, useCallback } from "react";
import { Keyboard } from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useNetworkStatus } from "@/hooks/use-network-status";
import { authClient } from "@/services/auth-client";
import { ForgotPasswordFormState } from "../types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Decoupled form state, validation, and password-reset OTP request hook for the Forgot Password screen.
 */
export function useForgotPasswordForm(): ForgotPasswordFormState {
  const router = useRouter();
  const { isOnline } = useNetworkStatus();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      Keyboard.dismiss();
    };
  }, []);

  const handleBack = useCallback(() => {
    Keyboard.dismiss();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/login");
    }
  }, [router]);

  const handleRequestReset = useCallback(async () => {
    Keyboard.dismiss();

    if (!isOnline) {
      Toast.show({
        type: "error",
        text1: "No Internet Connection",
        text2: "Please connect to the internet before requesting a reset code.",
      });
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Toast.show({
        type: "error",
        text1: "Email Required",
        text2: "Please enter your email address to continue.",
      });
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await authClient.emailOtp.requestPasswordReset({
        email: trimmedEmail,
      });

      if (error) throw new Error(error.message);

      Keyboard.dismiss();
      Toast.show({
        type: "success",
        text1: "Reset Code Sent! 🔑",
        text2: "We've sent a 6-digit password reset code to your email.",
        visibilityTime: 4000,
      });

      router.push({
        pathname: "/(auth)/reset-password",
        params: { email: trimmedEmail },
      });
    } catch (error: any) {
      const msg = error?.message || "Failed to send reset code. Please try again.";
      const isNotFound = msg.toLowerCase().includes("no account found");

      Toast.show({
        type: "error",
        text1: isNotFound ? "Account Not Found" : "Request Failed",
        text2: msg,
        visibilityTime: 4500,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, isOnline, router]);

  return {
    email,
    setEmail,
    isSubmitting,
    handleBack,
    handleRequestReset,
  };
}
