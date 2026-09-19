import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  getLostFoundFeed,
  getLostFoundFeedPaginated,
  getLostFoundPostById,
  getPossibleMatches,
  createLostFoundPost,
  deleteLostFoundPost,
  updateLostFoundStatus,
  getLostFoundClaims,
  submitLostFoundClaim,
  acceptLostFoundClaim,
  rejectLostFoundClaim,
  withdrawLostFoundClaim,
  type CreateLostFoundInput,
  type LostFoundStatus,
  type CreateClaimInput,
  type GetLostFoundFeedParams,
} from "@/services/lost-found-service";

export const lostFoundKeys = {
  all: ["lostFound"] as const,
  feed: (params?: GetLostFoundFeedParams) => ["lostFound", "feed", params] as const,
  infiniteFeed: (params?: GetLostFoundFeedParams) => ["lostFound", "infiniteFeed", params] as const,
  detail: (id: string) => ["lostFound", "detail", id] as const,
  matches: (postId: string) => ["lostFound", "matches", postId] as const,
  claims: (postId: string) => ["lostFound", "claims", postId] as const,
};

export const useInfiniteLostFoundFeed = (params?: GetLostFoundFeedParams) => {
  return useInfiniteQuery({
    queryKey: lostFoundKeys.infiniteFeed(params),
    queryFn: ({ pageParam = 1, signal }) =>
      getLostFoundFeedPaginated(
        { ...params, page: pageParam as number, limit: 15 },
        signal
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages, hasMore } = lastPage.meta;
      return hasMore || page < totalPages ? page + 1 : undefined;
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    placeholderData: keepPreviousData,
  });
};

export const useLostFoundFeed = (params?: GetLostFoundFeedParams) => {
  return useQuery({
    queryKey: lostFoundKeys.feed(params),
    queryFn: ({ signal }) => getLostFoundFeed(params, signal),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    placeholderData: keepPreviousData,
  });
};

export const usePossibleMatches = (postId: string) => {
  return useQuery({
    queryKey: lostFoundKeys.matches(postId),
    queryFn: () => getPossibleMatches(postId),
    enabled: Boolean(postId),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
};

export const useLostFoundPost = (id: string) => {
  return useQuery({
    queryKey: lostFoundKeys.detail(id),
    queryFn: () => getLostFoundPostById(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 1,
    gcTime: 1000 * 60 * 10,
  });
};

export const useCreateLostFoundPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLostFoundInput) => createLostFoundPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.all });
    },
  });
};

export const useDeleteLostFoundPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLostFoundPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.all });
    },
  });
};

export const useUpdateLostFoundStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LostFoundStatus }) =>
      updateLostFoundStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.all });
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.detail(variables.id) });
    },
  });
};

export const useLostFoundClaims = (postId: string) => {
  return useQuery({
    queryKey: lostFoundKeys.claims(postId),
    queryFn: () => getLostFoundClaims(postId),
    enabled: Boolean(postId),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
};

export const useSubmitLostFoundClaim = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClaimInput) => submitLostFoundClaim(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.all });
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.claims(postId) });
    },
  });
};

export const useAcceptLostFoundClaim = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (claimId: string) => acceptLostFoundClaim(postId, claimId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.all });
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.claims(postId) });
    },
  });
};

export const useRejectLostFoundClaim = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (claimId: string) => rejectLostFoundClaim(postId, claimId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.claims(postId) });
    },
  });
};

export const useWithdrawLostFoundClaim = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (claimId: string) => withdrawLostFoundClaim(postId, claimId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.all });
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.claims(postId) });
    },
  });
};
