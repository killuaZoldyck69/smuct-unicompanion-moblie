import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { authClient } from "@/services/auth-client";
import {
  FORGOT_PASSWORD_COLORS,
  FORGOT_PASSWORD_STRINGS,
} from "./constants";
import { ForgotPasswordBackgroundDecorations } from "./components/forgot-password-background-decorations";
import { ForgotPasswordHeroIllustration } from "./components/forgot-password-hero-illustration";
import { ForgotPasswordCard } from "./components/forgot-password-card";

export function ForgotPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
      Keyboard.dismiss();
    };
  }, []);

  const handleBack = () => {
    Keyboard.dismiss();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/login");
    }
  };

  const handleRequestReset = async () => {
    Keyboard.dismiss();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Toast.show({
        type: "error",
        text1: "Email Required",
        text2: "Please enter your email address to continue.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await authClient.requestPasswordReset({
        email: trimmedEmail,
        redirectTo: "smuct-unicompanion://reset-password",
      });

      if (error) throw new Error(error.message);

      Keyboard.dismiss();
      Toast.show({
        type: "success",
        text1: "Reset Link Sent!",
        text2: "Check your inbox for instructions to reset your password.",
      });

      handleBack();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Request Failed",
        text2: error?.message || "Failed to send reset link. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* 3. SCROLLABLE CONTENT (Illustration stays permanently visible) */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={styles.keyboardContainer}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.formScrollView}
          contentContainerStyle={[
            styles.formScrollContent,
            {
              paddingTop: insets.top + (Platform.OS === "ios" ? 14 : 20),
              paddingBottom: Math.max(insets.bottom + 20, 32),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bounces={Platform.OS === "ios"}
        >
          {/* Base Campus Illustration & Animated Passkey Badge (Never Hidden) */}
          <View style={styles.heroContainer}>
            <ForgotPasswordHeroIllustration />
          </View>

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
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 120);
              }}
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
        </ScrollView>
      </KeyboardAvoidingView>
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
  heroContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  keyboardContainer: {
    flex: 1,
  },
  formScrollView: {
    flex: 1,
  },
  formScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    alignItems: "center",
  },
  typographyContainer: {
    width: "100%",
    alignItems: "center",
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
