import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded } from "../../src/theme/layout";
import Toast from "react-native-toast-message";
import { authClient } from "../../src/services/auth-client";

export default function RegisterScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Toast.show({ type: "error", text1: "Please fill all fields" });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: "error", text1: "Passwords do not match" });
      return;
    }

    try {
      setIsSubmitting(true);

      // Step 1: Create the base user in BetterAuth (triggers email verification)
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: fullName,
      });

      if (error) throw new Error(error.message);

      Toast.show({
        type: "success",
        text1: "Account Created!",
        text2: "Please check your email to verify your account.",
        visibilityTime: 4000,
      });

      // Redirect to login so they can log in AFTER clicking the email link
      router.replace("/(auth)/login");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: error.message || "An error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Sign up with your university email
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputContainer}>
            <Feather
              name="user"
              size={20}
              color={colors.outline}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputContainer}>
            <Feather
              name="mail"
              size={20}
              color={colors.outline}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="student@smuct.edu.bd"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Feather
              name="lock"
              size={20}
              color={colors.outline}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputContainer}>
            <Feather
              name="check-circle"
              size={20}
              color={colors.outline}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.marginMobile,
    justifyContent: "center",
  },
  header: { marginBottom: spacing.stackLg * 2 },
  title: {
    ...typography.headlineLgMobile,
    color: colors.primaryContainer,
    fontWeight: "800",
    marginBottom: spacing.stackSm,
  },
  subtitle: { ...typography.bodyLg, color: colors.onSurfaceVariant },
  form: { gap: spacing.stackSm },
  label: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: "700",
    marginTop: spacing.stackMd,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderRadius: rounded.md,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    paddingVertical: 16,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  button: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 16,
    borderRadius: rounded.md,
    alignItems: "center",
    marginTop: spacing.stackLg,
    marginBottom: spacing.stackLg,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    ...typography.bodyLg,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  footerContainer: { flexDirection: "row", justifyContent: "center" },
  footerText: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  loginLink: {
    ...typography.bodyMd,
    color: colors.primaryContainer,
    fontWeight: "700",
  },
});
