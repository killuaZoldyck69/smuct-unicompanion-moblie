import api from "./api";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  route: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  items: AppNotification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export const getNotifications = async (
  page = 1,
  limit = 30,
): Promise<NotificationListResponse> => {
  const response = await api.get("/notifications", { params: { page, limit } });
  return {
    items: response.data?.data ?? [],
    unreadCount: response.data?.unreadCount ?? 0,
    pagination: response.data?.pagination ?? {
      page,
      limit,
      total: 0,
      totalPages: 0,
      hasMore: false,
    },
  };
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  const response = await api.get("/notifications/unread-count");
  return response.data?.data?.unreadCount ?? 0;
};

export const markNotificationRead = async (id: string) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data?.data as AppNotification;
};

export const markAllNotificationsRead = async () => {
  const response = await api.patch("/notifications/read-all");
  return response.data?.data?.updatedCount as number;
};
