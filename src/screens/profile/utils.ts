import { Linking, Platform, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";
import { authClient } from "@/services/auth-client";

export const getOrdinalSuffix = (num: number | string): string => {
  const n = typeof num === "string" ? parseInt(num, 10) : num;
  if (isNaN(n)) return String(num);
  const s = ["ᵗʰ", "ˢᵗ", "ⁿᵈ", "ʳᵈ"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const safeOpenURL = async (url?: string | null): Promise<void> => {
  if (!url || typeof url !== "string") return;

  const trimmed = url.trim();
  if (!trimmed) return;

  // Security guard: ensure URL starts with http:// or https:// to prevent malicious schemes
  let validUrl = trimmed;
  if (!/^https?:\/\//i.test(trimmed)) {
    validUrl = `https://${trimmed}`;
  }

  try {
    const canOpen = await Linking.canOpenURL(validUrl);
    if (canOpen) {
      await Linking.openURL(validUrl);
    } else {
      Toast.show({
        type: "error",
        text1: "Cannot Open URL",
        text2: "The specified link is not supported.",
      });
    }
  } catch {
    Toast.show({
      type: "error",
      text1: "Error Opening Link",
      text2: "Unable to open the destination URL.",
    });
  }
};

export const performLogout = async (
  router: { replace: (href: any) => void },
  queryClient: { setQueryData: (key: any, data: any) => void; clear: () => void }
): Promise<void> => {
  try {
    await authClient.signOut();
    if (Platform.OS !== "web") {
      await SecureStore.deleteItemAsync("better-auth.session_token");
      await SecureStore.deleteItemAsync("better-auth_cookie");
      await SecureStore.deleteItemAsync("better-auth_session_data");
    }
    queryClient.setQueryData(["currentUser"], null);
    queryClient.clear();
    router.replace("/(auth)/login");
  } catch {
    Toast.show({
      type: "error",
      text1: "Sign Out Error",
      text2: "An error occurred while logging out. Please try again.",
    });
  }
};

export const confirmLogout = (onConfirm: () => void): void => {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm("Are you sure you want to log out?")) {
      onConfirm();
    }
  } else {
    Alert.alert("Log Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: onConfirm },
    ]);
  }
};
