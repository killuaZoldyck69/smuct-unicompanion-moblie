import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import * as FileSystem from "expo-file-system/legacy";
import { FileSystemUploadType } from "expo-file-system/legacy";

export interface GoogleDriveTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp in milliseconds
  email?: string;
  name?: string;
  avatarUrl?: string;
}

export interface GoogleDriveUploadedFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  webViewLink: string;
  webContentLink?: string;
}

const SECURE_STORE_KEY = "smuct_unicompanion_google_drive_tokens_v1";
const FOLDER_NAME = "SMUCT UniCompanion - Course Hub";

// Fallback in-memory storage for web or environments where SecureStore is unavailable
let memoryTokens: GoogleDriveTokens | null = null;

/**
 * Returns the configured Google OAuth Client ID.
 * Priority: Environment variable EXPO_PUBLIC_GOOGLE_CLIENT_ID -> Empty
 */
export function getGoogleClientId(): string {
  return process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";
}

/**
 * Retrieves stored Google Drive tokens securely.
 */
export async function getStoredDriveTokens(): Promise<GoogleDriveTokens | null> {
  try {
    if (Platform.OS === "web") {
      const raw = localStorage.getItem(SECURE_STORE_KEY);
      return raw ? JSON.parse(raw) : memoryTokens;
    }
    const raw = await SecureStore.getItemAsync(SECURE_STORE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GoogleDriveTokens;
  } catch (err) {
    console.warn("[GoogleDrive] Failed to read stored tokens:", err);
    return memoryTokens;
  }
}

/**
 * Persists Google Drive tokens securely.
 */
export async function saveDriveTokens(tokens: GoogleDriveTokens): Promise<void> {
  memoryTokens = tokens;
  const raw = JSON.stringify(tokens);
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(SECURE_STORE_KEY, raw);
      return;
    }
    await SecureStore.setItemAsync(SECURE_STORE_KEY, raw);
  } catch (err) {
    console.warn("[GoogleDrive] Failed to save tokens to SecureStore:", err);
  }
}

/**
 * Clears stored Google Drive tokens on disconnect.
 */
export async function clearDriveTokens(): Promise<void> {
  memoryTokens = null;
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(SECURE_STORE_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
  } catch (err) {
    console.warn("[GoogleDrive] Failed to clear stored tokens:", err);
  }
}

/**
 * Checks if the user has an active Google Drive connection.
 */
export async function isGoogleDriveConnected(): Promise<boolean> {
  const tokens = await getStoredDriveTokens();
  return Boolean(tokens?.accessToken);
}

/**
 * Fetches user identity details (email, name, picture) using the access token.
 */
async function fetchGoogleUserInfo(accessToken: string): Promise<{
  email?: string;
  name?: string;
  picture?: string;
}> {
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

/**
 * Resolves the appropriate OAuth Redirect URI based on runtime platform.
 * - Web: current window origin (e.g. http://localhost:8081).
 *   Note: Google strictly disallows raw private IPs (e.g. 192.168.x.x) in OAuth redirect URIs.
 * - Native: smuct-unicompanion://oauth/google-drive (configured in app.json scheme)
 */
export function getRedirectUri(): string {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.location) {
      // Check if user is using an IP address (like 192.168.0.104)
      if (/^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname)) {
        const port = window.location.port ? `:${window.location.port}` : ":8081";
        return `http://localhost${port}`;
      }
      return window.location.origin;
    }
    return "http://localhost:8081";
  }

  // Native mobile app scheme
  return "smuct-unicompanion://oauth/google-drive";
}

/**
 * Initiates the Google OAuth 2.0 flow for Google Drive with scope `drive.file`.
 * Scope `drive.file` only grants permission to files created by this app (0 CASA costs).
 */
export async function connectGoogleDrive(): Promise<GoogleDriveTokens> {
  const clientId = getGoogleClientId();

  if (!clientId) {
    throw new Error(
      "Google Client ID is missing. Please add EXPO_PUBLIC_GOOGLE_CLIENT_ID to your environment variables."
    );
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    if (/^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname)) {
      const port = window.location.port ? `:${window.location.port}` : ":8081";
      const localhostUrl = `http://localhost${port}${window.location.pathname}${window.location.search}`;
      throw new Error(
        `Google OAuth rejects raw IP addresses like "${window.location.hostname}". Please open the app in your browser at: ${localhostUrl}`
      );
    }
  }

  const redirectUri = getRedirectUri();
  const scope = encodeURIComponent(
    "https://www.googleapis.com/auth/drive.file email profile openid"
  );
  const nonce = Math.random().toString(36).substring(2, 15);

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=token%20id_token&` +
    `scope=${scope}&` +
    `nonce=${encodeURIComponent(nonce)}&` +
    `prompt=consent&` +
    `include_granted_scopes=true`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type !== "success" || !result.url) {
    throw new Error("Google Drive authentication was cancelled or failed.");
  }

  // Parse hash parameters from redirect url
  const hash = result.url.split("#")[1] || result.url.split("?")[1] || "";
  const params = new URLSearchParams(hash);

  const accessToken = params.get("access_token");
  const expiresIn = params.get("expires_in");

  if (!accessToken) {
    const errorDesc = params.get("error_description") || params.get("error");
    throw new Error(errorDesc || "No access token received from Google.");
  }

  const expiresInSec = expiresIn ? parseInt(expiresIn, 10) : 3600;
  const expiresAt = Date.now() + expiresInSec * 1000;

  // Retrieve user profile metadata for display
  const userInfo = await fetchGoogleUserInfo(accessToken);

  const tokens: GoogleDriveTokens = {
    accessToken,
    expiresAt,
    email: userInfo.email,
    name: userInfo.name,
    avatarUrl: userInfo.picture,
  };

  await saveDriveTokens(tokens);
  return tokens;
}

/**
 * Ensures the access token is currently valid, refreshing if needed.
 */
export async function ensureValidAccessToken(): Promise<string> {
  const tokens = await getStoredDriveTokens();
  if (!tokens?.accessToken) {
    throw new Error("Google Drive is not connected. Please connect your Drive.");
  }

  // If token is valid for more than 5 minutes, return immediately
  const bufferMs = 5 * 60 * 1000;
  if (tokens.expiresAt > Date.now() + bufferMs) {
    return tokens.accessToken;
  }

  // If expired and refresh token is available, attempt silent refresh
  if (tokens.refreshToken) {
    try {
      const clientId = getGoogleClientId();
      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: "refresh_token",
          refresh_token: tokens.refreshToken,
        }).toString(),
      });

      if (res.ok) {
        const data = await res.json();
        const newTokens: GoogleDriveTokens = {
          ...tokens,
          accessToken: data.access_token,
          expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
        };
        await saveDriveTokens(newTokens);
        return newTokens.accessToken;
      }
    } catch (err) {
      console.warn("[GoogleDrive] Silent refresh failed:", err);
    }
  }

  // Return existing token as last resort if refresh token unavailable
  return tokens.accessToken;
}

/**
 * Finds or creates the dedicated "SMUCT UniCompanion - Course Hub" folder in student's drive.
 */
export async function getOrCreateUniCompanionFolder(
  accessToken: string
): Promise<string> {
  try {
    // 1. Search for existing folder
    const query = encodeURIComponent(
      `name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    );
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (Array.isArray(data.files) && data.files.length > 0) {
        return data.files[0].id;
      }
    } else {
      const err = await searchRes.text();
      console.warn("[GoogleDrive] Folder search error:", searchRes.status, err);
    }

    // 2. Create folder if not found
    const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: FOLDER_NAME,
        mimeType: "application/vnd.google-apps.folder",
      }),
    });

    if (createRes.ok) {
      const folder = await createRes.json();
      return folder.id;
    } else {
      const err = await createRes.text();
      console.warn("[GoogleDrive] Folder create error:", createRes.status, err);
    }
  } catch (err) {
    console.warn("[GoogleDrive] Folder lookup/creation fallback:", err);
  }

  // Fallback to Drive root if folder creation fails
  return "root";
}

/**
 * Sets public view/download permissions on the file so classmates can access it.
 */
export async function setFilePublicPermissions(
  fileId: string,
  accessToken: string
): Promise<{ webViewLink: string; webContentLink?: string }> {
  // Set permission to anyone with link as reader
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      role: "reader",
      type: "anyone",
    }),
  });

  // Query publicly accessible links
  const fields = encodeURIComponent("id,name,mimeType,size,webViewLink,webContentLink");
  const fileRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=${fields}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!fileRes.ok) {
    return {
      webViewLink: `https://drive.google.com/file/d/${fileId}/view`,
      webContentLink: `https://drive.google.com/uc?id=${fileId}&export=download`,
    };
  }

  const fileData = await fileRes.json();
  return {
    webViewLink:
      fileData.webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
    webContentLink:
      fileData.webContentLink ||
      `https://drive.google.com/uc?id=${fileId}&export=download`,
  };
}

/**
 * Direct file upload to student's Google Drive via Resumable / Multipart API.
 * Uses zero server storage and zero Cloudinary quota.
 */
export async function uploadFileToGoogleDrive({
  uri,
  name,
  mimeType,
  size,
  onProgress,
}: {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
  onProgress?: (text: string) => void;
}): Promise<GoogleDriveUploadedFile> {
  const accessToken = await ensureValidAccessToken();

  onProgress?.("Locating UniCompanion folder...");
  const folderId = await getOrCreateUniCompanionFolder(accessToken);

  const cleanMimeType = mimeType || "application/octet-stream";
  const cleanName = name || `document-${Date.now()}`;

  onProgress?.("Uploading directly to your Google Drive...");

  // 1. Initialize Resumable Upload Session
  const initRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": cleanMimeType,
        ...(size ? { "X-Upload-Content-Length": String(size) } : {}),
      },
      body: JSON.stringify({
        name: cleanName,
        parents: folderId === "root" ? undefined : [folderId],
      }),
    }
  );

  if (!initRes.ok) {
    const errorText = await initRes.text();
    console.error("[GoogleDrive] Upload Init Error:", initRes.status, errorText);
    let parsedMessage = "";
    try {
      const errObj = JSON.parse(errorText);
      parsedMessage = errObj.error?.message || "";
    } catch {}

    if (errorText.includes("storageQuotaExceeded")) {
      throw new Error(
        "Your Google Drive storage is full. Please free up space in your Google Drive."
      );
    }
    throw new Error(
      parsedMessage
        ? `Google Drive API: ${parsedMessage}`
        : `Failed to initiate Drive upload (${initRes.status}): ${initRes.statusText}`
    );
  }

  const uploadUrl = initRes.headers.get("Location");
  if (!uploadUrl) {
    throw new Error("Google Drive did not return an upload session URL.");
  }

  // 2. Upload file content to the session URL
  let uploadedFileId = "";

  if (Platform.OS === "web") {
    const fileBlob = await (await fetch(uri)).blob();
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": cleanMimeType },
      body: fileBlob,
    });
    if (!uploadRes.ok) {
      throw new Error("Failed to send file payload to Google Drive.");
    }
    const data = await uploadRes.json();
    uploadedFileId = data.id;
  } else {
    // Native Mobile: Upload efficiently via FileSystem.uploadAsync
    const uploadRes = await FileSystem.uploadAsync(uploadUrl, uri, {
      httpMethod: "PUT",
      uploadType: FileSystemUploadType.BINARY_CONTENT,
      headers: { "Content-Type": cleanMimeType },
    });

    if (uploadRes.status < 200 || uploadRes.status >= 300) {
      throw new Error(`Failed to upload file content to Google Drive (${uploadRes.status}).`);
    }

    try {
      const parsed = JSON.parse(uploadRes.body);
      uploadedFileId = parsed.id;
    } catch {
      throw new Error("Could not parse file upload response from Google Drive.");
    }
  }

  // 3. Make the uploaded file publicly readable
  onProgress?.("Configuring public view permissions...");
  const links = await setFilePublicPermissions(uploadedFileId, accessToken);

  return {
    id: uploadedFileId,
    name: cleanName,
    mimeType: cleanMimeType,
    size,
    webViewLink: links.webViewLink,
    webContentLink: links.webContentLink,
  };
}
