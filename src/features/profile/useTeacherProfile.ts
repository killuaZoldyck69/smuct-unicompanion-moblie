import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import Toast from "react-native-toast-message";

import {
  getTeacherProfileAPI,
  updateTeacherProfileAPI,
  updateTeacherProfileImageAPI,
} from "@/services/teacher-service";
import { UpdateTeacherProfileInput } from "./types";
import { supabase } from "@/services/supabase";

export const useTeacherProfile = () => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: getTeacherProfileAPI,
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

  const pickAndUploadAvatar = async (safeName: string = "teacher") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      try {
        setIsUploading(true);
        const fileExt = result.assets[0].mimeType?.split("/").pop() || "jpg";
        const fileName = `teacher-${Date.now()}-${safeName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, decode(result.assets[0].base64), {
            contentType: result.assets[0].mimeType || "image/jpeg",
            upsert: true,
          });

        if (uploadError) throw new Error(uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        await updateTeacherProfileImageAPI(publicUrlData.publicUrl);

        queryClient.invalidateQueries({ queryKey: ["teacherProfile"] });
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        Toast.show({ type: "success", text1: "Profile Picture Updated!" });
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Upload Failed",
          text2: error.message,
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    refetch: profileQuery.refetch,
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    pickAndUploadAvatar,
    isUploading,
  };
};
