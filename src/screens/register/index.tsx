import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
  Keyboard,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

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

  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Smooth animation drivers to collapse hero illustration when keyboard is active
  const heroHeightAnim = useRef(new Animated.Value(ILLUSTRATION_HEIGHT)).current;
  const heroOpacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const height = e?.endCoordinates?.height ?? 0;
      setKeyboardHeight(height);

      Animated.parallel([
        Animated.timing(heroHeightAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: false,
        }),
        Animated.timing(heroOpacityAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: false,
        }),
      ]).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);

      Animated.parallel([
        Animated.timing(heroHeightAnim, {
          toValue: ILLUSTRATION_HEIGHT,
          duration: 220,
          useNativeDriver: false,
        }),
        Animated.timing(heroOpacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: false,
        }),
      ]).start();

      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [heroHeightAnim, heroOpacityAnim]);

  // Ensure active input is scrolled into clear view above keyboard
  useEffect(() => {
    if (keyboardHeight > 0) {
      if (form.isConfirmPasswordFocused) {
        scrollViewRef.current?.scrollTo({ y: 190, animated: true });
      } else if (form.isPasswordFocused) {
        scrollViewRef.current?.scrollTo({ y: 130, animated: true });
      } else if (form.isEmailFocused) {
        scrollViewRef.current?.scrollTo({ y: 60, animated: true });
      } else if (form.isNameFocused) {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    }
  }, [
    keyboardHeight,
    form.isNameFocused,
    form.isEmailFocused,
    form.isPasswordFocused,
    form.isConfirmPasswordFocused,
  ]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* 1. FIXED BACKGROUND DECORATIONS (Pastel shapes & sprout) */}
      <RegisterBackgroundDecorations />

      {/* 2. TOP HERO SECTION (Smoothly collapses when keyboard is open) */}
      <Animated.View
        style={[
          styles.fixedHeroContainer,
          {
            paddingTop: insets.top + 2,
            height: heroHeightAnim.interpolate({
              inputRange: [0, ILLUSTRATION_HEIGHT],
              outputRange: [0, ILLUSTRATION_HEIGHT + insets.top + 2],
            }),
            opacity: heroOpacityAnim,
            overflow: "hidden",
          },
        ]}
      >
        <RegisterHeroIllustration />
      </Animated.View>

      {/* 3. SCROLLABLE FORM SECTION (Lifted directly above keyboard) */}
      <View
        style={[
          styles.keyboardContainer,
          {
            paddingBottom: keyboardHeight > 0 ? keyboardHeight : 0,
          },
        ]}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.formScrollView}
          contentContainerStyle={[
            styles.formScrollContent,
            {
              paddingTop: keyboardHeight > 0 ? insets.top + 8 : 4,
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
        </ScrollView>
      </View>
    </View>
  );
}

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: REGISTER_COLORS.background,
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
    alignItems: "center",
  },
  typographyContainer: {
    width: "100%",
    alignItems: "flex-start",
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
});
