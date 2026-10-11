import api from "./api";

export interface TeacherProfileData {
  id: string;
  userId: string;
  teacherId: string;
  designation: string;
  department: string;
  faculty: string;
  officeRoom?: string | null;
  consultationHours?: string | null;
  expertiseFields?: string[] | null;
  academicQualifications?: any | null;
  linkedInUrl?: string | null;
  personalWebsiteUrl?: string | null;
}

export interface TeacherDirectoryItem {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  role?: string | null;
  createdAt?: string;
  teacherProfile?: TeacherProfileData | null;
}

export interface TeacherPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface TeacherDirectoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
}

export interface TeachersDirectoryResponse {
  data: TeacherDirectoryItem[];
  meta: TeacherPaginationMeta;
}

/**
 * Fetch teachers with search, department filtering, and pagination
 */
export const getTeachersDirectory = async (
  params?: TeacherDirectoryQueryParams,
): Promise<TeachersDirectoryResponse> => {
  const queryParams: Record<string, any> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.search?.trim()) queryParams.search = params.search.trim();
  if (params?.department?.trim()) queryParams.department = params.department.trim();

  const res = await api.get("/directory/teachers", { params: queryParams });
  const rawData = res.data?.data;
  const items: TeacherDirectoryItem[] = Array.isArray(rawData) ? rawData : [];

  const meta: TeacherPaginationMeta = res.data?.meta || {
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

/**
 * Fetch unique active departments across teachers
 */
export const getTeacherDepartments = async (): Promise<string[]> => {
  const res = await api.get("/directory/teachers/departments");
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

// Backwards-compatible legacy helpers
export const getDirectoryTeachers = async (): Promise<TeacherDirectoryItem[]> => {
  const res = await getTeachersDirectory({ limit: 100 });
  return res.data;
};

export const getDirectoryTeachersAPI = getDirectoryTeachers;
export const getTeachersDirectoryAPI = getDirectoryTeachers;
