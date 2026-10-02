import { MaterialItem } from "./types";

export const formatFileSize = (bytes?: number | string): string => {
  if (bytes === undefined || bytes === null || bytes === "") return "";
  const num = typeof bytes === "string" ? parseFloat(bytes) : bytes;
  if (isNaN(num) || num <= 0) return "";
  if (num < 1024) return `${Math.round(num)} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  if (num < 1024 * 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  return `${(num / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export type MaterialFileType =
  | "ppt"
  | "pdf"
  | "docs"
  | "code"
  | "link"
  | "excel"
  | "image"
  | "archive"
  | "generic";

export interface FileTypeTheme {
  type: MaterialFileType;
  label: string;
  badgeBg: string;
  badgeBorder: string;
  iconColor: string;
  iconName: string;
  iconFamily: "MaterialCommunityIcons" | "Feather";
}

export const FILE_THEMES: Record<MaterialFileType, FileTypeTheme> = {
  ppt: {
    type: "ppt",
    label: "PPTX",
    badgeBg: "#fff7ed",
    badgeBorder: "rgba(249, 115, 22, 0.28)",
    iconColor: "#ea580c",
    iconName: "file-powerpoint-box",
    iconFamily: "MaterialCommunityIcons",
  },
  pdf: {
    type: "pdf",
    label: "PDF",
    badgeBg: "#fef2f2",
    badgeBorder: "rgba(239, 68, 68, 0.28)",
    iconColor: "#dc2626",
    iconName: "file-pdf-box",
    iconFamily: "MaterialCommunityIcons",
  },
  docs: {
    type: "docs",
    label: "DOCX",
    badgeBg: "#eff6ff",
    badgeBorder: "rgba(37, 99, 235, 0.25)",
    iconColor: "#2563eb",
    iconName: "file-word-box",
    iconFamily: "MaterialCommunityIcons",
  },
  code: {
    type: "code",
    label: "CODE",
    badgeBg: "#faf5ff",
    badgeBorder: "rgba(126, 34, 206, 0.25)",
    iconColor: "#7c3aed",
    iconName: "file-code-outline",
    iconFamily: "MaterialCommunityIcons",
  },
  link: {
    type: "link",
    label: "LINK",
    badgeBg: "#eff6ff",
    badgeBorder: "rgba(2, 132, 199, 0.25)",
    iconColor: "#0284c7",
    iconName: "link-variant",
    iconFamily: "MaterialCommunityIcons",
  },
  excel: {
    type: "excel",
    label: "XLSX",
    badgeBg: "#f0fdf4",
    badgeBorder: "rgba(22, 163, 74, 0.25)",
    iconColor: "#16a34a",
    iconName: "file-excel-box",
    iconFamily: "MaterialCommunityIcons",
  },
  image: {
    type: "image",
    label: "IMAGE",
    badgeBg: "#f0fdfa",
    badgeBorder: "rgba(13, 148, 136, 0.25)",
    iconColor: "#0d9488",
    iconName: "file-image-outline",
    iconFamily: "MaterialCommunityIcons",
  },
  archive: {
    type: "archive",
    label: "ZIP",
    badgeBg: "#fffbeb",
    badgeBorder: "rgba(217, 119, 6, 0.25)",
    iconColor: "#d97706",
    iconName: "folder-zip-outline",
    iconFamily: "MaterialCommunityIcons",
  },
  generic: {
    type: "generic",
    label: "FILE",
    badgeBg: "#f8fafc",
    badgeBorder: "rgba(100, 116, 139, 0.2)",
    iconColor: "#475569",
    iconName: "file-document-outline",
    iconFamily: "MaterialCommunityIcons",
  },
};

export const getFileTheme = (type?: string, name?: string): FileTypeTheme => {
  const ext = (name?.split(".").pop() || "").toLowerCase();
  const lowerType = (type || "").toLowerCase();

  // PPT / Slides
  if (
    ["ppt", "pptx", "pps", "ppsx", "odp", "key"].includes(ext) ||
    lowerType.includes("powerpoint") ||
    lowerType.includes("presentation")
  ) {
    return FILE_THEMES.ppt;
  }

  // PDF
  if (ext === "pdf" || lowerType.includes("pdf")) {
    return FILE_THEMES.pdf;
  }

  // Word / Docs
  if (
    ["doc", "docx", "odt", "rtf", "txt", "pages"].includes(ext) ||
    lowerType.includes("word") ||
    lowerType.includes("document") ||
    lowerType.includes("text/plain")
  ) {
    return FILE_THEMES.docs;
  }

  // Code
  if (
    [
      "js",
      "jsx",
      "ts",
      "tsx",
      "py",
      "java",
      "c",
      "cpp",
      "h",
      "cs",
      "html",
      "css",
      "scss",
      "php",
      "go",
      "rs",
      "swift",
      "kt",
      "sql",
      "json",
      "sh",
      "bash",
      "xml",
      "yaml",
      "yml",
      "dart",
    ].includes(ext) ||
    lowerType.includes("javascript") ||
    lowerType.includes("typescript") ||
    lowerType.includes("python") ||
    lowerType.includes("json")
  ) {
    return FILE_THEMES.code;
  }

  // Excel / Spreadsheet
  if (
    ["xls", "xlsx", "csv", "ods", "numbers"].includes(ext) ||
    lowerType.includes("excel") ||
    lowerType.includes("spreadsheet") ||
    lowerType.includes("csv")
  ) {
    return FILE_THEMES.excel;
  }

  // Images
  if (
    ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "heic"].includes(ext) ||
    lowerType.includes("image")
  ) {
    return FILE_THEMES.image;
  }

  // Archives
  if (
    ["zip", "rar", "7z", "tar", "gz", "bz2"].includes(ext) ||
    lowerType.includes("zip") ||
    lowerType.includes("compressed") ||
    lowerType.includes("tar")
  ) {
    return FILE_THEMES.archive;
  }

  return FILE_THEMES.generic;
};

export const getMaterialTheme = (item: MaterialItem): FileTypeTheme => {
  const attachments = Array.isArray(item.attachments) ? item.attachments : [];
  if (attachments.length > 0) {
    return getFileTheme(attachments[0].type, attachments[0].name);
  }

  const links = Array.isArray(item.links) ? item.links : [];
  if (links.length > 0 || (item.driveUrl && item.driveUrl !== "https://drive.google.com")) {
    return FILE_THEMES.link;
  }

  return getFileTheme(item.category || undefined, item.title);
};

export const getMaterialSubtitle = (item: MaterialItem): string => {
  const theme = getMaterialTheme(item);
  const attachments = Array.isArray(item.attachments) ? item.attachments : [];
  const links = Array.isArray(item.links) ? item.links : [];

  if (attachments.length > 0) {
    if (attachments.length === 1) {
      const sizeStr = formatFileSize(attachments[0].size);
      return sizeStr ? `${theme.label} • ${sizeStr}` : theme.label;
    }
    const totalBytes = attachments.reduce((acc, a) => acc + (a.size || 0), 0);
    const sizeStr = formatFileSize(totalBytes);
    return `${theme.label} • ${attachments.length} files${sizeStr ? ` • ${sizeStr}` : ""}`;
  }

  if (links.length > 0) {
    if (links.length === 1) {
      const url = links[0].url.toLowerCase();
      if (url.includes("drive.google.com")) return "Google Drive";
      if (url.includes("github.com")) return "GitHub Repository";
      return "Web Resource";
    }
    return `${links.length} links`;
  }

  if (item.driveUrl && item.driveUrl !== "https://drive.google.com") {
    const url = item.driveUrl.toLowerCase();
    if (url.includes("drive.google.com")) return "Google Drive";
    if (url.includes("github.com")) return "GitHub Repository";
    return "Web Link";
  }

  return "Course Resource";
};

// Legacy helper for backwards compatibility
export const getFileIcon = (
  type?: string,
  name?: string
): "image" | "archive" | "file-text" | "file" | "paperclip" => {
  const ext = (name?.split(".").pop() || "").toLowerCase();
  if (type?.includes("image") || ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
    return "image";
  }
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return "archive";
  }
  if (["pdf", "doc", "docx"].includes(ext)) {
    return "file-text";
  }
  if (["ppt", "pptx"].includes(ext)) {
    return "file";
  }
  return "paperclip";
};
