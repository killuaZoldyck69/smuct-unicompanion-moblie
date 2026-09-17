import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

import {
  getTeacherProfileAPI,
  updateTeacherProfileAPI,
  updateTeacherProfileImageAPI,
} from "@/services/teacher-service";
import { PROFILE_CACHE_CONFIG } from "@/screens/profile/constants";
import { UpdateTeacherProfileInput } from "./types";

export const useTeacherProfile = () => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: getTeacherProfileAPI,
    ...PROFILE_CACHE_CONFIG,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTeacherProfileInput) =>
      updateTeacherProfileAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherProfile"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      Toast.show({ type: "success", text1: "Profile Updated Successfully!" });
    },
    onError: (err: any) => {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: err.message || "Please try again.",
      });
    },
  });

  const pickAndUploadAvatar = async (_safeName: string = "teacher") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      try {
        setIsUploading(true);
        await updateTeacherProfileImageAPI(result.assets[0].uri);

        queryClient.invalidateQueries({ queryKey: ["teacherProfile"] });
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        Toast.show({ type: "success", text1: "Profile Picture Updated!" });
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Upload Failed",
          text2:
            error.response?.data?.message ||
            error.message ||
            "Failed to update profile picture.",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isRefetching: profileQuery.isRefetching,
    isError: profileQuery.isError,
    refetch: profileQuery.refetch,
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    pickAndUploadAvatar,
    isUploading,
  };
};
