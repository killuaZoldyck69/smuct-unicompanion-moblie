import { useRef } from "react";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
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
  reactToForumResponseAPI,
  type GetForumPostsParams,
} from "@/services/forum-service";
import {
  applyOptimisticReactionToThread,
  patchReactionResultInThread,
} from "./forum-logic";
import type {
  CreateForumPostInput,
  CreateForumResponseInput,
  UpdateForumPostInput,
  ForumResponseReactionType,
  ForumFeedResponse,
  ForumPostItem,
} from "./types";

export const forumQueryKeys = {
  all: ["forumPosts"] as const,
  feed: (params?: Record<string, any>) => ["forumPosts", "feed", params] as const,
  detail: (id: string) => ["forumPosts", "detail", id] as const,
};

export const useInfiniteForumPosts = (
  params?: Omit<GetForumPostsParams, "page">,
) => {
  return useInfiniteQuery<ForumFeedResponse>({
    queryKey: forumQueryKeys.feed(params),
    queryFn: ({ pageParam = 1, signal }) =>
      getForumPostsAPI(
        {
          ...params,
          page: pageParam as number,
        },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const page = lastPage?.meta?.page ?? 1;
      const totalPages = lastPage?.meta?.totalPages ?? 1;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes fresh cache
    gcTime: 1000 * 60 * 10,   // 10 minutes memory cache
    placeholderData: keepPreviousData,
  });
};

export const useForumPosts = (params?: GetForumPostsParams) => {
  return useQuery<ForumFeedResponse>({
    queryKey: forumQueryKeys.feed(params),
    queryFn: ({ signal }) => getForumPostsAPI(params, signal),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    placeholderData: keepPreviousData,
  });
};

export const useSingleForumPost = (id: string) => {
  return useQuery<ForumPostItem>({
    queryKey: forumQueryKeys.detail(id),
    queryFn: ({ signal }) => getSingleForumPostAPI(id, signal),
    enabled: !!id,
    staleTime: 1000 * 60 * 1, // 1 minute fresh cache
    gcTime: 1000 * 60 * 10,   // 10 minutes memory cache
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

type UpdateForumPostParams =
  | UpdateForumPostInput
  | { id: string; data: UpdateForumPostInput };

function unpackUpdatePostParams(
  params: UpdateForumPostParams,
  defaultId?: string,
): { targetId: string | undefined; data: UpdateForumPostInput } {
  if ("data" in params) {
    return { targetId: params.id, data: params.data };
  }
  return { targetId: defaultId, data: params };
}

export const useUpdateForumPost = (defaultId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: UpdateForumPostParams) => {
      const { targetId, data } = unpackUpdatePostParams(params, defaultId);
      if (!targetId) {
        throw new Error("Missing forum post ID for update");
      }
      return updateForumPostAPI(targetId, data);
    },
    onSuccess: (_, params) => {
      const { targetId } = unpackUpdatePostParams(params, defaultId);
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
      if (targetId) {
        queryClient.invalidateQueries({
          queryKey: forumQueryKeys.detail(targetId),
        });
      }
    },
  });
};

export const useResolveForumPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: string | { id: string; isResolved?: boolean }) => {
      const postId =
        typeof variables === "string" ? variables : variables.id;
      const isResolved =
        typeof variables === "object" ? variables.isResolved : undefined;
      return resolveForumPostAPI(postId, isResolved);
    },
    onSuccess: (_, variables) => {
      const postId =
        typeof variables === "string" ? variables : variables.id;
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: forumQueryKeys.detail(postId),
      });
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
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
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

export const useReactForumResponse = (postId: string) => {
  const queryClient = useQueryClient();
  const latestSeqByResponseRef = useRef<Record<string, number>>({});
  const queueByResponseRef = useRef<Record<string, Promise<unknown>>>({});

  return useMutation({
    mutationFn: ({
      responseId,
      type,
    }: {
      responseId: string;
      type: ForumResponseReactionType;
    }) => {
      const previous =
        queueByResponseRef.current[responseId] ?? Promise.resolve();
      const next = previous
        .catch(() => undefined)
        .then(() => reactToForumResponseAPI(postId, responseId, type));
      queueByResponseRef.current[responseId] = next;
      return next.finally(() => {
        if (queueByResponseRef.current[responseId] === next) {
          delete queueByResponseRef.current[responseId];
        }
      });
    },
    onMutate: async ({ responseId, type }) => {
      const seq = (latestSeqByResponseRef.current[responseId] ?? 0) + 1;
      latestSeqByResponseRef.current[responseId] = seq;

      const detailKey = forumQueryKeys.detail(postId);
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previous = queryClient.getQueryData<ForumPostItem>(detailKey);
      if (previous) {
        queryClient.setQueryData<ForumPostItem>(
          detailKey,
          applyOptimisticReactionToThread(previous, responseId, type),
        );
      }
      return { previous, seq, responseId };
    },
    onError: (_err, _vars, context) => {
      if (
        !context ||
        latestSeqByResponseRef.current[context.responseId] !== context.seq
      ) {
        return;
      }
      if (context.previous) {
        queryClient.setQueryData(forumQueryKeys.detail(postId), context.previous);
      }
    },
    onSuccess: (result, _vars, context) => {
      if (
        !result ||
        !context ||
        latestSeqByResponseRef.current[context.responseId] !== context.seq
      ) {
        return;
      }
      const detailKey = forumQueryKeys.detail(postId);
      const current = queryClient.getQueryData<ForumPostItem>(detailKey);
      if (current) {
        queryClient.setQueryData<ForumPostItem>(
          detailKey,
          patchReactionResultInThread(current, result),
        );
      }
    },
    onSettled: (_data, _err, _vars, context) => {
      if (
        !context ||
        latestSeqByResponseRef.current[context.responseId] !== context.seq
      ) {
        return;
      }
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.detail(postId) });
    },
  });
};
