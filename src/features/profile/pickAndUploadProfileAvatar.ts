import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

export const MAX_PROFILE_AVATAR_BYTES = 3 * 1024 * 1024;

export interface PickAvatarOptions {
  isOffline: boolean;
  onUpload: (uri: string) => Promise<void>;
}

async function resolveAssetByteSize(asset: ImagePicker.ImagePickerAsset): Promise<number | null> {
  if (typeof asset.fileSize === "number" && asset.fileSize > 0) {
    return asset.fileSize;
  }

  if (Platform.OS !== "web") {
    try {
      const info = await FileSystem.getInfoAsync(asset.uri);
      if (info.exists && typeof info.size === "number") {
        return info.size;
      }
    } catch {
      // Fallback below
    }
  } else if (typeof fetch === "function") {
    try {
      const blob = await fetch(asset.uri).then((res) => res.blob());
      if (typeof blob.size === "number") {
        return blob.size;
      }
    } catch {
      // Non-fatal; backend also enforces 3 MB limit
    }
  }

  return null;
}

/**
 * Shared profile avatar picker with offline check, permission prompt,
 * square crop compression (`quality: 0.65`), and strict < 3 MB pre-upload check.
 */
export async function pickAndUploadProfileAvatar({
  isOffline,
  onUpload,
}: PickAvatarOptions): Promise<string | null> {
  if (isOffline) {
    Toast.show({
      type: "error",
      text1: "You Are Offline",
      text2: "Connect to the internet before changing your profile photo.",
    });
    return null;
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Toast.show({
      type: "error",
      text1: "Permission Required",
      text2: "Please allow access to your photo library to update your avatar.",
    });
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.65,
  });

  if (result.canceled || !result.assets?.[0]?.uri) {
    return null;
  }

  const asset = result.assets[0];
  const fileSize = await resolveAssetByteSize(asset);
  if (fileSize !== null && fileSize >= MAX_PROFILE_AVATAR_BYTES) {
    const sizeMb = (fileSize / (1024 * 1024)).toFixed(1);
    Toast.show({
      type: "error",
      text1: "Image Too Large",
      text2: `Selected image is ${sizeMb} MB. Please choose a photo under 3 MB.`,
      visibilityTime: 4500,
    });
    return null;
  }

  await onUpload(asset.uri);
  return asset.uri;
}
