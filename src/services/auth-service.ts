import api from "./api";
import { authClient } from "./auth-client";

export interface OnboardStudentInput {
  studentId: string;
  faculty: string;
  department: string;
  program: string;
  batch: string;
  currentSemester: number;
  section: string;
}

export const onboardStudentAPI = async (data: OnboardStudentInput) => {
  const res = await api.post("/students/onboard", data);
  return res.data;
};

export const updateInitialProfileImageAPI = async (imageUrl: string) => {
  const res = await api.patch("/students/profile/image", { imageUrl });
  return res.data;
};

export const getSessionUser = async () => {
  const session = await authClient.getSession();
  return session.data?.user || null;
};
