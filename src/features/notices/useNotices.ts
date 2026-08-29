import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNoticesAPI,
  getNoticeByIdAPI,
  createNoticeAPI,
  deleteNoticeAPI,
} from "@/services/notice-service";
import { CreateNoticeInput } from "./types";

export const useNotices = () => {
  return useQuery({
    queryKey: ["notices"],
    queryFn: getNoticesAPI,
  });
};

export const useNoticeById = (id: string) => {
  return useQuery({
    queryKey: ["notice", id],
    queryFn: () => getNoticeByIdAPI(id),
    enabled: !!id,
  });
};

export const useCreateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNoticeInput) => createNoticeAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
};

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNoticeAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
};
