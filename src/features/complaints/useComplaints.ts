import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyComplaintsAPI,
  getMyComplaintStatsAPI,
  getAllComplaintsAdminAPI,
  getComplaintByIdAPI,
  createComplaintAPI,
  updateComplaintAPI,
  updateComplaintStatusAPI,
  deleteComplaintAPI,
  GetMyComplaintsParams,
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

export const useAllComplaintsAdmin = () => {
  return useQuery({
    queryKey: ["allComplaints"],
    queryFn: getAllComplaintsAdminAPI,
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
    },
  });
};

export const useUpdateComplaintStatus = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateComplaintStatusInput) =>
      updateComplaintStatusAPI(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allComplaints"] });
      queryClient.invalidateQueries({ queryKey: ["myComplaints"] });
      queryClient.invalidateQueries({ queryKey: ["myComplaintStats"] });
      queryClient.invalidateQueries({ queryKey: ["complaint", id] });
    },
  });
};

export const useDeleteComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteComplaintAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allComplaints"] });
      queryClient.invalidateQueries({ queryKey: ["myComplaints"] });
      queryClient.invalidateQueries({ queryKey: ["myComplaintStats"] });
    },
  });
};
