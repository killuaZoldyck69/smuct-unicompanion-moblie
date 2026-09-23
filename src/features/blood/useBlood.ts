import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  getBloodFeedAPI,
  getBloodFeedPaginated,
  getBloodPostByIdAPI,
  createBloodPostAPI,
  respondBloodPostAPI,
  resolveBloodPostAPI,
  deleteBloodPostAPI,
} from "@/services/blood-service";
import type {
  CreateBloodPostInput,
  RespondBloodPostInput,
  GetBloodFeedParams,
  BloodFeedResponse,
  BloodPostItem,
} from "./types";

export const bloodKeys = {
  all: ["bloodPosts"] as const,
  feed: (params?: Record<string, any>) =>
    ["bloodPosts", "feed", params] as const,
  detail: (id: string) => ["bloodPosts", "detail", id] as const,
};

export const useInfiniteBloodFeed = (
  params?: Omit<GetBloodFeedParams, "page">,
) => {
  return useInfiniteQuery<BloodFeedResponse, Error>({
    queryKey: bloodKeys.feed(params),
    queryFn: ({ pageParam = 1, signal }) =>
      getBloodFeedPaginated(
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
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 15,
    refetchOnReconnect: "always",
    placeholderData: keepPreviousData,
  });
};

export const useBloodFeed = () => {
  return useQuery<BloodPostItem[], Error>({
    queryKey: bloodKeys.feed(),
    queryFn: () => getBloodFeedAPI(),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 15,
    refetchOnReconnect: "always",
    placeholderData: keepPreviousData,
  });
};

export const useBloodPostById = (id?: string) => {
  return useQuery<BloodPostItem, Error>({
    queryKey: bloodKeys.detail(id || ""),
    queryFn: ({ signal }) => getBloodPostByIdAPI(id!, signal),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 15,
    refetchOnReconnect: "always",
  });
};

export const useCreateBloodPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBloodPostInput) => createBloodPostAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloodKeys.all });
    },
  });
};

export const useRespondBloodPost = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RespondBloodPostInput) =>
      respondBloodPostAPI(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloodKeys.all });
      queryClient.invalidateQueries({ queryKey: bloodKeys.detail(postId) });
    },
  });
};

export const useResolveBloodPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resolveBloodPostAPI(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: bloodKeys.all });
      queryClient.invalidateQueries({ queryKey: bloodKeys.detail(id) });
    },
  });
};

export const useDeleteBloodPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBloodPostAPI(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: bloodKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bloodKeys.all });
    },
  });
};
