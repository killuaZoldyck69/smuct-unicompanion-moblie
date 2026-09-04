import api from "./api";

export type ListingType = "SELLING" | "BUYING";
export type ListingStatus = "ACTIVE" | "SOLD" | "CLOSED";
export type ItemCondition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";

export type MarketplaceCategory =
  | "TEXTBOOKS"
  | "ELECTRONICS"
  | "STATIONERY"
  | "CLOTHING"
  | "OTHER";

export interface MarketplaceAuthor {
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

export interface MarketplaceComment {
  id: string;
  content: string;
  parentId?: string | null;
  createdAt: string;
  author: MarketplaceAuthor;
  replies?: MarketplaceComment[];
}

export interface MarketplacePost {
  id: string;
  type: ListingType;
  title: string;
  description: string;
  price: number | null;
  category: MarketplaceCategory;
  condition: ItemCondition | null;
  status: ListingStatus;
  images: string[];
  contactPhone: string | null;
  authorId: string;
  author: MarketplaceAuthor;
  createdAt: string;
  _count?: { comments: number };
  comments?: MarketplaceComment[];
}

export interface CreateMarketplaceInput {
  type: ListingType;
  title: string;
  description: string;
  price?: number | null;
  category: MarketplaceCategory;
  condition?: ItemCondition | null;
  images: string[];
  contactPhone?: string | null;
}

export interface CreateCommentInput {
  content: string;
  parentId?: string | null;
}

export const getMarketplaceFeed = async (params?: {
  type?: ListingType;
  status?: ListingStatus;
  search?: string;
  category?: MarketplaceCategory;
}): Promise<MarketplacePost[]> => {
  const res = await api.get("/marketplace", { params });
  return res.data?.data ?? [];
};

export const getMarketplacePostById = async (
  id: string
): Promise<MarketplacePost> => {
  const res = await api.get(`/marketplace/${id}`);
  return res.data?.data;
};

export const createMarketplacePost = async (
  data: CreateMarketplaceInput
): Promise<MarketplacePost> => {
  const res = await api.post("/marketplace", data);
  return res.data?.data;
};

export const deleteMarketplacePost = async (id: string): Promise<void> => {
  await api.delete(`/marketplace/${id}`);
};

export const markMarketplaceSold = async (
  id: string
): Promise<MarketplacePost> => {
  const res = await api.patch(`/marketplace/${id}/sold`);
  return res.data?.data;
};

export const addMarketplaceComment = async (
  postId: string,
  data: CreateCommentInput
): Promise<MarketplaceComment> => {
  const res = await api.post(`/marketplace/${postId}/comments`, data);
  return res.data?.data;
};

export const deleteMarketplaceComment = async (
  postId: string,
  commentId: string
): Promise<void> => {
  await api.delete(`/marketplace/${postId}/comments/${commentId}`);
};
