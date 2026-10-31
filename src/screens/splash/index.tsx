import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SPLASH_COLORS, SPLASH_DURATION_MS } from "./constants";
import { BackgroundDecorations } from "./components/background-decorations";
import { FloatingDots } from "./components/floating-dots";
import { BrandHeader } from "./components/brand-header";
import { SplashLoadingBar } from "./components/splash-loading-bar";
import { useSplashFlow } from "./hooks/use-splash-flow";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Proportional illustration dimensions matching native 1456x1080 aspect ratio
const ILLUSTRATION_ASPECT_RATIO = 1456 / 1080;
const ILLUSTRATION_WIDTH = Math.min(SCREEN_WIDTH * 0.95, 390);
const ILLUSTRATION_HEIGHT = ILLUSTRATION_WIDTH / ILLUSTRATION_ASPECT_RATIO;

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const { handleLoadingComplete, handleSkip } = useSplashFlow();

  // Entrance animations for a buttery-smooth aesthetic
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const contentScaleAnim = useRef(new Animated.Value(0.97)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.spring(contentScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  }, [fadeAnim, contentScaleAnim]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Decorative Pastel Corner Waves & Gradients */}
      <BackgroundDecorations />

      {/* Floating Animated Light Red, Yellow, Blue, Green, Purple Dots */}
      <FloatingDots />

      {/* Main Foreground Interactive Content */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleSkip}
        style={[
          styles.contentWrapper,
          {
            paddingTop: insets.top + (SCREEN_HEIGHT < 700 ? 6 : 14),
            paddingBottom: Math.max(insets.bottom + 12, 28),
          },
        ]}
      >
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: contentScaleAnim }],
            },
          ]}
        >
          {/* Main Visual Group: Brand Header directly coupled with Illustration */}
          <View style={styles.mainContent}>
            <BrandHeader />

            <View style={styles.illustrationWrapper}>
              <Image
                source={require("@/assets/splash-screen-bg.png")}
                style={styles.illustrationImage}
                resizeMode="contain"
                accessible={true}
                accessibilityLabel="Campus life illustration with student and university building"
              />
            </View>
          </View>

          {/* Bottom Loading Bar */}
          <View style={styles.bottomSection}>
            <SplashLoadingBar
              durationMs={SPLASH_DURATION_MS}
              onComplete={handleLoadingComplete}
            />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPLASH_COLORS.background,
  },
  contentWrapper: {
    flex: 1,
    zIndex: 10,
  },
  animatedContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    paddingHorizontal: 8,
  },
  illustrationImage: {
    width: ILLUSTRATION_WIDTH,
    height: ILLUSTRATION_HEIGHT,
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 8,
  },
});
