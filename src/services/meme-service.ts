import api from "./api";

export type MemeReactionType = "LIKE" | "DISLIKE";
export type MemeFilter = "latest" | "popular" | "mine";

export interface MemeAuthor {
  id: string;
  name: string;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  studentProfile?: {
    studentId?: string | null;
    department?: string | null;
    batch?: string | null;
    currentSemester?: number | string | null;
    section?: string | null;
  } | null;
  teacherProfile?: {
    department?: string | null;
    designation?: string | null;
    officeRoom?: string | null;
    consultationHours?: string | null;
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
  userReaction: MemeReactionType | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemeInput {
  imageUrl: string;
  caption?: string | null;
}

export interface ReactMemeResult {
  memeId: string;
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
  signal?: AbortSignal
): Promise<MemesFeedResponse> => {
  const res = await api.get("/memes", { params, signal });
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
  signal?: AbortSignal
): Promise<Meme> => {
  const res = await api.get(`/memes/${id}`, { signal });
  return res.data?.data;
};

export const createMeme = async (
  data: CreateMemeInput
): Promise<Meme> => {
  const res = await api.post("/memes", data);
  return res.data?.data;
};

export const reactToMeme = async (
  memeId: string,
  type: MemeReactionType
): Promise<ReactMemeResult> => {
  const res = await api.post(`/memes/${memeId}/react`, { type });
  return res.data?.data;
};

export const deleteMeme = async (id: string): Promise<void> => {
  await api.delete(`/memes/${id}`);
};
