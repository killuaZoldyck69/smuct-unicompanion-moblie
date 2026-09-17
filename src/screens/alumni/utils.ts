import { Linking, Platform, Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import { AVATAR_PALETTES } from "./constants";
import { DeptTheme, AvatarTheme, AlumniItem } from "./types";

export const getDeptTheme = (dept?: string | null): DeptTheme => {
  const d = (dept || "").toLowerCase();
  if (d.includes("cse") || d.includes("computer")) {
    return { bg: "#dbeafe", border: "#bfdbfe", text: "#2563eb", badge: "CSE" };
  }
  if (d.includes("civil")) {
    return { bg: "#fef3c7", border: "#fde68a", text: "#b45309", badge: "Civil" };
  }
  if (d.includes("eee") || d.includes("electrical")) {
    return { bg: "#ccfbf1", border: "#99f6e4", text: "#0f766e", badge: "EEE" };
  }
  if (d.includes("bba") || d.includes("business")) {
    return { bg: "#fce7f3", border: "#fbcfe8", text: "#be185d", badge: "BBA" };
  }
  if (d.includes("textile")) {
    return { bg: "#fdf2f8", border: "#fbcfe8", text: "#db2777", badge: "Textile" };
  }
  if (d.includes("fashion") || d.includes("apparel")) {
    return { bg: "#fff1f2", border: "#fecdd3", text: "#e11d48", badge: "Fashion" };
  }
  if (d.includes("law")) {
    return { bg: "#f0fdfa", border: "#99f6e4", text: "#0d9488", badge: "Law" };
  }
  return { bg: "#f1f5f9", border: "#e2e8f0", text: "#475569", badge: dept || "Alumni" };
};


export const getAvatarTheme = (
  name?: string | null,
  dept?: string | null,
): AvatarTheme => {
  if (dept) {
    const d = dept.toLowerCase();
    if (d.includes("cse") || d.includes("computer")) return AVATAR_PALETTES[0];
    if (d.includes("bba") || d.includes("business")) return AVATAR_PALETTES[1];
    if (d.includes("civil")) return AVATAR_PALETTES[2];
    if (d.includes("eee") || d.includes("electrical")) return AVATAR_PALETTES[3];
    if (d.includes("textile")) return AVATAR_PALETTES[4];
    if (d.includes("fashion")) return AVATAR_PALETTES[7];
    if (d.includes("law")) return AVATAR_PALETTES[5];
  }
  let hash = 0;
  const str = name || "Alumni";
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
};

export const getInitials = (name?: string | null): string => {
  if (!name) return "AL";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ALLOWED_PROTOCOLS = ["https:", "http:", "mailto:", "tel:"];

export const openSafeLink = async (url?: string | null): Promise<void> => {
  if (!url || typeof url !== "string") return;
  const trimmed = url.trim();
  if (!trimmed) return;

  let targetUrl = trimmed;
  if (
    !targetUrl.startsWith("http://") &&
    !targetUrl.startsWith("https://") &&
    !targetUrl.startsWith("mailto:") &&
    !targetUrl.startsWith("tel:")
  ) {
    targetUrl = `https://${targetUrl}`;
  }

  try {
    const parsed = new URL(targetUrl);
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      Toast.show({
        type: "error",
        text1: "Security Warning",
        text2: "Blocked unsafe link protocol.",
      });
      return;
    }

    const canOpen = await Linking.canOpenURL(targetUrl);
    if (canOpen) {
      await Linking.openURL(targetUrl);
    } else {
      Toast.show({
        type: "error",
        text1: "Cannot Open Link",
        text2: targetUrl,
      });
    }
  } catch {
    Toast.show({
      type: "error",
      text1: "Invalid URL",
      text2: "Unable to process the requested link.",
    });
  }
};

export const copyToClipboard = async (
  text: string,
  label = "Item",
): Promise<void> => {
  if (!text) return;
  try {
    await Clipboard.setStringAsync(text);
    Toast.show({
      type: "success",
      text1: `${label} Copied`,
      text2: `${text} copied to clipboard!`,
    });
  } catch {
    Toast.show({
      type: "error",
      text1: "Copy Failed",
      text2: "Please copy manually.",
    });
  }
};

export const shareAlumniProfile = async (alumni: AlumniItem): Promise<void> => {
  const role =
    alumni.currentPosition || alumni.designation || alumni.currentRole || "Graduate";
  const company = alumni.currentCompany ? ` at ${alumni.currentCompany}` : "";
  const dept = alumni.department ? ` (${alumni.department})` : "";
  const linkedIn = alumni.linkedInUrl || alumni.linkedinUrl;

  const message = `Check out SMUCT Alumni: ${alumni.name}${dept} - ${role}${company}.${
    linkedIn ? ` LinkedIn: ${linkedIn}` : ""
  }`;

  try {
    if (Platform.OS === "web") {
      await Clipboard.setStringAsync(message);
      Toast.show({
        type: "success",
        text1: "Profile Copied",
        text2: "Alumni profile details copied to clipboard!",
      });
    } else {
      await Share.share({
        title: `${alumni.name} - SMUCT Alumni`,
        message,
      });
    }
  } catch {
    // User cancelled or dismissed
  }
};
