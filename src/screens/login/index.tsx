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
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";

import { authClient } from "@/services/auth-client";
import { getStudentProfile } from "@/services/student-service";

export function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: "error", text1: "Missing fields" });
      return;
    }

    try {
      setIsSubmitting(true);
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) throw new Error(error.message || "Invalid credentials.");

      // Ensure session token is persisted immediately to SecureStore on native devices
      const rawToken =
        (data as any)?.token ||
        (data as any)?.session?.token;

      if (Platform.OS !== "web" && rawToken) {
        await SecureStore.setItemAsync("better-auth.session_token", rawToken);
        const cookiePayload = JSON.stringify({
          "better-auth.session_token": {
            value: rawToken,
            expires: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
        });
        await SecureStore.setItemAsync("better-auth_cookie", cookiePayload);
      }

      const sessionRes = await authClient.getSession();
      const rawUser = sessionRes.data?.user || (data as any)?.user;
      const rawSession = sessionRes.data?.session || (data as any)?.session;
      const sessionToken = (rawSession as any)?.token || rawToken;

      if (Platform.OS !== "web" && sessionToken) {
        await SecureStore.setItemAsync("better-auth.session_token", sessionToken);
      }

      if (rawUser) {
        queryClient.setQueryData(["currentUser"], {
          user: rawUser,
          session: rawSession,
        });
        if (Platform.OS !== "web") {
          await SecureStore.setItemAsync(
            "better-auth_session_data",
            JSON.stringify({ user: rawUser, session: rawSession }),
          );
        }
      }

      const rawRole = (rawUser as any)?.role;
      const userRole =
        rawRole === "TEACHER" || rawRole === "ADMIN" || rawRole === "STUDENT"
          ? rawRole
          : "STUDENT";

      if (userRole === "TEACHER" || userRole === "ADMIN") {
        Toast.show({ type: "success", text1: "Welcome back!" });
        router.replace("/(tabs)");
        return;
      }

      try {
        const studentProfile = await getStudentProfile();

        if (studentProfile) {
          Toast.show({ type: "success", text1: "Welcome back!" });
          router.replace("/(tabs)");
        } else {
          router.replace("/(auth)/onboard");
        }
      } catch (profileError: any) {
        if (profileError.response && profileError.response.status === 404) {
          router.replace("/(auth)/onboard");
        } else {
          Toast.show({
            type: "error",
            text1: "Profile Check Failed",
            text2:
              profileError.response?.data?.message ||
              "Could not load student profile. Please try again.",
          });
        }
      }
    } catch (error: any) {
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
    <View
      style={[
        styles.safeArea,
        {
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.illustrationContainer}>
            <Image
              source={require("@/assets/login.png")}
              style={styles.illustration}
              resizeMode="contain"
              accessible={true}
              accessibilityLabel="UniCompanion sign in illustration"
            />
          </View>

          <Text style={styles.pageTitle}>Sign in to your{"\n"}account</Text>

          <View style={styles.bentoFormContainer}>
            <View
              style={[
                styles.inputWrapper,
                isEmailFocused && styles.inputFocused,
              ]}
            >
              <Feather
                name="mail"
                size={20}
                color={isEmailFocused ? "#131b2e" : "#76777d"}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Student / Faculty Email"
                placeholderTextColor="#76777d"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                accessible={true}
                accessibilityLabel="Student or Faculty Email"
              />
            </View>

            <View
              style={[
                styles.inputWrapper,
                isPasswordFocused && styles.inputFocused,
              ]}
            >
              <Feather
                name="lock"
                size={20}
                color={isPasswordFocused ? "#131b2e" : "#76777d"}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#76777d"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                accessible={true}
                accessibilityLabel="Password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              >
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#76777d"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordBtn}
              onPress={() => router.push("/(auth)/forgot-password")}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                isSubmitting && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isSubmitting}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Sign In"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Register for an account"
            >
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f9fb",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  illustrationContainer: {
    width: 200,
    height: 200,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  illustration: {
    width: 160,
    height: 160,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#131b2e",
    textAlign: "center",
    lineHeight: 38,
    letterSpacing: -0.64,
    marginBottom: 32,
  },
  bentoFormContainer: {
    width: "100%",
    backgroundColor: "#d0e4ff",
    borderRadius: 32,
    padding: 24,
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 9999,
    paddingHorizontal: 20,
    height: 56,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputFocused: {
    borderColor: "#131b2e",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#191c1e",
    height: "100%",
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPasswordBtn: {
    alignSelf: "flex-end",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#131b2e",
  },
  loginButton: {
    backgroundColor: "#131b2e",
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
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#76777d",
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#131b2e",
  },
});
