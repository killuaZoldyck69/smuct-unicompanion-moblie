import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { PROFILE_CACHE_CONFIG } from "@/screens/profile/constants";
import { pickAndUploadProfileAvatar } from "./pickAndUploadProfileAvatar";
import { extractApiErrorMessage } from "./profile-error-utils";

interface RoleProfileConfig<TProfile, TUpdateInput> {
  queryKey: string;
  fallbackLoadError: string;
  fetchProfile: () => Promise<TProfile | null>;
  updateProfileRequest: (data: TUpdateInput) => Promise<unknown>;
  uploadImageRequest: (uri: string) => Promise<unknown>;
}

/**
 * Shared typed React Query lifecycle hook for user-scoped profile screens.
 * Handles offline detection, user-scoped query keys, error message extraction,
 * and compressed (< 3 MB) avatar uploads.
 */
export function useRoleProfile<TProfile, TUpdateInput>({
  queryKey,
  fallbackLoadError,
  fetchProfile,
  updateProfileRequest,
  uploadImageRequest,
}: RoleProfileConfig<TProfile, TUpdateInput>) {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const { isOffline } = useNetworkStatus();
  const [isUploading, setIsUploading] = useState(false);

  const scopedQueryKey = useMemo(
    () => [queryKey, user?.id ?? "current"] as const,
    [queryKey, user?.id]
  );

  const profileQuery = useQuery({
    queryKey: scopedQueryKey,
    queryFn: fetchProfile,
    enabled: Boolean(user?.id),
    ...PROFILE_CACHE_CONFIG,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: TUpdateInput) => {
      if (isOffline) {
        throw new Error("You appear to be offline. Check your internet connection and try again.");
      }
      return updateProfileRequest(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      Toast.show({ type: "success", text1: "Profile Updated Successfully!" });
    },
    onError: (err: unknown) => {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: extractApiErrorMessage(err, "Please try again.", isOffline),
      });
    },
  });

  const pickAndUploadAvatar = useCallback(async () => {
    setIsUploading(true);
    try {
      await pickAndUploadProfileAvatar({
        isOffline,
        onUpload: async (uri) => {
          await uploadImageRequest(uri);
          queryClient.invalidateQueries({ queryKey: [queryKey] });
          queryClient.invalidateQueries({ queryKey: ["currentUser"] });
          Toast.show({ type: "success", text1: "Profile Picture Updated!" });
        },
      });
    } catch (error: unknown) {
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: extractApiErrorMessage(error, "Could not update profile picture.", isOffline),
      });
    } finally {
      setIsUploading(false);
    }
  }, [isOffline, queryClient, queryKey, uploadImageRequest]);

  const errorMessage = useMemo(() => {
    if (!profileQuery.isError) return null;
    return extractApiErrorMessage(profileQuery.error, fallbackLoadError, isOffline);
  }, [profileQuery.isError, profileQuery.error, fallbackLoadError, isOffline]);

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isRefetching: profileQuery.isRefetching,
    isError: profileQuery.isError,
    error: profileQuery.error,
    errorMessage,
    isOffline,
    refetch: profileQuery.refetch,
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    pickAndUploadAvatar,
    isUploading,
  };
}
