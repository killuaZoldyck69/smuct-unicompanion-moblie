import api from "./api";

export type ComplaintStatus = "PENDING" | "ACCEPTED" | "RESOLVED" | "REJECTED";

export interface ComplaintUser {
  id: string;
  name: string;
  email?: string;
  image?: string | null;
  role?: string;
  studentProfile?: {
    studentId?: string;
    department?: string;
    batch?: string;
    program?: string;
  } | null;
  teacherProfile?: {
    teacherId?: string;
    department?: string;
    designation?: string;
  } | null;
}

export interface ComplaintItem {
  id: string;
  userId?: string | null;
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  isAnonymous: boolean;
  adminRemarks?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: ComplaintUser | null;
}

export interface ComplaintStats {
  all: number;
  pending: number;
  accepted: number;
  resolved: number;
  rejected: number;
}

export interface CreateComplaintInput {
  title: string;
  description: string;
  category: string;
  isAnonymous?: boolean;
}

export interface UpdateComplaintInput {
  title?: string;
  description?: string;
  category?: string;
  isAnonymous?: boolean;
}

export interface UpdateComplaintStatusInput {
  status: ComplaintStatus;
  adminRemarks?: string | null;
}

export interface GetMyComplaintsParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface AdminGetComplaintsParams {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getMyComplaints = async (
  params?: GetMyComplaintsParams,
): Promise<ComplaintItem[]> => {
  const cleanParams: Record<string, any> = {};
  if (params?.status && params.status !== "ALL") {
    cleanParams.status = params.status;
  }
  if (params?.page) cleanParams.page = params.page;
  if (params?.limit) cleanParams.limit = params.limit;

  const res = await api.get("/complaints/my", { params: cleanParams });
  return res.data?.data || [];
};
export const getMyComplaintsAPI = getMyComplaints;

export const getMyComplaintStats = async (): Promise<ComplaintStats> => {
  const res = await api.get("/complaints/my/stats");
  return res.data?.data || { all: 0, pending: 0, accepted: 0, resolved: 0, rejected: 0 };
};
export const getMyComplaintStatsAPI = getMyComplaintStats;

export const getAllComplaintsAdmin = async (
  params?: AdminGetComplaintsParams,
): Promise<ComplaintItem[]> => {
  const cleanParams: Record<string, any> = {};
  if (params?.status && params.status !== "ALL") {
    cleanParams.status = params.status;
  }
  if (params?.category && params.category !== "ALL") {
    cleanParams.category = params.category;
  }
  if (params?.search && params.search.trim()) {
    cleanParams.search = params.search.trim();
  }
  if (params?.page) cleanParams.page = params.page;
  if (params?.limit) cleanParams.limit = params.limit;

  const res = await api.get("/complaints", { params: cleanParams });
  return res.data?.data || [];
};
export const getAllComplaintsAdminAPI = getAllComplaintsAdmin;

export const getAdminComplaintStats = async (): Promise<ComplaintStats> => {
  const res = await api.get("/complaints/admin/stats");
  return res.data?.data || { all: 0, pending: 0, accepted: 0, resolved: 0, rejected: 0 };
};
export const getAdminComplaintStatsAPI = getAdminComplaintStats;

export const getComplaintById = async (id: string): Promise<ComplaintItem> => {
  const res = await api.get(`/complaints/${id}`);
  return res.data?.data;
};
export const getComplaintByIdAPI = getComplaintById;

export const createComplaint = async (data: CreateComplaintInput) => {
  const res = await api.post("/complaints", data);
  return res.data?.data;
};
export const createComplaintAPI = createComplaint;

export const updateComplaint = async (
  id: string,
  data: UpdateComplaintInput,
) => {
  const res = await api.patch(`/complaints/${id}`, data);
  return res.data?.data;
};
export const updateComplaintAPI = updateComplaint;

export const updateComplaintStatus = async (
  id: string,
  data: UpdateComplaintStatusInput,
) => {
  const res = await api.patch(`/complaints/${id}/status`, data);
  return res.data?.data;
};
export const updateComplaintStatusAPI = updateComplaintStatus;

export const deleteComplaint = async (id: string) => {
  const res = await api.delete(`/complaints/${id}`);
  return res.data?.data;
};
export const deleteComplaintAPI = deleteComplaint;
