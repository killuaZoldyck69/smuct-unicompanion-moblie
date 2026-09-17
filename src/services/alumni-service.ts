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

export interface AlumniQueryParams {
  page?: number;
  limit?: number;
  department?: string | null;
  search?: string | null;
  all?: boolean;
}

export interface AlumniPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface AlumniPaginatedResponse {
  data: AlumniItem[];
  meta: AlumniPaginationMeta;
}

export interface AlumniDepartmentItem {
  department: string;
  count: number;
}

export const getAlumniPaginated = async (
  params?: AlumniQueryParams,
): Promise<AlumniPaginatedResponse> => {
  const queryParams: Record<string, any> = {};
  if (params?.all) queryParams.all = true;
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.department && params.department.trim()) {
    queryParams.department = params.department.trim();
  }
  if (params?.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }

  const res = await api.get("/alumni", { params: queryParams });
  const rawData = res.data?.data;
  const items: AlumniItem[] = Array.isArray(rawData) ? rawData : [];
  const meta: AlumniPaginationMeta = res.data?.meta || {
    page: params?.page || 1,
    limit: params?.limit || items.length,
    total: items.length,
    totalPages: 1,
    hasMore: false,
  };

  return {
    data: items,
    meta,
  };
};
export const getAlumniPaginatedAPI = getAlumniPaginated;

export const getAlumniList = async (
  params?: AlumniQueryParams,
): Promise<AlumniItem[]> => {
  const res = await getAlumniPaginated(params);
  return res.data;
};
export const getAlumniListAPI = getAlumniList;

export const getAlumniDepartments = async (): Promise<AlumniDepartmentItem[]> => {
  const res = await api.get("/alumni/departments");
  return Array.isArray(res.data?.data) ? res.data.data : [];
};
export const getAlumniDepartmentsAPI = getAlumniDepartments;

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
