import api from "./api";
import type { CreateUgcReportResult, UgcReportReason } from "./ugc-service";

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------
export type ListingType = "SELLING" | "BUYING";
export type ListingStatus = "ACTIVE" | "SOLD" | "CLOSED";
export type ItemCondition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";
export type MarketplaceCategory =
  | "TEXTBOOKS"
  | "ELECTRONICS"
  | "CALCULATORS"
  | "COMPUTERS_ACCESSORIES"
  | "LAB_DRAWING_TOOLS"
  | "STATIONERY"
  | "CYCLES_VEHICLES"
  | "ROOM_HOSTEL_ESSENTIALS"
  | "FURNITURE"
  | "SPORTS_FITNESS"
  | "CLOTHING"
  | "MOBILE_ACCESSORIES"
  | "OTHER";

export interface MarketplaceAuthor {
  id: string;
  name: string;
  image?: string | null;
  role?: string | null;
  studentProfile?: {
    department?: string | null;
    program?: string | null;
    batch?: string | null;
    currentSemester?: number | string | null;
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
      | any
      | null;
    expertiseFields?: string[];
    linkedInUrl?: string | null;
    personalWebsiteUrl?: string | null;
  } | null;
}

export interface MarketplaceComment {
  id: string;
  content: string;
  parentId?: string | null;
  isHiddenByModeration?: boolean;
  createdAt: string;
  updatedAt?: string;
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
  isHiddenByModeration?: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: { comments: number };
  comments?: MarketplaceComment[];
}

// ---------------------------------------------------------------------------
// Paginated response envelope
// ---------------------------------------------------------------------------
export interface PaginatedFeedResponse {
  items: MarketplacePost[];
  nextCursor: string | null;
  total: number;
  counts?: {
    selling: number;
    buying: number;
  };
}

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------
export interface FeedQueryParams {
  type?: ListingType;
  status?: ListingStatus;
  category?: MarketplaceCategory;
  search?: string;
  myPosts?: boolean;
  limit?: number;
  cursor?: string;
}

export interface CreateMarketplaceReportInput {
  targetType: "MARKETPLACE_POST" | "MARKETPLACE_COMMENT";
  targetId: string;
  reason: UgcReportReason;
  details?: string;
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

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------
export const getMarketplaceFeed = async (
  params?: FeedQueryParams
): Promise<PaginatedFeedResponse> => {
  const res = await api.get("/marketplace", { params });
  return (
    res.data?.data ?? {
      items: [],
      nextCursor: null,
      total: 0,
      counts: { selling: 0, buying: 0 },
    }
  );
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

export const updateMarketplacePost = async (
  id: string,
  data: Partial<CreateMarketplaceInput>
): Promise<MarketplacePost> => {
  const res = await api.patch(`/marketplace/${id}`, data);
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

export const updateMarketplaceStatus = async (
  id: string,
  status: ListingStatus
): Promise<MarketplacePost> => {
  const res = await api.patch(`/marketplace/${id}/status`, { status });
  return res.data?.data;
};

export const addMarketplaceComment = async (
  postId: string,
  data: CreateCommentInput
): Promise<MarketplaceComment> => {
  const res = await api.post(`/marketplace/${postId}/comments`, data);
  return res.data?.data;
};

export const updateMarketplaceComment = async (
  postId: string,
  commentId: string,
  content: string
): Promise<MarketplaceComment> => {
  const res = await api.patch(`/marketplace/${postId}/comments/${commentId}`, {
    content,
  });
  return res.data?.data;
};

export const deleteMarketplaceComment = async (
  postId: string,
  commentId: string
): Promise<void> => {
  await api.delete(`/marketplace/${postId}/comments/${commentId}`);
};

export const reportMarketplaceContent = async (
  input: CreateMarketplaceReportInput
): Promise<CreateUgcReportResult> => {
  const res = await api.post("/marketplace/reports", input);
  return res.data?.data;
};
