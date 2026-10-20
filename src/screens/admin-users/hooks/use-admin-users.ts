import { useState, useMemo, useEffect, useCallback } from "react";
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
import {
  TabType,
  RoleStatusTag,
  RoleAction,
  AdminUser,
  UpdateAdminTeacherProfilePayload,
  UpdateAdminStudentProfilePayload,
} from "../types";

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

  const extractErrorMessage = (
    err: any,
    fallback: string = "An unexpected error occurred.",
  ): string => {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.response?.data?.errorSources?.[0]?.message ||
      err?.message ||
      fallback
    );
  };

  // Mutations
  const restrictUserMutation = useMutation({
    mutationFn: async ({
      userId,
      isRestricted,
    }: {
      userId: string;
      isRestricted: boolean;
    }) => {
      return await api.patch(`/users/${userId}/restrict`, { isRestricted });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["directory"] });
      Toast.show({
        type: "success",
        text1: variables.isRestricted
          ? "Account Restricted"
          : "Account Unrestricted",
        text2: variables.isRestricted
          ? "User has been restricted and logged out."
          : "User access has been restored.",
      });
      setSelectedUser(null);
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Action Failed",
        text2: extractErrorMessage(err, "Failed to update account restriction status."),
      }),
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["directory"] });
      const isCR = variables.action === "MAKE_CR";
      setSelectedUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          studentProfile: prev.studentProfile
            ? {
                ...prev.studentProfile,
                isCR,
              }
            : prev.studentProfile,
        };
      });
      Toast.show({
        type: "success",
        text1: isCR ? "Assigned as Class Representative" : "Role Removed",
        text2: isCR
          ? "Student designated as Class Representative."
          : "Class Representative status was cleared.",
      });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: extractErrorMessage(err, "Failed to update student role."),
      }),
  });

  const updateTeacherPositionMutation = useMutation({
    mutationFn: async ({
      userId,
      designation,
      administrativeRole,
    }: {
      userId: string;
      designation?: string;
      administrativeRole?: string | null;
    }) => {
      return await api.patch(`/users/${userId}/teacher-position`, {
        designation,
        administrativeRole,
      });
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["directory"] });
      const updatedTeacher = response.data?.data;
      if (updatedTeacher && selectedUser) {
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                teacherProfile: {
                  ...prev.teacherProfile,
                  ...updatedTeacher,
                },
              }
            : null,
        );
      }
      Toast.show({
        type: "success",
        text1: "Faculty Position Updated",
        text2: variables.designation
          ? `Designation set to ${variables.designation}`
          : variables.administrativeRole
          ? `Leadership role set to ${variables.administrativeRole}`
          : "Leadership role cleared",
      });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: extractErrorMessage(err, "Failed to update faculty position."),
      }),
  });

  const updateTeacherProfileMutation = useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateAdminTeacherProfilePayload;
    }) => {
      const response = await api.patch(`/users/${userId}/teacher-profile`, data);
      return response.data?.data;
    },
    onSuccess: (updatedUser: any) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["directory"] });
      if (updatedUser) {
        setSelectedUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            name: updatedUser.name ?? prev.name,
            phoneNumber: updatedUser.phoneNumber ?? prev.phoneNumber,
            bloodGroup: updatedUser.bloodGroup ?? prev.bloodGroup,
            teacherProfile: {
              ...prev.teacherProfile,
              ...(updatedUser.teacherProfile || {}),
            },
          };
        });
      }
      Toast.show({
        type: "success",
        text1: "Faculty Profile Updated",
        text2: "Changes saved successfully.",
      });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: extractErrorMessage(err, "Failed to update faculty profile."),
      }),
  });

  const updateStudentProfileMutation = useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateAdminStudentProfilePayload;
    }) => {
      const response = await api.patch(`/users/${userId}/student-profile`, data);
      return response.data?.data;
    },
    onSuccess: (updatedUser: any) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["directory"] });
      if (updatedUser) {
        setSelectedUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            name: updatedUser.name ?? prev.name,
            phoneNumber: updatedUser.phoneNumber ?? prev.phoneNumber,
            bloodGroup: updatedUser.bloodGroup ?? prev.bloodGroup,
            studentProfile: {
              ...prev.studentProfile,
              ...(updatedUser.studentProfile || {}),
            },
          };
        });
      }
      Toast.show({
        type: "success",
        text1: "Student Profile Updated",
        text2: "Changes saved successfully.",
      });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: extractErrorMessage(err, "Failed to update student profile."),
      }),
  });

  // Handlers
  const handleToggleRestrict = useCallback(
    (userId: string, _name?: string, currentlyRestricted?: boolean) => {
      const willRestrict = !currentlyRestricted;
      restrictUserMutation.mutate({ userId, isRestricted: willRestrict });
    },
    [restrictUserMutation],
  );

  const handleUpdateRole = useCallback(
    (userId: string, action: RoleAction) => {
      updateRoleMutation.mutate({ userId, action });
    },
    [updateRoleMutation],
  );

  const handleUpdateTeacherPosition = useCallback(
    (
      userId: string,
      data: { designation?: string; administrativeRole?: string | null },
    ) => {
      updateTeacherPositionMutation.mutate({ userId, ...data });
    },
    [updateTeacherPositionMutation],
  );

  const handleUpdateTeacherProfile = useCallback(
    async (userId: string, data: UpdateAdminTeacherProfilePayload) => {
      return await updateTeacherProfileMutation.mutateAsync({ userId, data });
    },
    [updateTeacherProfileMutation],
  );

  const handleUpdateStudentProfile = useCallback(
    async (userId: string, data: UpdateAdminStudentProfilePayload) => {
      return await updateStudentProfileMutation.mutateAsync({ userId, data });
    },
    [updateStudentProfileMutation],
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
    handleToggleRestrict,
    handleDelete: handleToggleRestrict,
    handleUpdateRole,
    handleUpdateTeacherPosition,
    handleUpdateTeacherProfile,
    handleUpdateStudentProfile,
    resetFilters,
    isStudentTab,
    primaryThemeColor,
    isUpdatingRole: updateRoleMutation.isPending,
    isUpdatingTeacherPosition: updateTeacherPositionMutation.isPending,
    isUpdatingTeacherProfile: updateTeacherProfileMutation.isPending,
    isUpdatingStudentProfile: updateStudentProfileMutation.isPending,
    isRestrictingUser: restrictUserMutation.isPending,
    isDeletingUser: restrictUserMutation.isPending,
  };
}
