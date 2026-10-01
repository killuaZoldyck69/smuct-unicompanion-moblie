export const toDateTimeLocalString = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

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
  if (["pdf"].includes(ext)) {
    return "file-text";
  }
  if (["doc", "docx"].includes(ext)) {
    return "file-text";
  }
  if (["ppt", "pptx"].includes(ext)) {
    return "file";
  }
  return "paperclip";
};

export const getInitialDeadline = (): Date => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(23, 59, 0, 0);
  return d;
};
