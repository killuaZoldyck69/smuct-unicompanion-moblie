import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { FORGOT_PASSWORD_COLORS } from "../constants";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Calculate proportional illustration dimensions based on native 2400x1610 aspect ratio
const ILLUSTRATION_ASPECT_RATIO = 2400 / 1610;
const isSmallScreen = SCREEN_HEIGHT < 740;
const ILLUSTRATION_WIDTH = isSmallScreen
  ? Math.min(SCREEN_WIDTH * 0.82, 300)
  : Math.min(SCREEN_WIDTH * 0.9, 345);
export const ILLUSTRATION_HEIGHT = ILLUSTRATION_WIDTH / ILLUSTRATION_ASPECT_RATIO;

/**
 * Animated Hero Section for Forgot Password Screen:
 * 1. Base Illustration (forgot-password-screen-bg.png)
 * 2. Animated floating Passkey badge near the student's head
 * 3. Animated pulse halo aura behind the passkey badge
 * 4. Animated floating circular accent dots (mint & lavender)
 */
export const ForgotPasswordHeroIllustration = React.memo(
  function ForgotPasswordHeroIllustration() {
    // 1. Passkey Badge animation drivers
    const keyY = useRef(new Animated.Value(0)).current;
    const keyX = useRef(new Animated.Value(0)).current;
    const keyScale = useRef(new Animated.Value(1)).current;
    const keyRotate = useRef(new Animated.Value(0)).current;

    // 2. Pulse Halo animation driver (radiating ripple behind key badge)
    const haloScale = useRef(new Animated.Value(1)).current;
    const haloOpacity = useRef(new Animated.Value(0.5)).current;

    // 3. Floating Accent Dots
    const mintDotY = useRef(new Animated.Value(0)).current;
    const purpleDotY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const smoothEase = Easing.inOut(Easing.sin);

      // Helper for harmonic continuous floating loop
      const createHarmonicLoop = (
        anim: Animated.Value,
        distance: number,
        duration: number,
      ) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: distance,
              duration,
              easing: smoothEase,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration,
              easing: smoothEase,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: -distance,
              duration,
              easing: smoothEase,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration,
              easing: smoothEase,
              useNativeDriver: true,
            }),
          ]),
        );
      };

      // 1. Organic floating animation for Passkey Badge
      const keyYLoop = createHarmonicLoop(keyY, -8, 2200);
      const keyXLoop = createHarmonicLoop(keyX, 4, 2700);

      // Subtle breathing scale loop
      const keyScaleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(keyScale, {
            toValue: 1.06,
            duration: 1800,
            easing: smoothEase,
            useNativeDriver: true,
          }),
          Animated.timing(keyScale, {
            toValue: 0.98,
            duration: 1800,
            easing: smoothEase,
            useNativeDriver: true,
          }),
        ]),
      );

      // Subtle key tilt loop (-5 deg to +5 deg)
      const keyRotateLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(keyRotate, {
            toValue: 1,
            duration: 2400,
            easing: smoothEase,
            useNativeDriver: true,
          }),
          Animated.timing(keyRotate, {
            toValue: -1,
            duration: 2400,
            easing: smoothEase,
            useNativeDriver: true,
          }),
        ]),
      );

      // 2. Continuous pulse halo loop behind passkey badge
      const haloLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(haloScale, {
              toValue: 1.45,
              duration: 2200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(haloScale, {
              toValue: 1.0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(haloOpacity, {
              toValue: 0,
              duration: 2200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(haloOpacity, {
              toValue: 0.45,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );

      // 3. Accent dots
      const mintDotLoop = createHarmonicLoop(mintDotY, -6, 2000);
      const purpleDotLoop = createHarmonicLoop(purpleDotY, 6, 2300);

      keyYLoop.start();
      keyXLoop.start();
      keyScaleLoop.start();
      keyRotateLoop.start();
      haloLoop.start();
      mintDotLoop.start();
      purpleDotLoop.start();

      return () => {
        keyYLoop.stop();
        keyXLoop.stop();
        keyScaleLoop.stop();
        keyRotateLoop.stop();
        haloLoop.stop();
        mintDotLoop.stop();
        purpleDotLoop.stop();
      };
    }, [
      keyY,
      keyX,
      keyScale,
      keyRotate,
      haloScale,
      haloOpacity,
      mintDotY,
      purpleDotY,
    ]);

    const rotateInterpolation = keyRotate.interpolate({
      inputRange: [-1, 1],
      outputRange: ["-5deg", "5deg"],
    });

    return (
      <View style={styles.container}>
        {/* Base Campus Illustration */}
        <Image
          source={require("@/assets/forgot-password-screen-bg.png")}
          style={styles.illustrationImage}
          resizeMode="contain"
          accessible={true}
          accessibilityLabel="Student thinking with campus background"
        />

        {/* 1. ANIMATED PASSKEY BADGE (Floating near his head / upper-right) */}
        <Animated.View
          style={[
            styles.badgeBase,
            styles.keyBadge,
            {
              transform: [
                { translateY: keyY },
                { translateX: keyX },
                { scale: keyScale },
                { rotate: rotateInterpolation },
              ],
            },
          ]}
        >
          {/* Pulsing Aura Halo */}
          <Animated.View
            style={[
              styles.haloRing,
              {
                transform: [{ scale: haloScale }],
                opacity: haloOpacity,
              },
            ]}
          />

          {/* Crisp Passkey Vector Icon */}
          <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            {/* Key Ring/Head */}
            <Circle
              cx={8.5}
              cy={8.5}
              r={5.5}
              stroke={FORGOT_PASSWORD_COLORS.badgeKeyIcon}
              strokeWidth={2.2}
            />
            {/* Inner Ring Hole */}
            <Circle
              cx={8.5}
              cy={8.5}
              r={2}
              fill={FORGOT_PASSWORD_COLORS.badgeKeyIcon}
            />
            {/* Diagonal Key Shaft extending down-right */}
            <Path
              d="M 12.5 12.5 L 20 20"
              stroke={FORGOT_PASSWORD_COLORS.badgeKeyIcon}
              strokeWidth={2.2}
              strokeLinecap="round"
            />
            {/* First Key Notch */}
            <Path
              d="M 16.5 16.5 L 14.5 18.5"
              stroke={FORGOT_PASSWORD_COLORS.badgeKeyIcon}
              strokeWidth={2.2}
              strokeLinecap="round"
            />
            {/* Second Key Notch */}
            <Path
              d="M 19 19 L 17.5 20.5"
              stroke={FORGOT_PASSWORD_COLORS.badgeKeyIcon}
              strokeWidth={2.2}
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>

        {/* 2. ANIMATED FLOATING ACCENT DOTS */}
        {/* Soft mint dot to the left near his shoulder */}
        <Animated.View
          style={[
            styles.dotCircle,
            styles.mintDot,
            { transform: [{ translateY: mintDotY }] },
          ]}
        />

        {/* Soft lavender dot floating above campus building */}
        <Animated.View
          style={[
            styles.dotCircle,
            styles.purpleDot,
            { transform: [{ translateY: purpleDotY }] },
          ]}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    width: ILLUSTRATION_WIDTH,
    height: ILLUSTRATION_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginVertical: 4,
  },
  illustrationImage: {
    width: ILLUSTRATION_WIDTH,
    height: ILLUSTRATION_HEIGHT,
  },
  badgeBase: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0D1E42",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  keyBadge: {
    top: "13%",
    right: "20%",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: FORGOT_PASSWORD_COLORS.badgeKeyBg,
    borderWidth: 1.5,
    borderColor: FORGOT_PASSWORD_COLORS.badgeKeyBorder,
  },
  haloRing: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: FORGOT_PASSWORD_COLORS.accentBlue,
    backgroundColor: FORGOT_PASSWORD_COLORS.badgeGlow,
  },
  dotCircle: {
    position: "absolute",
    borderRadius: 999,
  },
  mintDot: {
    top: "22%",
    left: "19%",
    width: 12,
    height: 12,
    backgroundColor: FORGOT_PASSWORD_COLORS.dotMint,
  },
  purpleDot: {
    top: "8%",
    right: "42%",
    width: 10,
    height: 10,
    backgroundColor: FORGOT_PASSWORD_COLORS.dotPurple,
  },
});
