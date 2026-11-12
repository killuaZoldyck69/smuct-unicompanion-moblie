import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthKeyboardScrollView } from "../../components/ui";
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

      {/* 2. ADAPTIVE KEYBOARD-AWARE SCROLLABLE CONTENT */}
      <AuthKeyboardScrollView
        collapsibleHero={<VerifyEmailHeroIllustration />}
        expandedTopPadding={insets.top}
        collapsedTopPadding={insets.top + 16}
      >
        {/* 3. TITLE & SUBTITLE SECTION (Matching exact typography of reference image) */}
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

        {/* 4. VERIFY EMAIL CARD (6-Digit Boxes, Solid Navy CTA Button, Resend Timer) */}
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
      </AuthKeyboardScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: VERIFY_EMAIL_COLORS.screenBg,
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
    color: VERIFY_EMAIL_COLORS.navyDark,
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitleSentence: {
    fontSize: 15,
    color: VERIFY_EMAIL_COLORS.navyMedium,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "400",
  },
  emailHighlighted: {
    fontSize: 15,
    color: VERIFY_EMAIL_COLORS.navyDark,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 22,
  },
  instructionSentence: {
    fontSize: 14,
    color: VERIFY_EMAIL_COLORS.navyMedium,
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
