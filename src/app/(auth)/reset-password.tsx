import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";

import { authClient } from "@/services/auth-client";
import { validatePassword } from "@/utils/password-validator";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { spacing, rounded } from "@/theme/layout";

export default function ResetPasswordScreen() {
  const router = useRouter();

  // Support both OTP-based reset (email) and deep-link token fallback
  const params = useLocalSearchParams<{ email?: string; token?: string }>();
  const rawEmail = params.email;
  const email = (Array.isArray(rawEmail) ? rawEmail[0] : rawEmail || "").trim();

  const rawToken = params.token;
  const safeToken = Array.isArray(rawToken) ? rawToken[0] : (rawToken as string | undefined);

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      Keyboard.dismiss();
    };
  }, []);

  const handleResetPassword = async () => {
    Keyboard.dismiss();

    if (!email && !safeToken) {
      Toast.show({
        type: "error",
        text1: "Invalid Request",
        text2: "No email or token found. Please request a new password reset.",
      });
      return;
    }

    if (email && !otp.trim()) {
      Toast.show({
        type: "error",
        text1: "OTP Required",
        text2: "Please enter the 6-digit code sent to your email.",
      });
      return;
    }

    if (!newPassword || !confirmPassword) {
      Toast.show({ type: "error", text1: "Please fill in all password fields." });
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      Toast.show({
        type: "error",
        text1: "Password Requirement",
        text2: passwordValidation.error,
        visibilityTime: 4000,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({ type: "error", text1: "Passwords do not match." });
      return;
    }

    try {
      setIsSubmitting(true);

      if (email) {
        // 1. Primary: Better Auth OTP-based reset
        const { error } = await authClient.emailOtp.resetPassword({
          email,
          otp: otp.trim(),
          password: newPassword,
        });

        if (error) throw new Error(error.message || "Invalid or expired reset code.");
      } else if (safeToken) {
        // 2. Fallback: Token-based reset
        const { error } = await authClient.resetPassword({
          newPassword,
          token: safeToken,
        });

        if (error) throw new Error(error.message || "Invalid or expired reset link.");
      }

      Keyboard.dismiss();
      Toast.show({
        type: "success",
        text1: "Password Reset Successful! 🚀",
        text2: "You can now log in with your new password.",
        visibilityTime: 4000,
      });

      router.replace("/(auth)/login");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Reset Failed",
        text2: error?.message || "Failed to reset password. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If neither email nor token exists, show helpful error state
  if (!email && !safeToken) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Feather
            name="alert-triangle"
            size={48}
            color={colors.error}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.title}>Missing Reset Information</Text>
          <Text style={styles.subtitle}>
            Please request a fresh password reset code or link from the Forgot Password screen.
          </Text>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => router.replace("/(auth)/forgot-password")}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go to Forgot Password"
          >
            <Text style={styles.submitBtnText}>Request Reset Code</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerBox}>
            <View style={styles.iconBox}>
              <Feather name="lock" size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>
              {email
                ? `Enter the 6-digit code sent to ${email} and your new password.`
                : "Your new password must be unique from those previously used."}
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* 6-Digit OTP Input (When resetting via email) */}
            {!!email && (
              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>6-Digit Verification Code</Text>
                <View style={styles.inputWrapper}>
                  <Feather
                    name="key"
                    size={20}
                    color={colors.outline}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={colors.outlineVariant}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                    editable={!isSubmitting}
                    accessible={true}
                    accessibilityLabel="Verification Code"
                  />
                </View>
              </View>
            )}

            {/* New Password Input */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrapper}>
                <Feather
                  name="shield"
                  size={20}
                  color={colors.outline}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="At least 8 characters"
                  placeholderTextColor={colors.outlineVariant}
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  editable={!isSubmitting}
                  accessible={true}
                  accessibilityLabel="New Password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.outline}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Feather
                  name="check-circle"
                  size={20}
                  color={colors.outline}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter new password"
                  placeholderTextColor={colors.outlineVariant}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!isSubmitting}
                  accessible={true}
                  accessibilityLabel="Confirm Password"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  <Feather
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.outline}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                isSubmitting && styles.submitBtnDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={isSubmitting}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Set New Password"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Set New Password</Text>
              )}
            </TouchableOpacity>

            {/* Back to Login Link */}
            <TouchableOpacity
              onPress={() => router.replace("/(auth)/login")}
              style={styles.backToLoginBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.backToLoginText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
    justifyContent: "center",
  },
  headerBox: {
    alignItems: "center",
    marginVertical: 24,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceContainer,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  formContainer: {
    width: "100%",
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  label: {
    ...typography.labelMd,
    color: colors.onSurface,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: rounded.md,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: rounded.full,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: colors.onPrimary,
    fontWeight: "bold",
    fontSize: 16,
  },
  backToLoginBtn: {
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 6,
  },
  backToLoginText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textDecorationLine: "underline",
  },
  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
});

