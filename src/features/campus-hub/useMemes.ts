import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  keepPreviousData,
  InfiniteData,
} from "@tanstack/react-query";
import {
  getMemesFeed,
  getMemeById,
  createMeme,
  reactToMeme,
  deleteMeme,
  type Meme,
  type CreateMemeInput,
  type MemeReactionType,
  type MemeFilter,
  type MemesFeedResponse,
  type ReactMemeResult,
} from "@/services/meme-service";

export const memeKeys = {
  all: ["memes"] as const,
  feed: (filter?: MemeFilter) => ["memes", "feed", filter] as const,
  infiniteFeed: (filter?: MemeFilter) =>
    ["memes", "infiniteFeed", filter] as const,
  detail: (id: string) => ["memes", "detail", id] as const,
};

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
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
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
    mutationFn: (data: CreateMemeInput) => createMeme(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memeKeys.all });
    },
  });
};

export const useReactToMeme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memeId,
      type,
    }: {
      memeId: string;
      type: MemeReactionType;
    }) => reactToMeme(memeId, type),

    onMutate: async ({ memeId, type }) => {
      // Cancel outgoing queries for all meme feeds
      await queryClient.cancelQueries({ queryKey: memeKeys.all });

      // Snapshot all cached queries that match memeKeys.all
      const previousData = queryClient.getQueriesData<
        InfiniteData<MemesFeedResponse>
      >({ queryKey: ["memes", "infiniteFeed"] });

      // Optimistically update all matching infinite query caches
      queryClient.setQueriesData<InfiniteData<MemesFeedResponse>>(
        { queryKey: ["memes", "infiniteFeed"] },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              memes: page.memes.map((meme) => {
                if (meme.id !== memeId) return meme;

                const currentReaction = meme.userReaction;
                let nextReaction: MemeReactionType | null = type;
                let nextLikes = meme.likesCount;
                let nextDislikes = meme.dislikesCount;

                if (currentReaction === type) {
                  // Toggle off
                  nextReaction = null;
                  if (type === "LIKE") nextLikes = Math.max(0, nextLikes - 1);
                  if (type === "DISLIKE") nextDislikes = Math.max(0, nextDislikes - 1);
                } else if (currentReaction === null) {
                  // Fresh reaction
                  nextReaction = type;
                  if (type === "LIKE") nextLikes++;
                  if (type === "DISLIKE") nextDislikes++;
                } else {
                  // Switching reaction
                  nextReaction = type;
                  if (type === "LIKE") {
                    nextLikes++;
                    nextDislikes = Math.max(0, nextDislikes - 1);
                  } else {
                    nextDislikes++;
                    nextLikes = Math.max(0, nextLikes - 1);
                  }
                }

                return {
                  ...meme,
                  userReaction: nextReaction,
                  likesCount: nextLikes,
                  dislikesCount: nextDislikes,
                };
              }),
            })),
          };
        }
      );

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSuccess: (data: ReactMemeResult) => {
      // Sync actual backend counts
      queryClient.setQueriesData<InfiniteData<MemesFeedResponse>>(
        { queryKey: ["memes", "infiniteFeed"] },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              memes: page.memes.map((meme) => {
                if (meme.id !== data.memeId) return meme;
                return {
                  ...meme,
                  userReaction: data.userReaction,
                  likesCount: data.likesCount,
                  dislikesCount: data.dislikesCount,
                };
              }),
            })),
          };
        }
      );
    },
  });
};

export const useDeleteMeme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMeme(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: memeKeys.all });

      const previousData = queryClient.getQueriesData<
        InfiniteData<MemesFeedResponse>
      >({ queryKey: ["memes", "infiniteFeed"] });

      queryClient.setQueriesData<InfiniteData<MemesFeedResponse>>(
        { queryKey: ["memes", "infiniteFeed"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              memes: page.memes.filter((meme) => meme.id !== id),
            })),
          };
        }
      );

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
    },
  });
};
