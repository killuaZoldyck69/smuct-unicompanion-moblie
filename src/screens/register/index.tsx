import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { AuthKeyboardScrollView } from "../../components/ui";
import { REGISTER_COLORS, REGISTER_STRINGS } from "./constants";
import { RegisterBackgroundDecorations } from "./components/register-background-decorations";
import {
  RegisterHeroIllustration,
  ILLUSTRATION_HEIGHT,
} from "./components/register-hero-illustration";
import { RegisterCard } from "./components/register-card";
import { useRegisterForm } from "./hooks/use-register-form";

export function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const form = useRegisterForm();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* 1. FIXED BACKGROUND DECORATIONS (Pastel shapes & sprout) */}
      <RegisterBackgroundDecorations />

      {/* 2. ADAPTIVE KEYBOARD-AWARE SCROLLABLE CONTENT */}
      <AuthKeyboardScrollView
        collapsibleHero={<RegisterHeroIllustration />}
        initialHeroHeight={ILLUSTRATION_HEIGHT}
        expandedTopPadding={insets.top + 2}
        collapsedTopPadding={insets.top + 10}
        contentContainerStyle={styles.formScrollContent}
      >
        {/* Header Title & Subtitle */}
        <View style={styles.typographyContainer}>
          <Text style={styles.title}>{REGISTER_STRINGS.TITLE}</Text>
          <Text style={styles.subtitle}>{REGISTER_STRINGS.SUBTITLE}</Text>
        </View>

        {/* Elevated Register Card */}
        <View style={styles.cardWrapper}>
          <RegisterCard form={form} />
        </View>

        {/* Already have an account? Sign in */}
        <View style={styles.loginRow}>
          <Text style={styles.footerText}>
            {REGISTER_STRINGS.ALREADY_ACCOUNT}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Sign in to existing account"
          >
            <Text style={styles.loginLink}>{REGISTER_STRINGS.SIGN_IN}</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Policy Link (Mobile-3) */}
        <TouchableOpacity
          style={styles.privacyPolicyButton}
          onPress={() => router.push("/privacy-policy")}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="link"
          accessibilityLabel="View Privacy Policy"
        >
          <Text style={styles.privacyPolicyLink}>
            {REGISTER_STRINGS.PRIVACY_POLICY}
          </Text>
        </TouchableOpacity>
      </AuthKeyboardScrollView>
    </View>
  );
}

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: REGISTER_COLORS.background,
  },
  formScrollContent: {
    paddingHorizontal: 22,
  },
  typographyContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.6,
    color: REGISTER_COLORS.titleText,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: REGISTER_COLORS.subtitleText,
    lineHeight: 21,
  },
  cardWrapper: {
    width: "100%",
    marginBottom: 14,
  },
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "500",
    color: REGISTER_COLORS.subtitleText,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "700",
    color: REGISTER_COLORS.accentBlue,
  },
  privacyPolicyButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  privacyPolicyLink: {
    fontSize: 13,
    fontWeight: "600",
    color: REGISTER_COLORS.subtitleText,
    textDecorationLine: "underline",
  },
});
