import React, { useEffect, useRef } from "react";
import {
  View,
  Animated,
  StyleSheet,
  Easing,
  StyleProp,
  ViewStyle,
} from "react-native";

interface LiveBeepDotProps {
  size?: number;
  color?: string;
  pulseColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const LiveBeepDot = React.memo(function LiveBeepDot({
  size = 6,
  color = "#ef4444",
  pulseColor = "rgba(239, 68, 68, 0.25)",
  style,
}: LiveBeepDotProps) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  // Expanding wave scale from core outward
  const ringScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.8],
  });

  // Fade out as it expands outward
  const ringOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.2, 0.7, 1],
    outputRange: [0.9, 0.7, 0.25, 0],
  });

  // Subtle core heartbeat
  const coreScale = pulseAnim.interpolate({
    inputRange: [0, 0.15, 0.35, 1],
    outputRange: [1, 1.2, 1, 1],
  });

  const containerSize = size + 6;

  return (
    <View
      style={[
        styles.container,
        { width: containerSize, height: containerSize },
        style,
      ]}
    >
      {/* Expanding Beep Ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            backgroundColor: pulseColor,
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
          },
        ]}
      />

      {/* Central Solid Beep Dot */}
      <Animated.View
        style={[
          styles.coreDot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            transform: [{ scale: coreScale }],
          },
        ]}
      />
    </View>
  );
});

interface LiveNodeBeepRingProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const LiveNodeBeepRing = React.memo(function LiveNodeBeepRing({
  size = 24,
  color = "#ef4444",
  style,
}: LiveNodeBeepRingProps) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const ringScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.7],
  });

  const ringOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.25, 0.7, 1],
    outputRange: [0.85, 0.6, 0.2, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.nodeRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          transform: [{ scale: ringScale }],
          opacity: ringOpacity,
        },
        style,
      ]}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    borderWidth: 1.2,
  },
  coreDot: {
    zIndex: 1,
  },
  nodeRing: {
    position: "absolute",
    borderWidth: 1.5,
    zIndex: 0,
  },
});
