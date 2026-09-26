import { Platform } from "react-native";
import api from "./api";

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

/**
 * Standard project folder structure for Cloudinary media assets.
 * Keeps all files under "smuct-unicompanion" organized by feature.
 */
export const CLOUDINARY_FOLDERS = {
  PROJECT_ROOT: "smuct-unicompanion",
  CAMPUS_HUB: {
    ROOT: "smuct-unicompanion/campus-hub",
    MEMES: "smuct-unicompanion/campus-hub/memes",
    LOST_FOUND: "smuct-unicompanion/campus-hub/lost-found",
    LOST_FOUND_CLAIMS: "smuct-unicompanion/campus-hub/lost-found/claims",
    MARKETPLACE: "smuct-unicompanion/campus-hub/marketplace",
    FORUM: "smuct-unicompanion/campus-hub/forum",
  },
  PROFILES: "smuct-unicompanion/profiles",
  NOTICES: "smuct-unicompanion/notices",
  BLOOD: "smuct-unicompanion/blood",
  HUBS: "smuct-unicompanion/hubs",
} as const;

export type CloudinaryFolder =
  | (typeof CLOUDINARY_FOLDERS.CAMPUS_HUB)[keyof typeof CLOUDINARY_FOLDERS.CAMPUS_HUB]
  | typeof CLOUDINARY_FOLDERS.PROFILES
  | typeof CLOUDINARY_FOLDERS.NOTICES
  | typeof CLOUDINARY_FOLDERS.BLOOD
  | typeof CLOUDINARY_FOLDERS.HUBS
  | typeof CLOUDINARY_FOLDERS.PROJECT_ROOT
  | (string & {});

export function getMimeType(filename: string): string {
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

export async function createSingleImageFormData(
  localUri: string,
  fieldName: string = "image"
): Promise<FormData> {
  const filename = localUri.split("/").pop() ?? `upload-${Date.now()}.jpg`;
  const type = getMimeType(filename);
  const formData = new FormData();

  if (Platform.OS === "web") {
    const response = await fetch(localUri);
    const blob = await response.blob();
    formData.append(fieldName, blob, filename);
  } else {
    formData.append(fieldName, {
      uri: localUri,
      name: filename,
      type,
    } as any);
  }

  return formData;
}

/**
 * Uploads a single image to Cloudinary securely via the backend API.
 */
export async function uploadImageToCloudinary(
  localUri: string,
  folder: CloudinaryFolder = CLOUDINARY_FOLDERS.PROJECT_ROOT
): Promise<CloudinaryUploadResult> {
  if (!localUri || typeof localUri !== "string" || !localUri.trim()) {
    throw new Error("Invalid image URI provided.");
  }

  const formData = await createSingleImageFormData(localUri, "image");
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
  folder: CloudinaryFolder = CLOUDINARY_FOLDERS.PROJECT_ROOT
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

export interface CloudinaryDocumentUploadResult {
  secureUrl: string;
  publicId: string;
  name: string;
  size?: number;
  type?: string;
}

/**
 * Uploads a single document or generic file to Cloudinary securely via the backend API.
 */
export async function uploadFileToCloudinary(
  localUri: string,
  filename?: string,
  mimeType?: string,
  folder: CloudinaryFolder = CLOUDINARY_FOLDERS.HUBS
): Promise<CloudinaryDocumentUploadResult> {
  if (!localUri || typeof localUri !== "string" || !localUri.trim()) {
    throw new Error("Invalid file URI provided.");
  }

  const name = filename || localUri.split("/").pop() || `file-${Date.now()}`;
  const type = mimeType || "application/octet-stream";

  const formData = new FormData();
  if (Platform.OS === "web") {
    const res = await fetch(localUri);
    const blob = await res.blob();
    formData.append("file", blob, name);
  } else {
    formData.append("file", {
      uri: localUri,
      name,
      type,
    } as any);
  }
  formData.append("folder", folder);

  const response = await api.post("/upload/file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const data = response.data?.data;
  if (!data?.secureUrl) {
    throw new Error(response.data?.message ?? "File upload failed");
  }

  return {
    secureUrl: data.secureUrl,
    publicId: data.publicId ?? "",
    name: data.originalName || name,
    size: data.size,
    type: data.format || type,
  };
}

/**
 * Uploads multiple files (documents or images) to Cloudinary via backend.
 */
export async function uploadMultipleFilesToCloudinary(
  files: { uri: string; name?: string; mimeType?: string; size?: number }[],
  folder: CloudinaryFolder = CLOUDINARY_FOLDERS.HUBS
): Promise<CloudinaryDocumentUploadResult[]> {
  if (!files || files.length === 0) return [];

  const formData = new FormData();
  for (const f of files) {
    const name = f.name || f.uri.split("/").pop() || `file-${Date.now()}`;
    const type = f.mimeType || "application/octet-stream";

    if (Platform.OS === "web") {
      const res = await fetch(f.uri);
      const blob = await res.blob();
      formData.append("files", blob, name);
    } else {
      formData.append("files", {
        uri: f.uri,
        name,
        type,
      } as any);
    }
  }
  formData.append("folder", folder);

  const response = await api.post("/upload/files", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const list = response.data?.data;
  if (!Array.isArray(list)) {
    throw new Error(response.data?.message ?? "Multiple file upload failed");
  }

  return list.map((item: any, idx: number) => ({
    secureUrl: item.secureUrl,
    publicId: item.publicId ?? "",
    name: item.originalName || files[idx]?.name || "file",
    size: item.size || files[idx]?.size,
    type: item.format || files[idx]?.mimeType,
  }));
}
