import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  keepPreviousData,
  type QueryClient,
} from "@tanstack/react-query";
import {
  getLostFoundFeedPaginated,
  getLostFoundPostById,
  createLostFoundPost,
  updateLostFoundPost,
  deleteLostFoundPost,
  updateLostFoundStatus,
  getLostFoundClaims,
  submitLostFoundClaim,
  acceptLostFoundClaim,
  rejectLostFoundClaim,
  withdrawLostFoundClaim,
  reportLostFoundPost,
  type LostFoundPost,
  type CreateLostFoundInput,
  type LostFoundStatus,
  type CreateClaimInput,
  type GetLostFoundFeedParams,
} from "@/services/lost-found-service";
import type { UgcReportReason } from "@/services/ugc-service";

export const lostFoundKeys = {
  all: ["lostFound"] as const,
  infiniteFeedRoot: ["lostFound", "infiniteFeed"] as const,
  infiniteFeed: (params?: GetLostFoundFeedParams) =>
    ["lostFound", "infiniteFeed", params] as const,
  detail: (id: string) => ["lostFound", "detail", id] as const,
  claims: (postId: string) => ["lostFound", "claims", postId] as const,
};

const invalidatePostAndFeeds = (queryClient: QueryClient, postId: string) => {
  queryClient.invalidateQueries({ queryKey: lostFoundKeys.infiniteFeedRoot });
  queryClient.invalidateQueries({ queryKey: lostFoundKeys.detail(postId) });
  queryClient.invalidateQueries({ queryKey: lostFoundKeys.claims(postId) });
};

export const useInfiniteLostFoundFeed = (params?: GetLostFoundFeedParams) =>
  useInfiniteQuery({
    queryKey: lostFoundKeys.infiniteFeed(params),
    queryFn: ({ pageParam = 1, signal }) =>
      getLostFoundFeedPaginated(
        { ...params, page: pageParam as number, limit: 15 },
        signal,
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

export const useLostFoundPost = (id: string) =>
  useQuery({
    queryKey: lostFoundKeys.detail(id),
    queryFn: () => getLostFoundPostById(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
  });

export const useCreateLostFoundPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLostFoundInput) => createLostFoundPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: lostFoundKeys.infiniteFeedRoot,
      });
    },
  });
};

export const useUpdateLostFoundPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateLostFoundInput>;
    }) => updateLostFoundPost(id, data),
    onSuccess: (updatedPost, { id }) => {
      if (updatedPost) {
        queryClient.setQueryData<LostFoundPost>(
          lostFoundKeys.detail(id),
          (previous) =>
            previous ? { ...previous, ...updatedPost } : updatedPost,
        );
      }
      queryClient.invalidateQueries({
        queryKey: lostFoundKeys.infiniteFeedRoot,
      });
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.detail(id) });
    },
  });
};

export const useDeleteLostFoundPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLostFoundPost(id),
    onSuccess: (_data, id) => {
      for (const queryKey of [
        lostFoundKeys.detail(id),
        lostFoundKeys.claims(id),
      ]) {
        queryClient.cancelQueries({ queryKey });
        queryClient.removeQueries({ queryKey });
      }
      queryClient.invalidateQueries({
        queryKey: lostFoundKeys.infiniteFeedRoot,
      });
    },
  });
};

export const useUpdateLostFoundStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LostFoundStatus }) =>
      updateLostFoundStatus(id, status),
    onSuccess: (_data, { id }) => invalidatePostAndFeeds(queryClient, id),
  });
};

export const useLostFoundClaims = (postId: string, enabled = true) =>
  useQuery({
    queryKey: lostFoundKeys.claims(postId),
    queryFn: () => getLostFoundClaims(postId),
    enabled: Boolean(postId) && enabled,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });

export const useSubmitLostFoundClaim = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClaimInput) => submitLostFoundClaim(postId, data),
    onSuccess: () => invalidatePostAndFeeds(queryClient, postId),
  });
};

export const useAcceptLostFoundClaim = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (claimId: string) => acceptLostFoundClaim(postId, claimId),
    onSuccess: () => invalidatePostAndFeeds(queryClient, postId),
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
    onSuccess: () => invalidatePostAndFeeds(queryClient, postId),
  });
};

export const useReportLostFoundPost = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { reason: UgcReportReason; details?: string }) =>
      reportLostFoundPost(postId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: lostFoundKeys.infiniteFeedRoot,
      });
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: ["adminForumReports"] });
    },
  });
};
