import React, { useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Cropped illustration aspect ratio (1736 x 950 ~ 1.83)
const HERO_WIDTH = Math.min(SCREEN_WIDTH, 420);
const HERO_HEIGHT = HERO_WIDTH / (1736 / 950);

export function ResetPasswordHeroIllustration() {
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const scaleAnim1 = useRef(new Animated.Value(1)).current;
  const scaleAnim2 = useRef(new Animated.Value(1)).current;
  const sparkleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const smoothSine = Easing.inOut(Easing.sin);

    // 1. Silky harmonic floating for Left Lock & Key Badge (0 -> -6 -> 0)
    const floatLoop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: -6,
          duration: 3000,
          easing: smoothSine,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 3000,
          easing: smoothSine,
          useNativeDriver: true,
        }),
      ]),
    );

    // 2. Silky harmonic floating for Right Verified Check Badge (0 -> 5 -> 0)
    const floatLoop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 5,
          duration: 3200,
          easing: smoothSine,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 3200,
          easing: smoothSine,
          useNativeDriver: true,
        }),
      ]),
    );

    // 3. Gentle organic breathing for Badge 1
    const scaleLoop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim1, {
          toValue: 1.03,
          duration: 3000,
          easing: smoothSine,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim1, {
          toValue: 1,
          duration: 3000,
          easing: smoothSine,
          useNativeDriver: true,
        }),
      ]),
    );

    // 4. Gentle organic breathing for Badge 2 (phase offset)
    const scaleLoop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim2, {
          toValue: 1.03,
          duration: 3200,
          easing: smoothSine,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim2, {
          toValue: 1,
          duration: 3200,
          easing: smoothSine,
          useNativeDriver: true,
        }),
      ]),
    );

    // 5. Gentle twinkling for the purple sparkle star
    const sparkleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1.2,
          duration: 2000,
          easing: smoothSine,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0.85,
          duration: 2000,
          easing: smoothSine,
          useNativeDriver: true,
        }),
      ]),
    );

    floatLoop1.start();
    floatLoop2.start();
    scaleLoop1.start();
    scaleLoop2.start();
    sparkleLoop.start();

    return () => {
      floatLoop1.stop();
      floatLoop2.stop();
      scaleLoop1.stop();
      scaleLoop2.stop();
      sparkleLoop.stop();
    };
  }, [floatAnim1, floatAnim2, scaleAnim1, scaleAnim2, sparkleAnim]);

  return (
    <View style={styles.container}>
      {/* BASE CAMPUS & STUDENT ILLUSTRATION */}
      <View style={[styles.imageWrapper, { height: HERO_HEIGHT }]}>
        <Image
          source={require("@/assets/verify-email-screen-bg.png")}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* BADGE 1: FLOATING LOCK & KEY BADGE (Left) */}
        <Animated.View
          style={[
            styles.lockBadge,
            {
              transform: [
                { translateY: floatAnim1 },
                { scale: scaleAnim1 },
              ],
            },
          ]}
        >
          <View style={styles.lockBadgeInner}>
            {/* Navy Lock */}
            <Feather name="lock" size={20} color="#1E293B" />
            {/* Cyan Key */}
            <Feather
              name="key"
              size={15}
              color="#0284C7"
              style={styles.keyIcon}
            />
          </View>
        </Animated.View>

        {/* BADGE 2: FLOATING VERIFIED CHECK BADGE (Right) */}
        <Animated.View
          style={[
            styles.checkBadge,
            {
              transform: [
                { translateY: floatAnim2 },
                { scale: scaleAnim2 },
              ],
            },
          ]}
        >
          <View style={styles.checkBadgeInner}>
            <MaterialCommunityIcons
              name="check-decagram"
              size={30}
              color="#3B82F6"
            />
          </View>
        </Animated.View>

        {/* FLOATING SPARKLE / STAR WITH SOFT TWINKLE */}
        <Animated.View
          style={[
            styles.sparkleStar,
            {
              transform: [{ scale: sparkleAnim }],
              opacity: sparkleAnim.interpolate({
                inputRange: [0.85, 1.2],
                outputRange: [0.75, 1],
              }),
            },
          ]}
        >
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="#C084FC">
            <Path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </Svg>
        </Animated.View>
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
    marginTop: 6,
    position: "relative",
    justifyContent: "flex-end",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  lockBadge: {
    position: "absolute",
    top: "3%",
    left: "42%",
    zIndex: 30,
    borderRadius: 30,
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  lockBadgeInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#E0F2FE",
    borderWidth: 2,
    borderColor: "#BAE6FD",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  keyIcon: {
    marginLeft: 3,
    transform: [{ rotate: "45deg" }],
  },
  checkBadge: {
    position: "absolute",
    top: "3%",
    left: "68%",
    zIndex: 30,
    borderRadius: 30,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  checkBadgeInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#EDE9FE",
    borderWidth: 2,
    borderColor: "#DDD6FE",
    alignItems: "center",
    justifyContent: "center",
  },
  sparkleStar: {
    position: "absolute",
    top: "36%",
    left: "40%",
  },
});
