import { useState, useEffect, useCallback } from "react";
import Toast from "react-native-toast-message";
import {
  getStoredDriveTokens,
  connectGoogleDrive,
  clearDriveTokens,
  uploadFileToGoogleDrive,
  getGoogleClientId,
  type GoogleDriveTokens,
  type GoogleDriveUploadedFile,
} from "@/services/google-drive-service";

export interface StagedUploadFile {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}

export interface GoogleDriveAttachmentResult {
  name: string;
  url: string;
  downloadUrl?: string;
  size?: number;
  type: string;
}

export function useGoogleDrive() {
  const [tokens, setTokens] = useState<GoogleDriveTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadTokens = useCallback(async () => {
    setIsLoading(true);
    try {
      const stored = await getStoredDriveTokens();
      setTokens(stored);
    } catch {
      setTokens(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  const connect = useCallback(async (): Promise<boolean> => {
    setIsConnecting(true);
    try {
      const newTokens = await connectGoogleDrive();
      setTokens(newTokens);
      Toast.show({
        type: "success",
        text1: "Google Drive Connected",
        text2: `Linked to ${newTokens.email || "your Google Account"}.`,
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
  }, []);

  const disconnect = useCallback(async () => {
    await clearDriveTokens();
    setTokens(null);
    Toast.show({
      type: "info",
      text1: "Google Drive Disconnected",
      text2: "Your account was unlinked from UniCompanion.",
    });
  }, []);

  const uploadFiles = useCallback(
    async (
      files: StagedUploadFile[],
      onProgressUpdate?: (text: string) => void
    ): Promise<GoogleDriveAttachmentResult[]> => {
      if (!files || files.length === 0) return [];

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
            uri: file.uri,
            name: file.name,
            mimeType: file.mimeType,
            size: file.size,
            onProgress: (step) => {
              const fullStep = `${fileCounter}${step}`;
              setStatusMessage(fullStep);
              onProgressUpdate?.(fullStep);
            },
          });

          results.push({
            name: uploaded.name,
            url: uploaded.webViewLink,
            downloadUrl: uploaded.webContentLink,
            size: uploaded.size,
            type: "google-drive",
          });
        }

        return results;
      } finally {
        setIsUploading(false);
        setStatusMessage(null);
      }
    },
    []
  );

  return {
    isConnected: Boolean(tokens?.accessToken),
    email: tokens?.email,
    userName: tokens?.name,
    avatarUrl: tokens?.avatarUrl,
    hasClientIdConfigured: Boolean(getGoogleClientId()),
    isLoading,
    isConnecting,
    isUploading,
    statusMessage,
    connect,
    disconnect,
    uploadFiles,
    refreshStatus: loadTokens,
  };
}
