import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getAlumniListAPI,
  getAlumniPaginatedAPI,
  getAlumniDepartmentsAPI,
  getAlumniByIdAPI,
  createAlumniAPI,
  updateAlumniAPI,
  deleteAlumniAPI,
  AlumniQueryParams,
} from "@/services/alumni-service";
import { CreateAlumniInput } from "./types";

export const ALUMNI_CACHE_CONFIG = {
  staleTime: Infinity,
  gcTime: 1000 * 60 * 60 * 24,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

export interface UseAlumniInfiniteFilters {
  department?: string | null;
  search?: string | null;
}

export const useAlumniInfinite = (filters?: UseAlumniInfiniteFilters) => {
  const department = filters?.department || null;
  const search = filters?.search?.trim() || "";

  return useInfiniteQuery({
    queryKey: ["alumniDirectory", "infinite", department, search],
    queryFn: async ({ pageParam = 1 }) => {
      return await getAlumniPaginatedAPI({
        page: pageParam as number,
        limit: 20,
        department,
        search: search || undefined,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta?.hasMore) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    ...ALUMNI_CACHE_CONFIG,
  });
};

export const useAlumniDepartments = () => {
  return useQuery({
    queryKey: ["alumniDirectory", "departments"],
    queryFn: getAlumniDepartmentsAPI,
    ...ALUMNI_CACHE_CONFIG,
  });
};

export const useAlumniList = (params?: AlumniQueryParams) => {
  return useQuery({
    queryKey: ["alumniDirectory", "list", params],
    queryFn: () => getAlumniListAPI({ all: true, ...params }),
    ...ALUMNI_CACHE_CONFIG,
  });
};

export const useAlumniById = (id: string) => {
  return useQuery({
    queryKey: ["alumni", id],
    queryFn: () => getAlumniByIdAPI(id),
    enabled: !!id,
  });
};

export const useCreateAlumni = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAlumniInput) => createAlumniAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumniDirectory"] });
    },
  });
};

export const useUpdateAlumni = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateAlumniInput>) => updateAlumniAPI(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumniDirectory"] });
      queryClient.invalidateQueries({ queryKey: ["alumni", id] });
    },
  });
};

export const useDeleteAlumni = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAlumniAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumniDirectory"] });
    },
  });
};
