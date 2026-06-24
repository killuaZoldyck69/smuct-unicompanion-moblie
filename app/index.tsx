// app/index.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";

export default function SplashScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Centered Content */}
      <View style={styles.centerContent}>
        {/* Soft Bento Image Container */}
        <View style={styles.imageBentoBox}>
          <Image
            // Make sure your new book illustration is saved here!
            source={require("../src/assets/logo.jpg")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Typography updated to new theme */}
        <Text style={styles.title}>UniCompanion</Text>
        <Text style={styles.subtitle}>developed by ...</Text>
      </View>

      {/* Action Buttons Container */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/(auth)/register")}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- ISOLATED NEW DESIGN THEME (Soft Campus Bento) ---
// Hardcoded here to prevent crashing other screens that rely on the old theme files.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fb", // surface-bright
    justifyContent: "space-between",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 40,
  },
  imageBentoBox: {
    backgroundColor: "transparent",
    padding: 32,
    marginBottom: 24,
  },
  logo: {
    width: 240,
    height: 240,
  },
  title: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -0.64,
    color: "#131b2e", // primary-container (Deep Navy)
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 18,
    fontWeight: "500",
    color: "#45464d", // on-surface-variant
    textAlign: "center",
  },
  bottomContainer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16, // Spacing between buttons
  },
  primaryButton: {
    backgroundColor: "#131b2e", // primary-container
    borderRadius: 9999, // Pill shape
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  primaryButtonText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff", // on-primary
  },
  secondaryButton: {
    backgroundColor: "#c1dcff", // secondary-container (Pastel Blue)
    borderRadius: 9999, // Pill shape
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "700",
    color: "#131b2e", // Deep Navy text for contrast
  },
});
