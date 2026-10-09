import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getFieldSettingsAPI,
  updateFieldSettingsAPI,
  getMyFieldBookingsAPI,
  getFieldScheduleAPI,
  getAllFieldBookingsAdminAPI,
  createFieldBookingAPI,
  updateFieldBookingStatusAPI,
  deleteFieldBookingAPI,
  type GetBookingsQueryParams,
  type GetScheduleQueryParams,
} from "@/services/field-service";
import {
  CreateFieldBookingInput,
  UpdateBookingStatusInput,
  UpdateFieldSettingsInput,
} from "./types";

/**
 * Live Ground Availability & Settings Query
 * Caches settings for 60 seconds with 10 minute retention.
 */
export const useFieldSettings = () => {
  return useQuery({
    queryKey: ["fieldSettings"],
    queryFn: getFieldSettingsAPI,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Public Approved Schedule Query
 * Caches schedule with date filters for smooth calendar browsing.
 */
export const useFieldSchedule = (params?: GetScheduleQueryParams) => {
  return useQuery({
    queryKey: ["fieldSchedule", params],
    queryFn: () => getFieldScheduleAPI(params),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Infinite Paginated Query for Current User's Bookings
 * Supports smooth infinite scrolling and pull-to-refresh.
 */
export const useInfiniteMyFieldBookings = (
  params?: Omit<GetBookingsQueryParams, "page">,
  options?: { enabled?: boolean },
) => {
  return useInfiniteQuery({
    queryKey: ["myFieldBookingsInfinite", params],
    queryFn: ({ pageParam = 1 }) =>
      getMyFieldBookingsAPI({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.meta?.hasMore && lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled,
  });
};

/**
 * Non-infinite fallback query for My Bookings
 */
export const useMyFieldBookings = (params?: GetBookingsQueryParams) => {
  return useQuery({
    queryKey: ["myFieldBookings", params],
    queryFn: async () => {
      const res = await getMyFieldBookingsAPI(params);
      return res.data;
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Infinite Paginated Query for Admin All Bookings
 * Supports server-side search, status filters, and infinite scroll.
 */
export const useInfiniteAllFieldBookingsAdmin = (
  params?: Omit<GetBookingsQueryParams, "page">,
  options?: { enabled?: boolean },
) => {
  return useInfiniteQuery({
    queryKey: ["allFieldBookingsAdminInfinite", params],
    queryFn: ({ pageParam = 1 }) =>
      getAllFieldBookingsAdminAPI({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.meta?.hasMore && lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled,
  });
};

/**
 * Non-infinite fallback query for Admin All Bookings
 */
export const useAllFieldBookingsAdmin = (
  params?: GetBookingsQueryParams,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["allFieldBookings", params],
    queryFn: async () => {
      const res = await getAllFieldBookingsAdminAPI(params);
      return res.data;
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled,
  });
};

/**
 * Lightweight query for Admin requests badge counts
 */
export const useFieldBookingCounts = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["fieldBookingCounts"],
    queryFn: async () => {
      const res = await getAllFieldBookingsAdminAPI({ limit: 1 });
      return (
        res.meta.counts || {
          all: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        }
      );
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled,
  });
};

/**
 * Create Field Booking Mutation
 */
export const useCreateFieldBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFieldBookingInput) => createFieldBookingAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myFieldBookings"] });
      queryClient.invalidateQueries({ queryKey: ["myFieldBookingsInfinite"] });
      queryClient.invalidateQueries({ queryKey: ["fieldSchedule"] });
      queryClient.invalidateQueries({ queryKey: ["allFieldBookings"] });
      queryClient.invalidateQueries({
        queryKey: ["allFieldBookingsAdminInfinite"],
      });
      queryClient.invalidateQueries({ queryKey: ["fieldBookingCounts"] });
    },
  });
};

/**
 * Update Ground Availability & Notice Settings Mutation
 */
export const useUpdateFieldSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateFieldSettingsInput) => updateFieldSettingsAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fieldSettings"] });
    },
  });
};

/**
 * Update Booking Approval/Rejection Status Mutation
 */
export const useUpdateFieldBookingStatus = (fixedId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      variables:
        | UpdateBookingStatusInput
        | { id: string; data: UpdateBookingStatusInput },
    ) => {
      const targetId =
        (variables as { id?: string }).id || fixedId;
      if (!targetId) {
        throw new Error("Booking ID is required to update status");
      }
      const data =
        "data" in variables
          ? (variables as { data: UpdateBookingStatusInput }).data
          : (variables as UpdateBookingStatusInput);
      return updateFieldBookingStatusAPI(targetId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allFieldBookings"] });
      queryClient.invalidateQueries({
        queryKey: ["allFieldBookingsAdminInfinite"],
      });
      queryClient.invalidateQueries({ queryKey: ["myFieldBookings"] });
      queryClient.invalidateQueries({ queryKey: ["myFieldBookingsInfinite"] });
      queryClient.invalidateQueries({ queryKey: ["fieldSchedule"] });
      queryClient.invalidateQueries({ queryKey: ["fieldBookingCounts"] });
    },
  });
};

/**
 * Delete Booking Mutation
 */
export const useDeleteFieldBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFieldBookingAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myFieldBookings"] });
      queryClient.invalidateQueries({ queryKey: ["myFieldBookingsInfinite"] });
      queryClient.invalidateQueries({ queryKey: ["fieldSchedule"] });
      queryClient.invalidateQueries({ queryKey: ["allFieldBookings"] });
      queryClient.invalidateQueries({
        queryKey: ["allFieldBookingsAdminInfinite"],
      });
      queryClient.invalidateQueries({ queryKey: ["fieldBookingCounts"] });
    },
  });
};
