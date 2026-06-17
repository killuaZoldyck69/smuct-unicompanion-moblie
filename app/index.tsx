// app/index.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Image, Animated } from "react-native";
import { useRouter, useRootNavigationState } from "expo-router";
import { colors } from "../src/theme/colors";
import { typography } from "../src/theme/typography";
import { spacing } from "../src/theme/layout";

export default function SplashScreen() {
  const router = useRouter();

  const rootNavigationState = useRootNavigationState();

  const [isTimerFinished, setIsTimerFinished] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => {
      setIsTimerFinished(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isTimerFinished && rootNavigationState?.key) {
      router.replace("/(auth)/login");
    }
  }, [isTimerFinished, rootNavigationState?.key]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Image
          source={require("../src/assets/logo.jpg")}
          style={styles.logo}
          resizeMode="contain"
        />
        {/* Custom Linear Progress Bar matching the mockup */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[styles.progressBarFill, { width: progressWidth }]}
          />
        </View>
      </View>
      <Text style={styles.brandText}>UNICOMPANION</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 60,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: spacing.stackLg,
  },
  progressBarContainer: {
    width: 120,
    height: 4,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primaryContainer,
  },
  brandText: {
    ...typography.labelMd,
    color: colors.primaryContainer,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
