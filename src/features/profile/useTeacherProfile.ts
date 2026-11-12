import {
  getTeacherProfileAPI,
  updateTeacherProfileAPI,
  updateTeacherProfileImageAPI,
  type TeacherProfileData,
  type UpdateTeacherProfileInput,
} from "@/services/teacher-service";
import { useRoleProfile } from "./useRoleProfile";

export const useTeacherProfile = () =>
  useRoleProfile<TeacherProfileData, UpdateTeacherProfileInput>({
    queryKey: "teacherProfile",
    fallbackLoadError: "Unable to load your faculty profile right now.",
    fetchProfile: getTeacherProfileAPI,
    updateProfileRequest: updateTeacherProfileAPI,
    uploadImageRequest: updateTeacherProfileImageAPI,
  });
