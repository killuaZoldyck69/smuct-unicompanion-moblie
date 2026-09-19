export interface BloodAuthor {
  id: string;
  name: string;
  image?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  role?: string;
  studentProfile?: {
    department?: string | null;
    currentSemester?: string | number | null;
    section?: string | null;
  } | null;
  teacherProfile?: {
    department?: string | null;
    designation?: string | null;
  } | null;
}

export interface BloodResponseItem {
  id: string;
  message?: string | null;
  createdAt: string;
  responder: BloodAuthor;
}

export interface BloodCounts {
  total: number;
  active: number;
  urgent: number;
  fulfilled: number;
  myPosts: number;
}

export interface BloodFeedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  counts: BloodCounts;
}

export interface BloodFeedResponse {
  posts: BloodPostItem[];
  meta?: BloodFeedMeta;
}

export interface GetBloodFeedParams {
  page?: number;
  limit?: number;
  search?: string;
  bloodGroup?: string;
  urgency?: string;
  isFulfilled?: boolean | string;
  myPosts?: boolean | string;
}

export interface BloodPostItem {
  id: string;
  patientName: string;
  patientCondition: string;
  bloodGroup: string;
  location: string;
  urgency: string;
  contactPhone: string;
  isFulfilled: boolean;
  createdAt: string;
  authorId: string;
  author?: BloodAuthor | null;
  _count?: {
    responses: number;
  };
  responses?: BloodResponseItem[];
}

export interface CreateBloodPostInput {
  patientName: string;
  patientCondition: string;
  bloodGroup: string;
  location: string;
  urgency: string;
  contactPhone: string;
}

export interface RespondBloodPostInput {
  message?: string;
}
