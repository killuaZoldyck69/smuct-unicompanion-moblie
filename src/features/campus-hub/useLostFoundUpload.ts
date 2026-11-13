import { useCallback, useRef, useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import Toast from "react-native-toast-message";
import { extractApiErrorInfo } from "@/features/forum/forum-logic";
import { LOST_FOUND_LIMITS } from "@/features/campus-hub/lost-found-logic";
import { useAcceptUgcTerms } from "@/features/ugc/useUgcModeration";
import {
  deleteFileFromCloudinaryApi,
  uploadMultipleImages,
  type CloudinaryFolder,
} from "@/services/cloudinary-service";

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
): Promise<string | null> {
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
        info.size > LOST_FOUND_LIMITS.MAX_IMAGE_BYTES
      ) {
        return localUris.length === 1
          ? `${singlePhotoLabel} exceeds 5MB limit. Please choose a smaller photo.`
          : `Photo ${i + 1} exceeds the 5MB size limit. Please choose a smaller photo.`;
      }
    } catch (err) {
      console.warn("[LostFound] Unable to verify local photo size:", err);
    }
  }

  return null;
}

export async function uploadPendingLostFoundImages(params: {
  uris: string[];
  uploadedMap: Record<string, string>;
  folder: CloudinaryFolder;
  singlePhotoLabel?: string;
  uploadErrorTitle?: string;
  uploadErrorFallback?: string;
  setIsUploading: (uploading: boolean) => void;
  setUploadedMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}): Promise<Record<string, string> | null> {
  const {
    uris,
    uploadedMap,
    folder,
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

  const sizeError = await validateLocalImageSizes(
    pendingLocalUris,
    singlePhotoLabel,
  );
  if (sizeError) {
    Toast.show({ type: "error", text1: "Photo Exceeds 5MB", text2: sizeError });
    return null;
  }

  setIsUploading(true);
  try {
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
  setUploadedMap: React.Dispatch<React.SetStateAction<Record<string, string>>>,
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

export function useUgcTermsRetry<TPayload>(userId: string | undefined) {
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

  const handleUgcError = useCallback((err: unknown): boolean => {
    if (extractApiErrorInfo(err, "").code === "UGC_TERMS_REQUIRED") {
      setShowGuidelines(true);
      return true;
    }
    return false;
  }, []);

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
