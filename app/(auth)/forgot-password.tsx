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
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { authClient } from "../../src/services/auth-client";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded } from "../../src/theme/layout";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestReset = async () => {
    if (!email) {
      Toast.show({ type: "error", text1: "Please enter your email" });
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "smuct-unicompanion://reset-password",
      });

      if (error) throw new Error(error.message);

      Toast.show({
        type: "success",
        text1: "Email Sent!",
        text2: "Check your inbox for the reset link.",
      });

      router.back();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Request Failed",
        text2: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.onSurface} />
          </TouchableOpacity>

          <View style={styles.headerBox}>
            <View style={styles.iconBox}>
              <Feather name="key" size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter the email associated with your account and we'll send you a
              link to reset your password.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Feather
                name="mail"
                size={20}
                color={colors.outline}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="student@smuct.edu.bd"
                placeholderTextColor={colors.outlineVariant}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!isSubmitting}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                isSubmitting && styles.submitBtnDisabled,
              ]}
              onPress={handleRequestReset}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Send Reset Link</Text>
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

  backButton: {
    position: "absolute",
    top: spacing.marginMobile,
    left: spacing.marginMobile,
    zIndex: 10,
    padding: 8,
  },

  headerBox: {
    alignItems: "center",
    marginBottom: spacing.stackLg * 2,
    marginTop: 40,
  },
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
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: {
    ...typography.labelMd,
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
