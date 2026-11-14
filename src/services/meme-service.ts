import api from "./api";
import type { CreateUgcReportResult, UgcReportReason } from "./ugc-service";

const CAMPUS_HUB_COLD_START_TIMEOUT_MS = 45000;

export type MemeReactionType = "LIKE" | "DISLIKE";
export type MemeFilter = "latest" | "popular" | "mine";

export interface MemeAuthor {
  id: string;
  name: string;
  image?: string | null;
  role?: string | null;
  studentProfile?: {
    department?: string | null;
    program?: string | null;
    batch?: string | null;
    currentSemester?: number | string | null;
    semester?: number | string | null;
    section?: string | null;
    isCR?: boolean;
    skills?: string[];
    linkedInUrl?: string | null;
    personalWebsiteUrl?: string | null;
  } | null;
  teacherProfile?: {
    designation?: string | null;
    department?: string | null;
    faculty?: string | null;
    administrativeRole?: string | null;
    officeRoom?: string | null;
    advisoryBatch?: string | null;
    dayOff?: string | null;
    consultationSlots?:
      | Array<{ day: string; startTime: string; endTime: string }>
      | string
      | Record<string, unknown>[]
      | null;
    expertiseFields?: string[];
    academicQualifications?: unknown;
    linkedInUrl?: string | null;
    personalWebsiteUrl?: string | null;
  } | null;
}

export interface Meme {
  id: string;
  caption?: string | null;
  imageUrl: string;
  authorId: string;
  author: MemeAuthor;
  likesCount: number;
  dislikesCount: number;
  popularityScore?: number;
  isHiddenByModeration?: boolean;
  userReaction: MemeReactionType | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemeInput {
  imageUrl: string;
  caption?: string | null;
  idempotencyKey?: string;
}

export interface ReactMemeResult {
  memeId: string;
  action?: "ADDED" | "REMOVED" | "SWITCHED";
  type?: MemeReactionType;
  userReaction: MemeReactionType | null;
  likesCount: number;
  dislikesCount: number;
}

export interface MemesFeedParams {
  page?: number;
  limit?: number;
  filter?: MemeFilter;
}

export interface MemesFeedResponse {
  memes: Meme[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export const getMemesFeed = async (
  params?: MemesFeedParams,
  signal?: AbortSignal,
): Promise<MemesFeedResponse> => {
  const res = await api.get("/memes", {
    params,
    signal,
    timeout: CAMPUS_HUB_COLD_START_TIMEOUT_MS,
  });
  return {
    memes: res.data?.data ?? [],
    pagination: res.data?.pagination ?? {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
      hasMore: false,
    },
  };
};

export const getMemeById = async (
  id: string,
  signal?: AbortSignal,
): Promise<Meme> => {
  const res = await api.get(`/memes/${id}`, {
    signal,
    timeout: CAMPUS_HUB_COLD_START_TIMEOUT_MS,
  });
  return res.data?.data;
};

export const createMeme = async (data: CreateMemeInput): Promise<Meme> => {
  const res = await api.post("/memes", data, {
    timeout: CAMPUS_HUB_COLD_START_TIMEOUT_MS,
  });
  return res.data?.data;
};

export interface UpdateMemeInput {
  caption: string | null;
}

export const updateMeme = async (
  id: string,
  data: UpdateMemeInput,
): Promise<Meme> => {
  const res = await api.patch(`/memes/${id}`, data, {
    timeout: CAMPUS_HUB_COLD_START_TIMEOUT_MS,
  });
  return res.data?.data;
};

export const reactToMeme = async (
  memeId: string,
  type: MemeReactionType,
): Promise<ReactMemeResult> => {
  const res = await api.post(
    `/memes/${memeId}/react`,
    { type },
    { timeout: CAMPUS_HUB_COLD_START_TIMEOUT_MS },
  );
  return res.data?.data;
};

export const deleteMeme = async (id: string): Promise<void> => {
  await api.delete(`/memes/${id}`, {
    timeout: CAMPUS_HUB_COLD_START_TIMEOUT_MS,
  });
};

export const reportMeme = async (
  memeId: string,
  data: { reason: UgcReportReason; details?: string },
): Promise<CreateUgcReportResult> => {
  const res = await api.post(`/memes/${memeId}/reports`, data, {
    timeout: CAMPUS_HUB_COLD_START_TIMEOUT_MS,
  });
  return res.data?.data;
};
