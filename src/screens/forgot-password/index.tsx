import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { AuthKeyboardScrollView } from "../../components/ui";
import {
  FORGOT_PASSWORD_COLORS,
  FORGOT_PASSWORD_STRINGS,
} from "./constants";
import { useForgotPasswordForm } from "./hooks/use-forgot-password-form";
import { ForgotPasswordBackgroundDecorations } from "./components/forgot-password-background-decorations";
import {
  ForgotPasswordHeroIllustration,
  ILLUSTRATION_HEIGHT,
} from "./components/forgot-password-hero-illustration";
import { ForgotPasswordCard } from "./components/forgot-password-card";

export function ForgotPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    email,
    setEmail,
    isSubmitting,
    handleBack,
    handleRequestReset,
  } = useForgotPasswordForm();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* 1. BACKGROUND DECORATIONS (Pastel wave corners & sprout motif) */}
      <ForgotPasswordBackgroundDecorations />

      {/* 2. TOP BACK BUTTON (Fixed with safe area padding) */}
      <TouchableOpacity
        onPress={handleBack}
        style={[
          styles.backButton,
          {
            top: insets.top + (Platform.OS === "ios" ? 6 : 12),
          },
        ]}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Feather
          name="arrow-left"
          size={24}
          color={FORGOT_PASSWORD_COLORS.titleText}
        />
      </TouchableOpacity>

      {/* 3. ADAPTIVE KEYBOARD-AWARE SCROLLABLE CONTENT */}
      <AuthKeyboardScrollView
        collapsibleHero={<ForgotPasswordHeroIllustration />}
        initialHeroHeight={ILLUSTRATION_HEIGHT}
        expandedTopPadding={insets.top + (Platform.OS === "ios" ? 14 : 20)}
        collapsedTopPadding={insets.top + 52}
        contentContainerStyle={styles.formScrollContent}
      >
        {/* Header Title & Subtitle */}
        <View style={styles.typographyContainer}>
          <Text style={styles.title}>{FORGOT_PASSWORD_STRINGS.TITLE}</Text>
          <Text style={styles.subtitle}>
            {FORGOT_PASSWORD_STRINGS.SUBTITLE}
          </Text>
        </View>

        {/* Elevated Forgot Password Card */}
        <View style={styles.cardWrapper}>
          <ForgotPasswordCard
            email={email}
            setEmail={setEmail}
            isSubmitting={isSubmitting}
            onSubmit={handleRequestReset}
          />
        </View>

        {/* Remember Password / Sign In Link */}
        <View style={styles.signInRow}>
          <Text style={styles.footerText}>
            {FORGOT_PASSWORD_STRINGS.REMEMBER_PASSWORD}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Sign in to your account"
          >
            <Text style={styles.signInLink}>
              {FORGOT_PASSWORD_STRINGS.SIGN_IN}
            </Text>
          </TouchableOpacity>
        </View>
      </AuthKeyboardScrollView>
    </View>
  );
}

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FORGOT_PASSWORD_COLORS.background,
  },
  backButton: {
    position: "absolute",
    left: 18,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  formScrollContent: {
    paddingHorizontal: 22,
  },
  typographyContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.6,
    color: FORGOT_PASSWORD_COLORS.titleText,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15.5,
    fontWeight: "500",
    color: FORGOT_PASSWORD_COLORS.subtitleText,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  cardWrapper: {
    width: "100%",
    marginBottom: 18,
  },
  signInRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 14.5,
    fontWeight: "500",
    color: FORGOT_PASSWORD_COLORS.subtitleText,
  },
  signInLink: {
    fontSize: 14.5,
    fontWeight: "700",
    color: FORGOT_PASSWORD_COLORS.accentBlue,
  },
});
