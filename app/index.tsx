import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // --- Animation Setup ---
  // Create 5 separate animated values for independent floating effects
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;
  const anim4 = useRef(new Animated.Value(0)).current;
  const anim5 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Helper function to create a continuous floating loop
    const createFloatAnimation = (
      animatedValue: Animated.Value,
      duration: number,
      distance: number,
    ) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: distance,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    // Start all animations with slightly different timings/distances for an organic feel
    createFloatAnimation(anim1, 2000, -8); // Purple Calendar
    createFloatAnimation(anim2, 2300, 6); // Blue Cap
    createFloatAnimation(anim3, 1800, -6); // Green File
    createFloatAnimation(anim4, 2500, 8); // Pink Chart
    createFloatAnimation(anim5, 2100, -5); // Yellow Star
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom + 16, 40),
        },
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <View style={styles.centerContent}>
        {/* ANIMATED BENTO GRID */}
        <View style={styles.gridContainer}>
          {/* 1. Purple Calendar */}
          <Animated.View
            style={[
              styles.bentoBlock,
              styles.purpleBlock,
              { transform: [{ translateY: anim1 }] },
            ]}
          >
            <Feather name="calendar" size={40} color="#a855f7" />
          </Animated.View>

          {/* 2. Blue Cap/Book */}
          <Animated.View
            style={[
              styles.bentoBlock,
              styles.blueBlock,
              { transform: [{ translateY: anim2 }] },
            ]}
          >
            {/* Using book-open as a placeholder for the academic hat */}
            <Feather name="book-open" size={28} color="#0284c7" />
          </Animated.View>

          {/* 3. Green File */}
          <Animated.View
            style={[
              styles.bentoBlock,
              styles.greenBlock,
              { transform: [{ translateY: anim3 }] },
            ]}
          >
            <Feather name="file-text" size={40} color="#059669" />
          </Animated.View>

          {/* 4. Pink Chart */}
          <Animated.View
            style={[
              styles.bentoBlock,
              styles.pinkBlock,
              { transform: [{ translateY: anim4 }] },
            ]}
          >
            <Feather name="pie-chart" size={44} color="#e11d48" />
          </Animated.View>

          {/* 5. Yellow Star */}
          <Animated.View
            style={[
              styles.bentoBlock,
              styles.yellowBlock,
              { transform: [{ translateY: anim5 }] },
            ]}
          >
            <Feather name="star" size={24} color="#b45309" />
          </Animated.View>
        </View>

        {/* TYPOGRAPHY */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>UniCompanion</Text>
          <Text style={styles.subtitle}>
            Your academic journey,{"\n"}beautifully organized.
          </Text>
        </View>
      </View>

      {/* ACTION BUTTON */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <Feather
            name="arrow-right"
            size={20}
            color="#ffffff"
            style={styles.btnIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- ISOLATED NEW DESIGN THEME (Soft Campus Bento) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fb", // Soft off-white
    justifyContent: "space-between",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 20,
  },

  // --- GRID STYLES ---
  gridContainer: {
    width: 260,
    height: 260,
    position: "relative",
    marginBottom: 40,
  },
  bentoBlock: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  purpleBlock: {
    top: 0,
    left: 10,
    width: 110,
    height: 110,
    backgroundColor: "#f3e8ff",
    borderRadius: 32,
  },
  pinkBlock: {
    top: 120,
    left: 10,
    width: 110,
    height: 110,
    backgroundColor: "#ffe4e6",
    borderRadius: 32,
  },
  blueBlock: {
    top: 0,
    left: 130,
    width: 110,
    height: 64,
    backgroundColor: "#e0f2fe",
    borderRadius: 24,
  },
  greenBlock: {
    top: 74,
    left: 130,
    width: 110,
    height: 110,
    backgroundColor: "#d1fae5",
    borderRadius: 32,
  },
  yellowBlock: {
    top: 194,
    left: 130,
    width: 56,
    height: 56,
    backgroundColor: "#fef08a",
    borderRadius: 28, // Perfect circle
  },

  // --- TYPOGRAPHY ---
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.8,
    color: "#131b2e",
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 18,
    fontWeight: "500",
    color: "#45464d",
    textAlign: "center",
    lineHeight: 26, // Improves multi-line readability
  },

  // --- BUTTON ---
  bottomContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: "#131b2e",
    borderRadius: 9999,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  btnIcon: {
    marginLeft: 8,
  },
});
