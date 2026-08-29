import api from "./api";

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  image?: string | null;
  phoneNumber?: string | null;
  createdAt: string;
  studentProfile?: any;
  teacherProfile?: any;
}

export const getAllUsersAdmin = async (params?: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}): Promise<{ data: AdminUserItem[]; meta: any }> => {
  const res = await api.get("/users", { params });
  return res.data?.data || { data: [], meta: {} };
};
export const getAllUsersAdminAPI = getAllUsersAdmin;

export const updateUserRoleAdmin = async (
  userId: string,
  role: "STUDENT" | "TEACHER" | "ADMIN",
) => {
  const res = await api.patch(`/users/${userId}/role`, { role });
  return res.data?.data;
};
export const updateUserRoleAdminAPI = updateUserRoleAdmin;

export const deleteUserAdmin = async (userId: string) => {
  const res = await api.delete(`/users/${userId}`);
  return res.data?.data;
};
export const deleteUserAdminAPI = deleteUserAdmin;
