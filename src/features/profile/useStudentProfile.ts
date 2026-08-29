import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import Toast from "react-native-toast-message";

import {
  getStudentProfileAPI,
  updateStudentProfileAPI,
  updateStudentProfileImageAPI,
} from "@/services/student-service";
import { UpdateStudentProfileInput } from "./types";
import { supabase } from "@/services/supabase";

export const useStudentProfile = () => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["studentProfile"],
    queryFn: getStudentProfileAPI,
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

  const pickAndUploadAvatar = async (safeName: string = "student") => {
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
        const fileName = `student-${Date.now()}-${safeName}.${fileExt}`;

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

        await updateStudentProfileImageAPI(publicUrlData.publicUrl);

        queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
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
