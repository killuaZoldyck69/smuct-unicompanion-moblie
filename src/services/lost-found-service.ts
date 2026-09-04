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
  email?: string | null;
  image?: string | null;
  role?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
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

export interface LostFoundComment {
  id: string;
  content: string;
  parentId?: string | null;
  createdAt: string;
  author: LostFoundAuthor;
  replies?: LostFoundComment[];
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
  parentId?: string | null;
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
