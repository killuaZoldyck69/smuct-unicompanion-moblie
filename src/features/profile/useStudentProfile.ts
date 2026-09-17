import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

import {
  getStudentProfileAPI,
  updateStudentProfileAPI,
  updateStudentProfileImageAPI,
} from "@/services/student-service";
import { PROFILE_CACHE_CONFIG } from "@/screens/profile/constants";
import { UpdateStudentProfileInput } from "./types";

export const useStudentProfile = () => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["studentProfile"],
    queryFn: getStudentProfileAPI,
    ...PROFILE_CACHE_CONFIG,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateStudentProfileInput) =>
      updateStudentProfileAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
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

  const pickAndUploadAvatar = async (_safeName: string = "student") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      try {
        setIsUploading(true);
        await updateStudentProfileImageAPI(result.assets[0].uri);

        queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
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
