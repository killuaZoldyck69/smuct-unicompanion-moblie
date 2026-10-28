import { api } from "@/services/api";

export interface AdminCourseHubsParams {
  search?: string;
  department?: string;
  status?: "ALL" | "ACTIVE" | "ARCHIVED";
  page?: number;
  limit?: number;
}

export interface AdminCourseHubsResponse {
  hubs: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  meta: {
    totalActive: number;
    totalArchived: number;
    availableDepartments: string[];
  };
}

export const fetchAdminCourseHubs = async (
  params: AdminCourseHubsParams = {},
): Promise<AdminCourseHubsResponse> => {
  const queryParams = new URLSearchParams();

  if (params.search && params.search.trim()) {
    queryParams.append("search", params.search.trim());
  }
  if (
    params.department &&
    params.department.trim() &&
    params.department.toUpperCase() !== "ALL"
  ) {
    queryParams.append("department", params.department.trim());
  }
  if (params.status && params.status !== "ALL") {
    queryParams.append("status", params.status);
  }
  if (params.page) {
    queryParams.append("page", String(params.page));
  }
  if (params.limit) {
    queryParams.append("limit", String(params.limit));
  }

  const queryString = queryParams.toString();
  const url = queryString
    ? `/admin/course-hubs?${queryString}`
    : "/admin/course-hubs";

  const response = await api.get(url);
  return response.data?.data;
};

