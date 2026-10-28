import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Feather, Ionicons } from "@expo/vector-icons";

import { fetchAdminCourseHubs } from "@/services/admin-course-hubs";
import { CourseCard } from "@/screens/hubs/components/course-card";
import { CourseHubsSkeleton } from "@/screens/hubs/components/course-hubs-skeleton";
import { AdminCourseHubsHeader } from "./components/AdminCourseHubsHeader";
import { AdminCourseHubsFilterModal } from "./components/AdminCourseHubsFilterModal";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export function AdminCourseHubsScreen() {
  const insets = useSafeAreaInsets();

  // Ensure edge-to-edge translucent status bar on screen focus
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle("dark-content", true);
      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor("transparent", true);
        StatusBar.setTranslucent(true);
      }
    }, []),
  );

  // Search & Filter State
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "ARCHIVED">("ALL");
  const [department, setDepartment] = useState("ALL");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Debounce search query by 300ms to prevent request flood while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Infinite Query with React Query for Lazy Loading & Infinite Scrolling
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["adminCourseHubs", debouncedSearch, department, status],
    queryFn: ({ pageParam = 1 }) =>
      fetchAdminCourseHubs({
        search: debouncedSearch,
        department,
        status,
        page: pageParam as number,
        limit: 15,
      }),
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.hasMore
        ? lastPage.pagination.page + 1
        : undefined,
    initialPageParam: 1,
    staleTime: 30000,
  });

  // Flatten paginated pages into single array
  const courseHubs = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page?.hubs || []);
  }, [data]);

  // Aggregate metadata from the first page response
  const firstPageMeta = data?.pages?.[0]?.meta;
  const totalActive = firstPageMeta?.totalActive ?? 0;
  const totalArchived = firstPageMeta?.totalArchived ?? 0;
  const availableDepartments = useMemo(() => {
    return firstPageMeta?.availableDepartments || [];
  }, [firstPageMeta]);

  // Reset all filters and search input
  const handleResetFilters = useCallback(() => {
    setSearchInput("");
    setDebouncedSearch("");
    setStatus("ALL");
    setDepartment("ALL");
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#131b2e" />
        <Text style={styles.footerLoaderText}>Loading more course hubs...</Text>
      </View>
    );
  }, [isFetchingNextPage]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* 1. Header with Search Input & Filter Trigger */}
      <AdminCourseHubsHeader
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        onClearSearch={() => setSearchInput("")}
        onOpenFilter={() => setIsFilterModalVisible(true)}
        status={status}
        onStatusReset={() => setStatus("ALL")}
        department={department}
        onDepartmentReset={() => setDepartment("ALL")}
        totalActive={totalActive}
        totalArchived={totalArchived}
      />

      {/* 2. Main Course Hubs Stream */}
      {isLoading ? (
        <CourseHubsSkeleton />
      ) : courseHubs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="search-outline" size={44} color="#94a3b8" />
          </View>
          <Text style={styles.emptyTitle}>
            {debouncedSearch || department !== "ALL" || status !== "ALL"
              ? "No Matching Course Hubs"
              : "No Course Hubs Available"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {debouncedSearch
              ? `No course hubs found matching "${debouncedSearch}".`
              : department !== "ALL" || status !== "ALL"
              ? "No course hubs match your selected filters."
              : "There are currently no course hubs created in the university system."}
          </Text>

          {(debouncedSearch ||
            department !== "ALL" ||
            status !== "ALL") && (
            <TouchableOpacity
              style={styles.resetAllBtn}
              onPress={handleResetFilters}
              activeOpacity={0.8}
            >
              <Feather
                name="rotate-ccw"
                size={14}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.resetAllBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={courseHubs}
          keyExtractor={(item) => item.id || item.hub?.id}
          renderItem={({ item, index }) => (
            <CourseCard item={item} index={index} />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom + 120, 140) },
          ]}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          removeClippedSubviews={Platform.OS === "android"}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={10}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#131b2e"
            />
          }
        />
      )}

      {/* 3. Filter Modal (Department and Active/Archived Status) */}
      <AdminCourseHubsFilterModal
        isVisible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        status={status}
        onStatusChange={setStatus}
        department={department}
        onDepartmentChange={setDepartment}
        availableDepartments={availableDepartments}
        totalActive={totalActive}
        totalArchived={totalArchived}
        onReset={() => {
          setStatus("ALL");
          setDepartment("ALL");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fb",
  },
  listContent: {
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  footerLoaderText: {
    fontFamily,
    fontSize: 12,
    color: "#64748b",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 120,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  resetAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131b2e",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 9999,
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  resetAllBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});

