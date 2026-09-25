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
  deleteMarketplaceComment,
  type CreateMarketplaceInput,
  type CreateCommentInput,
  type FeedQueryParams,
  type PaginatedFeedResponse,
  type ListingStatus,
  type MarketplacePost,
} from "@/services/marketplace-service";

// ---------------------------------------------------------------------------
// Query key factory — centralised to keep cache operations consistent
// ---------------------------------------------------------------------------
export const marketplaceKeys = {
  all: ["marketplace"] as const,
  feed: (params?: Omit<FeedQueryParams, "cursor" | "limit">) =>
    [...marketplaceKeys.all, "feed", params ?? {}] as const,
  post: (id: string) => [...marketplaceKeys.all, "post", id] as const,
};

// ---------------------------------------------------------------------------
// Feed — infinite scroll with cursor-based pagination
// ---------------------------------------------------------------------------
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
    // Cache feed data for 2 minutes before marking stale
    staleTime: 2 * 60 * 1000,
    // Keep unused cache for 5 minutes
    gcTime: 5 * 60 * 1000,
  });

// ---------------------------------------------------------------------------
// Single post
// ---------------------------------------------------------------------------
export const useMarketplacePost = (id: string) =>
  useQuery({
    queryKey: marketplaceKeys.post(id),
    queryFn: () => getMarketplacePostById(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
export const useCreateMarketplacePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMarketplaceInput) => createMarketplacePost(data),
    onSuccess: () => {
      // Invalidate all feed variants so the new post appears everywhere
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
    onSuccess: () => {
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
