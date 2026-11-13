import type React from "react";
import { LOST_FOUND_LIMITS } from "@/features/campus-hub/lost-found-logic";
import {
  deleteRemovedCloudinaryUploads,
  requireOnline,
  scheduleSuccessToast,
  showApiErrorToast,
  uploadPendingImages,
  useUgcTermsRetry as useCampusHubUgcTermsRetry,
  validateLocalImageSizes as validateCampusHubImageSizes,
} from "@/features/campus-hub/campus-hub-upload";
import type { CloudinaryFolder } from "@/services/cloudinary-service";

export {
  deleteRemovedCloudinaryUploads,
  requireOnline,
  scheduleSuccessToast,
  showApiErrorToast,
};

export function useUgcTermsRetry<TPayload>(userId: string | undefined) {
  return useCampusHubUgcTermsRetry<TPayload>(userId, "UGC_TERMS_REQUIRED");
}

export function validateLocalImageSizes(
  uris: string[],
  singlePhotoLabel = "Photo",
): Promise<string | null> {
  return validateCampusHubImageSizes(uris, singlePhotoLabel, {
    maxBytes: LOST_FOUND_LIMITS.MAX_IMAGE_BYTES,
    logTag: "LostFound",
  });
}

export function uploadPendingLostFoundImages(params: {
  uris: string[];
  uploadedMap: Record<string, string>;
  folder: CloudinaryFolder;
  singlePhotoLabel?: string;
  uploadErrorTitle?: string;
  uploadErrorFallback?: string;
  setIsUploading: (uploading: boolean) => void;
  setUploadedMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}): Promise<Record<string, string> | null> {
  return uploadPendingImages({
    ...params,
    maxBytes: LOST_FOUND_LIMITS.MAX_IMAGE_BYTES,
    logTag: "LostFound",
  });
}
