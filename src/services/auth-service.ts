import api from "./api";
import { authClient } from "./auth-client";

import { createSingleImageFormData } from "./cloudinary-service";

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

export const uploadProfileImageAPI = async (imageUriOrUrl: string) => {
  if (!imageUriOrUrl || typeof imageUriOrUrl !== "string" || !imageUriOrUrl.trim()) {
    throw new Error("Invalid image provided.");
  }

  // If already a remote URL, update directly
  if (/^https?:\/\//i.test(imageUriOrUrl)) {
    const res = await api.patch("/users/profile/image", { imageUrl: imageUriOrUrl });
    return res.data?.data?.imageUrl || res.data?.data?.user?.image || imageUriOrUrl;
  }

  // Upload local file to backend which stores it in Cloudinary and updates DB
  const formData = await createSingleImageFormData(imageUriOrUrl, "image");
  const res = await api.patch("/users/profile/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return (
    res.data?.data?.imageUrl ||
    res.data?.data?.user?.image ||
    res.data?.data?.image ||
    ""
  );
};

export const updateInitialProfileImageAPI = async (imageUrlOrUri: string) => {
  return await uploadProfileImageAPI(imageUrlOrUri);
};

export const getSessionUser = async () => {
  const session = await authClient.getSession();
  return session.data?.user || null;
};
