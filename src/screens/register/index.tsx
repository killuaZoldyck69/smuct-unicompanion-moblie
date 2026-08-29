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
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { authClient } from "@/services/auth-client";

export function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
    useState(false);

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
          <View style={styles.illustrationContainer}>
            <Image
              source={require("@/assets/register.png")}
              style={styles.illustration}
              resizeMode="contain"
              accessible={true}
              accessibilityLabel="UniCompanion registration illustration"
            />
          </View>

          <Text style={styles.pageTitle}>Create new account</Text>

          <View style={styles.bentoFormContainer}>
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
                accessible={true}
                accessibilityLabel="Full Name"
              />
            </View>

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
                accessible={true}
                accessibilityLabel="University Email"
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
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#76777d"
                />
              </TouchableOpacity>
            </View>

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
                accessible={true}
                accessibilityLabel="Confirm Password"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                <Feather
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#76777d"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.registerButton,
                isSubmitting && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isSubmitting}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Sign Up"
            >
              <Text style={styles.registerButtonText}>
                {isSubmitting ? "Creating Account..." : "Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Log in to existing account"
            >
              <Text style={styles.loginLink}>Log in</Text>
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
    paddingBottom: 40,
    alignItems: "center",
  },
  illustrationContainer: {
    width: 200,
    height: 180,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  illustration: {
    width: 140,
    height: 140,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#131b2e",
    textAlign: "center",
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  bentoFormContainer: {
    width: "100%",
    backgroundColor: "#d0e4ff",
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
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
  registerButton: {
    backgroundColor: "#131b2e",
    borderRadius: 9999,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#76777d",
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#131b2e",
  },
});
