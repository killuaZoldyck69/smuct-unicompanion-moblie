import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {} from "expo-status-bar"; // 👈 1. Import StatusBar

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
      {/* 👇 2. Add this to make the top bar transparent and icons dark 👇 */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Centered Content */}
      <View style={styles.centerContent}>
        {/* Soft Bento Image Container */}
        <View style={styles.imageBentoBox}>
          <Image
            source={require("../src/assets/splash-screen.png")}
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
    </View>
  );
}

// --- ISOLATED NEW DESIGN THEME (Soft Campus Bento) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fb", // This will now stretch cleanly behind the transparent status bar!
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
    color: "#131b2e",
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 18,
    fontWeight: "500",
    color: "#45464d",
    textAlign: "center",
  },
  bottomContainer: {
    width: "100%",
    paddingHorizontal: 20,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#131b2e",
    borderRadius: 9999,
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
    color: "#ffffff",
  },
  secondaryButton: {
    backgroundColor: "#c1dcff",
    borderRadius: 9999,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "700",
    color: "#131b2e",
  },
});
