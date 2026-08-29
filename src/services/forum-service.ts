import api from "./api";

export interface ForumPostItem {
  id: string;
  title: string;
  description: string;
  isResolved: boolean;
  createdAt: string;
  authorId: string;
  author?: {
    id: string;
    name: string;
    image?: string | null;
    role?: string;
  };
  _count?: {
    responses: number;
  };
  responses?: any[];
}

export interface CreateForumPostInput {
  title: string;
  description: string;
}

export interface UpdateForumPostInput {
  title?: string;
  description?: string;
}

export interface CreateForumResponseInput {
  content: string;
}

export const getForumPosts = async (params?: {
  page?: number;
  limit?: number;
  filter?: string;
  search?: string;
}): Promise<ForumPostItem[]> => {
  const res = await api.get("/forum", { params });
  return res.data?.data || [];
};
export const getForumPostsAPI = getForumPosts;

export const getSingleForumPost = async (id: string): Promise<ForumPostItem> => {
  const res = await api.get(`/forum/${id}`);
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
  const res = await api.post(`/forum/${postId}/responses`, data);
  return res.data?.data;
};
export const createForumResponseAPI = createForumResponse;
