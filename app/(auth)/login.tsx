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
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded } from "../../src/theme/layout";
import Toast from "react-native-toast-message";
import { authClient } from "../../src/services/auth-client";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: "Please enter email and password.",
      });
      return;
    }

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message || "Invalid credentials.");
      }

      Toast.show({ type: "success", text1: "Welcome back!" });
    } catch (error: any) {
      console.error("Login Error:", error.message);
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error.message,
      });
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
        <View style={styles.headerContainer}>
          <Image
            source={require("../../src/assets/logo.jpg")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome to{"\n"}UniCompanion</Text>
          <Text style={styles.subtitle}>
            Please log in to continue to your academic portal.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Email Input Group */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              University Email or Student ID
            </Text>
            <View
              style={[
                styles.inputWrapper,
                isEmailFocused && styles.inputFocused,
              ]}
            >
              <Feather
                name="user"
                size={20}
                color={colors.onSurfaceVariant}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="e.g. s1234567@uni.edu"
                placeholderTextColor={colors.outline}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
              />
            </View>
          </View>

          {/* Password Input Group */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View
              style={[
                styles.inputWrapper,
                isPasswordFocused && styles.inputFocused,
              ]}
            >
              <Feather
                name="lock"
                size={20}
                color={colors.onSurfaceVariant}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.outline}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
            <Feather
              name="arrow-right"
              size={20}
              color={colors.onPrimary}
              style={styles.btnIcon}
            />
          </TouchableOpacity>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.sectionBreak,
  },
  headerContainer: {
    marginBottom: spacing.sectionBreak,
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: spacing.stackLg,
  },
  title: {
    ...typography.headlineLgMobile,
    color: colors.primaryContainer,
    textAlign: "center",
    marginBottom: spacing.stackSm,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: spacing.stackLg,
  },
  inputLabel: {
    ...typography.labelMd,
    color: colors.onSurface,
    marginBottom: spacing.stackSm,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: rounded.lg,
    paddingHorizontal: spacing.gutter,
    height: 56,
  },
  inputFocused: {
    borderColor: colors.primaryContainer,
  },
  inputIcon: {
    marginRight: spacing.stackMd,
  },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    height: "100%",
  },
  eyeIcon: {
    padding: spacing.stackSm,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: spacing.stackLg,
  },
  forgotPasswordText: {
    ...typography.labelMd,
    color: colors.error,
  },
  loginButton: {
    backgroundColor: colors.primaryContainer,
    borderRadius: rounded.lg,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.stackLg,
  },
  loginButtonText: {
    ...typography.bodyLg,
    color: colors.onPrimary,
    fontWeight: "600",
  },
  btnIcon: {
    marginLeft: spacing.stackSm,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  registerLink: {
    ...typography.bodyMd,
    color: colors.primaryContainer,
    fontWeight: "700",
  },
});
