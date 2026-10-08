// src/screens/notices/utils.ts
import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import { NoticeItem } from "@/services/notice-service";
import { formatDate } from "@/utils/date-formatter";
import { CATEGORY_THEMES } from "./constants";
import { NoticeCategoryKey, NormalizedNotice } from "./types";

/**
 * Strips raw HTML tags and unsafe script characters from untrusted strings.
 */
export const sanitizeText = (text?: string | null): string => {
  if (!text) return "";
  return text
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
};

/**
 * Normalizes raw multiline body content:
 * - Replaces literal escaped `\n` or `\r\n` with standard linebreaks
 * - Splits into distinct non-empty paragraphs for clean reading
 */
export const extractParagraphs = (rawBody?: string | null): string[] => {
  if (!rawBody) return [];
  const normalized = rawBody.replace(/\\r\\n|\\n|\\r/g, "\n");
  const paragraphs = normalized
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return paragraphs.length > 0 ? paragraphs : [normalized.trim()];
};

/**
 * Dynamically resolves category key from explicit backend metadata or content heuristics.
 */
export const detectNoticeCategory = (notice: NoticeItem): NoticeCategoryKey => {
  if (notice.category && notice.category.trim()) {
    const raw = notice.category.trim().toUpperCase() as Exclude<
      NoticeCategoryKey,
      "ALL"
    >;
    if (CATEGORY_THEMES[raw]) return raw;
  }

  const text = `${notice.title || ""} ${notice.referenceNo || ""} ${notice.body || ""}`.toLowerCase();

  if (
    text.includes("transport") ||
    text.includes("bus") ||
    text.includes("route") ||
    text.includes("বাস") ||
    text.includes("পরিবহন")
  ) {
    return "TRANSPORT";
  }

  if (
    text.includes("holiday") ||
    text.includes("vacation") ||
    text.includes("eid") ||
    text.includes("puja") ||
    text.includes("closed") ||
    text.includes("ছুটি") ||
    text.includes("বন্ধ")
  ) {
    return "HOLIDAY";
  }

  if (
    text.includes("exam") ||
    text.includes("midterm") ||
    text.includes("final") ||
    text.includes("routine") ||
    text.includes("পরীক্ষা")
  ) {
    return "EXAM";
  }

  if (
    text.includes("academic") ||
    text.includes("semester") ||
    text.includes("class") ||
    text.includes("admission") ||
    text.includes("registration") ||
    text.includes("ক্লাস") ||
    text.includes("ভর্তি") ||
    text.includes("রেজিস্ট্রেশন")
  ) {
    return "ACADEMIC";
  }

  if (
    text.includes("urgent") ||
    text.includes("emergency") ||
    text.includes("warning") ||
    text.includes("জরুরী") ||
    text.includes("জরুরি")
  ) {
    return "EMERGENCY";
  }

  return "ADMIN";
};

export const isImportantNotice = (notice: NoticeItem): boolean => {
  const text = `${notice.title || ""} ${notice.body || ""}`.toLowerCase();
  return (
    text.includes("urgent") ||
    text.includes("important") ||
    text.includes("জরুরী") ||
    text.includes("জরুরি") ||
    text.includes("গুরুত্বপূর্ণ")
  );
};

export const isNewNotice = (dateStr?: string | null): boolean => {
  if (!dateStr) return false;
  try {
    const noticeDate = new Date(dateStr);
    const now = new Date();
    const diffDays =
      (now.getTime() - noticeDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  } catch {
    return false;
  }
};

export const getNoticeCategory = detectNoticeCategory;

/**
 * Normalizes a raw backend NoticeItem DTO into a strictly typed domain model.
 */
export const normalizeNotice = (item: NoticeItem): NormalizedNotice => {
  const category = detectNoticeCategory(item);
  const theme =
    category !== "ALL" && CATEGORY_THEMES[category]
      ? CATEGORY_THEMES[category]
      : CATEGORY_THEMES.ADMIN;
  const rawDate = item.issueDate || item.createdAt || new Date().toISOString();
  const formattedDate = formatDate(rawDate);
  const bodyParagraphs = extractParagraphs(item.body);
  const body = bodyParagraphs.join("\n\n");

  return {
    id: item.id,
    title: sanitizeText(item.title),
    body,
    bodyParagraphs,
    referenceNo: item.referenceNo ? sanitizeText(item.referenceNo) : null,
    category,
    categoryLabel: theme.label,
    issuerName: sanitizeText(item.issuerName) || "University Authority",
    issuerDesignation: sanitizeText(item.issuerDesignation) || "Office of the Registrar",
    copyTo: Array.isArray(item.copyTo)
      ? item.copyTo.map(sanitizeText).filter(Boolean)
      : [],
    issueDate: rawDate,
    formattedDate,
    rawDate,
    isImportant: isImportantNotice(item),
    isNew: isNewNotice(rawDate),
    fileUrl: item.fileUrl || null,
  };
};

export const copyNoticeContent = async (
  notice: NormalizedNotice | NoticeItem
): Promise<void> => {
  try {
    const title = sanitizeText(notice.title);
    const body = sanitizeText(notice.body);
    const ref = notice.referenceNo ? `Ref: ${notice.referenceNo}\n` : "";
    await Clipboard.setStringAsync(`${title}\n${ref}\n${body}`);
    Toast.show({
      type: "success",
      text1: "Notice Copied",
      text2: "Notice content copied to clipboard.",
    });
  } catch {
    Toast.show({
      type: "error",
      text1: "Copy Failed",
      text2: "Unable to copy notice content.",
    });
  }
};

export const shareNoticeContent = async (
  notice: NormalizedNotice | NoticeItem
): Promise<void> => {
  try {
    const title = sanitizeText(notice.title);
    const ref = notice.referenceNo ? `Ref: ${notice.referenceNo}` : "";
    const issuer = notice.issuerName
      ? `Issued by: ${notice.issuerName}${notice.issuerDesignation ? ` (${notice.issuerDesignation})` : ""}`
      : "";
    const body = sanitizeText(notice.body);

    const message = [
      title,
      ref,
      issuer,
      "",
      body,
      "",
      "Shared from SMUCT UniCompanion",
    ]
      .filter(Boolean)
      .join("\n");

    await Share.share({ message });
  } catch {
    // Sharing dismissed or unavailable
  }
};
