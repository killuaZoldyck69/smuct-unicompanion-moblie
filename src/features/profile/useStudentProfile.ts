import {
  getStudentProfileAPI,
  updateStudentProfileAPI,
  updateStudentProfileImageAPI,
  type StudentProfileData,
  type UpdateStudentProfileInput,
} from "@/services/student-service";
import { useRoleProfile } from "./useRoleProfile";

export const useStudentProfile = () =>
  useRoleProfile<StudentProfileData, UpdateStudentProfileInput>({
    queryKey: "studentProfile",
    fallbackLoadError: "Unable to load your student profile right now.",
    fetchProfile: getStudentProfileAPI,
    updateProfileRequest: updateStudentProfileAPI,
    uploadImageRequest: updateStudentProfileImageAPI,
  });
