// src/screens/notices/index.tsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useNotices } from "@/features/notices/useNotices";
import { NOTICE_COLORS, fontFamily } from "./constants";
import { NoticeCategoryKey, NormalizedNotice } from "./types";
import { normalizeNotice } from "./utils";
import { NoticeHeader } from "./components/notice-header";
import { NoticeSearchBar } from "./components/notice-search-bar";
import { NoticeFilterModal } from "./components/notice-filter-modal";
import { NoticeCard } from "./components/notice-card";
import { NoticeDetailView } from "./components/notice-detail-view";
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

export function NoticeboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedCategory, setSelectedCategory] = useState<NoticeCategoryKey>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<NormalizedNotice | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: rawNotices, isLoading, isError, refetch } = useNotices();

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleBack = useCallback(() => {
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
  }, [selectedNotice, isFilterModalOpen, searchQuery, selectedCategory, router]);

  useEffect(() => {
    const onHardwareBack = () => {
      if (
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
  }, [selectedNotice, isFilterModalOpen, searchQuery, selectedCategory, handleBack]);

  // 1. Normalization layer: strictly transforms backend items to domain models
  const normalizedNotices = useMemo(() => {
    const list = Array.isArray(rawNotices) ? rawNotices : [];
    return list.map(normalizeNotice);
  }, [rawNotices]);

  // 2. Compute dynamic category counts and filter options
  const { categoryCounts, availableCategories } = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: normalizedNotices.length,
      ACADEMIC: 0,
      ADMIN: 0,
      TRANSPORT: 0,
      HOLIDAY: 0,
      EXAM: 0,
    };

    normalizedNotices.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });

    const categories: Array<{ key: NoticeCategoryKey; label: string }> = [
      { key: "ALL", label: "All Notices" },
      { key: "ACADEMIC", label: "Academic" },
      { key: "ADMIN", label: "Admin" },
      { key: "TRANSPORT", label: "Transport" },
      { key: "HOLIDAY", label: "Holiday" },
    ];

    if ((counts.EXAM || 0) > 0) {
      categories.push({ key: "EXAM", label: "Exam" });
    }

    return {
      categoryCounts: counts,
      availableCategories: categories,
    };
  }, [normalizedNotices]);

  // 3. Filtered notices based on selected category and search query
  const filteredNotices = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

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
  }, [normalizedNotices, selectedCategory, searchQuery]);

  const activeCategoryLabel = useMemo(() => {
    const found = availableCategories.find((c) => c.key === selectedCategory);
    return found ? found.label : selectedCategory;
  }, [availableCategories, selectedCategory]);

  const handleResetFilters = useCallback(() => {
    setSelectedCategory("ALL");
    setSearchQuery("");
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Editorial Header ── */}
      <NoticeHeader />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 120 : 132 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[NOTICE_COLORS.deepNavy]}
            tintColor={NOTICE_COLORS.deepNavy}
          />
        }
      >
        {/* ── Search Box & Filter Icon Row ── */}
        <NoticeSearchBar
          searchQuery={searchQuery}
          onChangeSearchQuery={setSearchQuery}
          isFiltersVisible={isFilterModalOpen}
          onToggleFilters={() => setIsFilterModalOpen(true)}
          hasActiveFilter={selectedCategory !== "ALL"}
        />

        {/* ── Active Filter Badge (shows when filtered from modal) ── */}
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

        {/* ── Main List Content ── */}
        {isLoading ? (
          <NoticeSkeleton />
        ) : isError ? (
          <NoticeErrorState onRetry={refetch} />
        ) : filteredNotices.length === 0 ? (
          <NoticeEmptyState
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onReset={handleResetFilters}
          />
        ) : (
          <View style={styles.cardsContainer}>
            {filteredNotices.map((item) => (
              <NoticeCard
                key={item.id}
                item={item}
                onPress={setSelectedNotice}
              />
            ))}
          </View>
        )}

      </ScrollView>

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
  cardsContainer: {
    width: "100%",
  },
});
