import api from "./api";

export interface ComplaintItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "PENDING" | "INVESTIGATING" | "RESOLVED" | "REJECTED";
  isAnonymous: boolean;
  adminRemarks?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateComplaintInput {
  title: string;
  description: string;
  category: string;
  isAnonymous?: boolean;
}

export interface UpdateComplaintStatusInput {
  status: "PENDING" | "INVESTIGATING" | "RESOLVED" | "REJECTED";
  adminRemarks?: string;
}

export const getMyComplaints = async (): Promise<ComplaintItem[]> => {
  const res = await api.get("/complaints/my");
  return res.data?.data || [];
};
export const getMyComplaintsAPI = getMyComplaints;

export const getAllComplaintsAdmin = async (): Promise<ComplaintItem[]> => {
  const res = await api.get("/complaints");
  return res.data?.data || [];
};
export const getAllComplaintsAdminAPI = getAllComplaintsAdmin;

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
