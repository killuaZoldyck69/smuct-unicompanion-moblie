import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { OtpInputGroup } from "./otp-input-group";
import {
  VERIFY_EMAIL_COLORS,
  VERIFY_EMAIL_STRINGS,
  OTP_LENGTH,
} from "../constants";

interface Props {
  otp: string[];
  setOtpDigit: (index: number, digit: string) => void;
  setFullOtp: (code: string) => void;
  isVerifying: boolean;
  isResending: boolean;
  countdown: number;
  canResend: boolean;
  onVerify: () => Promise<void>;
  onResend: () => Promise<void>;
  onChangeEmail: () => void;
  onLogin: () => void;
}

export function VerifyEmailCard({
  otp,
  setOtpDigit,
  setFullOtp,
  isVerifying,
  isResending,
  countdown,
  canResend,
  onVerify,
  onResend,
  onChangeEmail,
  onLogin,
}: Props) {
  const isComplete = otp.filter(Boolean).length === OTP_LENGTH;
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formattedCountdown = `(in ${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds})`;

  return (
    <View style={styles.card}>
      {/* 1. 6-DIGIT OTP INPUTS */}
      <OtpInputGroup
        otp={otp}
        setOtpDigit={setOtpDigit}
        setFullOtp={setFullOtp}
        disabled={isVerifying}
      />

      {/* 2. VERIFY & PROCEED BUTTON (Solid Navy matching reference mockup) */}
      <TouchableOpacity
        onPress={onVerify}
        disabled={!isComplete || isVerifying}
        style={[
          styles.submitButton,
          !isComplete && styles.submitButtonIncomplete,
        ]}
        activeOpacity={0.85}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Verify and proceed"
      >
        {isVerifying ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>
            {VERIFY_EMAIL_STRINGS.ctaButtonText}
          </Text>
        )}
      </TouchableOpacity>

      {/* 3. RESEND COUNTDOWN ROW (Didn't receive the code? Resend (in 00:55)) */}
      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>
          {VERIFY_EMAIL_STRINGS.resendPrefix}
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
                {VERIFY_EMAIL_STRINGS.resendAction}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.resendCountdownRow}>
            <Text style={styles.resendActionMuted}>
              {VERIFY_EMAIL_STRINGS.resendAction}
            </Text>
            <Text style={styles.resendTimerText}> {formattedCountdown}</Text>
          </View>
        )}
      </View>

      {/* 4. FOOTER SECONDARY LINKS */}
      <View style={styles.footerLinksRow}>
        <Text style={styles.footerText}>{VERIFY_EMAIL_STRINGS.orSeparator} </Text>
        <TouchableOpacity
          onPress={onChangeEmail}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Change email address"
        >
          <Text style={styles.linkText}>{VERIFY_EMAIL_STRINGS.changeEmail}</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}> {VERIFY_EMAIL_STRINGS.orSeparator} </Text>
        <TouchableOpacity
          onPress={onLogin}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Back to sign in"
        >
          <Text style={styles.linkText}>
            {VERIFY_EMAIL_STRINGS.backToLogin}
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
    paddingTop: 8,
    paddingBottom: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.75)",
  },
  submitButton: {
    backgroundColor: "#131B2E",
    borderRadius: 28,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 6,
    marginBottom: 20,
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
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  resendText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "400",
  },
  resendCountdownRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  resendActionActive: {
    fontSize: 14,
    color: "#1D4ED8",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  resendActionMuted: {
    fontSize: 14,
    color: "#1D4ED8",
    fontWeight: "600",
  },
  resendTimerText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "400",
  },
  resendSpinner: {
    marginLeft: 6,
  },
  footerLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  footerText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "400",
  },
  linkText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
