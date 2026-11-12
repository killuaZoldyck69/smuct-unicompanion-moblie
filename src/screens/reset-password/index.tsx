import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { AuthKeyboardScrollView } from "../../components/ui";
import { RESET_PASSWORD_COLORS, RESET_PASSWORD_STRINGS } from "./constants";
import { ResetPasswordBackgroundDecorations } from "./components/reset-password-background-decorations";
import { ResetPasswordHeroIllustration } from "./components/reset-password-hero-illustration";
import { ResetPasswordCard } from "./components/reset-password-card";
import { useResetPasswordForm } from "./hooks/use-reset-password-form";

export function ResetPassword() {
  const insets = useSafeAreaInsets();
  const form = useResetPasswordForm();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* 1. BACKGROUND PASTEL DECORATIONS & BOTTOM SPROUT */}
      <ResetPasswordBackgroundDecorations />

      {/* 2. ADAPTIVE KEYBOARD-AWARE SCROLLABLE CONTENT */}
      <AuthKeyboardScrollView
        topBar={
          <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              onPress={form.handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Feather name="arrow-left" size={24} color={RESET_PASSWORD_COLORS.navyDark} />
            </TouchableOpacity>
          </View>
        }
        collapsibleHero={<ResetPasswordHeroIllustration />}
        expandedTopPadding={0}
        collapsedTopPadding={4}
        extraScrollHeight={120}
      >
        {/* 3. TITLE & SUBTITLE SECTION */}
        <View style={styles.textSection}>
          <Text style={styles.mainTitle}>
            {RESET_PASSWORD_STRINGS.title}
          </Text>

          <Text style={styles.subtitleSentence}>
            {RESET_PASSWORD_STRINGS.subtitlePrefix}{" "}
            <Text style={styles.emailHighlighted}>
              {form.email || "your email address"}
            </Text>{" "}
            {RESET_PASSWORD_STRINGS.subtitleSuffix}
          </Text>
        </View>

        {/* 4. RESET PASSWORD CARD */}
        <View style={styles.cardWrapper}>
          <ResetPasswordCard
            otp={form.otp}
            setOtpDigit={form.setOtpDigit}
            setFullOtp={form.setFullOtp}
            newPassword={form.newPassword}
            setNewPassword={form.setNewPassword}
            confirmPassword={form.confirmPassword}
            setConfirmPassword={form.setConfirmPassword}
            showPassword={form.showPassword}
            setShowPassword={form.setShowPassword}
            showConfirmPassword={form.showConfirmPassword}
            setShowConfirmPassword={form.setShowConfirmPassword}
            isSubmitting={form.isSubmitting}
            isResending={form.isResending}
            countdown={form.countdown}
            canResend={form.canResend}
            onSubmit={form.handleResetPassword}
            onResend={form.handleResend}
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
    backgroundColor: RESET_PASSWORD_COLORS.screenBg,
  },
  topBar: {
    width: "100%",
    paddingHorizontal: 16,
    paddingBottom: 4,
    zIndex: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  textSection: {
    width: "100%",
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: RESET_PASSWORD_COLORS.navyDark,
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitleSentence: {
    fontSize: 15,
    color: RESET_PASSWORD_COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
  emailHighlighted: {
    fontSize: 15,
    color: RESET_PASSWORD_COLORS.navyDark,
    fontWeight: "700",
  },
  cardWrapper: {
    width: "100%",
    paddingHorizontal: 20,
    maxWidth: 440,
  },
});
