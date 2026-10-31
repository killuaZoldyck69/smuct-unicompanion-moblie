import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing, Platform } from "react-native";
import { FLOATING_DOTS } from "../constants";
import { FloatingDotConfig } from "../types";

/**
 * An individual animated floating dot using 4-quadrant harmonic sinusoidal oscillation
 * for perfectly seamless, continuous, zero-jerk drifting physics.
 */
const FloatingDotItem = React.memo(function FloatingDotItem({
  config,
}: {
  config: FloatingDotConfig;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const rawDistY = config.distanceY ?? 10;
    const durY = config.durationY ?? 1800;
    const rawDistX = config.distanceX ?? 6;
    const durX = config.durationX ?? 2200;

    const absDistY = Math.abs(rawDistY);
    const targetY1 = rawDistY >= 0 ? absDistY : -absDistY;
    const targetY2 = rawDistY >= 0 ? -absDistY : absDistY;

    const absDistX = Math.abs(rawDistX);
    const targetX1 = rawDistX >= 0 ? absDistX : -absDistX;
    const targetX2 = rawDistX >= 0 ? -absDistX : absDistX;

    const smoothEasing = Easing.inOut(Easing.sin);

    // 1. Perfectly continuous 4-phase vertical harmonic cycle (0 -> +d -> 0 -> -d -> 0)
    const loopY = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: targetY1,
          duration: durY,
          easing: smoothEasing,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: durY,
          easing: smoothEasing,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(translateY, {
          toValue: targetY2,
          duration: durY,
          easing: smoothEasing,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: durY,
          easing: smoothEasing,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    );

    // 2. Perfectly continuous 4-phase horizontal harmonic cycle (0 -> +d -> 0 -> -d -> 0)
    const loopX = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: targetX1,
          duration: durX,
          easing: smoothEasing,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: durX,
          easing: smoothEasing,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(translateX, {
          toValue: targetX2,
          duration: durX,
          easing: smoothEasing,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: durX,
          easing: smoothEasing,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    );

    // 3. Gentle harmonic micro-breathing (±3% subtle breathing)
    const durScale = Math.round((durY + durX) / 2);
    const loopScale = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.03,
          duration: durScale,
          easing: smoothEasing,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(scale, {
          toValue: 1.0,
          duration: durScale,
          easing: smoothEasing,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(scale, {
          toValue: 0.97,
          duration: durScale,
          easing: smoothEasing,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(scale, {
          toValue: 1.0,
          duration: durScale,
          easing: smoothEasing,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    );

    loopY.start();
    loopX.start();
    loopScale.start();

    return () => {
      loopY.stop();
      loopX.stop();
      loopScale.stop();
    };
  }, [config, translateX, translateY, scale]);

  const dotStyle = {
    width: config.size,
    height: config.size,
    borderRadius: config.size / 2,
    backgroundColor: config.color,
    opacity: config.opacity ?? 0.85,
    top: config.top,
    bottom: config.bottom,
    left: config.left,
    right: config.right,
  };

  return (
    <Animated.View
      style={[
        styles.dotBase,
        dotStyle,
        {
          transform: [{ translateY }, { translateX }, { scale }],
        },
      ]}
      pointerEvents="none"
    />
  );
});

/**
 * Container rendering the light red, yellow, blue, green, and purple animated floating dots.
 */
export const FloatingDots = React.memo(function FloatingDots() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {FLOATING_DOTS.map((dot) => (
        <FloatingDotItem key={dot.id} config={dot} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  dotBase: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
});
