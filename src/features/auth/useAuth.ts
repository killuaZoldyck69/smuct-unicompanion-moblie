import { useMutation, useQueryClient } from "@tanstack/react-query";
import { onboardStudentAPI, updateInitialProfileImageAPI } from "@/services/auth-service";
import { OnboardStudentInput } from "./types";

export const useOnboardStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OnboardStudentInput) => onboardStudentAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
    },
  });
};

export const useUpdateInitialProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageUrl: string) => updateInitialProfileImageAPI(imageUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
    },
  });
};
