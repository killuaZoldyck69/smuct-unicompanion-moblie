import { useRef } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import {
  getMemesFeed,
  getMemeById,
  createMeme,
  updateMeme,
  reactToMeme,
  deleteMeme,
  reportMeme,
  type UpdateMemeInput,
  type MemeReactionType,
  type MemeFilter,
  type Meme,
  type MemesFeedResponse,
  type ReactMemeResult,
} from "@/services/meme-service";
import type { UgcReportReason } from "@/services/ugc-service";
import {
  applyOptimisticMemeReaction,
  patchMemeWithReactionResult,
} from "./meme-logic";

export const memeKeys = {
  all: ["memes"] as const,
  infiniteFeedRoot: ["memes", "infiniteFeed"] as const,
  infiniteFeed: (filter?: MemeFilter) =>
    ["memes", "infiniteFeed", filter] as const,
  detail: (id: string) => ["memes", "detail", id] as const,
};

type MemeReactionSnapshot = Pick<
  Meme,
  "userReaction" | "likesCount" | "dislikesCount" | "popularityScore"
>;

function findMemeReactionSnapshot(
  queryClient: QueryClient,
  memeId: string,
): MemeReactionSnapshot | null {
  const feeds = queryClient.getQueriesData<InfiniteData<MemesFeedResponse>>({
    queryKey: memeKeys.infiniteFeedRoot,
  });
  for (const [, feedData] of feeds) {
    for (const page of feedData?.pages ?? []) {
      const found = page.memes.find((m) => m.id === memeId);
      if (found) {
        return {
          userReaction: found.userReaction,
          likesCount: found.likesCount,
          dislikesCount: found.dislikesCount,
          popularityScore: found.popularityScore,
        };
      }
    }
  }
  const detail = queryClient.getQueryData<Meme>(memeKeys.detail(memeId));
  return detail
    ? {
        userReaction: detail.userReaction,
        likesCount: detail.likesCount,
        dislikesCount: detail.dislikesCount,
        popularityScore: detail.popularityScore,
      }
    : null;
}

export function removeMemeFromFeedCaches(
  queryClient: QueryClient,
  memeId: string,
): void {
  queryClient.setQueriesData<InfiniteData<MemesFeedResponse>>(
    { queryKey: memeKeys.infiniteFeedRoot },
    (old) => {
      if (!old?.pages) return old;
      let changed = false;
      const nextPages = old.pages.map((page) => {
        if (!page.memes.some((m) => m.id === memeId)) return page;
        changed = true;
        return {
          ...page,
          memes: page.memes.filter((meme) => meme.id !== memeId),
        };
      });
      return changed ? { ...old, pages: nextPages } : old;
    },
  );
}

function updateMemeAcrossInfiniteFeeds(
  queryClient: QueryClient,
  memeId: string,
  updater: (meme: Meme) => Meme,
): void {
  queryClient.setQueriesData<InfiniteData<MemesFeedResponse>>(
    { queryKey: memeKeys.infiniteFeedRoot },
    (old) => {
      if (!old?.pages) return old;
      let changed = false;
      const nextPages = old.pages.map((page) => {
        if (!page.memes.some((m) => m.id === memeId)) return page;
        changed = true;
        return {
          ...page,
          memes: page.memes.map((meme) =>
            meme.id === memeId ? updater(meme) : meme,
          ),
        };
      });
      return changed ? { ...old, pages: nextPages } : old;
    },
  );
}

export const useInfiniteMemesFeed = (filter: MemeFilter = "latest") => {
  return useInfiniteQuery({
    queryKey: memeKeys.infiniteFeed(filter),
    queryFn: ({ pageParam = 1, signal }) =>
      getMemesFeed({ page: pageParam as number, limit: 10, filter }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages, hasMore } = lastPage.pagination;
      return hasMore || page < totalPages ? page + 1 : undefined;
    },
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
  });
};

export const useMemeDetail = (id: string) => {
  return useQuery({
    queryKey: memeKeys.detail(id),
    queryFn: ({ signal }) => getMemeById(id, signal),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateMeme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMeme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memeKeys.all });
    },
  });
};

export const useUpdateMeme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memeId, data }: { memeId: string; data: UpdateMemeInput }) =>
      updateMeme(memeId, data),
    onSuccess: (updatedMeme) => {
      updateMemeAcrossInfiniteFeeds(
        queryClient,
        updatedMeme.id,
        () => updatedMeme,
      );
      queryClient.invalidateQueries({ queryKey: memeKeys.all });
      queryClient.setQueryData(memeKeys.detail(updatedMeme.id), updatedMeme);
    },
  });
};

export const useReactToMeme = (options?: {
  onError?: (err: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  const latestSeqByMemeRef = useRef<Record<string, number>>({});
  const queueByMemeRef = useRef<Record<string, Promise<unknown>>>({});

  return useMutation({
    mutationFn: ({
      memeId,
      type,
    }: {
      memeId: string;
      type: MemeReactionType;
    }) => {
      const previous = queueByMemeRef.current[memeId] ?? Promise.resolve();
      const next = previous
        .catch(() => undefined)
        .then(() => reactToMeme(memeId, type));
      queueByMemeRef.current[memeId] = next;
      return next.finally(() => {
        if (queueByMemeRef.current[memeId] === next) {
          delete queueByMemeRef.current[memeId];
        }
      });
    },

    onMutate: async ({ memeId, type }) => {
      const seq = (latestSeqByMemeRef.current[memeId] ?? 0) + 1;
      latestSeqByMemeRef.current[memeId] = seq;

      const previousMemeSnapshot = findMemeReactionSnapshot(
        queryClient,
        memeId,
      );

      updateMemeAcrossInfiniteFeeds(queryClient, memeId, (meme) =>
        applyOptimisticMemeReaction(meme, type),
      );
      const previousDetail = queryClient.getQueryData<Meme>(
        memeKeys.detail(memeId),
      );
      if (previousDetail) {
        queryClient.setQueryData<Meme>(
          memeKeys.detail(memeId),
          applyOptimisticMemeReaction(previousDetail, type),
        );
      }

      void queryClient.cancelQueries({ queryKey: memeKeys.all });

      return { previousMemeSnapshot, memeId, seq };
    },

    onError: (err, _vars, context) => {
      options?.onError?.(err);
      if (
        !context?.previousMemeSnapshot ||
        latestSeqByMemeRef.current[context.memeId] !== context.seq
      ) {
        return;
      }
      const snapshot = context.previousMemeSnapshot;
      updateMemeAcrossInfiniteFeeds(queryClient, context.memeId, (meme) => ({
        ...meme,
        ...snapshot,
      }));
      const detail = queryClient.getQueryData<Meme>(
        memeKeys.detail(context.memeId),
      );
      if (detail) {
        queryClient.setQueryData<Meme>(memeKeys.detail(context.memeId), {
          ...detail,
          ...snapshot,
        });
      }
    },

    onSuccess: (data: ReactMemeResult, _vars, context) => {
      if (
        !context ||
        latestSeqByMemeRef.current[context.memeId] !== context.seq
      ) {
        return;
      }
      updateMemeAcrossInfiniteFeeds(queryClient, data.memeId, (meme) =>
        patchMemeWithReactionResult(meme, data),
      );
      const detail = queryClient.getQueryData<Meme>(
        memeKeys.detail(data.memeId),
      );
      if (detail) {
        queryClient.setQueryData<Meme>(
          memeKeys.detail(data.memeId),
          patchMemeWithReactionResult(detail, data),
        );
      }
    },
  });
};

export const useDeleteMeme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMeme,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: memeKeys.all });

      const previousData = queryClient.getQueriesData<
        InfiniteData<MemesFeedResponse>
      >({ queryKey: memeKeys.infiniteFeedRoot });

      removeMemeFromFeedCaches(queryClient, id);
      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: memeKeys.all });
      queryClient.invalidateQueries({ queryKey: ["adminForumReports"] });
    },
  });
};

export const useReportMeme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memeId,
      reason,
      details,
    }: {
      memeId: string;
      reason: UgcReportReason;
      details?: string;
    }) => reportMeme(memeId, { reason, ...(details ? { details } : {}) }),
    onSuccess: (_result, variables) => {
      removeMemeFromFeedCaches(queryClient, variables.memeId);
      queryClient.invalidateQueries({ queryKey: memeKeys.all });
      queryClient.invalidateQueries({ queryKey: ["adminForumReports"] });
    },
  });
};
