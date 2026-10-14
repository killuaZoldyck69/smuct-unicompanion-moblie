import React, { useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Cropped illustration aspect ratio (1736 x 950 ~ 1.83)
const HERO_WIDTH = Math.min(SCREEN_WIDTH, 420);
const HERO_HEIGHT = HERO_WIDTH / (1736 / 950);

export function VerifyEmailHeroIllustration() {
  // Ultra-smooth floating and subtle pulsing drivers
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const smoothSine = Easing.inOut(Easing.sin);

    // 1. Gentle continuous floating bobbing
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -7,
          duration: 2400,
          easing: smoothSine,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2400,
          easing: smoothSine,
          useNativeDriver: true,
        }),
      ]),
    );

    // 2. Harmonic organic breathing pulse
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.035,
          duration: 2400,
          easing: smoothSine,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2400,
          easing: smoothSine,
          useNativeDriver: true,
        }),
      ]),
    );

    floatLoop.start();
    pulseLoop.start();

    return () => {
      floatLoop.stop();
      pulseLoop.stop();
    };
  }, [floatAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      {/* BASE CAMPUS & STUDENT ILLUSTRATION */}
      <View style={[styles.imageWrapper, { height: HERO_HEIGHT }]}>
        <Image
          source={require("@/assets/verify-email-screen-bg.png")}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* FLOATING ANIMATED MESSAGE BADGE (Above campus clock tower) */}
        <Animated.View
          style={[
            styles.messageBadge,
            {
              transform: [
                { translateY: floatAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <View style={styles.messageBadgeInner}>
            {/* Blue Mail Icon */}
            <Feather name="mail" size={24} color="#2563EB" />
            {/* Single Micro Checkmark */}
            <View style={styles.checkDot1}>
              <Feather name="check" size={8} color="#ffffff" />
            </View>
          </View>
        </Animated.View>

        {/* FLOATING SPARKLE / STAR */}
        <View style={styles.sparkleStar}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="#C084FC">
            <Path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </Svg>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    position: "relative",
  },
  imageWrapper: {
    width: HERO_WIDTH,
    marginTop: 10,
    position: "relative",
    justifyContent: "flex-end",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  messageBadge: {
    position: "absolute",
    top: "3%",
    left: "44%",
    zIndex: 30,
    borderRadius: 30,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  messageBadgeInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FEF3C7",
    borderWidth: 2,
    borderColor: "#FDE68A",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  checkDot1: {
    position: "absolute",
    top: 9,
    right: 8,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    borderWidth: 1.5,
    borderColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  sparkleStar: {
    position: "absolute",
    top: "36%",
    left: "40%",
  },
});
