import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getForumPostsAPI,
  getSingleForumPostAPI,
  createForumPostAPI,
  updateForumPostAPI,
  resolveForumPostAPI,
  deleteForumPostAPI,
  createForumResponseAPI,
  updateForumResponseAPI,
  deleteForumResponseAPI,
  type GetForumPostsParams,
} from "@/services/forum-service";
import type {
  CreateForumPostInput,
  CreateForumResponseInput,
  UpdateForumPostInput,
  ForumFeedResponse,
  ForumPostItem,
} from "./types";

export const forumQueryKeys = {
  all: ["forumPosts"] as const,
  feed: (params?: GetForumPostsParams) => ["forumPosts", params] as const,
  detail: (id: string) => ["forumPost", id] as const,
};

export const useForumPosts = (params?: GetForumPostsParams) => {
  return useQuery<ForumFeedResponse>({
    queryKey: forumQueryKeys.feed(params),
    queryFn: ({ signal }) => getForumPostsAPI(params, signal),
  });
};

export const useSingleForumPost = (id: string) => {
  return useQuery<ForumPostItem>({
    queryKey: forumQueryKeys.detail(id),
    queryFn: ({ signal }) => getSingleForumPostAPI(id, signal),
    enabled: !!id,
  });
};

export const useCreateForumPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateForumPostInput) => createForumPostAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
    },
  });
};

export const useUpdateForumPost = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateForumPostInput) => updateForumPostAPI(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.detail(id) });
    },
  });
};

export const useResolveForumPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resolveForumPostAPI(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.detail(id) });
    },
  });
};

export const useDeleteForumPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteForumPostAPI(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.detail(id) });
    },
  });
};

export const useCreateForumResponse = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateForumResponseInput) =>
      createForumResponseAPI(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.detail(postId) });
    },
  });
};

export const useUpdateForumResponse = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      responseId,
      content,
    }: {
      responseId: string;
      content: string;
    }) => updateForumResponseAPI(postId, responseId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.detail(postId) });
    },
  });
};

export const useDeleteForumResponse = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (responseId: string) =>
      deleteForumResponseAPI(postId, responseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.detail(postId) });
    },
  });
};
