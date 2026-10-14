import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { VERIFY_EMAIL_COLORS, VERIFY_EMAIL_STRINGS } from "./constants";
import { VerifyEmailBackgroundDecorations } from "./components/verify-email-background-decorations";
import { VerifyEmailHeroIllustration } from "./components/verify-email-hero-illustration";
import { VerifyEmailCard } from "./components/verify-email-card";
import { useVerifyEmailForm } from "./hooks/use-verify-email-form";

export function VerifyEmail() {
  const insets = useSafeAreaInsets();
  const form = useVerifyEmailForm();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* 1. BACKGROUND PASTEL DECORATIONS & BOTTOM SPROUT */}
      <VerifyEmailBackgroundDecorations />

      {/* 2. SCROLLABLE CONTENT */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top,
              paddingBottom: Math.max(insets.bottom + 24, 40),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 3. TOP HERO ILLUSTRATION (Includes animated floating message badge) */}
          <VerifyEmailHeroIllustration />

          {/* 4. TITLE & SUBTITLE SECTION (Matching exact typography of reference image) */}
          <View style={styles.textSection}>
            <Text style={styles.mainTitle}>{VERIFY_EMAIL_STRINGS.title}</Text>

            <Text style={styles.subtitleSentence}>
              {VERIFY_EMAIL_STRINGS.subtitlePrefix}
            </Text>
            <Text style={styles.emailHighlighted}>
              {form.email || "student@smuct.edu.bd"}
            </Text>

            <Text style={styles.instructionSentence}>
              {VERIFY_EMAIL_STRINGS.subtitleInstruction}
            </Text>
          </View>

          {/* 5. VERIFY EMAIL CARD (6-Digit Boxes, Solid Navy CTA Button, Resend Timer) */}
          <View style={styles.cardWrapper}>
            <VerifyEmailCard
              otp={form.otp}
              setOtpDigit={form.setOtpDigit}
              setFullOtp={form.setFullOtp}
              isVerifying={form.isVerifying}
              isResending={form.isResending}
              countdown={form.countdown}
              canResend={form.canResend}
              onVerify={form.handleVerify}
              onResend={form.handleResend}
              onChangeEmail={form.handleChangeEmail}
              onLogin={form.handleLogin}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    flexGrow: 1,
  },
  textSection: {
    width: "100%",
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 14,
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#131B2E",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitleSentence: {
    fontSize: 15,
    color: "#1F2937",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "400",
  },
  emailHighlighted: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 22,
  },
  instructionSentence: {
    fontSize: 14,
    color: "#1F2937",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 12,
    fontWeight: "400",
  },
  cardWrapper: {
    width: "100%",
    paddingHorizontal: 20,
    maxWidth: 440,
  },
});
