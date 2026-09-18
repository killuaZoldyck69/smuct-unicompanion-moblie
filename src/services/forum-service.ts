import api from "./api";
import type {
  ForumPostItem,
  CreateForumPostInput,
  UpdateForumPostInput,
  CreateForumResponseInput,
  ForumFeedResponse,
  ForumFeedMeta,
  ForumCounts,
} from "@/features/forum/types";

export type {
  ForumPostItem,
  CreateForumPostInput,
  UpdateForumPostInput,
  CreateForumResponseInput,
  ForumFeedResponse,
  ForumFeedMeta,
  ForumCounts,
};

export interface GetForumPostsParams {
  page?: number;
  limit?: number;
  filter?: "ALL" | "UNRESOLVED" | "RESOLVED" | "MY_POSTS";
  search?: string;
}

export const getForumPosts = async (
  params?: GetForumPostsParams,
  signal?: AbortSignal,
): Promise<ForumFeedResponse> => {
  const res = await api.get("/forum", { params, signal });
  return {
    posts: res.data?.data || [],
    meta: res.data?.meta,
  };
};
export const getForumPostsAPI = getForumPosts;

export const getSingleForumPost = async (
  id: string,
  signal?: AbortSignal,
): Promise<ForumPostItem> => {
  const res = await api.get(`/forum/${id}`, { signal });
  return res.data?.data;
};
export const getSingleForumPostAPI = getSingleForumPost;

export const createForumPost = async (data: CreateForumPostInput) => {
  const res = await api.post("/forum", data);
  return res.data?.data;
};
export const createForumPostAPI = createForumPost;

export const updateForumPost = async (
  id: string,
  data: UpdateForumPostInput,
) => {
  const res = await api.patch(`/forum/${id}`, data);
  return res.data?.data;
};
export const updateForumPostAPI = updateForumPost;

export const resolveForumPost = async (id: string) => {
  const res = await api.patch(`/forum/${id}/resolve`);
  return res.data?.data;
};
export const resolveForumPostAPI = resolveForumPost;

export const deleteForumPost = async (id: string) => {
  const res = await api.delete(`/forum/${id}`);
  return res.data?.data;
};
export const deleteForumPostAPI = deleteForumPost;

export const createForumResponse = async (
  postId: string,
  data: CreateForumResponseInput,
) => {
  const res = await api.post(`/forum/${postId}/respond`, data);
  return res.data?.data;
};
export const createForumResponseAPI = createForumResponse;

export const updateForumResponse = async (
  postId: string,
  responseId: string,
  data: { content: string },
) => {
  const res = await api.patch(`/forum/${postId}/responses/${responseId}`, data);
  return res.data?.data;
};
export const updateForumResponseAPI = updateForumResponse;

export const deleteForumResponse = async (
  postId: string,
  responseId: string,
) => {
  const res = await api.delete(`/forum/${postId}/responses/${responseId}`);
  return res.data?.data;
};
export const deleteForumResponseAPI = deleteForumResponse;
