import api from "./api";

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
  author?: {
    id: string;
    name: string;
    image?: string | null;
    phoneNumber?: string;
  };
  _count?: {
    responses: number;
  };
  responses?: any[];
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

export const getBloodFeed = async (): Promise<BloodPostItem[]> => {
  const res = await api.get("/blood");
  return res.data?.data || [];
};
export const getBloodFeedAPI = getBloodFeed;

export const getBloodPostById = async (id: string): Promise<BloodPostItem> => {
  const res = await api.get(`/blood/${id}`);
  return res.data?.data;
};
export const getBloodPostByIdAPI = getBloodPostById;

export const createBloodPost = async (data: CreateBloodPostInput) => {
  const res = await api.post("/blood", data);
  return res.data?.data;
};
export const createBloodPostAPI = createBloodPost;

export const respondBloodPost = async (
  postId: string,
  data: RespondBloodPostInput,
) => {
  const res = await api.post(`/blood/${postId}/respond`, data);
  return res.data?.data;
};
export const respondBloodPostAPI = respondBloodPost;

export const resolveBloodPost = async (id: string) => {
  const res = await api.patch(`/blood/${id}/resolve`);
  return res.data?.data;
};
export const resolveBloodPostAPI = resolveBloodPost;

export const deleteBloodPost = async (id: string) => {
  const res = await api.delete(`/blood/${id}`);
  return res.data?.data;
};
export const deleteBloodPostAPI = deleteBloodPost;
