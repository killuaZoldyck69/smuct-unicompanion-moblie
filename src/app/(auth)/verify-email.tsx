import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { authClient } from "@/services/auth-client";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string>(
    "Invalid or expired verification link.",
  );

  useEffect(() => {
    let timeoutId: any;

    const verify = async () => {
      if (!token) {
        setStatus("error");
        setErrorMessage("No verification token found in link.");
        return;
      }

      try {
        const { error } = await authClient.verifyEmail({
          query: { token },
        });

        if (error) throw new Error(error.message);

        setStatus("success");
        Toast.show({
          type: "success",
          text1: "Email Verified",
          text2: "Your email has been verified successfully.",
        });

        // Auto-redirect to login after 2.5 seconds
        timeoutId = setTimeout(() => {
          router.replace("/(auth)/login");
        }, 2500);
      } catch (error: any) {
        setStatus("error");
        setErrorMessage(
          error?.message || "Invalid or expired verification link.",
        );
        Toast.show({
          type: "error",
          text1: "Verification Failed",
          text2: error.message,
        });
      }
    };

    verify();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [token, router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {status === "loading" && (
          <View style={styles.card}>
            <View style={[styles.iconCircle, styles.loadingCircle]}>
              <ActivityIndicator size="large" color="#131b2e" />
            </View>
            <Text style={styles.title}>Verifying Email</Text>
            <Text style={styles.subtitle}>
              Please wait while we verify your academic account...
            </Text>
          </View>
        )}

        {status === "success" && (
          <View style={styles.card}>
            <View style={[styles.iconCircle, styles.successCircle]}>
              <Feather name="check-circle" size={48} color="#065f46" />
            </View>
            <Text style={styles.title}>Email Verified!</Text>
            <Text style={styles.subtitle}>
              Your account has been successfully verified. Redirecting you to sign in...
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace("/(auth)/login")}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Continue to Sign In"
            >
              <Text style={styles.primaryButtonText}>Continue to Sign In</Text>
              <Feather name="arrow-right" size={18} color="#ffffff" style={styles.btnIcon} />
            </TouchableOpacity>
          </View>
        )}

        {status === "error" && (
          <View style={styles.card}>
            <View style={[styles.iconCircle, styles.errorCircle]}>
              <Feather name="alert-triangle" size={48} color="#991b1b" />
            </View>
            <Text style={styles.title}>Verification Failed</Text>
            <Text style={styles.subtitle}>{errorMessage}</Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace("/(auth)/login")}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Back to Sign In"
            >
              <Text style={styles.primaryButtonText}>Back to Sign In</Text>
              <Feather name="arrow-right" size={18} color="#ffffff" style={styles.btnIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.replace("/(auth)/register")}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Create New Account"
            >
              <Text style={styles.secondaryButtonText}>Create New Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fb",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  loadingCircle: {
    backgroundColor: "#e0f2fe",
  },
  successCircle: {
    backgroundColor: "#d1fae5",
  },
  errorCircle: {
    backgroundColor: "#fee2e2",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#131b2e",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#45464d",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: "#131b2e",
    borderRadius: 9999,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  btnIcon: {
    marginLeft: 8,
  },
  secondaryButton: {
    width: "100%",
    backgroundColor: "#f2f4f6",
    borderRadius: 9999,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#131b2e",
  },
});
