import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import {
  getStoredDriveTokens,
  connectGoogleDrive,
  clearDriveTokens,
  uploadFileToGoogleDrive,
  deleteGoogleDriveFile,
  ensureValidAccessToken,
  getGoogleClientId,
  GOOGLE_DRIVE_TOKEN_EXPIRY_BUFFER_MS,
  type GoogleDriveTokens,
  type GoogleDriveUploadedFile,
} from "@/services/google-drive-service";
import { useCurrentUser } from "@/hooks/use-current-user";
import { syncGoogleDriveConnectionStatus } from "@/services/user-service";

export interface StagedUploadFile {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}

export interface UploadFilesOptions {
  folderPath?: string[];
  onProgressUpdate?: (text: string) => void;
}

export interface GoogleDriveAttachmentResult {
  id: string;
  name: string;
  url: string;
  downloadUrl?: string;
  size?: number;
  type: string;
}

export function useGoogleDrive() {
  const { user, isPending: isUserPending } = useCurrentUser();
  const queryClient = useQueryClient();
  const appUserId = user?.id;
  const [tokens, setTokens] = useState<GoogleDriveTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadTokens = useCallback(async () => {
    if (!appUserId) {
      setTokens(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const stored = await getStoredDriveTokens(appUserId);
      setTokens(stored);
      const isConnected = Boolean(
        stored?.accessToken &&
          stored.expiresAt > Date.now() + GOOGLE_DRIVE_TOKEN_EXPIRY_BUFFER_MS,
      );
      try {
        const statusChanged =
          await syncGoogleDriveConnectionStatus(isConnected, isConnected ? stored?.email : null);
        if (statusChanged) {
          await queryClient.invalidateQueries({ queryKey: ["hubDetails"] });
        }
      } catch (err) {
        Toast.show({
          type: "error",
          text1: "Drive Status Sync Failed",
          text2:
            err instanceof Error
              ? err.message
              : "Could not update your Course Hub Drive status.",
        });
      }
    } catch (err) {
      setTokens(null);
      Toast.show({
        type: "error",
        text1: "Google Drive Status Unavailable",
        text2: err instanceof Error ? err.message : "Could not read the saved connection.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [appUserId, queryClient]);

  useEffect(() => {
    if (!isUserPending) {
      loadTokens();
    }
  }, [isUserPending, loadTokens]);

  const connect = useCallback(async (): Promise<boolean> => {
    if (!appUserId) {
      Toast.show({
        type: "error",
        text1: "Sign In Required",
        text2: "Sign in to UniCompanion before connecting Google Drive.",
      });
      return false;
    }
    setIsConnecting(true);
    try {
      const newTokens = await connectGoogleDrive(appUserId);
      setTokens(newTokens);
      let statusSynced = true;
      let statusSyncError = "";
      try {
        const statusChanged = await syncGoogleDriveConnectionStatus(true, newTokens.email);
        if (statusChanged) {
          await queryClient.invalidateQueries({ queryKey: ["hubDetails"] });
        }
      } catch (err) {
        statusSynced = false;
        statusSyncError =
          err instanceof Error ? ` ${err.message}` : "";
      }
      Toast.show({
        type: statusSynced ? "success" : "info",
        text1: "Google Drive Connected",
        text2: statusSynced
          ? `Linked to ${newTokens.email || "your Google Account"}.`
          : `Drive is linked on this device, but Course Hub status could not sync.${statusSyncError}`,
      });
      return true;
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Connection Failed",
        text2: err?.message || "Could not link Google Drive.",
      });
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [appUserId, queryClient]);

  const disconnect = useCallback(async () => {
    if (!appUserId) return;
    await clearDriveTokens(appUserId);
    setTokens(null);
    let statusSynced = true;
    try {
      const statusChanged = await syncGoogleDriveConnectionStatus(false, null);
      if (statusChanged) {
        await queryClient.invalidateQueries({ queryKey: ["hubDetails"] });
      }
    } catch {
      statusSynced = false;
    }
    Toast.show({
      type: statusSynced ? "info" : "error",
      text1: "Google Drive Disconnected",
      text2: statusSynced
        ? "Your account was unlinked from UniCompanion."
        : "Disconnected on this device, but Course Hub status could not sync. Check your connection.",
    });
  }, [appUserId, queryClient]);

  const ensureConnected = useCallback(async (): Promise<boolean> => {
    if (
      tokens &&
      tokens.appUserId === appUserId &&
      tokens.accessToken &&
      tokens.expiresAt > Date.now() + GOOGLE_DRIVE_TOKEN_EXPIRY_BUFFER_MS
    ) {
      return true;
    }
    return connect();
  }, [appUserId, connect, tokens]);

  const uploadFiles = useCallback(
    async (
      files: StagedUploadFile[],
      optionsOrProgress?: ((text: string) => void) | UploadFilesOptions,
      legacyFolderPath?: string[]
    ): Promise<GoogleDriveAttachmentResult[]> => {
      let onProgressUpdate: ((text: string) => void) | undefined;
      let folderPath: string[] | undefined;

      if (typeof optionsOrProgress === "function") {
        onProgressUpdate = optionsOrProgress;
        folderPath = legacyFolderPath;
      } else if (optionsOrProgress) {
        onProgressUpdate = optionsOrProgress.onProgressUpdate;
        folderPath = optionsOrProgress.folderPath ?? legacyFolderPath;
      }

      if (!files || files.length === 0) return [];
      if (!appUserId) {
        throw new Error("Sign in to UniCompanion before uploading Course Hub files.");
      }

      setIsUploading(true);
      const results: GoogleDriveAttachmentResult[] = [];

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileCounter = files.length > 1 ? `(${i + 1}/${files.length}) ` : "";
          const progressMsg = `Uploading ${fileCounter}"${file.name}" to Google Drive...`;

          setStatusMessage(progressMsg);
          onProgressUpdate?.(progressMsg);

          const uploaded: GoogleDriveUploadedFile = await uploadFileToGoogleDrive({
            appUserId,
            uri: file.uri,
            name: file.name,
            mimeType: file.mimeType,
            size: file.size,
            folderPath,
            onProgress: (step) => {
              const fullStep = `${fileCounter}${step}`;
              setStatusMessage(fullStep);
              onProgressUpdate?.(fullStep);
            },
          });

          results.push({
            id: uploaded.id,
            name: uploaded.name,
            url: uploaded.webViewLink,
            downloadUrl: uploaded.webContentLink,
            size: uploaded.size,
            type: "google-drive",
          });
        }

        return results;
      } catch (err) {
        const uploadedIds = results.map((file) => file.id);
        if (uploadedIds.length > 0) {
          try {
            const accessToken = await ensureValidAccessToken(appUserId);
            await Promise.all(
              uploadedIds.map((id) => deleteGoogleDriveFile(id, accessToken)),
            );
          } catch (cleanupError) {
            console.warn("[GoogleDrive] Failed to clean up partial uploads:", cleanupError);
          }
        }
        throw err;
      } finally {
        setIsUploading(false);
        setStatusMessage(null);
      }
    },
    [appUserId]
  );

  const deleteFiles = useCallback(
    async (fileIds: string[]): Promise<void> => {
      if (!appUserId) {
        throw new Error("Sign in to UniCompanion before managing Drive files.");
      }
      if (fileIds.length === 0) return;
      try {
        const accessToken = await ensureValidAccessToken(appUserId);
        await Promise.all(
          fileIds.map((id) => deleteGoogleDriveFile(id, accessToken)),
        );
      } catch (err) {
        console.warn("[GoogleDrive] Failed to delete files:", err);
      }
    },
    [appUserId],
  );

  return {
    isConnected: Boolean(
      tokens &&
        tokens.appUserId === appUserId &&
        tokens.accessToken &&
        tokens.expiresAt > Date.now() + GOOGLE_DRIVE_TOKEN_EXPIRY_BUFFER_MS,
    ),
    email: tokens && tokens.appUserId === appUserId ? tokens.email : undefined,
    userName: tokens && tokens.appUserId === appUserId ? tokens.name : undefined,
    avatarUrl:
      tokens && tokens.appUserId === appUserId ? tokens.avatarUrl : undefined,
    hasClientIdConfigured: Boolean(getGoogleClientId()),
    isLoading: isLoading || isUserPending,
    isConnecting,
    isUploading,
    statusMessage,
    connect,
    disconnect,
    ensureConnected,
    uploadFiles,
    deleteFiles,
    refreshStatus: loadTokens,
  };
}
