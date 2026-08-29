import api from "./api";

export interface TeacherProfileData {
  id: string;
  name?: string;
  email?: string;
  image?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  teacherId?: string;
  designation: string;
  department: string;
  faculty?: string;
  roomNumber?: string | null;
  roomNo?: string | null;
  researchInterests?: string[];
  education?: string[] | string;
  officeHours?: any[];
  consultationHours?: string | null;
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
  phoneNumber?: string;
  phone?: string;
  bloodGroup?: string;
  roomNumber?: string;
  roomNo?: string;
  department?: string;
  designation?: string;
  faculty?: string;
  researchInterests?: string[];
  education?: string[] | string;
  officeHours?: any[];
  consultationHours?: string;
  linkedInUrl?: string;
  linkedinUrl?: string;
  personalWebsiteUrl?: string;
  websiteUrl?: string;
  googleScholarUrl?: string;
  bio?: string;
}

export const getTeacherProfile = async (): Promise<TeacherProfileData | null> => {
  try {
    const response = await api.get("/teachers/profile");
    return response.data?.data ?? response.data?.profile ?? null;
  } catch (error) {
    return null;
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

export const updateTeacherProfileImage = async (imageUrl: string) => {
  const response = await api.patch("/teachers/profile/image", { imageUrl });
  return response.data?.user ?? response.data?.data;
};
export const updateTeacherProfileImageAPI = updateTeacherProfileImage;
