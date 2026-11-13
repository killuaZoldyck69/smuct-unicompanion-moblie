import { useState, useMemo, useCallback, useEffect } from "react";
import Toast from "react-native-toast-message";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { extractApiErrorInfo } from "@/features/forum/forum-logic";
import {
  useDeleteForumPost,
  useInfiniteForumPosts,
  useResolveForumPost,
} from "@/features/forum/useForum";
import { useCreateForumReport } from "@/features/ugc/useUgcModeration";
import type { UgcReportReason } from "@/services/ugc-service";
import type { FilterType, ForumPostItem, ForumCounts } from "../types";

export interface FeedConfirmModalState {
  type: "danger" | "success";
  title: string;
  message: string;
  confirmLabel: string;
  iconName?: "trash-2" | "check-circle";
  action: () => void;
}

export function useForumFeed() {
  const { user: currentUser } = useCurrentUser();
  const { isOffline } = useNetworkStatus();

  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reportTargetPost, setReportTargetPost] = useState<ForumPostItem | null>(
    null,
  );
  const [confirmModal, setConfirmModal] = useState<FeedConfirmModalState | null>(
    null,
  );

  const resolveMutation = useResolveForumPost();
  const deleteMutation = useDeleteForumPost();
  const reportMutation = useCreateForumReport();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const filteredPosts: ForumPostItem[] = useMemo(() => {
    if (!feedData?.pages) return [];
    return feedData.pages.flatMap((page) => page.posts || []);
  }, [feedData]);

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

  const handleResolve = useCallback(
    (id: string, title: string, currentlyResolved: boolean = false) => {
      const isReopening = currentlyResolved;
      setConfirmModal({
        type: "success",
        title: isReopening ? "Reopen Discussion" : "Mark as Solved",
        message: isReopening
          ? `Reopen "${title}" for new answers and community replies?`
          : `Mark "${title}" as solved?`,
        confirmLabel: isReopening ? "Reopen" : "Mark Solved",
        action: () => {
          if (isOffline) {
            Toast.show({
              type: "error",
              text1: "You are offline",
              text2: "Reconnect to the internet to update this discussion.",
            });
            return;
          }
          resolveMutation.mutate(
            { id, isResolved: !isReopening },
            {
              onSuccess: () => {
                setConfirmModal(null);
                Toast.show({
                  type: "success",
                  text1: isReopening
                    ? "Discussion Reopened"
                    : "Discussion Resolved",
                  text2: isReopening
                    ? "This discussion is open for new replies."
                    : "Marked as solved successfully.",
                });
              },
              onError: (err: unknown) => {
                setConfirmModal(null);
                const info = extractApiErrorInfo(
                  err,
                  "Failed to update discussion status.",
                );
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: info.message,
                });
              },
            },
          );
        },
      });
    },
    [resolveMutation, isOffline],
  );

  const handleDelete = useCallback(
    (id: string, title: string) => {
      setConfirmModal({
        type: "danger",
        title: "Delete Discussion",
        message: `Are you sure you want to permanently delete "${title}"? This action cannot be undone.`,
        confirmLabel: "Delete",
        action: () => {
          if (isOffline) {
            Toast.show({
              type: "error",
              text1: "You are offline",
              text2: "Reconnect to the internet to delete this discussion.",
            });
            return;
          }
          deleteMutation.mutate(id, {
            onSuccess: () => {
              setConfirmModal(null);
              Toast.show({
                type: "success",
                text1: "Discussion Deleted",
                text2: "Discussion was permanently removed.",
              });
            },
            onError: (err: unknown) => {
              setConfirmModal(null);
              const info = extractApiErrorInfo(
                err,
                "Failed to delete discussion.",
              );
              Toast.show({
                type: "error",
                text1: "Error",
                text2: info.message,
              });
            },
          });
        },
      });
    },
    [deleteMutation, isOffline],
  );

  const handleReportPost = useCallback((post: ForumPostItem) => {
    setReportTargetPost(post);
  }, []);

  const handleSubmitReport = useCallback(
    ({ reason, details }: { reason: UgcReportReason; details?: string }) => {
      if (!reportTargetPost) return;
      if (isOffline) {
        Toast.show({
          type: "error",
          text1: "You're Offline",
          text2: "Connect to the internet to submit a report.",
        });
        return;
      }

      reportMutation.mutate(
        {
          targetType: "FORUM_POST",
          targetId: reportTargetPost.id,
          reason,
          ...(details ? { details } : {}),
        },
        {
          onSuccess: () => {
            setReportTargetPost(null);
            Toast.show({
              type: "success",
              text1: "Report Submitted",
              text2: "This post has been hidden from your feed for review.",
            });
          },
          onError: (err: unknown) => {
            const info = extractApiErrorInfo(err, "Could not submit report.");
            Toast.show({
              type: "error",
              text1: "Report Failed",
              text2: info.message,
            });
          },
        },
      );
    },
    [reportTargetPost, isOffline, reportMutation],
  );

  return {
    currentUser,
    isOffline,
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
    confirmModal,
    setConfirmModal,
    isConfirmLoading: resolveMutation.isPending || deleteMutation.isPending,
    handleResolve,
    handleDelete,
    reportTargetPost,
    setReportTargetPost,
    isSubmittingReport: reportMutation.isPending,
    handleReportPost,
    handleSubmitReport,
  };
}
