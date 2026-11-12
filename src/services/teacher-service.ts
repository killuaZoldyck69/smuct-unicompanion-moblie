import api from "./api";
import { createSingleImageFormData } from "./cloudinary-service";
import { isNotFoundError } from "@/features/profile/profile-error-utils";

export interface ConsultationSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface AcademicQualificationItem {
  id?: string;
  degree?: string;
  field?: string | null;
  institution?: string | null;
  passingYear?: string | number | null;
  year?: string | number | null;
  honors?: string | null;
}

export interface TeacherProfileData {
  id: string;
  name?: string;
  email?: string;
  image?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  teacherId?: string;
  designation: string;
  administrativeRole?: string | null;
  department: string;
  faculty?: string;
  officeRoom?: string | null;
  roomNumber?: string | null;
  roomNo?: string | null;
  advisoryBatch?: number | null;
  dayOff?: string | null;
  expertiseFields?: string[];
  academicQualifications?: AcademicQualificationItem[] | null;
  researchInterests?: string[];
  education?: string[] | string;
  officeHours?: any[];
  consultationSlots?: ConsultationSlot[] | null;
  linkedInUrl?: string | null;
  linkedinUrl?: string | null;
  personalWebsiteUrl?: string | null;
  websiteUrl?: string | null;
  googleScholarUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    phoneNumber?: string | null;
  };
}

export interface UpdateTeacherProfileInput {
  name?: string;
  phoneNumber?: string | null;
  phone?: string;
  bloodGroup?: string | null;
  officeRoom?: string | null;
  department?: string;
  designation?: string;
  administrativeRole?: string | null;
  faculty?: string;
  advisoryBatch?: number | null;
  dayOff?: string | null;
  expertiseFields?: string[];
  academicQualifications?: AcademicQualificationItem[] | null;
  consultationSlots?: ConsultationSlot[] | null;
  linkedInUrl?: string | null;
  personalWebsiteUrl?: string | null;
}

export const getTeacherProfile = async (): Promise<TeacherProfileData | null> => {
  try {
    const response = await api.get("/teachers/profile");
    return response.data?.data ?? response.data?.profile ?? null;
  } catch (error) {
    if (isNotFoundError(error)) {
      return null;
    }
    throw error;
  }
};
export const getTeacherProfileAPI = getTeacherProfile;

export const updateTeacherProfile = async (
  data: UpdateTeacherProfileInput,
) => {
  const response = await api.patch("/teachers/profile", data);
  return response.data?.profile ?? response.data?.data;
};
export const updateTeacherProfileAPI = updateTeacherProfile;

export const updateTeacherProfileImage = async (imageUriOrUrl: string) => {
  if (!imageUriOrUrl || typeof imageUriOrUrl !== "string") {
    throw new Error("Invalid image provided.");
  }

  if (/^https?:\/\//i.test(imageUriOrUrl)) {
    const response = await api.patch("/teachers/profile/image", { imageUrl: imageUriOrUrl });
    return response.data?.user ?? response.data?.data;
  }

  const formData = await createSingleImageFormData(imageUriOrUrl, "image");
  const response = await api.patch("/teachers/profile/image", formData);
  return response.data?.user ?? response.data?.data;
};
export const updateTeacherProfileImageAPI = updateTeacherProfileImage;
