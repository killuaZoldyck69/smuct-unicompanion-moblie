import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNoticesAPI,
  getNoticeByIdAPI,
  createNoticeAPI,
  updateNoticeAPI,
  deleteNoticeAPI,
} from "@/services/notice-service";
import { CreateNoticeInput, UpdateNoticeInput } from "./types";

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

export const useUpdateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoticeInput }) =>
      updateNoticeAPI(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      queryClient.invalidateQueries({ queryKey: ["notice", id] });
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
