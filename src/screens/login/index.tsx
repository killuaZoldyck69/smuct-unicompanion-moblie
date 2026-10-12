import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

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

      {/* 2. FIXED TOP HERO SECTION (Always stays at top, never scrolled away) */}
      <View
        style={[
          styles.fixedHeroContainer,
          {
            paddingTop: insets.top + 4,
          },
        ]}
      >
        <LoginHeroIllustration />
      </View>

      {/* 3. SCROLLABLE FORM SECTION (Title, Login Card & Register Link) */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          style={styles.formScrollView}
          contentContainerStyle={[
            styles.formScrollContent,
            {
              paddingBottom: Math.max(insets.bottom + 12, 24),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bounces={Platform.OS === "ios"}
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
              <Text style={styles.registerLink}>
                {LOGIN_STRINGS.REGISTER}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOGIN_COLORS.background,
  },
  fixedHeroContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  keyboardContainer: {
    flex: 1,
    zIndex: 2,
  },
  formScrollView: {
    flex: 1,
  },
  formScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
    alignItems: "center",
  },
  typographyContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.6,
    color: LOGIN_COLORS.titleText,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
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
});
