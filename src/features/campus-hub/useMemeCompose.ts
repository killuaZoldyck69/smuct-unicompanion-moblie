import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Keyboard } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useUgcTermsStatus } from "@/features/ugc/useUgcModeration";
import {
  requireOnline,
  scheduleSuccessToast,
  showApiErrorToast,
  useUgcTermsRetry,
  validateLocalImageSizes,
} from "@/features/campus-hub/campus-hub-upload";
import {
  createMemeIdempotencyKey,
  MEME_LIMITS,
  sanitizeMemeCaption,
} from "@/features/campus-hub/meme-logic";
import { useCreateMeme } from "@/features/campus-hub/useMemes";
import {
  CLOUDINARY_FOLDERS,
  deleteFileFromCloudinaryApi,
  uploadImageToCloudinary,
} from "@/services/cloudinary-service";

interface UploadedDraftAsset {
  localUri: string;
  secureUrl: string;
  publicId: string;
}

export function useMemeCompose(visible: boolean, onClose: () => void) {
  const { user } = useCurrentUser();
  const { isOffline } = useNetworkStatus();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const pickLockRef = useRef(false);
  const submitLockRef = useRef(false);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const idempotencyKeyRef = useRef<string | null>(null);
  const uploadedAssetRef = useRef<UploadedDraftAsset | null>(null);
  const createMemeMutation = useCreateMeme();
  const { data: ugcTermsData, refetch: refetchUgcTerms } = useUgcTermsStatus(
    user?.id,
    visible,
  );

  const {
    showGuidelines,
    setShowGuidelines,
    isAcceptingGuidelines,
    queuePayload,
    clearQueuedPayload,
    handleUgcError,
    acceptGuidelines,
  } = useUgcTermsRetry<void>(user?.id);

  const cleanupOrphanDraftUpload = useCallback(() => {
    const uploaded = uploadedAssetRef.current;
    if (!uploaded) return;
    uploadedAssetRef.current = null;
    void deleteFileFromCloudinaryApi(
      uploaded.publicId || uploaded.secureUrl,
      "image",
    );
  }, []);

  const resetDraftState = useCallback(() => {
    setImageUri(null);
    setCaption("");
    setIsUploading(false);
    submitLockRef.current = false;
    idempotencyKeyRef.current = null;
    clearQueuedPayload();
  }, [clearQueuedPayload]);

  useEffect(() => {
    if (!visible && !submitLockRef.current) {
      cleanupOrphanDraftUpload();
      resetDraftState();
    }
  }, [visible, cleanupOrphanDraftUpload, resetDraftState]);

  useEffect(() => {
    return () => {
      if (!submitLockRef.current) {
        cleanupOrphanDraftUpload();
      }
    };
  }, [cleanupOrphanDraftUpload]);

  const handlePickImage = useCallback(async () => {
    if (
      pickLockRef.current ||
      submitLockRef.current ||
      isUploading ||
      createMemeMutation.isPending
    ) {
      return;
    }
    pickLockRef.current = true;
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Photo library access is needed to pick a meme from your device.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.85,
      });
      if (result.canceled || !result.assets?.[0]?.uri) return;

      const asset = result.assets[0];
      let candidateUri = asset.uri;
      const isGif =
        asset.mimeType === "image/gif" ||
        asset.uri.toLowerCase().endsWith(".gif");

      if (!isGif) {
        try {
          const actions: ImageManipulator.Action[] =
            asset.width && asset.width > MEME_LIMITS.MAX_IMAGE_DIMENSION
              ? [{ resize: { width: MEME_LIMITS.MAX_IMAGE_DIMENSION } }]
              : [];
          const manipulated = await ImageManipulator.manipulateAsync(
            asset.uri,
            actions,
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
          );
          candidateUri = manipulated.uri;
        } catch {
          candidateUri = asset.uri;
        }
      }

      const sizeError = await validateLocalImageSizes(
        [candidateUri],
        "Meme image",
        { maxBytes: MEME_LIMITS.MAX_IMAGE_BYTES, logTag: "Memes" },
      );
      if (sizeError) {
        Toast.show({
          type: "error",
          text1: "Photo Exceeds 5MB",
          text2: sizeError,
        });
        return;
      }

      if (!visibleRef.current) return;

      cleanupOrphanDraftUpload();
      idempotencyKeyRef.current = createMemeIdempotencyKey();
      setImageUri(candidateUri);
    } catch (err) {
      showApiErrorToast(
        err,
        "Error Picking Image",
        "Failed to open photo picker.",
      );
    } finally {
      pickLockRef.current = false;
    }
  }, [
    isUploading,
    createMemeMutation.isPending,
    cleanupOrphanDraftUpload,
  ]);

  const handleRemoveImage = useCallback(() => {
    cleanupOrphanDraftUpload();
    setImageUri(null);
    idempotencyKeyRef.current = null;
  }, [cleanupOrphanDraftUpload]);

  const handleClose = useCallback(() => {
    if (isUploading || createMemeMutation.isPending) return;
    Keyboard.dismiss();
    cleanupOrphanDraftUpload();
    resetDraftState();
    onClose();
  }, [
    isUploading,
    createMemeMutation.isPending,
    cleanupOrphanDraftUpload,
    resetDraftState,
    onClose,
  ]);

  const submitMeme = useCallback(async () => {
    if (submitLockRef.current || isUploading || createMemeMutation.isPending) {
      return;
    }
    if (!imageUri) {
      Toast.show({
        type: "error",
        text1: "No Image Selected",
        text2: "Please choose a meme image to upload.",
      });
      return;
    }
    if (
      !requireOnline(
        isOffline,
        "Reconnect to the internet before posting a meme.",
      )
    ) {
      return;
    }

    const sanitized = sanitizeMemeCaption(caption);
    if (sanitized.error) {
      Toast.show({
        type: "error",
        text1: "Invalid Caption",
        text2: sanitized.error,
      });
      return;
    }

    submitLockRef.current = true;
    try {
      let termsAccepted = ugcTermsData?.accepted;
      if (termsAccepted === undefined && user?.id) {
        const refreshed = await refetchUgcTerms();
        termsAccepted = refreshed.data?.accepted;
      }
      if (termsAccepted === false) {
        setShowGuidelines(true);
        queuePayload(undefined, () => {
          void submitMeme();
        });
        return;
      }

      setIsUploading(true);
      let cached = uploadedAssetRef.current;
      if (!cached || cached.localUri !== imageUri) {
        const uploadRes = await uploadImageToCloudinary(
          imageUri,
          CLOUDINARY_FOLDERS.CAMPUS_HUB.MEMES,
        );
        cached = {
          localUri: imageUri,
          secureUrl: uploadRes.secureUrl,
          publicId: uploadRes.publicId,
        };
        uploadedAssetRef.current = cached;
      }

      idempotencyKeyRef.current ??= createMemeIdempotencyKey();

      await createMemeMutation.mutateAsync({
        imageUrl: cached.secureUrl,
        caption: sanitized.caption,
        idempotencyKey: idempotencyKeyRef.current,
      });

      uploadedAssetRef.current = null;
      resetDraftState();
      onClose();
      scheduleSuccessToast(
        "Meme Posted!",
        "Your meme is now live on Campus Hub.",
      );
    } catch (err) {
      if (handleUgcError(err)) {
        queuePayload(undefined, () => {
          void submitMeme();
        });
        return;
      }
      showApiErrorToast(
        err,
        "Failed to Post Meme",
        "Something went wrong. Please try again.",
      );
    } finally {
      submitLockRef.current = false;
      setIsUploading(false);
      if (!visibleRef.current) {
        cleanupOrphanDraftUpload();
        resetDraftState();
      }
    }
  }, [
    imageUri,
    caption,
    isOffline,
    isUploading,
    createMemeMutation,
    ugcTermsData?.accepted,
    user?.id,
    refetchUgcTerms,
    setShowGuidelines,
    resetDraftState,
    onClose,
    handleUgcError,
    queuePayload,
    cleanupOrphanDraftUpload,
  ]);

  const dismissGuidelines = useCallback(() => {
    clearQueuedPayload();
    setShowGuidelines(false);
  }, [clearQueuedPayload, setShowGuidelines]);

  return {
    imageUri,
    caption,
    setCaption,
    isOffline,
    isBusy: isUploading || createMemeMutation.isPending,
    showGuidelines,
    isAcceptingGuidelines,
    handlePickImage,
    handleRemoveImage,
    handleClose,
    submitMeme,
    acceptGuidelines,
    dismissGuidelines,
  };
}
