import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllUsersAdminAPI,
  updateUserRoleAdminAPI,
  deleteUserAdminAPI,
} from "@/services/admin-service";

export const useAllUsersAdmin = (params?: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["adminUsers", params],
    queryFn: () => getAllUsersAdminAPI(params),
  });
};

export const useUpdateUserRoleAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: "STUDENT" | "TEACHER" | "ADMIN";
    }) => updateUserRoleAdminAPI(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });
};

export const useDeleteUserAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteUserAdminAPI(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });
};
