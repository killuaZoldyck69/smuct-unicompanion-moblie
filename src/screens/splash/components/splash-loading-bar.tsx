import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { SPLASH_COLORS, SPLASH_DURATION_MS } from "../constants";
import { SplashLoadingBarProps } from "../types";

const BAR_WIDTH = 170;
const BAR_HEIGHT = 5;

export const SplashLoadingBar = React.memo(function SplashLoadingBar({
  durationMs = SPLASH_DURATION_MS,
  onComplete,
}: SplashLoadingBarProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: durationMs,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished && onComplete) {
        onComplete();
      }
    });

    return () => {
      animation.stop();
    };
  }, [durationMs, onComplete, progressAnim]);

  // Translate from -BAR_WIDTH to 0 for a performant native-driven fill
  const translateX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-BAR_WIDTH, 0],
  });

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel="Splash Screen Loading"
    >
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  track: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    backgroundColor: SPLASH_COLORS.progressTrack,
    borderRadius: BAR_HEIGHT / 2,
    overflow: "hidden",
  },
  fill: {
    width: BAR_WIDTH,
    height: "100%",
    backgroundColor: SPLASH_COLORS.progressBar,
    borderRadius: BAR_HEIGHT / 2,
  },
});
