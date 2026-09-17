import api from "./api";
import { createSingleImageFormData } from "./cloudinary-service";

export interface StudentProfileData {
  id: string;
  name?: string;
  email?: string;
  image?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  studentId: string;
  department: string;
  program: string;
  batch: string;
  currentSemester: number;
  section: string;
  isCR?: boolean;
  isTA?: boolean;
  skills?: string[];
  linkedInUrl?: string | null;
  personalWebsiteUrl?: string | null;
  faculty?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    phoneNumber?: string | null;
  };
}

export interface UpdateStudentProfileInput {
  name?: string;
  phoneNumber?: string;
  batch?: string;
  currentSemester?: number;
  section?: string;
  bloodGroup?: string;
  skills?: string[];
  linkedInUrl?: string;
  personalWebsiteUrl?: string;
}

export const getStudentProfile = async (): Promise<StudentProfileData | null> => {
  try {
    const response = await api.get("/students/profile");
    return response.data?.data ?? response.data?.profile ?? null;
  } catch (error) {
    return null;
  }
};
export const getStudentProfileAPI = getStudentProfile;
export const fetchProfile = getStudentProfile;

export const updateStudentProfile = async (
  data: UpdateStudentProfileInput,
) => {
  const response = await api.patch("/students/profile", data);
  return response.data?.profile ?? response.data?.data;
};
export const updateStudentProfileAPI = updateStudentProfile;
export const updateProfile = updateStudentProfile;

export const updateStudentProfileImage = async (imageUriOrUrl: string) => {
  if (!imageUriOrUrl || typeof imageUriOrUrl !== "string") {
    throw new Error("Invalid image provided.");
  }

  if (/^https?:\/\//i.test(imageUriOrUrl)) {
    const response = await api.patch("/students/profile/image", {
      imageUrl: imageUriOrUrl,
    });
    return response.data?.user ?? response.data?.data;
  }

  const formData = await createSingleImageFormData(imageUriOrUrl, "image");
  const response = await api.patch("/students/profile/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data?.user ?? response.data?.data;
};
export const updateStudentProfileImageAPI = updateStudentProfileImage;
export const updateProfileImageAPI = updateStudentProfileImage;