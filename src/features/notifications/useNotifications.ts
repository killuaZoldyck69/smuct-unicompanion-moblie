import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notification-service";

const notificationKeys = {
  list: (userId?: string) => ["notifications", "list", userId],
  unread: (userId?: string) => ["notifications", "unread", userId],
};

export const useNotifications = () => {
  const { user } = useCurrentUser();
  return useInfiniteQuery({
    queryKey: notificationKeys.list(user?.id),
    queryFn: ({ pageParam = 1 }) => getNotifications(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    enabled: !!user?.id,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
};

export const useUnreadNotificationCount = () => {
  const { user } = useCurrentUser();
  return useQuery({
    queryKey: notificationKeys.unread(user?.id),
    queryFn: getUnreadNotificationCount,
    enabled: !!user?.id,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list(user?.id) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread(user?.id) });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list(user?.id) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread(user?.id) });
    },
  });
};
