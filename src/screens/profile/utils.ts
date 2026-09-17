import { Linking, Platform, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";
import { authClient } from "@/services/auth-client";

/**
 * Splits a number into its numeric string and ordinal suffix (e.g. 9 -> { number: "9", suffix: "th" }).
 * Enables pixel-perfect superscript rendering across all platforms.
 */
export const splitOrdinal = (
  num: number | string
): { number: string; suffix: string } => {
  const n = typeof num === "string" ? parseInt(num, 10) : num;
  if (isNaN(n)) return { number: String(num), suffix: "" };
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  const suffix = s[(v - 20) % 10] || s[v] || s[0];
  return { number: String(n), suffix };
};

export const getOrdinalSuffix = (num: number | string): string => {
  const { number, suffix } = splitOrdinal(num);
  return `${number}${suffix}`;
};

/**
 * Formats a phone number for clean readability.
 * E.g., "01712345678" -> "01712-345678"
 *       "+8801712345678" -> "+880 1712-345678"
 */
export const formatPhoneNumber = (phone?: string | null): string => {
  if (!phone) return "Not provided";
  const cleaned = phone.replace(/[\s-]/g, "");

  // Bangladesh format with country code (+880 1XXX-XXXXXX)
  if (cleaned.startsWith("+880") && cleaned.length === 14) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
  }
  // Local 11-digit Bangladesh mobile (01XXX-XXXXXX)
  if (cleaned.startsWith("01") && cleaned.length === 11) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return phone;
};

/**
 * Sanitizes URLs to prevent dev/local IP addresses from polluting the UI.
 * Returns empty if no link is provided or if it's a dev IP address.
 */
export const resolveSocialUrl = (
  url?: string | null,
  _type?: "linkedin" | "website",
  _userName?: string
): { displayUrl: string; isValid: boolean; isPlaceholder: boolean } => {
  if (!url || !url.trim()) {
    return {
      displayUrl: "",
      isValid: false,
      isPlaceholder: false,
    };
  }

  const trimmed = url.trim();
  const isLocalDevUrl =
    /192\.168\.\d+\.\d+/i.test(trimmed) ||
    /localhost/i.test(trimmed) ||
    /127\.0\.0\.1/i.test(trimmed) ||
    /:8081/i.test(trimmed);

  if (isLocalDevUrl) {
    return {
      displayUrl: "",
      isValid: false,
      isPlaceholder: false,
    };
  }

  const normalizedUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return { displayUrl: normalizedUrl, isValid: true, isPlaceholder: false };
};

export const resolvePersonalWebsite = (
  url?: string | null,
  userName?: string
): { displayUrl: string; isValid: boolean; isPlaceholder: boolean } => {
  return resolveSocialUrl(url, "website", userName);
};

/**
 * Extracts a friendly display label for long links (e.g. "https://linkedin.com/in/nahid" -> "linkedin.com/in/nahid")
 */
export const formatFriendlyLink = (url?: string | null): string => {
  if (!url || !url.trim()) return "";
  return url.trim().replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
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
