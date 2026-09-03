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
  authorId?: string;
  author?: {
    name: string;
  };
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

export const getNotices = async (): Promise<NoticeItem[]> => {
  const res = await api.get("/notices");
  return res.data?.data || [];
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

export const deleteNotice = async (id: string) => {
  const res = await api.delete(`/notices/${id}`);
  return res.data?.data;
};
export const deleteNoticeAPI = deleteNotice;
