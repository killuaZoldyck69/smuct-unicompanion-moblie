import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { RESET_PASSWORD_STRINGS } from "./constants";
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

      {/* 2. SCROLLABLE CONTENT */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        {/* TOP APP BAR WITH BACK ARROW */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={form.handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={24} color="#131B2E" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: Math.max(insets.bottom + 24, 40),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 3. HERO ILLUSTRATION (Includes animated lock & key and verified check badges) */}
          <ResetPasswordHeroIllustration />

          {/* 4. TITLE & SUBTITLE SECTION */}
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

          {/* 5. RESET PASSWORD CARD */}
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
    marginTop: 10,
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#131B2E",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitleSentence: {
    fontSize: 14.5,
    color: "#1F2937",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "400",
  },
  emailHighlighted: {
    fontSize: 14.5,
    color: "#111827",
    fontWeight: "700",
  },
  cardWrapper: {
    width: "100%",
    paddingHorizontal: 20,
    maxWidth: 440,
  },
});
