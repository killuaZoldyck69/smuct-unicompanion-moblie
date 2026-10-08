// src/screens/notices/types.ts
import { Feather } from "@expo/vector-icons";

export type NoticeCategoryKey =
  | "ALL"
  | "ACADEMIC"
  | "ADMIN"
  | "TRANSPORT"
  | "HOLIDAY"
  | "EXAM"
  | "EMERGENCY";

export interface NoticeCategoryTheme {
  key: NoticeCategoryKey;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentBarColor: string;
  icon: keyof typeof Feather.glyphMap;
  iconBg: string;
}

export interface NormalizedNotice {
  id: string;
  title: string;
  body: string;
  bodyParagraphs: string[];
  referenceNo: string | null;
  category: NoticeCategoryKey;
  categoryLabel: string;
  issuerName: string;
  issuerDesignation: string;
  copyTo: string[];
  issueDate: string;
  formattedDate: string;
  rawDate: string;
  isImportant: boolean;
  isNew: boolean;
  fileUrl?: string | null;
}
