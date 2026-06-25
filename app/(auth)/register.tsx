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
  StatusBar,
  Image, // 👈 1. Added Image import
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { authClient } from "../../src/services/auth-client";

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus states for the inputs
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
    useState(false);

  // Focus states for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          {/* 👇 2. Added Illustration Area 👇 */}
          <View style={styles.illustrationContainer}>
            <Image
              // Update this path to match where you saved your register illustration!
              source={require("../../src/assets/register.png")}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* Main Title */}
          <Text style={styles.pageTitle}>Create new account</Text>

          {/* Soft Blue Bento Box for Form */}
          <View style={styles.bentoFormContainer}>
            {/* Full Name Input */}
            <View
              style={[
                styles.inputWrapper,
                isNameFocused && styles.inputFocused,
              ]}
            >
              <Feather
                name="user"
                size={20}
                color="#76777d"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#76777d"
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
                editable={!isSubmitting}
              />
            </View>

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
                placeholder="University Email"
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

            {/* Confirm Password Input */}
            <View
              style={[
                styles.inputWrapper,
                isConfirmPasswordFocused && styles.inputFocused,
              ]}
            >
              <Feather
                name="check-circle"
                size={20}
                color="#76777d"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#76777d"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setIsConfirmPasswordFocused(true)}
                onBlur={() => setIsConfirmPasswordFocused(false)}
                editable={!isSubmitting}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Feather
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#76777d"
                />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                isSubmitting && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isSubmitting}
            >
              <Text style={styles.registerButtonText}>
                {isSubmitting ? "Creating Account..." : "Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
    marginBottom: 16, // Reduced margin to make room for image
  },
  backBtn: {
    paddingRight: 16,
    paddingVertical: 8,
  },
  topBarText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 20,
    fontWeight: "800",
    color: "#131b2e", // Deep Navy
    letterSpacing: -0.5,
  },

  // 👇 3. Added Illustration Styles 👇
  illustrationContainer: {
    width: 200,
    height: 180,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  illustration: {
    width: 180,
    height: 180,
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

  // Submit Button
  registerButton: {
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
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
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
  loginLink: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "800",
    color: "#131b2e",
  },
});
