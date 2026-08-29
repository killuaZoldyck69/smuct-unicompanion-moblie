import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAlumniListAPI,
  getAlumniByIdAPI,
  createAlumniAPI,
  updateAlumniAPI,
  deleteAlumniAPI,
} from "@/services/alumni-service";
import { CreateAlumniInput } from "./types";

export const useAlumniList = () => {
  return useQuery({
    queryKey: ["alumniDirectory"],
    queryFn: getAlumniListAPI,
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
