import { Platform } from "react-native";
import api from "./api";

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "heic":
      return "image/heic";
    case "jpg":
    case "jpeg":
    default:
      return "image/jpeg";
  }
}

/**
 * Uploads a single image to Cloudinary securely via the backend API.
 */
export async function uploadImageToCloudinary(
  localUri: string,
  folder: string = "unicompanion"
): Promise<CloudinaryUploadResult> {
  if (!localUri || typeof localUri !== "string" || !localUri.trim()) {
    throw new Error("Invalid image URI provided.");
  }

  const filename = localUri.split("/").pop() ?? "upload.jpg";
  const type = getMimeType(filename);

  const formData = new FormData();

  if (Platform.OS === "web") {
    const response = await fetch(localUri);
    const blob = await response.blob();
    formData.append("image", blob, filename);
  } else {
    formData.append("image", {
      uri: localUri,
      name: filename,
      type,
    } as any);
  }

  formData.append("folder", folder);

  const response = await api.post("/upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const data = response.data?.data;
  if (!data?.secureUrl) {
    throw new Error(response.data?.message ?? "Image upload failed");
  }

  return {
    secureUrl: data.secureUrl,
    publicId: data.publicId ?? "",
  };
}

/**
 * Uploads multiple images in a single batch to Cloudinary securely via the backend API.
 */
export async function uploadMultipleImages(
  localUris: string[],
  folder: string = "unicompanion"
): Promise<CloudinaryUploadResult[]> {
  if (!localUris || localUris.length === 0) {
    return [];
  }

  const formData = new FormData();

  for (const uri of localUris) {
    if (!uri || typeof uri !== "string" || !uri.trim()) {
      continue;
    }

    const filename = uri.split("/").pop() ?? "upload.jpg";
    const type = getMimeType(filename);

    if (Platform.OS === "web") {
      const res = await fetch(uri);
      const blob = await res.blob();
      formData.append("images", blob, filename);
    } else {
      formData.append("images", {
        uri,
        name: filename,
        type,
      } as any);
    }
  }

  formData.append("folder", folder);

  const response = await api.post("/upload/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const list = response.data?.data;
  if (!Array.isArray(list)) {
    throw new Error(response.data?.message ?? "Multiple image upload failed");
  }

  return list.map((item: any) => ({
    secureUrl: item.secureUrl,
    publicId: item.publicId ?? "",
  }));
}
