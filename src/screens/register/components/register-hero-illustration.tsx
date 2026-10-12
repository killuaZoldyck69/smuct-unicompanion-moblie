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
import { REGISTER_COLORS } from "../constants";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Calculate proportional illustration dimensions based on native 2400x1610 aspect ratio
const ILLUSTRATION_ASPECT_RATIO = 2400 / 1610;
const isSmallScreen = SCREEN_HEIGHT < 740;
const ILLUSTRATION_WIDTH = isSmallScreen
  ? Math.min(SCREEN_WIDTH * 0.7, 250)
  : Math.min(SCREEN_WIDTH * 0.78, 290);
export const ILLUSTRATION_HEIGHT = ILLUSTRATION_WIDTH / ILLUSTRATION_ASPECT_RATIO;

/**
 * Animated Hero Section for Register Screen:
 * 1. Base Illustration (register-screen-bg.png)
 * 2. Animated floating Graduation Hat badge (yellow circle with teal hat)
 * 3. Animated floating Open Book badge (green circle with emerald book)
 * 4. Animated floating circular dots (mint, green, yellow sun, and purple)
 */
export const RegisterHeroIllustration = React.memo(
  function RegisterHeroIllustration() {
    // 1. Hat Badge animation drivers
    const hatY = useRef(new Animated.Value(0)).current;
    const hatX = useRef(new Animated.Value(0)).current;

    // 2. Book Badge animation drivers
    const bookY = useRef(new Animated.Value(0)).current;
    const bookX = useRef(new Animated.Value(0)).current;

    // 3. Circle Dots animation drivers
    const mintDotY = useRef(new Animated.Value(0)).current;
    const greenDotY = useRef(new Animated.Value(0)).current;
    const sunDotY = useRef(new Animated.Value(0)).current;
    const purpleDotY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const smoothEase = Easing.inOut(Easing.sin);

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

      // Staggered out-of-phase floating loops
      const hatYLoop = createHarmonicLoop(hatY, -8, 2200);
      const hatXLoop = createHarmonicLoop(hatX, 4, 2600);

      const bookYLoop = createHarmonicLoop(bookY, 8, 2000);
      const bookXLoop = createHarmonicLoop(bookX, -4, 2400);

      const mintDotLoop = createHarmonicLoop(mintDotY, -6, 1900);
      const greenDotLoop = createHarmonicLoop(greenDotY, 6, 2100);
      const sunDotLoop = createHarmonicLoop(sunDotY, -5, 2300);
      const purpleDotLoop = createHarmonicLoop(purpleDotY, 7, 2000);

      hatYLoop.start();
      hatXLoop.start();
      bookYLoop.start();
      bookXLoop.start();
      mintDotLoop.start();
      greenDotLoop.start();
      sunDotLoop.start();
      purpleDotLoop.start();

      return () => {
        hatYLoop.stop();
        hatXLoop.stop();
        bookYLoop.stop();
        bookXLoop.stop();
        mintDotLoop.stop();
        greenDotLoop.stop();
        sunDotLoop.stop();
        purpleDotLoop.stop();
      };
    }, [hatY, hatX, bookY, bookX, mintDotY, greenDotY, sunDotY, purpleDotY]);

    return (
      <View style={styles.container}>
        {/* Base Campus Illustration */}
        <Image
          source={require("@/assets/register-screen-bg.png")}
          style={styles.illustrationImage}
          resizeMode="contain"
          accessible={true}
          accessibilityLabel="Female student holding books with campus background"
        />

        {/* 1. ANIMATED GRADUATION HAT BADGE (Floating above campus building) */}
        <Animated.View
          style={[
            styles.badgeBase,
            styles.hatBadge,
            {
              transform: [{ translateY: hatY }, { translateX: hatX }],
            },
          ]}
        >
          <Svg width={28} height={28} viewBox="0 0 32 32" fill="none">
            {/* Mortarboard Diamond Top */}
            <Path
              d="M 16 6 L 29 12.5 L 16 19 L 3 12.5 Z"
              fill={REGISTER_COLORS.badgeHatIcon}
            />
            {/* Skull Cap Base beneath */}
            <Path
              d="M 7.5 15.5 L 7.5 21 C 7.5 24, 11 26, 16 26 C 21 26, 24.5 24, 24.5 21 L 24.5 15.5"
              stroke={REGISTER_COLORS.badgeHatIcon}
              strokeWidth={2.2}
              strokeLinecap="round"
              fill="none"
            />
            {/* Hanging Tassel */}
            <Path
              d="M 26 14.5 L 26 22.5"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Circle cx={26} cy={23.5} r={2} fill="#F59E0B" />
          </Svg>
        </Animated.View>

        {/* 2. ANIMATED OPEN BOOK BADGE (Floating to the right) */}
        <Animated.View
          style={[
            styles.badgeBase,
            styles.bookBadge,
            {
              transform: [{ translateY: bookY }, { translateX: bookX }],
            },
          ]}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            {/* Open Book Cover & Pages */}
            <Path
              d="M 2 4 C 5 3, 9 3, 12 6 C 15 3, 19 3, 22 4 L 22 19 C 19 18, 15 18, 12 20 C 9 18, 5 18, 2 19 Z"
              stroke={REGISTER_COLORS.badgeBookIcon}
              strokeWidth={2}
              strokeLinejoin="round"
            />
            {/* Center spine */}
            <Path
              d="M 12 6 L 12 20"
              stroke={REGISTER_COLORS.badgeBookIcon}
              strokeWidth={2}
              strokeLinecap="round"
            />
            {/* Left page lines */}
            <Path
              d="M 5 8.5 L 9 8.5 M 5 12 L 9 12 M 5 15.5 L 9 15.5"
              stroke={REGISTER_COLORS.badgeBookIcon}
              strokeWidth={1.3}
              strokeLinecap="round"
            />
            {/* Right page lines */}
            <Path
              d="M 15 8.5 L 19 8.5 M 15 12 L 19 12 M 15 15.5 L 19 15.5"
              stroke={REGISTER_COLORS.badgeBookIcon}
              strokeWidth={1.3}
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>

        {/* 3. ANIMATED FLOATING CIRCLE DOTS */}
        {/* Upper mint dot (left of student) */}
        <Animated.View
          style={[
            styles.dotCircle,
            styles.mintDot,
            { transform: [{ translateY: mintDotY }] },
          ]}
        />

        {/* Lower green dot (left of student) */}
        <Animated.View
          style={[
            styles.dotCircle,
            styles.greenDot,
            { transform: [{ translateY: greenDotY }] },
          ]}
        />

        {/* Warm yellow dot (near student's ponytail) */}
        <Animated.View
          style={[
            styles.dotCircle,
            styles.sunDot,
            { transform: [{ translateY: sunDotY }] },
          ]}
        />

        {/* Purple dot (right edge) */}
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
    marginVertical: 2,
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
  hatBadge: {
    top: "12%",
    left: "57%",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: REGISTER_COLORS.badgeHatBg,
    borderWidth: 1.5,
    borderColor: REGISTER_COLORS.badgeHatBorder,
  },
  bookBadge: {
    top: "18%",
    right: "17%",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: REGISTER_COLORS.badgeBookBg,
    borderWidth: 1.5,
    borderColor: REGISTER_COLORS.badgeBookBorder,
  },
  dotCircle: {
    position: "absolute",
    borderRadius: 999,
  },
  mintDot: {
    top: "16%",
    left: "14%",
    width: 13,
    height: 13,
    backgroundColor: REGISTER_COLORS.dotMint,
  },
  greenDot: {
    top: "27%",
    left: "14%",
    width: 10,
    height: 10,
    backgroundColor: REGISTER_COLORS.dotGreen,
  },
  sunDot: {
    top: "21%",
    left: "20%",
    width: 14,
    height: 14,
    backgroundColor: REGISTER_COLORS.dotSun,
  },
  purpleDot: {
    top: "23%",
    right: "14%",
    width: 10,
    height: 10,
    backgroundColor: REGISTER_COLORS.dotPurple,
  },
});
