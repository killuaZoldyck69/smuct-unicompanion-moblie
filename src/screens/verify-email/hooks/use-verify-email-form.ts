import { useState, useEffect, useCallback, useRef } from "react";
import { Keyboard, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";

import { authClient } from "@/services/auth-client";
import { OTP_LENGTH, RESEND_COOLDOWN_SECONDS } from "../constants";
import { VerifyEmailState } from "../types";

export function useVerifyEmailForm(): VerifyEmailState {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ email?: string }>();

  const rawEmail = params.email;
  const email = (Array.isArray(rawEmail) ? rawEmail[0] : rawEmail || "").trim();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);

  const timerRef = useRef<any>(null);

  // 1. Resend countdown ticker
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown]);

  const setOtpDigit = useCallback((index: number, digit: string) => {
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
  }, []);

  const setFullOtp = useCallback((code: string) => {
    const chars = code.split("").slice(0, OTP_LENGTH);
    while (chars.length < OTP_LENGTH) chars.push("");
    setOtp(chars);
  }, []);

  const clearOtp = useCallback(() => {
    setOtp(Array(OTP_LENGTH).fill(""));
  }, []);

  // 2. Handle OTP Verification
  const handleVerify = useCallback(async () => {
    Keyboard.dismiss();
    const code = otp.join("").trim();

    if (code.length < OTP_LENGTH) {
      Toast.show({
        type: "error",
        text1: "Incomplete Code",
        text2: `Please enter the complete ${OTP_LENGTH}-digit verification code.`,
      });
      return;
    }

    if (!email) {
      Toast.show({
        type: "error",
        text1: "Missing Email",
        text2: "Unable to find your email address. Please return to registration.",
      });
      return;
    }

    try {
      setIsVerifying(true);

      const { data, error } = await authClient.emailOtp.verifyEmail({
        email,
        otp: code,
      });

      if (error) {
        throw new Error(error.message || "Invalid or expired verification code.");
      }

      // Persist session if autoSignInAfterVerification returned token
      const sessionToken =
        (data as any)?.token ||
        (data as any)?.session?.token;

      if (sessionToken) {
        if (Platform.OS === "web") {
          if (typeof localStorage !== "undefined") {
            localStorage.setItem("better-auth.session_token", sessionToken);
          }
        } else {
          await SecureStore.setItemAsync("better-auth.session_token", sessionToken);
          const cookiePayload = JSON.stringify({
            "better-auth.session_token": {
              value: sessionToken,
              expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
          });
          await SecureStore.setItemAsync("better-auth_cookie", cookiePayload);
        }
      }

      // Invalidate queries so session status reflects immediately
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      Toast.show({
        type: "success",
        text1: "Email Verified! 🚀",
        text2: "Your account is active. Complete your profile to get started.",
        visibilityTime: 4000,
      });

      // Per specification: Redirect to Onboard screen!
      router.replace("/(auth)/onboard");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2:
          err?.message ||
          "Incorrect or expired verification code. Please check and try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  }, [otp, email, queryClient, router]);

  const [resendAttempts, setResendAttempts] = useState(0);

  // 3. Handle Resending OTP (Max 3 attempts per 15 minutes)
  const handleResend = useCallback(async () => {
    Keyboard.dismiss();
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Missing Email",
        text2: "No email provided to resend code.",
      });
      return;
    }

    if (resendAttempts >= 3) {
      Toast.show({
        type: "error",
        text1: "Limit Reached",
        text2:
          "You have reached the maximum of 3 code requests. Please wait 15 minutes before trying again.",
        visibilityTime: 5000,
      });
      return;
    }

    try {
      setIsResending(true);

      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });

      if (error) {
        throw new Error(error.message || "Failed to resend verification code.");
      }

      setResendAttempts((prev) => prev + 1);
      setCountdown(RESEND_COOLDOWN_SECONDS);
      clearOtp();

      Toast.show({
        type: "success",
        text1: "Code Sent!",
        text2: "A fresh 6-digit code has been delivered to your email.",
        visibilityTime: 4000,
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Resend Failed",
        text2:
          err?.message || "Could not send verification code. Please wait a moment.",
      });
    } finally {
      setIsResending(false);
    }
  }, [email, clearOtp, resendAttempts]);

  const handleBack = useCallback(() => {
    Keyboard.dismiss();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/register");
    }
  }, [router]);

  const handleChangeEmail = useCallback(() => {
    Keyboard.dismiss();
    router.replace({
      pathname: "/(auth)/register",
      params: email ? { email } : undefined,
    });
  }, [router, email]);

  const handleLogin = useCallback(() => {
    Keyboard.dismiss();
    router.replace({
      pathname: "/(auth)/login",
      params: email ? { email } : undefined,
    });
  }, [router, email]);

  return {
    email,
    otp,
    setOtpDigit,
    setFullOtp,
    clearOtp,
    isVerifying,
    isResending,
    countdown,
    canResend: countdown <= 0,
    handleVerify,
    handleResend,
    handleBack,
    handleChangeEmail,
    handleLogin,
  };
}

