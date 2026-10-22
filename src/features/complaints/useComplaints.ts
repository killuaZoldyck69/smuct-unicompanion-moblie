import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyComplaintsAPI,
  getMyComplaintStatsAPI,
  getAllComplaintsAdminAPI,
  getAdminComplaintStatsAPI,
  getComplaintByIdAPI,
  createComplaintAPI,
  updateComplaintAPI,
  updateComplaintStatusAPI,
  deleteComplaintAPI,
  GetMyComplaintsParams,
  AdminGetComplaintsParams,
  CreateComplaintInput,
  UpdateComplaintInput,
  UpdateComplaintStatusInput,
} from "@/services/complaint-service";

export const useMyComplaints = (params?: GetMyComplaintsParams) => {
  return useQuery({
    queryKey: ["myComplaints", params?.status, params?.page, params?.limit],
    queryFn: () => getMyComplaintsAPI(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useMyComplaintStats = () => {
  return useQuery({
    queryKey: ["myComplaintStats"],
    queryFn: getMyComplaintStatsAPI,
    staleTime: 1000 * 60 * 2,
  });
};

export const useAdminComplaintStats = () => {
  return useQuery({
    queryKey: ["adminComplaintStats"],
    queryFn: getAdminComplaintStatsAPI,
    staleTime: 1000 * 60,
  });
};

export const useAllComplaintsAdmin = (params?: AdminGetComplaintsParams) => {
  return useQuery({
    queryKey: [
      "allComplaints",
      params?.status,
      params?.category,
      params?.search,
      params?.page,
      params?.limit,
    ],
    queryFn: () => getAllComplaintsAdminAPI(params),
    staleTime: 1000 * 60,
  });
};

export const useComplaintById = (id: string) => {
  return useQuery({
    queryKey: ["complaint", id],
    queryFn: () => getComplaintByIdAPI(id),
    enabled: !!id,
  });
};

export const useCreateComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateComplaintInput) => createComplaintAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myComplaints"] });
      queryClient.invalidateQueries({ queryKey: ["myComplaintStats"] });
      queryClient.invalidateQueries({ queryKey: ["allComplaints"] });
      queryClient.invalidateQueries({ queryKey: ["adminComplaintStats"] });
    },
  });
};

export const useUpdateComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateComplaintInput }) =>
      updateComplaintAPI(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["myComplaints"] });
      queryClient.invalidateQueries({ queryKey: ["myComplaintStats"] });
      queryClient.invalidateQueries({ queryKey: ["complaint", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["allComplaints"] });
      queryClient.invalidateQueries({ queryKey: ["adminComplaintStats"] });
    },
  });
};

/**
 * Hook to update complaint status. Supports passing { id, data } directly
 * into mutate/mutateAsync, preventing React Hook rule violations.
 */
export function useUpdateComplaintStatus(fixedId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id?: string; data: UpdateComplaintStatusInput } | UpdateComplaintStatusInput) => {
      const targetId = (payload as any).id || fixedId;
      const data = "data" in payload ? (payload as any).data : payload;
      if (!targetId) {
        throw new Error("Complaint ID is required to update status");
      }
      return updateComplaintStatusAPI(targetId, data);
    },
    onSuccess: (_, variables) => {
      const targetId = (variables as any).id || fixedId;
      queryClient.invalidateQueries({ queryKey: ["allComplaints"] });
      queryClient.invalidateQueries({ queryKey: ["adminComplaintStats"] });
      queryClient.invalidateQueries({ queryKey: ["myComplaints"] });
      queryClient.invalidateQueries({ queryKey: ["myComplaintStats"] });
      if (targetId) {
        queryClient.invalidateQueries({ queryKey: ["complaint", targetId] });
      }
    },
  });
}

export const useDeleteComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteComplaintAPI(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["allComplaints"] });
      queryClient.invalidateQueries({ queryKey: ["adminComplaintStats"] });
      queryClient.invalidateQueries({ queryKey: ["myComplaints"] });
      queryClient.invalidateQueries({ queryKey: ["myComplaintStats"] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["complaint", id] });
      }
    },
  });
};
