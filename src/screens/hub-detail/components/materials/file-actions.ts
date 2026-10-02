import { Platform, Linking } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import Toast from "react-native-toast-message";

const MIME_MAP: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain",
  csv: "text/csv",
  zip: "application/zip",
  rar: "application/x-rar-compressed",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  mp3: "audio/mpeg",
  json: "application/json",
  js: "text/javascript",
  ts: "text/typescript",
  py: "text/x-python",
};

const UTI_MAP: Record<string, string> = {
  pdf: "com.adobe.pdf",
  doc: "com.microsoft.word.doc",
  docx: "org.openxmlformats.wordprocessingml.document",
  ppt: "com.microsoft.powerpoint.ppt",
  pptx: "org.openxmlformats.presentationml.presentation",
  xls: "com.microsoft.excel.xls",
  xlsx: "org.openxmlformats.spreadsheetml.sheet",
  zip: "public.zip-archive",
  png: "public.png",
  jpg: "public.jpeg",
  jpeg: "public.jpeg",
  txt: "public.plain-text",
};

/**
 * Ensures the URL is properly formatted with https://
 */
export function sanitizeUrl(url?: string): string {
  if (!url) return "";
  let trimmed = url.trim();
  if (trimmed.startsWith("http://")) {
    trimmed = "https://" + trimmed.slice(7);
  } else if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Extracts or derives the file extension from filename, url, or fallback
 */
export function getFileExtension(fileName?: string, url?: string): string {
  if (fileName && fileName.includes(".")) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext && ext.length <= 5) return ext;
  }
  if (url) {
    const cleanUrl = url.split("?")[0].split("#")[0];
    const parts = cleanUrl.split("/");
    const lastPart = parts[parts.length - 1];
    if (lastPart.includes(".")) {
      const ext = lastPart.split(".").pop()?.toLowerCase();
      if (ext && ext.length <= 5) return ext;
    }
  }
  return "";
}

/**
 * Generates a clean, valid local filename with proper extension
 */
export function getSafeFilename(
  fileName?: string,
  url?: string,
  fallbackType?: string
): string {
  let name = (fileName || "").trim();
  const ext = getFileExtension(name, url) || (fallbackType || "").toLowerCase() || "pdf";

  if (!name) {
    if (url) {
      const cleanUrl = url.split("?")[0].split("#")[0];
      const last = cleanUrl.split("/").pop();
      if (last && last.trim()) {
        name = decodeURIComponent(last);
      }
    }
  }

  if (!name) {
    name = `document_${Date.now()}`;
  }

  // Remove invalid filesystem characters
  name = name.replace(/[/\\?%*:|"<>]/g, "_").replace(/\s+/g, "_");

  // Ensure it ends with the proper extension
  if (!name.toLowerCase().endsWith(`.${ext}`)) {
    name = `${name}.${ext}`;
  }

  return name;
}

export function getMimeType(fileName: string): string {
  const ext = getFileExtension(fileName);
  return MIME_MAP[ext] || "application/octet-stream";
}

export function isOfficeDocument(fileName?: string, url?: string): boolean {
  const ext = getFileExtension(fileName, url);
  return ["ppt", "pptx", "doc", "docx", "xls", "xlsx", "csv"].includes(ext);
}

export function isPdf(fileName?: string, url?: string): boolean {
  const ext = getFileExtension(fileName, url);
  return ext === "pdf";
}

/**
 * Downloads a file to device cache and presents the native Save / Share dialog.
 * This works on both Android and iOS, allowing users to save to Downloads, Drive, or open in apps.
 */
export async function downloadAndSaveDocument(
  url: string,
  fileName?: string,
  fallbackType?: string
): Promise<boolean> {
  const safeUrl = sanitizeUrl(url);
  if (!safeUrl) {
    Toast.show({
      type: "error",
      text1: "Invalid File Link",
      text2: "The document link is missing or invalid.",
    });
    return false;
  }

  const safeName = getSafeFilename(fileName, safeUrl, fallbackType);

  // Web platform fallback
  if (Platform.OS === "web") {
    try {
      if (typeof window !== "undefined") {
        const anchor = document.createElement("a");
        anchor.href = safeUrl;
        anchor.download = safeName;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        Toast.show({
          type: "success",
          text1: "Download Started",
          text2: safeName,
        });
        return true;
      }
    } catch {
      Linking.openURL(safeUrl).catch(() => {});
      return false;
    }
  }

  try {
    const baseDir =
      (FileSystem as any).documentDirectory ||
      (FileSystem as any).cacheDirectory ||
      "";

    const localUri = `${baseDir}${safeName}`;

    // Check if already downloaded and valid
    try {
      const info = await (FileSystem as any).getInfoAsync(localUri);
      if (info && info.exists && info.size && info.size > 0) {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          const ext = getFileExtension(safeName);
          await Sharing.shareAsync(localUri, {
            mimeType: getMimeType(safeName),
            dialogTitle: `Save or Open ${safeName}`,
            UTI: UTI_MAP[ext],
          });
        }
        Toast.show({
          type: "success",
          text1: "File Ready",
          text2: safeName,
        });
        return true;
      }
    } catch {
      // Not cached yet, proceed to download
    }

    Toast.show({
      type: "info",
      text1: "Downloading File...",
      text2: safeName,
      visibilityTime: 2500,
    });

    const downloadRes = await (FileSystem as any).downloadAsync(
      safeUrl,
      localUri
    );

    if (downloadRes && (downloadRes.status === 200 || downloadRes.uri)) {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        const ext = getFileExtension(safeName);
        await Sharing.shareAsync(downloadRes.uri, {
          mimeType: getMimeType(safeName),
          dialogTitle: `Save or Open ${safeName}`,
          UTI: UTI_MAP[ext],
        });
      }
      Toast.show({
        type: "success",
        text1: "Download Complete",
        text2: "Saved to device. Choose where to save or open.",
      });
      return true;
    } else {
      throw new Error(`Download responded with status ${downloadRes?.status}`);
    }
  } catch (error: any) {
    console.warn("Document download error:", error);
    Toast.show({
      type: "error",
      text1: "Download Failed",
      text2: "Opening file in browser instead...",
    });
    // Fallback to opening in browser
    return openDocumentOrLink(safeUrl, safeName);
  }
}

/**
 * Smart file / link opener that prevents "link not reachable" errors:
 * - Uses in-app Chrome Custom Tabs / Safari View Controller via WebBrowser
 * - Uses Google Docs Viewer for Office documents (.ppt, .doc, .xls) and raw Cloudinary streams
 * - Falls back to downloadAndSaveDocument or Linking.openURL
 */
export async function openDocumentOrLink(
  url: string,
  fileName?: string,
  isExplicitLink?: boolean
): Promise<boolean> {
  const safeUrl = sanitizeUrl(url);
  if (!safeUrl) {
    Toast.show({
      type: "error",
      text1: "Invalid Link",
      text2: "The document link is missing or invalid.",
    });
    return false;
  }

  // If it's a generic web link (not a file download), open via WebBrowser
  if (isExplicitLink) {
    try {
      await WebBrowser.openBrowserAsync(safeUrl);
      return true;
    } catch {
      await Linking.openURL(safeUrl).catch(() => {});
      return true;
    }
  }

  const office = isOfficeDocument(fileName, safeUrl);
  const isCloudinaryRaw =
    safeUrl.includes("res.cloudinary.com") && safeUrl.includes("/raw/upload/");

  // Office documents cannot be rendered directly in mobile browsers.
  // Google Docs Viewer renders PPT, DOC, XLS and raw Cloudinary files cleanly.
  if (office || isCloudinaryRaw) {
    const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
      safeUrl
    )}&embedded=true`;

    try {
      await WebBrowser.openBrowserAsync(googleDocsViewerUrl);
      return true;
    } catch {
      // Fallback: download and share directly
      return downloadAndSaveDocument(safeUrl, fileName);
    }
  }

  // For PDF and other documents: try in-app browser first
  try {
    await WebBrowser.openBrowserAsync(safeUrl);
    return true;
  } catch {
    // If WebBrowser fails, try Google Docs Viewer fallback for PDF
    if (isPdf(fileName, safeUrl)) {
      try {
        const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
          safeUrl
        )}&embedded=true`;
        await WebBrowser.openBrowserAsync(googleDocsViewerUrl);
        return true;
      } catch {
        // Fallback to download
        return downloadAndSaveDocument(safeUrl, fileName);
      }
    }

    try {
      await Linking.openURL(safeUrl);
      return true;
    } catch {
      return downloadAndSaveDocument(safeUrl, fileName);
    }
  }
}
