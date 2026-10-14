import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { OtpInputGroup } from "@/screens/verify-email/components/otp-input-group";
import {
  RESET_PASSWORD_COLORS,
  RESET_PASSWORD_STRINGS,
  OTP_LENGTH,
} from "../constants";
import { getPasswordCriteria } from "@/utils/password-validator";

interface Props {
  otp: string[];
  setOtpDigit: (index: number, digit: string) => void;
  setFullOtp: (code: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
  isSubmitting: boolean;
  isResending: boolean;
  countdown: number;
  canResend: boolean;
  onSubmit: () => Promise<void>;
  onResend: () => Promise<void>;
  onLogin: () => void;
}

export function ResetPasswordCard({
  otp,
  setOtpDigit,
  setFullOtp,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  isSubmitting,
  isResending,
  countdown,
  canResend,
  onSubmit,
  onResend,
  onLogin,
}: Props) {
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

  const criteria = useMemo(() => getPasswordCriteria(newPassword), [newPassword]);
  const showCriteria = newPassword.length > 0 || isPasswordFocused;

  const isOtpComplete = otp.filter(Boolean).length === OTP_LENGTH;
  const isFormComplete =
    isOtpComplete && criteria.allValid && confirmPassword.length >= 8;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formattedCountdown = `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;

  return (
    <View style={styles.card}>
      {/* 1. 6-DIGIT VERIFICATION CODE */}
      <Text style={styles.fieldLabel}>
        {RESET_PASSWORD_STRINGS.codeLabel}
      </Text>
      <OtpInputGroup
        otp={otp}
        setOtpDigit={setOtpDigit}
        setFullOtp={setFullOtp}
        disabled={isSubmitting}
      />

      {/* 2. RESEND COUNTDOWN (Right Aligned under inputs) */}
      <View style={styles.resendRow}>
        <Text style={styles.resendPrefix}>
          {RESET_PASSWORD_STRINGS.resendPrefix}
        </Text>
        {canResend ? (
          <TouchableOpacity
            onPress={onResend}
            disabled={isResending}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Resend verification code"
          >
            {isResending ? (
              <ActivityIndicator
                size="small"
                color="#1D4ED8"
                style={styles.resendSpinner}
              />
            ) : (
              <Text style={styles.resendActionActive}>
                {RESET_PASSWORD_STRINGS.resendAction}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <Text style={styles.resendTimerText}>
            Resend in {formattedCountdown}
          </Text>
        )}
      </View>

      {/* 3. NEW PASSWORD FIELD */}
      <Text style={styles.fieldLabel}>
        {RESET_PASSWORD_STRINGS.newPasswordLabel}
      </Text>
      <View
        style={[
          styles.inputContainer,
          showCriteria && styles.inputContainerWithCriteria,
          isPasswordFocused && styles.inputContainerFocused,
        ]}
      >
        <Feather
          name="shield"
          size={18}
          color="#334155"
          style={styles.inputLeftIcon}
        />
        <TextInput
          style={styles.textInput}
          placeholder={RESET_PASSWORD_STRINGS.newPasswordPlaceholder}
          placeholderTextColor="#94A3B8"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showPassword}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting}
        />
        <TouchableOpacity
          onPress={() => setShowPassword((prev) => !prev)}
          activeOpacity={0.7}
          style={styles.eyeToggle}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={showPassword ? "Hide password" : "Show password"}
        >
          <Feather
            name={showPassword ? "eye-off" : "eye"}
            size={19}
            color="#64748B"
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

      {/* 4. CONFIRM PASSWORD FIELD */}
      <Text style={styles.fieldLabel}>
        {RESET_PASSWORD_STRINGS.confirmPasswordLabel}
      </Text>
      <View
        style={[
          styles.inputContainer,
          isConfirmPasswordFocused && styles.inputContainerFocused,
        ]}
      >
        <Feather
          name="check-circle"
          size={18}
          color="#334155"
          style={styles.inputLeftIcon}
        />
        <TextInput
          style={styles.textInput}
          placeholder={RESET_PASSWORD_STRINGS.confirmPasswordPlaceholder}
          placeholderTextColor="#94A3B8"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          onFocus={() => setIsConfirmPasswordFocused(true)}
          onBlur={() => setIsConfirmPasswordFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword((prev) => !prev)}
          activeOpacity={0.7}
          style={styles.eyeToggle}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={
            showConfirmPassword ? "Hide password" : "Show password"
          }
        >
          <Feather
            name={showConfirmPassword ? "eye-off" : "eye"}
            size={19}
            color="#64748B"
          />
        </TouchableOpacity>
      </View>

      {/* 5. SET NEW PASSWORD BUTTON */}
      <TouchableOpacity
        onPress={onSubmit}
        disabled={!isFormComplete || isSubmitting}
        style={[
          styles.submitButton,
          !isFormComplete && styles.submitButtonIncomplete,
        ]}
        activeOpacity={0.85}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Set new password"
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>
            {RESET_PASSWORD_STRINGS.ctaButtonText}
          </Text>
        )}
      </TouchableOpacity>

      {/* 6. FOOTER BACK TO SIGN IN */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          onPress={onLogin}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Back to sign in"
        >
          <Text style={styles.backToSignInText}>
            {RESET_PASSWORD_STRINGS.backToSignIn}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.75)",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
    marginTop: 4,
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: -4,
    marginBottom: 14,
  },
  resendPrefix: {
    fontSize: 12.5,
    color: "#4B5563",
    fontWeight: "400",
  },
  resendActionActive: {
    fontSize: 12.5,
    color: "#1D4ED8",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  resendTimerText: {
    fontSize: 12.5,
    color: "#3B82F6",
    fontWeight: "600",
  },
  resendSpinner: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#D3DFEE",
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  inputContainerFocused: {
    borderColor: "#1E293B",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  inputLeftIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    color: "#111827",
    fontWeight: "500",
    height: "100%",
  },
  eyeToggle: {
    padding: 6,
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
  submitButton: {
    backgroundColor: "#131B2E",
    borderRadius: 28,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#131B2E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonIncomplete: {
    backgroundColor: "#131B2E",
    opacity: 0.88,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  footerRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
  },
  backToSignInText: {
    fontSize: 14,
    color: "#1D4ED8",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
