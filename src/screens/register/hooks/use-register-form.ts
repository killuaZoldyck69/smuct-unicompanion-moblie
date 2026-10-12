import { useState, useRef, useEffect, useCallback } from "react";
import { TextInput, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { authClient } from "@/services/auth-client";
import { validatePassword } from "@/utils/password-validator";
import { RegisterFormState } from "../types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Custom hook to manage registration form state, validation, and submission.
 */
export function useRegisterForm(): RegisterFormState {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
    useState(false);

  const emailInputRef = useRef<TextInput | null>(null);
  const passwordInputRef = useRef<TextInput | null>(null);
  const confirmPasswordInputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    return () => {
      Keyboard.dismiss();
    };
  }, []);

  const handleRegister = useCallback(async () => {
    Keyboard.dismiss();

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in all registration fields.",
      });
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid university email address.",
      });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      Toast.show({
        type: "error",
        text1: "Password Requirement",
        text2: passwordValidation.error,
        visibilityTime: 4000,
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords Do Not Match",
        text2: "Please ensure both password fields match exactly.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await authClient.signUp.email({
        email: trimmedEmail,
        password,
        name: trimmedName,
      });

      if (error) {
        throw new Error(error.message || "Registration failed.");
      }

      Keyboard.dismiss();
      Toast.show({
        type: "success",
        text1: "Account Created!",
        text2: "Please check your email to verify your account.",
        visibilityTime: 4000,
      });

      router.replace("/(auth)/login");
    } catch (error: any) {
      const rawMessage: string =
        error?.message || "An unexpected error occurred.";
      const lower = rawMessage.toLowerCase();

      const isDuplicate =
        lower.includes("already exists") ||
        lower.includes("user_already_exists") ||
        lower.includes("already registered");

      if (isDuplicate) {
        Toast.show({
          type: "error",
          text1: "Account Already Exists",
          text2:
            "An account with this email address already exists. Please log in instead.",
          visibilityTime: 4000,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Registration Failed",
          text2: rawMessage,
          visibilityTime: 4000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [fullName, email, password, confirmPassword, router]);

  return {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isSubmitting,

    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,

    isNameFocused,
    setIsNameFocused,
    isEmailFocused,
    setIsEmailFocused,
    isPasswordFocused,
    setIsPasswordFocused,
    isConfirmPasswordFocused,
    setIsConfirmPasswordFocused,

    emailInputRef,
    passwordInputRef,
    confirmPasswordInputRef,

    handleRegister,
  };
}
