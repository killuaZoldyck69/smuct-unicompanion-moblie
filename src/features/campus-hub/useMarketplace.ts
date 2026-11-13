import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import {
  getMarketplaceFeed,
  getMarketplacePostById,
  createMarketplacePost,
  updateMarketplacePost,
  deleteMarketplacePost,
  markMarketplaceSold,
  updateMarketplaceStatus,
  addMarketplaceComment,
  updateMarketplaceComment,
  deleteMarketplaceComment,
  reportMarketplaceContent,
  type CreateMarketplaceInput,
  type CreateCommentInput,
  type CreateMarketplaceReportInput,
  type FeedQueryParams,
  type PaginatedFeedResponse,
  type ListingStatus,
  type MarketplacePost,
} from "@/services/marketplace-service";

export const marketplaceKeys = {
  all: ["marketplace"] as const,
  feed: (params?: Omit<FeedQueryParams, "cursor" | "limit">) =>
    [...marketplaceKeys.all, "feed", params ?? {}] as const,
  post: (id: string) => [...marketplaceKeys.all, "post", id] as const,
};

const FEED_PAGE_LIMIT = 20;

export const useMarketplaceFeed = (
  filters?: Omit<FeedQueryParams, "cursor" | "limit">
) =>
  useInfiniteQuery<PaginatedFeedResponse, Error, InfiniteData<PaginatedFeedResponse>, ReturnType<typeof marketplaceKeys.feed>, string | null>({
    queryKey: marketplaceKeys.feed(filters),
    queryFn: ({ pageParam }) =>
      getMarketplaceFeed({
        ...filters,
        limit: FEED_PAGE_LIMIT,
        cursor: pageParam ?? undefined,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

export const useMarketplacePost = (id: string) =>
  useQuery({
    queryKey: marketplaceKeys.post(id),
    queryFn: () => getMarketplacePostById(id),
    enabled: !!id,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

export const useCreateMarketplacePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMarketplaceInput) => createMarketplacePost(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.all });
    },
  });
};

export const useUpdateMarketplacePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMarketplaceInput> }) =>
      updateMarketplacePost(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.all });
      qc.invalidateQueries({ queryKey: marketplaceKeys.post(id) });
    },
  });
};

export const useDeleteMarketplacePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMarketplacePost(id),
    onSuccess: (_data, id) => {
      qc.cancelQueries({ queryKey: marketplaceKeys.post(id) });
      qc.removeQueries({ queryKey: marketplaceKeys.post(id) });
      qc.invalidateQueries({ queryKey: marketplaceKeys.all });
    },
  });
};

export const useMarkMarketplaceSold = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markMarketplaceSold(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.all });
      qc.invalidateQueries({ queryKey: marketplaceKeys.post(id) });
    },
  });
};

export const useUpdateMarketplaceStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ListingStatus }) =>
      updateMarketplaceStatus(id, status),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.all });
      qc.invalidateQueries({ queryKey: marketplaceKeys.post(id) });
    },
  });
};

export const useAddMarketplaceComment = (postId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCommentInput | string) => {
      const payload =
        typeof input === "string" ? { content: input } : input;
      return addMarketplaceComment(postId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.post(postId) });
      qc.invalidateQueries({ queryKey: marketplaceKeys.all });
    },
  });
};

export const useUpdateMarketplaceComment = (postId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => updateMarketplaceComment(postId, commentId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.post(postId) });
    },
  });
};

export const useDeleteMarketplaceComment = (postId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      deleteMarketplaceComment(postId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.post(postId) });
      qc.invalidateQueries({ queryKey: marketplaceKeys.all });
    },
  });
};

export const useReportMarketplaceContent = (postId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMarketplaceReportInput) =>
      reportMarketplaceContent(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.all });
      if (postId) {
        qc.invalidateQueries({ queryKey: marketplaceKeys.post(postId) });
      }
      qc.invalidateQueries({ queryKey: ["adminForumReports"] });
    },
  });
};

// ---------------------------------------------------------------------------
// Derived helper — flatten paginated pages into a flat array of posts
// ---------------------------------------------------------------------------
export const flattenFeedPages = (
  data: InfiniteData<PaginatedFeedResponse> | undefined
): MarketplacePost[] => {
  if (!data) return [];
  return data.pages.flatMap((page) => page.items);
};
