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
import { LOGIN_COLORS } from "../constants";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Calculate proportional illustration dimensions based on native 2400x1610 aspect ratio
const ILLUSTRATION_ASPECT_RATIO = 2400 / 1610;
const isSmallScreen = SCREEN_HEIGHT < 740;
const ILLUSTRATION_WIDTH = isSmallScreen
  ? Math.min(SCREEN_WIDTH * 0.8, 290)
  : Math.min(SCREEN_WIDTH * 0.9, 345);
const ILLUSTRATION_HEIGHT = ILLUSTRATION_WIDTH / ILLUSTRATION_ASPECT_RATIO;

/**
 * Animated Hero Section:
 * 1. Base Illustration (login-screen-bg.png)
 * 2. Animated floating Open Book badge on left
 * 3. Animated floating Graduation Hat badge on right
 * 4. Animated floating circular dots (mint, purple, and sun)
 */
export const LoginHeroIllustration = React.memo(
  function LoginHeroIllustration() {
    // 1. Book Badge animation drivers
    const bookY = useRef(new Animated.Value(0)).current;
    const bookX = useRef(new Animated.Value(0)).current;

    // 2. Hat Badge animation drivers
    const hatY = useRef(new Animated.Value(0)).current;
    const hatX = useRef(new Animated.Value(0)).current;

    // 3. Circle Dots animation drivers
    const greenDotY = useRef(new Animated.Value(0)).current;
    const purpleDotY = useRef(new Animated.Value(0)).current;
    const sunDotY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const smoothEase = Easing.inOut(Easing.sin);

      // Helper for 4-phase harmonic continuous floating loop
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

      // Start animations with out-of-phase timings for organic float
      const bookYLoop = createHarmonicLoop(bookY, -8, 2000);
      const bookXLoop = createHarmonicLoop(bookX, 4, 2500);

      const hatYLoop = createHarmonicLoop(hatY, 9, 2300);
      const hatXLoop = createHarmonicLoop(hatX, -5, 2700);

      const greenDotLoop = createHarmonicLoop(greenDotY, -6, 1800);
      const purpleDotLoop = createHarmonicLoop(purpleDotY, 7, 2100);
      const sunDotLoop = createHarmonicLoop(sunDotY, -5, 2400);

      bookYLoop.start();
      bookXLoop.start();
      hatYLoop.start();
      hatXLoop.start();
      greenDotLoop.start();
      purpleDotLoop.start();
      sunDotLoop.start();

      return () => {
        bookYLoop.stop();
        bookXLoop.stop();
        hatYLoop.stop();
        hatXLoop.stop();
        greenDotLoop.stop();
        purpleDotLoop.stop();
        sunDotLoop.stop();
      };
    }, [bookY, bookX, hatY, hatX, greenDotY, purpleDotY, sunDotY]);

    return (
      <View style={styles.container}>
        {/* Base Campus Illustration */}
        <Image
          source={require("@/assets/login-screen-bg.png")}
          style={styles.illustrationImage}
          resizeMode="contain"
          accessible={true}
          accessibilityLabel="Student and campus background illustration"
        />

        {/* 1. ANIMATED BOOK BADGE (Floating on Left) */}
        <Animated.View
          style={[
            styles.badgeBase,
            styles.bookBadge,
            {
              transform: [{ translateY: bookY }, { translateX: bookX }],
            },
          ]}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            {/* Open Book Cover & Pages */}
            <Path
              d="M 2 4 C 5 3, 9 3, 12 6 C 15 3, 19 3, 22 4 L 22 19 C 19 18, 15 18, 12 20 C 9 18, 5 18, 2 19 Z"
              stroke={LOGIN_COLORS.badgeBookIcon}
              strokeWidth={2}
              strokeLinejoin="round"
            />
            {/* Center spine */}
            <Path
              d="M 12 6 L 12 20"
              stroke={LOGIN_COLORS.badgeBookIcon}
              strokeWidth={2}
              strokeLinecap="round"
            />
            {/* Left page content lines */}
            <Path
              d="M 5 8.5 L 9 8.5 M 5 12 L 9 12 M 5 15.5 L 9 15.5"
              stroke={LOGIN_COLORS.badgeBookIcon}
              strokeWidth={1.3}
              strokeLinecap="round"
            />
            {/* Right page content lines */}
            <Path
              d="M 15 8.5 L 19 8.5 M 15 12 L 19 12 M 15 15.5 L 19 15.5"
              stroke={LOGIN_COLORS.badgeBookIcon}
              strokeWidth={1.3}
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>

        {/* 2. ANIMATED GRADUATION HAT BADGE (Floating on Right) */}
        <Animated.View
          style={[
            styles.badgeBase,
            styles.hatBadge,
            {
              transform: [{ translateY: hatY }, { translateX: hatX }],
            },
          ]}
        >
          <Svg width={30} height={30} viewBox="0 0 32 32" fill="none">
            {/* Mortarboard Diamond Top */}
            <Path
              d="M 16 6 L 29 12.5 L 16 19 L 3 12.5 Z"
              fill={LOGIN_COLORS.badgeHatIcon}
            />
            {/* Skull Cap Base beneath */}
            <Path
              d="M 7.5 15.5 L 7.5 21 C 7.5 24, 11 26, 16 26 C 21 26, 24.5 24, 24.5 21 L 24.5 15.5"
              stroke={LOGIN_COLORS.badgeHatIcon}
              strokeWidth={2.2}
              strokeLinecap="round"
              fill="none"
            />
            {/* Hanging Tassel */}
            <Path
              d="M 26 14.5 L 26 22.5"
              stroke="#A78BFA"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Circle cx={26} cy={23.5} r={2} fill="#A78BFA" />
          </Svg>
        </Animated.View>

        {/* 3. ANIMATED FLOATING DOT CIRCLES */}
        {/* Mint green dot circle (near book badge) */}
        <Animated.View
          style={[
            styles.dotCircle,
            styles.greenDot,
            { transform: [{ translateY: greenDotY }] },
          ]}
        />

        {/* Purple dot circle (near hat badge) */}
        <Animated.View
          style={[
            styles.dotCircle,
            styles.purpleDot,
            { transform: [{ translateY: purpleDotY }] },
          ]}
        />

        {/* Soft yellow sun circle (top-right) */}
        <Animated.View
          style={[
            styles.dotCircle,
            styles.sunDot,
            { transform: [{ translateY: sunDotY }] },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  bookBadge: {
    top: "14%",
    left: "14%",
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: LOGIN_COLORS.badgeBookBg,
    borderWidth: 1.5,
    borderColor: LOGIN_COLORS.badgeBookBorder,
  },
  hatBadge: {
    top: "15%",
    right: "12%",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: LOGIN_COLORS.badgeHatBg,
    borderWidth: 1.5,
    borderColor: LOGIN_COLORS.badgeHatBorder,
  },
  dotCircle: {
    position: "absolute",
    borderRadius: 999,
  },
  greenDot: {
    top: "27%",
    left: "8%",
    width: 12,
    height: 12,
    backgroundColor: LOGIN_COLORS.dotGreen,
  },
  purpleDot: {
    top: "28%",
    right: "6%",
    width: 11,
    height: 11,
    backgroundColor: LOGIN_COLORS.dotPurple,
  },
  sunDot: {
    top: "4%",
    right: "6%",
    width: 26,
    height: 26,
    backgroundColor: LOGIN_COLORS.dotSun,
  },
});
