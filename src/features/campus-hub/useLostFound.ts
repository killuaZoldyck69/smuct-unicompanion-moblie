import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLostFoundFeed,
  getLostFoundPostById,
  createLostFoundPost,
  deleteLostFoundPost,
  markLostFoundClaimed,
  addLostFoundComment,
  deleteLostFoundComment,
} from "@/services/lost-found-service";
import type {
  CreateLostFoundInput,
  LostFoundType,
  LostFoundStatus,
} from "@/services/lost-found-service";

const QUERY_KEY = "lostFoundFeed";

export const useLostFoundFeed = (params?: {
  type?: LostFoundType;
  status?: LostFoundStatus;
  search?: string;
}) =>
  useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getLostFoundFeed(params),
  });

export const useLostFoundPost = (id: string) =>
  useQuery({
    queryKey: ["lostFoundPost", id],
    queryFn: () => getLostFoundPostById(id),
    enabled: !!id,
  });

export const useCreateLostFoundPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLostFoundInput) => createLostFoundPost(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
};

export const useDeleteLostFoundPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLostFoundPost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
};

export const useMarkLostFoundClaimed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markLostFoundClaimed(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["lostFoundPost", id] });
    },
  });
};

export const useAddLostFoundComment = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      addLostFoundComment(postId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lostFoundPost", postId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useDeleteLostFoundComment = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      deleteLostFoundComment(postId, commentId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["lostFoundPost", postId] }),
  });
};
