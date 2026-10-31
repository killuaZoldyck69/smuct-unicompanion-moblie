// src/screens/notices/index.tsx
import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  BackHandler,
  Platform,
  ListRenderItem,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";

import { useNotices, useDeleteNotice } from "@/features/notices/useNotices";
import { useCurrentUser } from "@/hooks/use-current-user";
import { NOTICE_COLORS, fontFamily } from "./constants";
import { NoticeCategoryKey, NormalizedNotice } from "./types";
import { normalizeNotice } from "./utils";
import { NoticeHeader } from "./components/notice-header";
import { NoticeSearchBar } from "./components/notice-search-bar";
import { NoticeFilterModal } from "./components/notice-filter-modal";
import { NoticeCard } from "./components/notice-card";
import { NoticeDetailView } from "./components/notice-detail-view";
import { CreateNoticeModal } from "./components/create-notice-modal";
import { DeleteNoticeModal } from "./components/delete-notice-modal";
import {
  NoticeSkeleton,
  NoticeErrorState,
  NoticeEmptyState,
} from "./components/notice-states";

export { NOTICE_COLORS, BENTO_COLORS, CATEGORY_THEMES } from "./constants";
export {
  normalizeNotice,
  detectNoticeCategory,
  isImportantNotice,
  isNewNotice,
  copyNoticeContent,
  shareNoticeContent,
} from "./utils";

export interface NoticeboardScreenProps {
  hasBackButton?: boolean;
  isStackScreen?: boolean;
  forceAdmin?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
}

export function NoticeboardScreen({
  hasBackButton = false,
  isStackScreen = false,
  forceAdmin = false,
  headerTitle,
  headerSubtitle,
}: NoticeboardScreenProps = {}) {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{
    category?: string;
    search?: string;
    noticeId?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { role, user } = useCurrentUser();
  const isAdmin = forceAdmin || role === "ADMIN" || user?.role === "ADMIN";

  // State initialization with URL search params support
  const initialCategory: NoticeCategoryKey = useMemo(() => {
    if (searchParams.category) {
      const upper = searchParams.category.toUpperCase() as NoticeCategoryKey;
      if (
        [
          "ALL",
          "ACADEMIC",
          "HOLIDAY",
          "TRANSPORT",
          "GENERAL",
          "ADMIN",
          "EXAM",
          "EMERGENCY",
        ].includes(upper)
      ) {
        return upper === "ADMIN" ? "GENERAL" : upper;
      }
    }
    return "ALL";
  }, [searchParams.category]);

  const [selectedCategory, setSelectedCategory] =
    useState<NoticeCategoryKey>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(searchParams.search || "");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(
    searchParams.search || "",
  );
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<NormalizedNotice | null>(
    null,
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NormalizedNotice | null>(
    null,
  );
  const [noticeToDelete, setNoticeToDelete] = useState<NormalizedNotice | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debounce search query to prevent high-frequency recalculations during typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync state if URL params change externally
  useEffect(() => {
    if (searchParams.category && searchParams.category.toUpperCase() !== selectedCategory) {
      const upper = searchParams.category.toUpperCase() as NoticeCategoryKey;
      if (
        [
          "ALL",
          "ACADEMIC",
          "HOLIDAY",
          "TRANSPORT",
          "GENERAL",
          "ADMIN",
          "EXAM",
          "EMERGENCY",
        ].includes(upper)
      ) {
        setSelectedCategory(upper === "ADMIN" ? "GENERAL" : upper);
      }
    }
    if (searchParams.search !== undefined && searchParams.search !== searchQuery) {
      setSearchQuery(searchParams.search);
    }
  }, [searchParams.category, searchParams.search]);

  // Data fetching via TanStack Query with caching
  const { data: rawNotices, isLoading, isError, refetch } = useNotices();
  const deleteNoticeMutation = useDeleteNotice();

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleOpenCreate = useCallback(() => {
    setEditingNotice(null);
    setIsCreateOpen(true);
  }, []);

  const handleEditNotice = useCallback((item: NormalizedNotice) => {
    setSelectedNotice(null);
    setEditingNotice(item);
    setIsCreateOpen(true);
  }, []);

  const handleDeleteNotice = useCallback((item: NormalizedNotice) => {
    setNoticeToDelete(item);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!noticeToDelete) return;
    setIsDeleting(true);
    try {
      await deleteNoticeMutation.mutateAsync(noticeToDelete.id);
      Toast.show({
        type: "success",
        text1: "Notice Deleted",
        text2: `"${noticeToDelete.title}" has been removed from noticeboard.`,
      });
      setNoticeToDelete(null);
      if (selectedNotice?.id === noticeToDelete.id) {
        setSelectedNotice(null);
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2: "Unable to delete notice. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [noticeToDelete, deleteNoticeMutation, selectedNotice?.id]);

  const handleBack = useCallback(() => {
    if (isCreateOpen) {
      setIsCreateOpen(false);
      setEditingNotice(null);
      return;
    }
    if (noticeToDelete) {
      setNoticeToDelete(null);
      return;
    }
    if (selectedNotice) {
      setSelectedNotice(null);
      return;
    }
    if (isFilterModalOpen) {
      setIsFilterModalOpen(false);
      return;
    }
    if (searchQuery.length > 0) {
      setSearchQuery("");
      return;
    }
    if (selectedCategory !== "ALL") {
      setSelectedCategory("ALL");
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/menu");
    }
  }, [
    isCreateOpen,
    noticeToDelete,
    selectedNotice,
    isFilterModalOpen,
    searchQuery,
    selectedCategory,
    router,
  ]);

  useEffect(() => {
    const onHardwareBack = () => {
      if (
        isCreateOpen ||
        noticeToDelete ||
        selectedNotice ||
        isFilterModalOpen ||
        searchQuery.length > 0 ||
        selectedCategory !== "ALL"
      ) {
        handleBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onHardwareBack);
    return () => sub.remove();
  }, [
    isCreateOpen,
    noticeToDelete,
    selectedNotice,
    isFilterModalOpen,
    searchQuery,
    selectedCategory,
    handleBack,
  ]);

  // 1. Normalization layer: strictly transforms backend items to domain models
  const normalizedNotices = useMemo(() => {
    const list = Array.isArray(rawNotices) ? rawNotices : [];
    return list.map(normalizeNotice);
  }, [rawNotices]);

  // Deep-link direct notice selection
  const hasAutoSelectedRef = useRef(false);
  useEffect(() => {
    if (
      searchParams.noticeId &&
      !hasAutoSelectedRef.current &&
      normalizedNotices.length > 0
    ) {
      const match = normalizedNotices.find((n) => n.id === searchParams.noticeId);
      if (match) {
        setSelectedNotice(match);
        hasAutoSelectedRef.current = true;
      }
    }
  }, [searchParams.noticeId, normalizedNotices]);

  // 2. Compute dynamic category counts and filter options
  const { categoryCounts, availableCategories } = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: normalizedNotices.length,
      ACADEMIC: 0,
      HOLIDAY: 0,
      TRANSPORT: 0,
      GENERAL: 0,
      EXAM: 0,
    };

    normalizedNotices.forEach((item) => {
      const key = item.category === "ADMIN" ? "GENERAL" : item.category;
      counts[key] = (counts[key] || 0) + 1;
    });

    const categories: Array<{ key: NoticeCategoryKey; label: string }> = [
      { key: "ALL", label: "All Notices" },
      { key: "ACADEMIC", label: "Academic" },
      { key: "HOLIDAY", label: "Holiday" },
      { key: "TRANSPORT", label: "Transport" },
      { key: "GENERAL", label: "General" },
    ];

    if ((counts.EXAM || 0) > 0) {
      categories.push({ key: "EXAM", label: "Exam" });
    }

    return {
      categoryCounts: counts,
      availableCategories: categories,
    };
  }, [normalizedNotices]);

  // 3. Filtered notices based on selected category and debounced search query
  const filteredNotices = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase().trim();

    return normalizedNotices.filter((item) => {
      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!query) return true;

      const titleMatch = item.title.toLowerCase().includes(query);
      const bodyMatch = item.body.toLowerCase().includes(query);
      const refMatch = (item.referenceNo || "").toLowerCase().includes(query);
      const issuerMatch = item.issuerName.toLowerCase().includes(query);

      return titleMatch || bodyMatch || refMatch || issuerMatch;
    });
  }, [normalizedNotices, selectedCategory, debouncedSearchQuery]);

  const activeCategoryLabel = useMemo(() => {
    const found = availableCategories.find((c) => c.key === selectedCategory);
    return found ? found.label : selectedCategory;
  }, [availableCategories, selectedCategory]);

  const handleResetFilters = useCallback(() => {
    setSelectedCategory("ALL");
    setSearchQuery("");
    setDebouncedSearchQuery("");
  }, []);

  const renderNoticeItem: ListRenderItem<NormalizedNotice> = useCallback(
    ({ item }) => (
      <NoticeCard
        item={item}
        onPress={setSelectedNotice}
        isAdmin={isAdmin}
        onEdit={handleEditNotice}
        onDelete={handleDeleteNotice}
      />
    ),
    [isAdmin, handleEditNotice, handleDeleteNotice],
  );

  const listHeaderComponent = useMemo(
    () => (
      <View style={styles.headerContainer}>
        {/* Search Box & Filter Icon Row */}
        <NoticeSearchBar
          searchQuery={searchQuery}
          onChangeSearchQuery={setSearchQuery}
          isFiltersVisible={isFilterModalOpen}
          onToggleFilters={() => setIsFilterModalOpen(true)}
          hasActiveFilter={selectedCategory !== "ALL"}
        />

        {/* Active Filter Badge */}
        {selectedCategory !== "ALL" && (
          <View style={styles.activeFilterRow}>
            <View style={styles.activeFilterPill}>
              <Text style={styles.activeFilterPillText}>
                Category: {activeCategoryLabel} ({filteredNotices.length})
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedCategory("ALL")}
                style={styles.clearFilterChip}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Clear category filter"
                activeOpacity={0.7}
              >
                <Feather name="x" size={13} color={NOTICE_COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    ),
    [
      searchQuery,
      isFilterModalOpen,
      selectedCategory,
      activeCategoryLabel,
      filteredNotices.length,
    ],
  );

  const listEmptyComponent = useMemo(() => {
    if (isLoading) {
      return <NoticeSkeleton />;
    }
    if (isError) {
      return <NoticeErrorState onRetry={refetch} />;
    }
    return (
      <NoticeEmptyState
        searchQuery={debouncedSearchQuery}
        selectedCategory={selectedCategory}
        onReset={handleResetFilters}
      />
    );
  }, [isLoading, isError, debouncedSearchQuery, selectedCategory, refetch, handleResetFilters]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Editorial Header ── */}
      <NoticeHeader
        title={headerTitle || "Noticeboard"}
        badgeText={
          headerSubtitle ||
          (isAdmin
            ? "Admin Management & Official Notices"
            : "Official University Announcements")
        }
        hasBackButton={hasBackButton}
        onBack={handleBack}
        isAdmin={isAdmin}
      />

      {/* ── Virtualized High-Performance List ── */}
      <FlatList
        data={isLoading || isError ? [] : filteredNotices}
        keyExtractor={(item) => item.id}
        renderItem={renderNoticeItem}
        ListHeaderComponent={listHeaderComponent}
        ListEmptyComponent={listEmptyComponent}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 120 : 132 },
        ]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === "android"}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[NOTICE_COLORS.deepNavy]}
            tintColor={NOTICE_COLORS.deepNavy}
          />
        }
      />

      {/* ── Floating Action Button (FAB) - Admin Only ── */}
      {isAdmin && (
        <TouchableOpacity
          style={[
            styles.fab,
            {
              bottom: isStackScreen
                ? insets.bottom > 0
                  ? insets.bottom + 20
                  : 28
                : insets.bottom > 0
                  ? insets.bottom + 88
                  : 100,
            },
          ]}
          onPress={handleOpenCreate}
          activeOpacity={0.85}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Create new campus notice"
        >
          <Feather
            name="plus"
            size={18}
            color="#ffffff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.fabText}>Create Notice</Text>
        </TouchableOpacity>
      )}

      {/* ── Category Filter Modal (Bottom Sheet Dialog) ── */}
      <NoticeFilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedCategory={selectedCategory}
        onApplyCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
        categories={availableCategories}
      />

      {/* ── Official Notice Detail Canvas ── */}
      <NoticeDetailView
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
        isAdmin={isAdmin}
        onEdit={handleEditNotice}
        onDelete={handleDeleteNotice}
      />

      {/* ── Create / Edit Notice Modal - Admin Only ── */}
      {isCreateOpen && (
        <CreateNoticeModal
          visible={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            setEditingNotice(null);
          }}
          noticeToEdit={editingNotice}
        />
      )}

      {/* ── Delete Confirmation Modal ── */}
      <DeleteNoticeModal
        visible={!!noticeToDelete}
        notice={noticeToDelete}
        isDeleting={isDeleting}
        onClose={() => setNoticeToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NOTICE_COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  headerContainer: {
    width: "100%",
  },
  activeFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  activeFilterPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: NOTICE_COLORS.deepNavy,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 6,
    borderRadius: NOTICE_COLORS.pillRadius,
  },
  activeFilterPillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: NOTICE_COLORS.white,
    marginRight: 6,
  },
  clearFilterChip: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: NOTICE_COLORS.deepNavy,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  fabText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
});
