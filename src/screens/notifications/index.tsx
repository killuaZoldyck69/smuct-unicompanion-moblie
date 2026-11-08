import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { AppNotification } from "@/services/notification-service";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/features/notifications/useNotifications";
import { fontFamily, titleFontFamily } from "@/theme/typography";

const TYPE_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  NOTICE: "file-text",
  HUB_ANNOUNCEMENT: "users",
  CLASS_NOTICE: "clock",
  ASSESSMENT: "book-open",
  GRADE: "award",
  MATERIAL: "book-open",
  REVIEW_OPEN: "star",
  BOOKING_STATUS: "calendar",
  COMPLAINT_STATUS: "message-square",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-BD", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

export function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const notificationsQuery = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const pages = notificationsQuery.data?.pages ?? [];
  const items = pages.flatMap((page) => page.items);
  const unreadCount = pages[0]?.unreadCount ?? 0;

  const listBottomPadding = insets.bottom > 0 ? insets.bottom + 120 : 130;

  const openNotification = useCallback(
    async (item: AppNotification) => {
      if (!item.readAt) {
        try {
          await markRead.mutateAsync(item.id);
        } catch {
          // Keep navigation useful when marking read fails due to a connection issue.
        }
      }
      router.push(item.route as any);
    },
    [markRead, router],
  );

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => {
      const isUnread = !item.readAt;
      return (
        <TouchableOpacity
          style={[styles.notificationCard, isUnread && styles.unreadCard]}
          onPress={() => void openNotification(item)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`${isUnread ? "Unread: " : ""}${item.title}. ${item.body}`}
        >
          <View style={[styles.iconWrap, isUnread && styles.unreadIconWrap]}>
            <Feather
              name={TYPE_ICONS[item.type] ?? "bell"}
              size={18}
              color={isUnread ? "#4f46e5" : "#64748b"}
            />
          </View>
          <View style={styles.copy}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {isUnread && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.body} numberOfLines={3}>
              {item.body}
            </Text>
            <Text style={styles.timestamp}>{formatDate(item.createdAt)}</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#94a3b8" />
        </TouchableOpacity>
      );
    },
    [openNotification],
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You’re all caught up"}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.readAllButton}
            onPress={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
          >
            {markAllRead.isPending ? (
              <ActivityIndicator size="small" color="#4338ca" />
            ) : (
              <Feather name="check-circle" size={20} color="#4338ca" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {notificationsQuery.isPending ? (
        <View style={styles.skeletonList} accessibilityLabel="Loading notifications">
          {[0, 1, 2].map((skeletonIndex) => (
            <View key={skeletonIndex} style={styles.skeletonCard}>
              <View style={styles.skeletonIcon} />
              <View style={styles.skeletonCopy}>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
                <View style={styles.skeletonTimestamp} />
              </View>
            </View>
          ))}
        </View>
      ) : notificationsQuery.isError ? (
        <View style={styles.state}>
          <Feather name="wifi-off" size={28} color="#94a3b8" />
          <Text style={styles.stateTitle}>Couldn’t load notifications</Text>
          <TouchableOpacity onPress={() => void notificationsQuery.refetch()}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: listBottomPadding },
            !items.length && styles.emptyListContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={notificationsQuery.isRefetching}
              onRefresh={() => void notificationsQuery.refetch()}
              tintColor="#4f46e5"
              colors={["#4f46e5"]}
            />
          }
          onEndReached={() => {
            if (notificationsQuery.hasNextPage && !notificationsQuery.isFetchingNextPage) {
              void notificationsQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            notificationsQuery.isFetchingNextPage ? (
              <ActivityIndicator style={styles.listFooter} color="#4f46e5" />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.state}>
              <View style={styles.emptyIcon}>
                <Feather name="bell" size={25} color="#64748b" />
              </View>
              <Text style={styles.stateTitle}>No notifications yet</Text>
              <Text style={styles.stateText}>
                Campus notices, course updates, booking decisions, and complaint updates will show here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f6f8fc" },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerCopy: { flex: 1 },
  title: {
    fontFamily: titleFontFamily,
    color: "#131b2e",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily,
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    letterSpacing: -0.1,
    marginTop: 4,
  },
  readAllButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  listContent: { paddingHorizontal: 18, paddingBottom: 130, gap: 10 },
  skeletonList: { paddingHorizontal: 18, gap: 10 },
  skeletonCard: {
    minHeight: 132,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e8edf5",
  },
  skeletonIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#edf1f7" },
  skeletonCopy: { flex: 1, gap: 10, paddingTop: 4 },
  skeletonTitle: { width: "76%", height: 15, borderRadius: 8, backgroundColor: "#e8edf5" },
  skeletonLine: { width: "92%", height: 12, borderRadius: 6, backgroundColor: "#eef1f6" },
  skeletonLineShort: { width: "62%" },
  skeletonTimestamp: { width: 74, height: 10, borderRadius: 5, backgroundColor: "#eef1f6", marginTop: 2 },
  listFooter: { paddingVertical: 16 },
  emptyListContent: { flexGrow: 1, justifyContent: "center" },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e8edf5",
  },
  unreadCard: { borderColor: "#c7d2fe", backgroundColor: "#fcfcff" },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  unreadIconWrap: { backgroundColor: "#eef2ff" },
  copy: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { flex: 1, color: "#172033", fontSize: 14, fontWeight: "800" },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#4f46e5" },
  body: { color: "#526078", fontSize: 13, lineHeight: 19, marginTop: 5 },
  timestamp: { color: "#94a3b8", fontSize: 11, marginTop: 8 },
  state: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    paddingVertical: 30,
  },
  stateTitle: { color: "#172033", fontSize: 16, fontWeight: "800", marginTop: 14 },
  stateText: { color: "#64748b", fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 8 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e9edf5",
  },
  retryText: { color: "#4f46e5", fontSize: 14, fontWeight: "700", marginTop: 12 },
});
