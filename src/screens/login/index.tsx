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
import { LOGIN_COLORS, LOGIN_STRINGS } from "./constants";
import { LoginBackgroundDecorations } from "./components/login-background-decorations";
import { LoginHeroIllustration } from "./components/login-hero-illustration";
import { LoginCard } from "./components/login-card";
import { useLoginForm } from "./hooks/use-login-form";

export function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const form = useLoginForm();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* 1. FIXED BACKGROUND DECORATIONS (Pastel shapes & sprout) */}
      <LoginBackgroundDecorations />

      {/* 2. ADAPTIVE KEYBOARD-AWARE SCROLLABLE CONTENT */}
      <AuthKeyboardScrollView
        collapsibleHero={<LoginHeroIllustration />}
        expandedTopPadding={insets.top + 4}
        collapsedTopPadding={insets.top + 12}
        contentContainerStyle={styles.formScrollContent}
      >
        {/* Header Title & Subtitle */}
        <View style={styles.typographyContainer}>
          <Text style={styles.title}>{LOGIN_STRINGS.TITLE}</Text>
          <Text style={styles.subtitle}>{LOGIN_STRINGS.SUBTITLE}</Text>
        </View>

        {/* Elevated Login Card */}
        <View style={styles.cardWrapper}>
          <LoginCard form={form} />
        </View>

        {/* Register Link */}
        <View style={styles.registerRow}>
          <Text style={styles.footerText}>{LOGIN_STRINGS.NO_ACCOUNT}</Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/register")}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Register for an account"
          >
            <Text style={styles.registerLink}>{LOGIN_STRINGS.REGISTER}</Text>
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
            {LOGIN_STRINGS.PRIVACY_POLICY}
          </Text>
        </TouchableOpacity>
      </AuthKeyboardScrollView>
    </View>
  );
}

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOGIN_COLORS.background,
  },
  formScrollContent: {
    paddingHorizontal: 22,
  },
  typographyContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginTop: 8,
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: LOGIN_COLORS.titleText,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: LOGIN_COLORS.subtitleText,
    lineHeight: 22,
  },
  cardWrapper: {
    width: "100%",
    marginBottom: 14,
  },
  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 14.5,
    fontWeight: "500",
    color: LOGIN_COLORS.subtitleText,
  },
  registerLink: {
    fontSize: 14.5,
    fontWeight: "700",
    color: LOGIN_COLORS.accentBlue,
  },
  privacyPolicyButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  privacyPolicyLink: {
    fontSize: 13,
    fontWeight: "600",
    color: LOGIN_COLORS.subtitleText,
    textDecorationLine: "underline",
  },
});
