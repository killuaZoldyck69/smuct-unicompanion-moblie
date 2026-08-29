import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyComplaintsAPI,
  getAllComplaintsAdminAPI,
  getComplaintByIdAPI,
  createComplaintAPI,
  updateComplaintStatusAPI,
  deleteComplaintAPI,
} from "@/services/complaint-service";
import { CreateComplaintInput, UpdateComplaintStatusInput } from "./types";

export const useMyComplaints = () => {
  return useQuery({
    queryKey: ["myComplaints"],
    queryFn: getMyComplaintsAPI,
  });
};

export const useAllComplaintsAdmin = () => {
  return useQuery({
    queryKey: ["allComplaints"],
    queryFn: getAllComplaintsAdminAPI,
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
    },
  });
};
