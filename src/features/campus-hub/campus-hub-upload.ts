import { useCallback, useRef, useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import Toast from "react-native-toast-message";
import { extractApiErrorInfo } from "@/features/forum/forum-logic";
import { useAcceptUgcTerms } from "@/features/ugc/useUgcModeration";
import {
  deleteFileFromCloudinaryApi,
  uploadMultipleImages,
  type CloudinaryFolder,
} from "@/services/cloudinary-service";

const DEFAULT_MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type UploadedUrlMapUpdater =
  | Record<string, string>
  | ((prev: Record<string, string>) => Record<string, string>);

export function requireOnline(isOffline: boolean, offlineMessage: string): boolean {
  if (!isOffline) return true;
  Toast.show({
    type: "error",
    text1: "You're Offline",
    text2: offlineMessage,
  });
  return false;
}

export function scheduleSuccessToast(text1: string, text2?: string): void {
  // Delay slightly so modal dismissal animations settle before showing the toast.
  setTimeout(() => {
    Toast.show({ type: "success", text1, text2 });
  }, 350);
}

export function showApiErrorToast(
  err: unknown,
  title: string,
  fallbackMessage: string,
): void {
  const info = extractApiErrorInfo(err, fallbackMessage);
  Toast.show({ type: "error", text1: title, text2: info.message });
}

export async function validateLocalImageSizes(
  uris: string[],
  singlePhotoLabel = "Photo",
  options?: { maxBytes?: number; logTag?: string },
): Promise<string | null> {
  const maxBytes = options?.maxBytes ?? DEFAULT_MAX_IMAGE_BYTES;
  const maxMb = Math.round(maxBytes / (1024 * 1024));
  const logTag = options?.logTag ?? "CampusHub";
  const localUris = uris.filter(
    (uri) => !uri.startsWith("http://") && !uri.startsWith("https://"),
  );

  for (let i = 0; i < localUris.length; i++) {
    try {
      const info = await FileSystem.getInfoAsync(localUris[i]);
      if (
        info.exists &&
        "size" in info &&
        typeof info.size === "number" &&
        info.size > maxBytes
      ) {
        return localUris.length === 1
          ? `${singlePhotoLabel} exceeds ${maxMb}MB limit. Please choose a smaller photo.`
          : `Photo ${i + 1} exceeds the ${maxMb}MB size limit. Please choose a smaller photo.`;
      }
    } catch (err) {
      console.warn(`[${logTag}] Unable to verify local photo size:`, err);
    }
  }

  return null;
}

export async function uploadPendingImages(params: {
  uris: string[];
  uploadedMap: Record<string, string>;
  folder: CloudinaryFolder;
  maxBytes?: number;
  logTag?: string;
  singlePhotoLabel?: string;
  uploadErrorTitle?: string;
  uploadErrorFallback?: string;
  setIsUploading: (uploading: boolean) => void;
  setUploadedMap: (updater: UploadedUrlMapUpdater) => void;
}): Promise<Record<string, string> | null> {
  const {
    uris,
    uploadedMap,
    folder,
    maxBytes = DEFAULT_MAX_IMAGE_BYTES,
    logTag = "CampusHub",
    singlePhotoLabel,
    uploadErrorTitle = "Image Upload Failed",
    uploadErrorFallback = "Check your connection or try again.",
    setIsUploading,
    setUploadedMap,
  } = params;

  const currentMap = { ...uploadedMap };
  const pendingLocalUris = uris.filter(
    (uri) =>
      !uri.startsWith("http://") &&
      !uri.startsWith("https://") &&
      !currentMap[uri],
  );

  if (pendingLocalUris.length === 0) {
    return currentMap;
  }

  setIsUploading(true);
  try {
    const sizeError = await validateLocalImageSizes(
      pendingLocalUris,
      singlePhotoLabel,
      { maxBytes, logTag },
    );
    if (sizeError) {
      const maxMb = Math.round(maxBytes / (1024 * 1024));
      Toast.show({
        type: "error",
        text1: `Photo Exceeds ${maxMb}MB`,
        text2: sizeError,
      });
      return null;
    }

    const results = await uploadMultipleImages(pendingLocalUris, folder);
    results.forEach((result, idx) => {
      currentMap[pendingLocalUris[idx]] = result.secureUrl;
    });
    setUploadedMap(currentMap);
    return currentMap;
  } catch (err) {
    showApiErrorToast(err, uploadErrorTitle, uploadErrorFallback);
    return null;
  } finally {
    setIsUploading(false);
  }
}

export function deleteRemovedCloudinaryUploads(
  currentImages: string[],
  uploadedMap: Record<string, string>,
  setUploadedMap: (updater: UploadedUrlMapUpdater) => void,
): void {
  const activeSet = new Set(currentImages);
  const removedEntries = Object.entries(uploadedMap).filter(
    ([localUri]) => !activeSet.has(localUri),
  );
  if (removedEntries.length === 0) return;

  for (const [, remoteUrl] of removedEntries) {
    deleteFileFromCloudinaryApi(remoteUrl, "image").catch((err) => {
      console.warn("[Cloudinary] Failed to remove discarded draft image:", err);
    });
  }

  setUploadedMap((prev) => {
    const next = { ...prev };
    for (const [localUri] of removedEntries) {
      delete next[localUri];
    }
    return next;
  });
}

export function useUgcTermsRetry<TPayload>(
  userId: string | undefined,
  requiredErrorCode = "UGC_TERMS_REQUIRED",
) {
  const [showGuidelines, setShowGuidelines] = useState(false);
  const pendingActionRef = useRef<{
    payload: TPayload;
    retry: (payload: TPayload) => void;
  } | null>(null);
  const acceptTermsMutation = useAcceptUgcTerms(userId);

  const queuePayload = useCallback(
    (payload: TPayload, retry: (payload: TPayload) => void) => {
      pendingActionRef.current = { payload, retry };
    },
    [],
  );

  const clearQueuedPayload = useCallback(() => {
    pendingActionRef.current = null;
  }, []);

  const handleUgcError = useCallback(
    (err: unknown): boolean => {
      if (extractApiErrorInfo(err, "").code === requiredErrorCode) {
        setShowGuidelines(true);
        return true;
      }
      return false;
    },
    [requiredErrorCode],
  );

  const acceptGuidelines = useCallback(() => {
    acceptTermsMutation.mutate(undefined, {
      onSuccess: () => {
        setShowGuidelines(false);
        const pending = pendingActionRef.current;
        pendingActionRef.current = null;
        pending?.retry(pending.payload);
      },
      onError: (err) => {
        showApiErrorToast(
          err,
          "Agreement Failed",
          "Could not accept guidelines.",
        );
      },
    });
  }, [acceptTermsMutation]);

  return {
    showGuidelines,
    setShowGuidelines,
    isAcceptingGuidelines: acceptTermsMutation.isPending,
    queuePayload,
    clearQueuedPayload,
    handleUgcError,
    acceptGuidelines,
  };
}
