import React, { useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { REGISTER_COLORS, REGISTER_STRINGS } from "../constants";
import { RegisterFormState } from "../types";
import { getPasswordCriteria } from "@/utils/password-validator";

interface RegisterCardProps {
  form: RegisterFormState;
}

export const RegisterCard = React.memo(function RegisterCard({
  form,
}: RegisterCardProps) {
  const {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isSubmitting,

    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,

    isNameFocused,
    setIsNameFocused,
    isEmailFocused,
    setIsEmailFocused,
    isPasswordFocused,
    setIsPasswordFocused,
    isConfirmPasswordFocused,
    setIsConfirmPasswordFocused,

    emailInputRef,
    passwordInputRef,
    confirmPasswordInputRef,

    handleRegister,
  } = form;

  const criteria = useMemo(() => getPasswordCriteria(password), [password]);
  const showCriteria = password.length > 0 || isPasswordFocused;

  return (
    <View style={styles.card}>
      {/* 1. FULL NAME INPUT */}
      <View
        style={[
          styles.inputContainer,
          isNameFocused && styles.inputContainerFocused,
        ]}
      >
        <Feather
          name="user"
          size={20}
          color={
            isNameFocused ? REGISTER_COLORS.iconFocused : REGISTER_COLORS.iconMuted
          }
          style={styles.leadingIcon}
        />
        <TextInput
          style={styles.textInput}
          placeholder={REGISTER_STRINGS.NAME_PLACEHOLDER}
          placeholderTextColor={REGISTER_COLORS.inputPlaceholder}
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => emailInputRef.current?.focus()}
          blurOnSubmit={false}
          onFocus={() => setIsNameFocused(true)}
          onBlur={() => setIsNameFocused(false)}
          editable={!isSubmitting}
          accessible={true}
          accessibilityLabel="Full Name"
        />
      </View>

      {/* 2. UNIVERSITY EMAIL INPUT */}
      <View
        style={[
          styles.inputContainer,
          isEmailFocused && styles.inputContainerFocused,
        ]}
      >
        <Feather
          name="mail"
          size={20}
          color={
            isEmailFocused ? REGISTER_COLORS.iconFocused : REGISTER_COLORS.iconMuted
          }
          style={styles.leadingIcon}
        />
        <TextInput
          ref={emailInputRef}
          style={styles.textInput}
          placeholder={REGISTER_STRINGS.EMAIL_PLACEHOLDER}
          placeholderTextColor={REGISTER_COLORS.inputPlaceholder}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          blurOnSubmit={false}
          onFocus={() => setIsEmailFocused(true)}
          onBlur={() => setIsEmailFocused(false)}
          editable={!isSubmitting}
          accessible={true}
          accessibilityLabel="University Email"
        />
      </View>

      {/* 3. PASSWORD INPUT */}
      <View
        style={[
          styles.inputContainer,
          isPasswordFocused && styles.inputContainerFocused,
          showCriteria && styles.inputContainerWithCriteria,
        ]}
      >
        <Feather
          name="lock"
          size={20}
          color={
            isPasswordFocused
              ? REGISTER_COLORS.iconFocused
              : REGISTER_COLORS.iconMuted
          }
          style={styles.leadingIcon}
        />
        <TextInput
          ref={passwordInputRef}
          style={styles.textInput}
          placeholder={REGISTER_STRINGS.PASSWORD_PLACEHOLDER}
          placeholderTextColor={REGISTER_COLORS.inputPlaceholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          returnKeyType="next"
          onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
          blurOnSubmit={false}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
          editable={!isSubmitting}
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
            color={REGISTER_COLORS.iconMuted}
          />
        </TouchableOpacity>
      </View>

      {/* LIVE PASSWORD REQUIREMENT CHIPS */}
      {showCriteria && (
        <View style={styles.criteriaContainer}>
          <View style={styles.criteriaHeaderRow}>
            <Text style={styles.criteriaHeaderTitle}>Password requirements:</Text>
            {criteria.allValid && (
              <View style={styles.strongBadge}>
                <Feather name="check" size={11} color="#059669" />
                <Text style={styles.strongBadgeText}>Strong</Text>
              </View>
            )}
          </View>
          <View style={styles.criteriaGrid}>
            <View
              style={[
                styles.criteriaChip,
                criteria.hasMinLength && styles.criteriaChipMet,
              ]}
            >
              <Feather
                name={criteria.hasMinLength ? "check" : "circle"}
                size={11}
                color={criteria.hasMinLength ? "#0D9488" : "#94A3B8"}
              />
              <Text
                style={[
                  styles.criteriaChipText,
                  criteria.hasMinLength && styles.criteriaChipTextMet,
                ]}
              >
                8+ characters
              </Text>
            </View>

            <View
              style={[
                styles.criteriaChip,
                criteria.hasUppercase && styles.criteriaChipMet,
              ]}
            >
              <Feather
                name={criteria.hasUppercase ? "check" : "circle"}
                size={11}
                color={criteria.hasUppercase ? "#0D9488" : "#94A3B8"}
              />
              <Text
                style={[
                  styles.criteriaChipText,
                  criteria.hasUppercase && styles.criteriaChipTextMet,
                ]}
              >
                Uppercase (A-Z)
              </Text>
            </View>

            <View
              style={[
                styles.criteriaChip,
                criteria.hasLowercase && styles.criteriaChipMet,
              ]}
            >
              <Feather
                name={criteria.hasLowercase ? "check" : "circle"}
                size={11}
                color={criteria.hasLowercase ? "#0D9488" : "#94A3B8"}
              />
              <Text
                style={[
                  styles.criteriaChipText,
                  criteria.hasLowercase && styles.criteriaChipTextMet,
                ]}
              >
                Lowercase (a-z)
              </Text>
            </View>

            <View
              style={[
                styles.criteriaChip,
                criteria.hasNumber && styles.criteriaChipMet,
              ]}
            >
              <Feather
                name={criteria.hasNumber ? "check" : "circle"}
                size={11}
                color={criteria.hasNumber ? "#0D9488" : "#94A3B8"}
              />
              <Text
                style={[
                  styles.criteriaChipText,
                  criteria.hasNumber && styles.criteriaChipTextMet,
                ]}
              >
                Number (0-9)
              </Text>
            </View>

            <View
              style={[
                styles.criteriaChip,
                criteria.hasSpecialChar && styles.criteriaChipMet,
              ]}
            >
              <Feather
                name={criteria.hasSpecialChar ? "check" : "circle"}
                size={11}
                color={criteria.hasSpecialChar ? "#0D9488" : "#94A3B8"}
              />
              <Text
                style={[
                  styles.criteriaChipText,
                  criteria.hasSpecialChar && styles.criteriaChipTextMet,
                ]}
              >
                Special char (!@#$)
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 4. CONFIRM PASSWORD INPUT */}
      <View
        style={[
          styles.inputContainer,
          isConfirmPasswordFocused && styles.inputContainerFocused,
        ]}
      >
        <Feather
          name="shield"
          size={20}
          color={
            isConfirmPasswordFocused
              ? REGISTER_COLORS.iconFocused
              : REGISTER_COLORS.iconMuted
          }
          style={styles.leadingIcon}
        />
        <TextInput
          ref={confirmPasswordInputRef}
          style={styles.textInput}
          placeholder={REGISTER_STRINGS.CONFIRM_PASSWORD_PLACEHOLDER}
          placeholderTextColor={REGISTER_COLORS.inputPlaceholder}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          returnKeyType="done"
          onSubmitEditing={handleRegister}
          onFocus={() => setIsConfirmPasswordFocused(true)}
          onBlur={() => setIsConfirmPasswordFocused(false)}
          editable={!isSubmitting}
          accessible={true}
          accessibilityLabel="Confirm Password"
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={styles.trailingIconButton}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={
            showConfirmPassword ? "Hide confirm password" : "Show confirm password"
          }
        >
          <Feather
            name={showConfirmPassword ? "eye" : "eye-off"}
            size={20}
            color={REGISTER_COLORS.iconMuted}
          />
        </TouchableOpacity>
      </View>

      {/* 5. CREATE ACCOUNT BUTTON */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          isSubmitting && styles.submitButtonDisabled,
        ]}
        onPress={handleRegister}
        disabled={isSubmitting}
        activeOpacity={0.85}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={REGISTER_STRINGS.BUTTON_TEXT}
      >
        {isSubmitting ? (
          <ActivityIndicator color={REGISTER_COLORS.primaryButtonText} />
        ) : (
          <Text style={styles.submitButtonText}>
            {REGISTER_STRINGS.BUTTON_TEXT}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: REGISTER_COLORS.cardBackground,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: REGISTER_COLORS.cardBorder,
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
    borderColor: REGISTER_COLORS.inputBorder,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  inputContainerFocused: {
    borderColor: REGISTER_COLORS.inputBorderFocused,
  },
  leadingIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: REGISTER_COLORS.inputText,
    fontWeight: "500",
  },
  trailingIconButton: {
    padding: 6,
    marginLeft: 4,
  },
  submitButton: {
    height: 54,
    borderRadius: 9999,
    backgroundColor: REGISTER_COLORS.primaryButton,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
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
    color: REGISTER_COLORS.primaryButtonText,
  },
  inputContainerWithCriteria: {
    marginBottom: 8,
  },
  criteriaContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  criteriaHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  criteriaHeaderTitle: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  strongBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  strongBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  criteriaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  criteriaChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 4.5,
  },
  criteriaChipMet: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  criteriaChipText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
  },
  criteriaChipTextMet: {
    color: "#065F46",
    fontWeight: "700",
  },
});
