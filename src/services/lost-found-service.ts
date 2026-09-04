import api from "./api";

export type LostFoundType = "LOST" | "FOUND";
export type LostFoundStatus = "ACTIVE" | "CLAIMED" | "RESOLVED";

export type LostFoundCategory =
  | "BOOKS"
  | "ELECTRONICS"
  | "ID_CARD"
  | "KEYS"
  | "CLOTHING"
  | "OTHER";

export interface LostFoundAuthor {
  id: string;
  name: string;
  image?: string | null;
}

export interface LostFoundComment {
  id: string;
  content: string;
  createdAt: string;
  author: LostFoundAuthor;
}

export interface LostFoundPost {
  id: string;
  type: LostFoundType;
  title: string;
  description: string;
  category: LostFoundCategory;
  location: string;
  status: LostFoundStatus;
  images: string[];
  authorId: string;
  author: LostFoundAuthor;
  createdAt: string;
  _count?: { comments: number };
  comments?: LostFoundComment[];
}

export interface CreateLostFoundInput {
  type: LostFoundType;
  title: string;
  description: string;
  category: LostFoundCategory;
  location: string;
  images: string[];
}

export interface CreateCommentInput {
  content: string;
}

export const getLostFoundFeed = async (params?: {
  type?: LostFoundType;
  status?: LostFoundStatus;
  search?: string;
}): Promise<LostFoundPost[]> => {
  const res = await api.get("/lost-found", { params });
  return res.data?.data ?? [];
};

export const getLostFoundPostById = async (id: string): Promise<LostFoundPost> => {
  const res = await api.get(`/lost-found/${id}`);
  return res.data?.data;
};

export const createLostFoundPost = async (
  data: CreateLostFoundInput
): Promise<LostFoundPost> => {
  const res = await api.post("/lost-found", data);
  return res.data?.data;
};

export const deleteLostFoundPost = async (id: string): Promise<void> => {
  await api.delete(`/lost-found/${id}`);
};

export const markLostFoundClaimed = async (id: string): Promise<LostFoundPost> => {
  const res = await api.patch(`/lost-found/${id}/claim`);
  return res.data?.data;
};

export const addLostFoundComment = async (
  postId: string,
  data: CreateCommentInput
): Promise<LostFoundComment> => {
  const res = await api.post(`/lost-found/${postId}/comments`, data);
  return res.data?.data;
};

export const deleteLostFoundComment = async (
  postId: string,
  commentId: string
): Promise<void> => {
  await api.delete(`/lost-found/${postId}/comments/${commentId}`);
};
