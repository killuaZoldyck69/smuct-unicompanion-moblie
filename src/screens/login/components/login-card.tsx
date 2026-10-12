import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LOGIN_COLORS, LOGIN_STRINGS } from "../constants";
import { LoginFormState } from "../types";

interface LoginCardProps {
  form: LoginFormState;
}

export const LoginCard = React.memo(function LoginCard({ form }: LoginCardProps) {
  const router = useRouter();

  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isEmailFocused,
    setIsEmailFocused,
    isPasswordFocused,
    setIsPasswordFocused,
    isSubmitting,
    passwordInputRef,
    handleLogin,
  } = form;

  return (
    <View style={styles.card}>
      {/* 1. EMAIL INPUT */}
      <View
        style={[
          styles.inputContainer,
          isEmailFocused && styles.inputContainerFocused,
        ]}
      >
        <Feather
          name="mail"
          size={20}
          color={isEmailFocused ? LOGIN_COLORS.iconFocused : LOGIN_COLORS.iconMuted}
          style={styles.leadingIcon}
        />
        <TextInput
          style={styles.textInput}
          placeholder={LOGIN_STRINGS.EMAIL_PLACEHOLDER}
          placeholderTextColor={LOGIN_COLORS.inputPlaceholder}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          blurOnSubmit={false}
          onFocus={() => setIsEmailFocused(true)}
          onBlur={() => setIsEmailFocused(false)}
          accessible={true}
          accessibilityLabel="Student or Faculty Email"
        />
      </View>

      {/* 2. PASSWORD INPUT */}
      <View
        style={[
          styles.inputContainer,
          isPasswordFocused && styles.inputContainerFocused,
        ]}
      >
        <Feather
          name="lock"
          size={20}
          color={
            isPasswordFocused ? LOGIN_COLORS.iconFocused : LOGIN_COLORS.iconMuted
          }
          style={styles.leadingIcon}
        />
        <TextInput
          ref={passwordInputRef}
          style={styles.textInput}
          placeholder={LOGIN_STRINGS.PASSWORD_PLACEHOLDER}
          placeholderTextColor={LOGIN_COLORS.inputPlaceholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
          accessible={true}
          accessibilityLabel="Password"
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.trailingIconButton}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={showPassword ? "Hide password" : "Show password"}
        >
          <Feather
            name={showPassword ? "eye" : "eye-off"}
            size={20}
            color={LOGIN_COLORS.iconMuted}
          />
        </TouchableOpacity>
      </View>

      {/* 3. FORGOT PASSWORD LINK */}
      <TouchableOpacity
        style={styles.forgotPasswordButton}
        onPress={() => router.push("/(auth)/forgot-password")}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Forgot password"
      >
        <Text style={styles.forgotPasswordText}>
          {LOGIN_STRINGS.FORGOT_PASSWORD}
        </Text>
      </TouchableOpacity>

      {/* 4. SIGN IN BUTTON */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          isSubmitting && styles.submitButtonDisabled,
        ]}
        onPress={handleLogin}
        disabled={isSubmitting}
        activeOpacity={0.85}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={LOGIN_STRINGS.SIGN_IN_BUTTON}
      >
        {isSubmitting ? (
          <ActivityIndicator color={LOGIN_COLORS.primaryButtonText} />
        ) : (
          <Text style={styles.submitButtonText}>
            {LOGIN_STRINGS.SIGN_IN_BUTTON}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: LOGIN_COLORS.cardBackground,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: LOGIN_COLORS.cardBorder,
    padding: 20,
    shadowColor: "#0D1E42",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: LOGIN_COLORS.inputBorder,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  inputContainerFocused: {
    borderColor: LOGIN_COLORS.inputBorderFocused,
  },
  leadingIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: LOGIN_COLORS.inputText,
    fontWeight: "500",
  },
  trailingIconButton: {
    padding: 6,
    marginLeft: 4,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 18,
    paddingVertical: 2,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
    color: LOGIN_COLORS.accentBlue,
  },
  submitButton: {
    height: 54,
    borderRadius: 9999,
    backgroundColor: LOGIN_COLORS.primaryButton,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F224A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: LOGIN_COLORS.primaryButtonText,
  },
});
