import { useState, useMemo, useCallback, useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useInfiniteForumPosts } from "@/features/forum/useForum";
import type { FilterType, ForumPostItem, ForumCounts } from "../types";

export function useForumFeed() {
  const { user: currentUser } = useCurrentUser();

  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debounce search input to avoid hitting backend on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Server-side query parameters
  const queryParams = useMemo(() => {
    return {
      filter: activeFilter,
      search: debouncedSearch.length > 0 ? debouncedSearch : undefined,
      limit: 15,
    };
  }, [activeFilter, debouncedSearch]);

  const {
    data: feedData,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteForumPosts(queryParams);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // Flatten paginated pages from backend
  const filteredPosts: ForumPostItem[] = useMemo(() => {
    if (!feedData?.pages) return [];
    return feedData.pages.flatMap((page) => page.posts || []);
  }, [feedData]);

  // Server-calculated category counts
  const counts: ForumCounts = useMemo(() => {
    const metaCounts = feedData?.pages?.[0]?.meta?.counts;
    return (
      metaCounts || {
        total: 0,
        open: 0,
        resolved: 0,
        myPosts: 0,
      }
    );
  }, [feedData]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearch("");
  }, []);

  return {
    currentUser,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    clearSearch,
    isRefreshing,
    onRefresh,
    isLoading,
    isError,
    filteredPosts,
    counts,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
    isSearching: searchQuery.trim() !== debouncedSearch,
  };
}
