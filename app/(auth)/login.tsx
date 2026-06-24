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
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";

import { authClient } from "../../src/services/auth-client";
import api from "../../src/services/api";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- LOGIC REMAINS 100% UNTOUCHED ---
  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: "error", text1: "Missing fields" });
      return;
    }

    try {
      setIsSubmitting(true);
      // 1. Hit Better Auth
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) throw new Error(error.message || "Invalid credentials.");

      // Extract the token to use immediately
      const freshToken =
        data && Platform.OS !== "web" ? (data as any).token : null;

      // 2. EXPLICITLY save the token to SecureStore
      if (freshToken) {
        await SecureStore.setItemAsync("better-auth.session_token", freshToken);
      }

      // 3. --- ROLE & ONBOARDING CHECK ---
      const sessionRes = await authClient.getSession();
      const userRole = (sessionRes.data?.user as any)?.role || "STUDENT";

      if (userRole === "TEACHER" || userRole === "ADMIN") {
        Toast.show({ type: "success", text1: "Welcome back!" });
        router.replace("/(tabs)");
        return;
      }

      // If they are a STUDENT, explicitly pass the fresh token so the backend doesn't reject it
      try {
        const profileRes = await api.get("/students/profile", {
          headers: freshToken ? { Authorization: `Bearer ${freshToken}` } : {},
        });

        if (profileRes.data?.data) {
          Toast.show({ type: "success", text1: "Welcome back!" });
          router.replace("/(tabs)/profile");
        } else {
          router.replace("/(auth)/onboard");
        }
      } catch (profileError: any) {
        // Strictly check if the error is a 404 (Profile doesn't exist).
        if (profileError.response && profileError.response.status === 404) {
          console.log(
            "No student profile found (404), redirecting to onboarding.",
          );
          router.replace("/(auth)/onboard");
        } else {
          // If it's a 500, 401, or network error, DO NOT send them to onboarding!
          console.error(
            "Profile check failed but it wasn't a 404:",
            profileError.message,
          );
          Toast.show({ type: "success", text1: "Welcome back!" });
          router.replace("/(tabs)/home");
        }
      }
    } catch (error: any) {
      console.error("Login Error:", error.message);
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Brand Bar */}
          <View style={styles.topBar}>
            {/* <Feather name="book-open" size={24} color="#131b2e" /> */}
            {/* <Image
              // Using your existing logo/illustration path
              source={require("../../src/assets/logo.jpg")}
              style={styles.topLogo}
              resizeMode="contain"
            /> */}
            {/* <Text style={styles.topBarText}>SMUCT UniCompanion</Text> */}
          </View>

          {/* Illustration Area */}
          <View style={styles.illustrationContainer}>
            <Image
              // Using your existing logo/illustration path
              source={require("../../src/assets/login.png")}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* Main Title */}
          <Text style={styles.pageTitle}>Sign in to your{"\n"}account</Text>

          {/* Soft Blue Bento Box for Form */}
          <View style={styles.bentoFormContainer}>
            {/* Email Input */}
            <View
              style={[
                styles.inputWrapper,
                isEmailFocused && styles.inputFocused,
              ]}
            >
              <Feather
                name="mail"
                size={20}
                color="#76777d"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#76777d"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                editable={!isSubmitting}
              />
            </View>

            {/* Password Input */}
            <View
              style={[
                styles.inputWrapper,
                isPasswordFocused && styles.inputFocused,
              ]}
            >
              <Feather
                name="lock"
                size={20}
                color="#76777d"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#76777d"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                editable={!isSubmitting}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#76777d"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordBtn}
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isSubmitting && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              <Text style={styles.loginButtonText}>
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.registerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- ISOLATED NEW DESIGN THEME (Soft Campus Bento) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f9fb", // surface-bright
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
  },

  // Top Brand Bar
  topBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 16,
    marginBottom: 32,
  },
  topBarText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 20,
    fontWeight: "800",
    color: "#131b2e", // Deep Navy
    marginLeft: 12,
    letterSpacing: -0.5,
  },

  // Illustration
  illustrationContainer: {
    width: 200,
    height: 200,
    backgroundColor: "#ffffff",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    // Soft Ambient Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  illustration: {
    width: 160,
    height: 160,
  },
  topLogo: {
    width: 40,
    height: 40,
  },

  // Typography
  pageTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 32,
    fontWeight: "800",
    color: "#131b2e", // Deep Navy
    textAlign: "center",
    lineHeight: 38,
    letterSpacing: -0.64,
    marginBottom: 32,
  },

  // Bento Box Form
  bentoFormContainer: {
    width: "100%",
    backgroundColor: "#d0e4ff", // secondary-fixed (Soft Blue)
    borderRadius: 32,
    padding: 24,
    marginBottom: 32,
  },

  // Inputs
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff", // Pure white pills
    borderRadius: 9999,
    paddingHorizontal: 20,
    height: 56,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "transparent", // Invisible border to prevent layout jump on focus
  },
  inputFocused: {
    borderColor: "#131b2e", // Deep Navy stroke on focus
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "500",
    color: "#191c1e",
    height: "100%",
  },
  eyeIcon: {
    padding: 4,
  },

  // Forgot Password
  forgotPasswordBtn: {
    alignSelf: "flex-end",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  forgotPasswordText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 14,
    fontWeight: "700",
    color: "#131b2e", // Deep Navy
  },

  // Submit Button
  loginButton: {
    backgroundColor: "#131b2e", // Deep Navy
    borderRadius: 9999,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Footer
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "500",
    color: "#45464d",
  },
  registerLink: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "800",
    color: "#131b2e",
  },
});
