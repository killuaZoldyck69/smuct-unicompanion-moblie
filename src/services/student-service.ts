import api from "./api";

export interface StudentProfileData {
  id: string;
  name?: string;
  email?: string;
  image?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  studentId: string;
  faculty: string;
  department: string;
  program: string;
  batch: string;
  currentSemester: number;
  section: string;
  skills?: string[];
  linkedInUrl?: string | null;
  personalWebsiteUrl?: string | null;
  isCR?: boolean;
  phone?: string | null;
  address?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  bio?: string | null;
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
  bloodGroup?: string;
  section?: string;
  currentSemester?: number;
  skills?: string[];
  linkedInUrl?: string;
  personalWebsiteUrl?: string;
  studentId?: string;
  faculty?: string;
  department?: string;
  program?: string;
  batch?: string;
  phone?: string;
  address?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  bio?: string;
}

export const getStudentProfile = async (): Promise<StudentProfileData | null> => {
  try {
    const response = await api.get("/students/profile");
    return response.data?.data ?? response.data?.profile ?? null;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
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

export const updateStudentProfileImage = async (imageUrl: string) => {
  const response = await api.patch("/students/profile/image", { imageUrl });
  return response.data?.user ?? response.data?.data;
};
export const updateStudentProfileImageAPI = updateStudentProfileImage;
export const updateProfileImageAPI = updateStudentProfileImage;
