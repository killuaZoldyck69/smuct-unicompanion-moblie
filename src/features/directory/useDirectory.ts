import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTeachersDirectory,
  getTeacherDepartments,
  TeacherDirectoryQueryParams,
  TeachersDirectoryResponse,
} from "@/services/directory-service";

export interface UseInfiniteTeachersOptions {
  search?: string;
  department?: string;
  limit?: number;
}

/**
 * Infinite query for Teachers Directory.
 * Supports server-side debounced search, department filtering, and pagination.
 */
export const useInfiniteTeachersDirectory = (
  options?: UseInfiniteTeachersOptions,
) => {
  const search = options?.search?.trim() || "";
  const department = options?.department?.trim() || "";
  const limit = options?.limit || 15;

  return useInfiniteQuery<TeachersDirectoryResponse>({
    queryKey: ["teachersDirectory", "infinite", { search, department, limit }],
    queryFn: async ({ pageParam = 1 }) => {
      return await getTeachersDirectory({
        page: pageParam as number,
        limit,
        search: search || undefined,
        department: department || undefined,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta?.hasMore) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 3, // 3 minutes cache freshness
    gcTime: 1000 * 60 * 15, // 15 minutes garbage collection (no memory leaks)
  });
};

/**
 * Query for active distinct teacher departments
 */
export const useTeacherDepartments = () => {
  return useQuery<string[]>({
    queryKey: ["teachersDirectory", "departments"],
    queryFn: getTeacherDepartments,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60,
  });
};

/**
 * Helper to prefetch or invalidate directory queries
 */
export const useTeachersDirectoryActions = () => {
  const queryClient = useQueryClient();

  const invalidateDirectory = () => {
    queryClient.invalidateQueries({ queryKey: ["teachersDirectory"] });
  };

  return { invalidateDirectory };
};
