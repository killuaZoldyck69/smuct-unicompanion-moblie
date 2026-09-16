import api from "./api";

export interface AlumniItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  department: string;
  batch?: string | null;
  graduationBatch?: string | null;
  graduationYear?: number | null;
  passingYear?: number | null;
  degree?: string | null;
  currentCompany?: string | null;
  currentPosition?: string | null;
  currentRole?: string | null;
  designation?: string | null;
  skills?: string[];
  linkedInUrl?: string | null;
  linkedinUrl?: string | null;
  personalWebsiteUrl?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAlumniInput {
  name: string;
  department: string;
  batch?: string;
  graduationBatch?: string;
  passingYear?: number;
  graduationYear?: number;
  currentCompany?: string;
  designation?: string;
  currentRole?: string;
  linkedinUrl?: string;
  linkedInUrl?: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
}

export const getAlumniList = async (): Promise<AlumniItem[]> => {
  const res = await api.get("/alumni");
  return res.data?.data || [];
};
export const getAlumniListAPI = getAlumniList;

export const getAlumniById = async (id: string): Promise<AlumniItem> => {
  const res = await api.get(`/alumni/${id}`);
  return res.data?.data;
};
export const getAlumniByIdAPI = getAlumniById;

export const createAlumni = async (data: CreateAlumniInput) => {
  const res = await api.post("/alumni", data);
  return res.data?.data;
};
export const createAlumniAPI = createAlumni;

export const updateAlumni = async (
  id: string,
  data: Partial<CreateAlumniInput>,
) => {
  const res = await api.patch(`/alumni/${id}`, data);
  return res.data?.data;
};
export const updateAlumniAPI = updateAlumni;

export const deleteAlumni = async (id: string) => {
  const res = await api.delete(`/alumni/${id}`);
  return res.data?.data;
};
export const deleteAlumniAPI = deleteAlumni;
