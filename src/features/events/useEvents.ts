import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCampusEventsAPI,
  getCampusEventByIdAPI,
  createCampusEventAPI,
  deleteCampusEventAPI,
} from "@/services/event-service";
import { CreateCampusEventInput } from "./types";

export const useCampusEvents = () => {
  return useQuery({
    queryKey: ["campusEvents"],
    queryFn: getCampusEventsAPI,
  });
};

export const useCampusEventById = (id: string) => {
  return useQuery({
    queryKey: ["campusEvent", id],
    queryFn: () => getCampusEventByIdAPI(id),
    enabled: !!id,
  });
};

export const useCreateCampusEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCampusEventInput) => createCampusEventAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campusEvents"] });
    },
  });
};

export const useDeleteCampusEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCampusEventAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campusEvents"] });
    },
  });
};
