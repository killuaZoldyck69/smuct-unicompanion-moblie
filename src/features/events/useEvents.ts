import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  InfiniteData,
} from "@tanstack/react-query";
import {
  getCampusEventsAPI,
  getCampusEventsPaginatedAPI,
  getCampusEventByIdAPI,
  createCampusEventAPI,
  updateCampusEventAPI,
  deleteCampusEventAPI,
  toggleEventInterestedAPI,
  UpdateCampusEventInput,
  GetEventsQueryParams,
  PaginatedEventsResponse,
  CampusEventItem,
} from "@/services/event-service";
import { CreateCampusEventInput } from "./types";

export const useCampusEvents = (params?: GetEventsQueryParams) => {
  return useQuery({
    queryKey: ["campusEvents", params],
    queryFn: () => getCampusEventsAPI(params),
  });
};

export interface UseInfiniteCampusEventsOptions {
  tab?: "all" | "upcoming" | "today" | "past";
  search?: string;
  limit?: number;
}

export const useInfiniteCampusEvents = (options?: UseInfiniteCampusEventsOptions) => {
  const tab = options?.tab || "upcoming";
  const search = options?.search?.trim() || "";
  const limit = options?.limit || 10;

  return useInfiniteQuery<PaginatedEventsResponse>({
    queryKey: ["campusEvents", "infinite", { tab, search }],
    queryFn: ({ pageParam = 1 }) =>
      getCampusEventsPaginatedAPI({
        page: pageParam as number,
        limit,
        tab,
        search: search || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasNextPage) {
        return lastPage.pagination.nextPage;
      }
      return undefined;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
};

export const useCampusEventById = (id: string) => {
  return useQuery({
    queryKey: ["campusEvent", id],
    queryFn: () => getCampusEventByIdAPI(id),
    enabled: !!id,
  });
};

export const useCreateCampusEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCampusEventInput) => createCampusEventAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campusEvents"] });
    },
  });
};

export const useUpdateCampusEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampusEventInput }) =>
      updateCampusEventAPI(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["campusEvents"] });
      queryClient.invalidateQueries({ queryKey: ["campusEvent", id] });
    },
  });
};

export const useDeleteCampusEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCampusEventAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campusEvents"] });
    },
  });
};

export const useToggleEventInterested = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleEventInterestedAPI(id),
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["campusEvents"] });

      // Optimistically update all infinite queries matching ["campusEvents", "infinite"]
      queryClient.setQueriesData<InfiniteData<PaginatedEventsResponse>>(
        { queryKey: ["campusEvents", "infinite"] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((item) => {
                if (item.id === id) {
                  const newIsInterested = !item.isInterested;
                  const newCount = Math.max(
                    0,
                    (item.interestedCount || 0) + (newIsInterested ? 1 : -1)
                  );
                  return {
                    ...item,
                    isInterested: newIsInterested,
                    interestedCount: newCount,
                  };
                }
                return item;
              }),
              nextUpcomingEvent:
                page.nextUpcomingEvent?.id === id
                  ? {
                      ...page.nextUpcomingEvent,
                      isInterested: !page.nextUpcomingEvent.isInterested,
                      interestedCount: Math.max(
                        0,
                        (page.nextUpcomingEvent.interestedCount || 0) +
                          (!page.nextUpcomingEvent.isInterested ? 1 : -1)
                      ),
                    }
                  : page.nextUpcomingEvent,
            })),
          };
        }
      );

      // Optimistically update single event query if open
      queryClient.setQueryData<CampusEventItem>(["campusEvent", id], (oldEvent) => {
        if (!oldEvent) return oldEvent;
        const newIsInterested = !oldEvent.isInterested;
        return {
          ...oldEvent,
          isInterested: newIsInterested,
          interestedCount: Math.max(
            0,
            (oldEvent.interestedCount || 0) + (newIsInterested ? 1 : -1)
          ),
        };
      });
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: ["campusEvents"] });
      queryClient.invalidateQueries({ queryKey: ["campusEvent", id] });
    },
  });
};


