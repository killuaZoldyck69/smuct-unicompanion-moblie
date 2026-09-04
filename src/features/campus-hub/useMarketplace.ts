import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMarketplaceFeed,
  getMarketplacePostById,
  createMarketplacePost,
  deleteMarketplacePost,
  markMarketplaceSold,
  addMarketplaceComment,
  deleteMarketplaceComment,
} from "@/services/marketplace-service";
import type {
  CreateMarketplaceInput,
  ListingType,
  ListingStatus,
  MarketplaceCategory,
} from "@/services/marketplace-service";

const QUERY_KEY = "marketplaceFeed";

export const useMarketplaceFeed = (params?: {
  type?: ListingType;
  status?: ListingStatus;
  search?: string;
  category?: MarketplaceCategory;
}) =>
  useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getMarketplaceFeed(params),
  });

export const useMarketplacePost = (id: string) =>
  useQuery({
    queryKey: ["marketplacePost", id],
    queryFn: () => getMarketplacePostById(id),
    enabled: !!id,
  });

export const useCreateMarketplacePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMarketplaceInput) => createMarketplacePost(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
};

export const useDeleteMarketplacePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMarketplacePost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
};

export const useMarkMarketplaceSold = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markMarketplaceSold(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["marketplacePost", id] });
    },
  });
};

export const useAddMarketplaceComment = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { content: string; parentId?: string | null } | string) => {
      const payload = typeof input === "string" ? { content: input } : input;
      return addMarketplaceComment(postId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplacePost", postId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useDeleteMarketplaceComment = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      deleteMarketplaceComment(postId, commentId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["marketplacePost", postId] }),
  });
};
