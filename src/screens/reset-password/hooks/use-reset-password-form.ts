import { useState, useEffect, useCallback, useRef } from "react";
import { Keyboard } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";

import { authClient } from "@/services/auth-client";
import { validatePassword } from "@/utils/password-validator";
import { OTP_LENGTH, RESEND_COOLDOWN_SECONDS } from "../constants";
import { ResetPasswordState } from "../types";

export function useResetPasswordForm(): ResetPasswordState {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; token?: string }>();

  const rawEmail = params.email;
  const email = (Array.isArray(rawEmail) ? rawEmail[0] : rawEmail || "").trim();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resendAttempts, setResendAttempts] = useState(0);

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

  // 2. Handle Password Reset
  const handleResetPassword = useCallback(async () => {
    Keyboard.dismiss();
    const code = otp.join("").trim();

    if (!email) {
      Toast.show({
        type: "error",
        text1: "Missing Email",
        text2: "Unable to find your email. Please request a new password reset.",
      });
      return;
    }

    if (code.length < OTP_LENGTH) {
      Toast.show({
        type: "error",
        text1: "Incomplete Code",
        text2: `Please enter the complete ${OTP_LENGTH}-digit code sent to your email.`,
      });
      return;
    }

    if (!newPassword || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in all password fields.",
      });
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      Toast.show({
        type: "error",
        text1: "Password Requirement",
        text2:
          validation.error ||
          "Password must be at least 8 characters long with uppercase, lowercase, number, and special character.",
        visibilityTime: 4000,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords Do Not Match",
        text2: "Please ensure both password fields match exactly.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await authClient.emailOtp.resetPassword({
        email,
        otp: code,
        password: newPassword,
      });

      if (error) {
        throw new Error(error.message || "Failed to reset password. Please check your code.");
      }

      Toast.show({
        type: "success",
        text1: "Password Reset Successfully! 🚀",
        text2: "Your new password is set. Please sign in to continue.",
        visibilityTime: 4000,
      });

      router.replace({
        pathname: "/(auth)/login",
        params: { email },
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Reset Failed",
        text2:
          err?.message ||
          "Could not reset password. The code may be invalid or expired.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, otp, newPassword, confirmPassword, router]);

  // 3. Handle Resending Reset Code (Max 3 attempts per 15 minutes)
  const handleResend = useCallback(async () => {
    Keyboard.dismiss();
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Missing Email",
        text2: "No email found to resend code.",
      });
      return;
    }

    if (resendAttempts >= 3) {
      Toast.show({
        type: "error",
        text1: "Limit Reached",
        text2:
          "You have requested 3 codes. Please wait 15 minutes before trying again.",
        visibilityTime: 5000,
      });
      return;
    }

    try {
      setIsResending(true);

      const { error } = await authClient.emailOtp.requestPasswordReset({
        email,
      });

      if (error) {
        throw new Error(error.message || "Failed to resend reset code.");
      }

      setResendAttempts((prev) => prev + 1);
      setCountdown(RESEND_COOLDOWN_SECONDS);
      clearOtp();

      Toast.show({
        type: "success",
        text1: "Code Sent!",
        text2: "A fresh 6-digit password reset code has been sent to your email.",
        visibilityTime: 4000,
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Resend Failed",
        text2:
          err?.message || "Could not send reset code. Please try again later.",
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
      router.replace({
        pathname: "/(auth)/login",
        params: email ? { email } : undefined,
      });
    }
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
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isSubmitting,
    isResending,
    countdown,
    canResend: countdown <= 0,
    resendAttempts,
    handleResetPassword,
    handleResend,
    handleBack,
    handleLogin,
  };
}
