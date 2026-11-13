import { useCallback, useRef, useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import Toast from "react-native-toast-message";
import { extractApiErrorInfo } from "@/features/forum/forum-logic";
import { LOST_FOUND_LIMITS } from "@/features/campus-hub/lost-found-logic";
import { useAcceptUgcTerms } from "@/features/ugc/useUgcModeration";
import { deleteFileFromCloudinaryApi } from "@/services/cloudinary-service";

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

export function useUgcTermsRetry<TPayload>(
  userId: string | undefined,
  submitPayload: (payload: TPayload) => void,
) {
  const [showGuidelines, setShowGuidelines] = useState(false);
  const pendingPayloadRef = useRef<TPayload | null>(null);
  const acceptTermsMutation = useAcceptUgcTerms(userId);

  const queuePayload = useCallback((payload: TPayload) => {
    pendingPayloadRef.current = payload;
  }, []);

  const clearQueuedPayload = useCallback(() => {
    pendingPayloadRef.current = null;
  }, []);

  const handleUgcError = useCallback((err: unknown): boolean => {
    const info = extractApiErrorInfo(err, "");
    if (info.code === "UGC_TERMS_REQUIRED") {
      setShowGuidelines(true);
      return true;
    }
    return false;
  }, []);

  const acceptGuidelines = useCallback(() => {
    acceptTermsMutation.mutate(undefined, {
      onSuccess: () => {
        setShowGuidelines(false);
        const queued = pendingPayloadRef.current;
        if (queued) {
          submitPayload(queued);
        }
      },
      onError: (err) => {
        const info = extractApiErrorInfo(err, "Could not accept guidelines.");
        Toast.show({
          type: "error",
          text1: "Agreement Failed",
          text2: info.message,
        });
      },
    });
  }, [acceptTermsMutation, submitPayload]);

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
