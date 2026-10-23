import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getNoticesAPI,
  getNoticesPaginatedAPI,
  getNoticeByIdAPI,
  createNoticeAPI,
  updateNoticeAPI,
  deleteNoticeAPI,
  GetNoticesQueryParams,
  PaginatedNoticesResponse,
} from "@/services/notice-service";
import { CreateNoticeInput, UpdateNoticeInput } from "./types";

/**
 * Standard query for campus notices (used across home widgets and noticeboard list)
 */
export const useNotices = (params?: GetNoticesQueryParams) => {
  return useQuery({
    queryKey: ["notices", params],
    queryFn: () => getNoticesAPI(params),
    staleTime: 1000 * 60, // 60s fresh
  });
};

/**
 * Infinite query for smooth pagination, infinite scrolling, and lazy loading
 */
export const useInfiniteNotices = (
  params?: Omit<GetNoticesQueryParams, "page">,
) => {
  return useInfiniteQuery<PaginatedNoticesResponse>({
    queryKey: ["notices", "infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      getNoticesPaginatedAPI({ ...params, page: pageParam as number }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60,
  });
};

export const useNoticeById = (id: string) => {
  return useQuery({
    queryKey: ["notice", id],
    queryFn: () => getNoticeByIdAPI(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
};

export const useCreateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNoticeInput) => createNoticeAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
};

export const useUpdateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoticeInput }) =>
      updateNoticeAPI(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      queryClient.invalidateQueries({ queryKey: ["notice", id] });
    },
  });
};

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNoticeAPI(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      queryClient.invalidateQueries({ queryKey: ["notice", id] });
    },
  });
};
