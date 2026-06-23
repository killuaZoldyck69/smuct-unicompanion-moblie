import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";

import { authClient } from "../../src/services/auth-client";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded } from "../../src/theme/layout";

export default function ResetPasswordScreen() {
  const router = useRouter();

  // 1. Grab the token from deep link parameters
  const { token } = useLocalSearchParams();

  // 2. Ensure it's treated strictly as a string (in case Expo parses it as an array)
  const safeToken = Array.isArray(token) ? token[0] : (token as string);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async () => {
    if (!safeToken) {
      Toast.show({
        type: "error",
        text1: "Invalid Link",
        text2: "Please request a new password reset link.",
      });
      return;
    }

    if (newPassword.length < 8) {
      Toast.show({
        type: "error",
        text1: "Password too short",
        text2: "Must be at least 8 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({ type: "error", text1: "Passwords do not match" });
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await authClient.resetPassword({
        newPassword,
        token: safeToken, // Pass the safely parsed token here
      });

      if (error) throw new Error(error.message);

      Toast.show({
        type: "success",
        text1: "Password reset successful!",
        text2: "You can now log in.",
      });

      // Send them to the login screen after a successful reset
      router.replace("/(auth)/login");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Reset Failed",
        text2: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If there's no token, show an error state instead of the form
  if (!safeToken) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Feather
            name="alert-triangle"
            size={48}
            color={colors.error}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.title}>Invalid Link</Text>
          <Text style={styles.subtitle}>
            This password reset link is invalid or has expired.
          </Text>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.submitBtnText}>Back to Login</Text>
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
          <View style={styles.headerBox}>
            <View style={styles.iconBox}>
              <Feather name="lock" size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>
              Your new password must be unique from those previously used.
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* New Password Input */}
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
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.outline}
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
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
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!isSubmitting}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                isSubmitting && styles.submitBtnDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Set New Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    padding: spacing.marginMobile,
    flexGrow: 1,
    justifyContent: "center",
  },

  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.marginMobile,
  },

  headerBox: { alignItems: "center", marginBottom: spacing.stackLg * 2 },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryContainer + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.stackLg,
  },
  title: {
    ...typography.headlineMd,
    fontWeight: "800",
    color: colors.onSurface,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 22,
  },

  formContainer: {
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.stackLg,
    borderRadius: rounded.xl,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  label: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: 8,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    paddingHorizontal: 16,
    marginBottom: spacing.stackLg,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    paddingVertical: 14,
    ...typography.bodyMd,
    color: colors.onSurface,
  },

  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: rounded.md,
    alignItems: "center",
    marginTop: 8,
    width: "100%",
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: {
    ...typography.labelMd,
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
