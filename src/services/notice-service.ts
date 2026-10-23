import api from "./api";

export interface NoticeItem {
  id: string;
  referenceNo?: string | null;
  title: string;
  body?: string;
  description?: string;
  issuerName?: string;
  issuerDesignation?: string;
  copyTo?: string[];
  fileUrl?: string | null;
  category?: string;
  issueDate?: string | null;
  priority?: string | null;
  createdAt: string;
  updatedAt?: string;
  authorId?: string;
  author?: {
    name: string;
  };
}

export interface NoticesPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
}

export interface PaginatedNoticesResponse {
  items: NoticeItem[];
  pagination: NoticesPagination;
}

export interface GetNoticesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: "createdAt" | "issueDate" | "title";
  sortOrder?: "asc" | "desc";
}

export interface CreateNoticeInput {
  referenceNo?: string;
  title: string;
  body?: string;
  description?: string;
  issuerName?: string;
  issuerDesignation?: string;
  copyTo?: string[];
  fileUrl?: string;
  category?: string;
}

export interface UpdateNoticeInput {
  referenceNo?: string | null;
  title?: string;
  body?: string;
  description?: string;
  issuerName?: string;
  issuerDesignation?: string;
  copyTo?: string[];
  fileUrl?: string;
  category?: string;
}

/**
 * High-performance paginated notice fetcher with server-side pagination metadata
 */
export const getNoticesPaginatedAPI = async (
  params?: GetNoticesQueryParams,
): Promise<PaginatedNoticesResponse> => {
  const res = await api.get("/notices", { params });
  const data = res.data?.data;
  const pagination: NoticesPagination = res.data?.pagination || {
    page: params?.page || 1,
    limit: params?.limit || 20,
    totalCount: Array.isArray(data) ? data.length : 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
  };

  const items: NoticeItem[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : [];

  return { items, pagination };
};

/**
 * Standard notice array fetcher (100% backward-compatible with legacy callers)
 */
export const getNotices = async (
  params?: GetNoticesQueryParams,
): Promise<NoticeItem[]> => {
  const res = await api.get("/notices", { params });
  const data = res.data?.data;
  if (data && Array.isArray(data.items)) {
    return data.items;
  }
  return Array.isArray(data) ? data : [];
};
export const getNoticesAPI = getNotices;

export const getNoticeById = async (id: string): Promise<NoticeItem> => {
  const res = await api.get(`/notices/${id}`);
  return res.data?.data;
};
export const getNoticeByIdAPI = getNoticeById;

export const createNotice = async (data: CreateNoticeInput) => {
  const res = await api.post("/notices", data);
  return res.data?.data;
};
export const createNoticeAPI = createNotice;

export const updateNotice = async (id: string, data: UpdateNoticeInput) => {
  const res = await api.patch(`/notices/${id}`, data);
  return res.data?.data;
};
export const updateNoticeAPI = updateNotice;

export const deleteNotice = async (id: string) => {
  const res = await api.delete(`/notices/${id}`);
  return res.data?.data;
};
export const deleteNoticeAPI = deleteNotice;
