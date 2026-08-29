import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBloodFeedAPI,
  getBloodPostByIdAPI,
  createBloodPostAPI,
  respondBloodPostAPI,
  resolveBloodPostAPI,
  deleteBloodPostAPI,
} from "@/services/blood-service";
import { CreateBloodPostInput, RespondBloodPostInput } from "./types";

export const useBloodFeed = () => {
  return useQuery({
    queryKey: ["bloodPosts"],
    queryFn: getBloodFeedAPI,
  });
};

export const useBloodPostById = (id: string) => {
  return useQuery({
    queryKey: ["bloodPost", id],
    queryFn: () => getBloodPostByIdAPI(id),
    enabled: !!id,
  });
};

export const useCreateBloodPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBloodPostInput) => createBloodPostAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bloodPosts"] });
    },
  });
};

export const useRespondBloodPost = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RespondBloodPostInput) => respondBloodPostAPI(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bloodPosts"] });
      queryClient.invalidateQueries({ queryKey: ["bloodPost", postId] });
    },
  });
};

export const useResolveBloodPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resolveBloodPostAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bloodPosts"] });
    },
  });
};

export const useDeleteBloodPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBloodPostAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bloodPosts"] });
    },
  });
};
