import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import { NoticeItem } from "@/services/notice-service";
import { CATEGORY_THEMES, CategoryKey } from "./constants";

export const getNoticeCategory = (notice: NoticeItem): CategoryKey => {
  if (notice.category && notice.category.trim()) {
    const raw = notice.category.trim().toUpperCase() as CategoryKey;
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
    return diffDays >= 0 && diffDays <= 5;
  } catch {
    return false;
  }
};

export const sanitizeNoticeText = (text?: string | null): string => {
  if (!text) return "";
  return text.trim();
};

export const copyNoticeContent = async (notice: NoticeItem): Promise<void> => {
  try {
    const title = sanitizeNoticeText(notice.title);
    const body = sanitizeNoticeText(notice.body);
    await Clipboard.setStringAsync(`${title}\n\n${body}`);
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

export const shareNoticeContent = async (notice: NoticeItem): Promise<void> => {
  try {
    const title = sanitizeNoticeText(notice.title);
    const ref = notice.referenceNo ? `Ref: ${notice.referenceNo}` : "";
    const issuer = notice.issuerName
      ? `Issued by: ${notice.issuerName}${notice.issuerDesignation ? ` (${notice.issuerDesignation})` : ""}`
      : "";
    const body = sanitizeNoticeText(notice.body);

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
