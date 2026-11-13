import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import api from "./api";
import type { ForumAuthor } from "@/features/forum/types";

export interface UgcTermsStatus {
  accepted: boolean;
  ugcTermsAcceptedAt: string | null;
}

export type UgcReportTargetType = "FORUM_POST" | "FORUM_RESPONSE";

export type UgcReportReason =
  | "SPAM"
  | "HARASSMENT"
  | "HATE_SPEECH"
  | "INAPPROPRIATE"
  | "ACADEMIC_MISCONDUCT"
  | "OTHER";

export interface CreateUgcReportInput {
  targetType: UgcReportTargetType;
  targetId: string;
  reason: UgcReportReason;
  details?: string;
}

export interface CreateUgcReportResult {
  reportId: string;
  autoHidden: boolean;
}

export type AdminReportStatusFilter =
  | "PENDING"
  | "DISMISSED"
  | "ACTIONED"
  | "ALL";

export type AdminReportTargetFilter =
  | "ALL"
  | "FORUM_POST"
  | "FORUM_RESPONSE";

export type AdminModerationAction =
  | "DISMISS"
  | "HIDE_CONTENT"
  | "DELETE_CONTENT"
  | "RESTRICT_USER";

export interface AdminForumReportTargetLive {
  id: string;
  postId: string | null;
  title?: string | null;
  postTitle?: string | null;
  contentPreview?: string | null;
  isResolved?: boolean | null;
  isHiddenByModeration?: boolean;
  createdAt?: string;
}

export interface AdminForumReportTargetSnapshot {
  postId?: string | null;
  responseId?: string | null;
  title?: string | null;
  contentPreview?: string | null;
}

export interface AdminForumReportItem {
  id: string;
  reporterId: string;
  targetType: UgcReportTargetType;
  targetId: string;
  targetAuthorId?: string | null;
  postId: string | null;
  responseId: string | null;
  reason: UgcReportReason;
  details: string | null;
  status: "PENDING" | "DISMISSED" | "ACTIONED";
  reviewedById: string | null;
  reviewedAt: string | null;
  adminNote: string | null;
  createdAt: string;
  uniquePendingReportCount?: number;
  targetExists?: boolean;
  reporter: ForumAuthor;
  targetAuthor?: (ForumAuthor & { isRestricted?: boolean }) | null;
  targetSnapshot?: AdminForumReportTargetSnapshot | null;
  targetLive?: AdminForumReportTargetLive | null;
}

export interface AdminForumReportsResponse {
  reports: AdminForumReportItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    pendingCount: number;
  };
}

export interface ReviewAdminForumReportInput {
  action: AdminModerationAction;
  adminNote?: string;
}

const UGC_TERMS_CACHE_PREFIX = "smuct_ugc_terms_v1_";

function getCacheKey(userId?: string): string {
  return `${UGC_TERMS_CACHE_PREFIX}${userId || "current"}`;
}

export async function getCachedUgcTermsAccepted(
  userId?: string,
): Promise<string | null> {
  const key = getCacheKey(userId);
  try {
    if (Platform.OS === "web" && typeof localStorage !== "undefined") {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setCachedUgcTermsAccepted(
  acceptedAt: string | null,
  userId?: string,
): Promise<void> {
  const key = getCacheKey(userId);
  try {
    if (Platform.OS === "web" && typeof localStorage !== "undefined") {
      if (acceptedAt) {
        localStorage.setItem(key, acceptedAt);
      } else {
        localStorage.removeItem(key);
      }
      return;
    }
    if (acceptedAt) {
      await SecureStore.setItemAsync(key, acceptedAt);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch {
    // Ignore local cache write errors gracefully
  }
}

export const getUgcTermsStatus = async (
  signal?: AbortSignal,
): Promise<UgcTermsStatus> => {
  const res = await api.get("/users/me/ugc-terms", { signal });
  return {
    accepted: Boolean(res.data?.data?.accepted),
    ugcTermsAcceptedAt: res.data?.data?.ugcTermsAcceptedAt ?? null,
  };
};

export const acceptUgcTerms = async (): Promise<UgcTermsStatus> => {
  const res = await api.post("/users/me/ugc-terms");
  return {
    accepted: Boolean(res.data?.data?.accepted ?? true),
    ugcTermsAcceptedAt:
      res.data?.data?.ugcTermsAcceptedAt ?? new Date().toISOString(),
  };
};

export const createForumReport = async (
  input: CreateUgcReportInput,
): Promise<CreateUgcReportResult> => {
  const res = await api.post("/forum/reports", input);
  return res.data?.data;
};

export const getAdminForumReports = async (
  params?: {
    status?: AdminReportStatusFilter;
    targetType?: AdminReportTargetFilter;
    page?: number;
    limit?: number;
  },
  signal?: AbortSignal,
): Promise<AdminForumReportsResponse> => {
  const res = await api.get("/admin/forum/reports", { params, signal });
  return {
    reports: Array.isArray(res.data?.data) ? res.data.data : [],
    meta: res.data?.meta ?? {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
      hasMore: false,
      pendingCount: 0,
    },
  };
};

export const reviewAdminForumReport = async (
  reportId: string,
  input: ReviewAdminForumReportInput,
) => {
  const res = await api.patch(`/admin/forum/reports/${reportId}`, input);
  return res.data?.data;
};
