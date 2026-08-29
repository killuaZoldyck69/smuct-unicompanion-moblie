import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getForumPostsAPI,
  getSingleForumPostAPI,
  createForumPostAPI,
  updateForumPostAPI,
  resolveForumPostAPI,
  deleteForumPostAPI,
  createForumResponseAPI,
} from "@/services/forum-service";
import {
  CreateForumPostInput,
  CreateForumResponseInput,
  UpdateForumPostInput,
} from "./types";

export const useForumPosts = (params?: {
  page?: number;
  limit?: number;
  filter?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["forumPosts", params],
    queryFn: () => getForumPostsAPI(params),
  });
};

export const useSingleForumPost = (id: string) => {
  return useQuery({
    queryKey: ["forumPost", id],
    queryFn: () => getSingleForumPostAPI(id),
    enabled: !!id,
  });
};

export const useCreateForumPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateForumPostInput) => createForumPostAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
    },
  });
};

export const useUpdateForumPost = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateForumPostInput) => updateForumPostAPI(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      queryClient.invalidateQueries({ queryKey: ["forumPost", id] });
    },
  });
};

export const useResolveForumPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resolveForumPostAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
    },
  });
};

export const useDeleteForumPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteForumPostAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
    },
  });
};

export const useCreateForumResponse = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateForumResponseInput) =>
      createForumResponseAPI(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      queryClient.invalidateQueries({ queryKey: ["forumPost", postId] });
    },
  });
};
