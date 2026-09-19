import api from "./api";
import type {
  BloodAuthor,
  BloodResponseItem,
  BloodCounts,
  BloodFeedMeta,
  BloodFeedResponse,
  GetBloodFeedParams,
  BloodPostItem,
  CreateBloodPostInput,
  RespondBloodPostInput,
} from "@/features/blood/types";

export type {
  BloodAuthor,
  BloodResponseItem,
  BloodCounts,
  BloodFeedMeta,
  BloodFeedResponse,
  GetBloodFeedParams,
  BloodPostItem,
  CreateBloodPostInput,
  RespondBloodPostInput,
};

export const getBloodFeedPaginated = async (
  params?: GetBloodFeedParams,
  signal?: AbortSignal,
): Promise<BloodFeedResponse> => {
  const res = await api.get("/blood", { params, signal });
  return {
    posts: res.data?.data || [],
    meta: res.data?.meta,
  };
};

export const getBloodFeed = async (): Promise<BloodPostItem[]> => {
  const res = await api.get("/blood");
  return res.data?.data || [];
};
export const getBloodFeedAPI = getBloodFeed;

export const getBloodPostById = async (
  id: string,
  signal?: AbortSignal,
): Promise<BloodPostItem> => {
  const res = await api.get(`/blood/${id}`, { signal });
  return res.data?.data;
};
export const getBloodPostByIdAPI = getBloodPostById;

export const createBloodPost = async (data: CreateBloodPostInput) => {
  const res = await api.post("/blood", data);
  return res.data?.data;
};
export const createBloodPostAPI = createBloodPost;

export const respondBloodPost = async (
  postId: string,
  data: RespondBloodPostInput,
) => {
  const res = await api.post(`/blood/${postId}/respond`, data);
  return res.data?.data;
};
export const respondBloodPostAPI = respondBloodPost;

export const resolveBloodPost = async (id: string) => {
  const res = await api.patch(`/blood/${id}/resolve`);
  return res.data?.data;
};
export const resolveBloodPostAPI = resolveBloodPost;

export const deleteBloodPost = async (id: string) => {
  const res = await api.delete(`/blood/${id}`);
  return res.data?.data;
};
export const deleteBloodPostAPI = deleteBloodPost;
