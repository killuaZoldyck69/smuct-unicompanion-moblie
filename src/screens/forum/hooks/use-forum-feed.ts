import { useState, useMemo, useCallback } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useForumPosts } from "@/features/forum/useForum";
import type { FilterType, ForumPostItem } from "../types";
import { computeForumFeed } from "../utils";

export function useForumFeed() {
  const { user: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;

  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: posts, isLoading, refetch } = useForumPosts();

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const { filteredPosts, counts } = useMemo(() => {
    return computeForumFeed(
      posts as ForumPostItem[] | undefined,
      activeFilter,
      searchQuery,
      currentUserId,
    );
  }, [posts, activeFilter, searchQuery, currentUserId]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
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
    filteredPosts,
    counts,
  };
}
