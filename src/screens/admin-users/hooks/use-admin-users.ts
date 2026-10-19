import { useState, useMemo, useEffect, useCallback } from "react";
import { Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import api from "@/services/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { THEME } from "../constants";
import { TabType, RoleStatusTag, RoleAction, AdminUser } from "../types";

export function useAdminUsers() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { role, isPending, isAuthenticated } = useCurrentUser();

  // Role Protection
  useEffect(() => {
    if (!isPending && (!isAuthenticated || role !== "ADMIN")) {
      router.replace("/(tabs)");
    }
  }, [isPending, isAuthenticated, role, router]);

  // Tab & Filter States
  const [activeTab, setActiveTab] = useState<TabType>("STUDENT");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [filterRoleTag, setFilterRoleTag] = useState<RoleStatusTag>("ALL");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Debounce search input by 350ms to minimize network traffic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Server-side Infinite Query
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: [
      "adminUsers",
      "infinite",
      {
        role: activeTab,
        department: selectedDepartment || "All",
        tag: activeTab === "STUDENT" ? filterRoleTag : "ALL",
        search: debouncedSearch,
      },
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, any> = {
        page: pageParam,
        limit: 20,
        role: activeTab,
      };
      if (selectedDepartment && selectedDepartment !== "All") {
        params.department = selectedDepartment;
      }
      if (activeTab === "STUDENT" && filterRoleTag !== "ALL") {
        params.tag = filterRoleTag;
      }
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const response = await api.get("/users", { params });
      return {
        users: (response.data?.data || []) as AdminUser[],
        meta: response.data?.meta || {
          page: pageParam,
          total: 0,
          totalPages: 1,
          hasMore: false,
        },
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta?.hasMore) {
        return (lastPage.meta.page as number) + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    placeholderData: (previousData) => previousData,
  });

  // Flattened users list
  const users = useMemo(() => {
    return data?.pages.flatMap((page) => page.users) || [];
  }, [data]);

  // Mutations
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => await api.delete(`/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      Toast.show({ type: "success", text1: "Account Deleted" });
      setSelectedUser(null);
    },
    onError: (err: any) =>
      Toast.show({ type: "error", text1: "Delete Failed", text2: err.message }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      action,
    }: {
      userId: string;
      action: RoleAction;
    }) => {
      return await api.patch(`/users/${userId}/role`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      Toast.show({ type: "success", text1: "User Role Updated" });
      setSelectedUser(null);
    },
    onError: (err: any) =>
      Toast.show({ type: "error", text1: "Update Failed", text2: err.message }),
  });

  // Handlers
  const handleDelete = useCallback(
    (userId: string, name: string) => {
      if (Platform.OS === "web") {
        if (
          window.confirm(
            `Are you sure you want to permanently delete ${name}'s account?`,
          )
        ) {
          deleteUserMutation.mutate(userId);
        }
      } else {
        Alert.alert(
          "Delete Account",
          `Are you sure you want to permanently delete ${name}? This cannot be undone.`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => deleteUserMutation.mutate(userId),
            },
          ],
        );
      }
    },
    [deleteUserMutation],
  );

  const handleUpdateRole = useCallback(
    (userId: string, action: RoleAction) => {
      updateRoleMutation.mutate({ userId, action });
    },
    [updateRoleMutation],
  );

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedDepartment(null);
    setFilterRoleTag("ALL");
  }, []);

  const isStudentTab = activeTab === "STUDENT";
  const primaryThemeColor = isStudentTab
    ? THEME.studentPrimary
    : THEME.teacherPrimary;

  return {
    isPending,
    isAuthenticated,
    role,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    selectedDepartment,
    setSelectedDepartment,
    filterRoleTag,
    setFilterRoleTag,
    isFilterModalOpen,
    setIsFilterModalOpen,
    selectedUser,
    setSelectedUser,
    users,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
    handleDelete,
    handleUpdateRole,
    resetFilters,
    isStudentTab,
    primaryThemeColor,
    isUpdatingRole: updateRoleMutation.isPending,
    isDeletingUser: deleteUserMutation.isPending,
  };
}
