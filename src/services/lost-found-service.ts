import api from "./api";

export type LostFoundType = "LOST" | "FOUND";
export type LostFoundStatus = "ACTIVE" | "CLAIMED" | "RESOLVED" | "CLOSED";
export type LostFoundClaimStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

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

export interface LostFoundClaim {
  id: string;
  postId: string;
  claimantId: string;
  status: LostFoundClaimStatus;
  message: string;
  answer?: string | null;
  proofImage?: string | null;
  createdAt: string;
  updatedAt?: string;
  claimant: LostFoundAuthor;
}

export interface HandoverData {
  role: "AUTHOR" | "CLAIMANT";
  counterpart: LostFoundAuthor;
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
  verificationQuestion?: string | null;
  verificationAnswer?: string | null;
  resolvedClaimId?: string | null;
  authorId: string;
  author: LostFoundAuthor;
  createdAt: string;
  updatedAt?: string;
  _count?: { claims?: number };
  myClaim?: LostFoundClaim | null;
  handoverData?: HandoverData | null;
}

export interface CreateLostFoundInput {
  type: LostFoundType;
  title: string;
  description: string;
  category: LostFoundCategory;
  location: string;
  images: string[];
  verificationQuestion?: string | null;
  verificationAnswer?: string | null;
}

export interface CreateClaimInput {
  message: string;
  answer?: string | null;
  proofImage?: string | null;
}

export interface LostFoundFeedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface LostFoundFeedResponse {
  data: LostFoundPost[];
  meta: LostFoundFeedMeta;
}

export interface GetLostFoundFeedParams {
  type?: LostFoundType;
  status?: LostFoundStatus;
  category?: LostFoundCategory;
  search?: string;
  myPosts?: boolean;
  page?: number;
  limit?: number;
}

export const getLostFoundFeedPaginated = async (
  params?: GetLostFoundFeedParams,
  signal?: AbortSignal
): Promise<LostFoundFeedResponse> => {
  const res = await api.get("/lost-found", { params, signal });
  return {
    data: res.data?.data ?? [],
    meta: res.data?.meta ?? {
      page: 1,
      limit: 20,
      total: res.data?.data?.length ?? 0,
      totalPages: 1,
      hasMore: false,
    },
  };
};

export const getLostFoundFeed = async (
  params?: GetLostFoundFeedParams,
  signal?: AbortSignal
): Promise<LostFoundPost[]> => {
  const res = await getLostFoundFeedPaginated(params, signal);
  return res.data;
};

export const getPossibleMatches = async (
  postId: string
): Promise<LostFoundPost[]> => {
  const res = await api.get(`/lost-found/${postId}/matches`);
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

export const updateLostFoundStatus = async (
  id: string,
  status: LostFoundStatus
): Promise<LostFoundPost> => {
  const res = await api.patch(`/lost-found/${id}/status`, { status });
  return res.data?.data;
};

export const getLostFoundClaims = async (
  postId: string
): Promise<LostFoundClaim[]> => {
  const res = await api.get(`/lost-found/${postId}/claims`);
  return res.data?.data ?? [];
};

export const submitLostFoundClaim = async (
  postId: string,
  data: CreateClaimInput
): Promise<LostFoundClaim> => {
  const res = await api.post(`/lost-found/${postId}/claims`, data);
  return res.data?.data;
};

export const acceptLostFoundClaim = async (
  postId: string,
  claimId: string
): Promise<{ post: LostFoundPost; acceptedClaim: LostFoundClaim }> => {
  const res = await api.patch(`/lost-found/${postId}/claims/${claimId}/accept`);
  return res.data?.data;
};

export const rejectLostFoundClaim = async (
  postId: string,
  claimId: string
): Promise<LostFoundClaim> => {
  const res = await api.patch(`/lost-found/${postId}/claims/${claimId}/reject`);
  return res.data?.data;
};

export const withdrawLostFoundClaim = async (
  postId: string,
  claimId: string
): Promise<void> => {
  await api.delete(`/lost-found/${postId}/claims/${claimId}`);
};

