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

export const uploadProfileImageAPI = async (
  imageUriOrUrl: string,
  base64Fallback?: string | null
) => {
  if (!imageUriOrUrl || typeof imageUriOrUrl !== "string" || !imageUriOrUrl.trim()) {
    throw new Error("Invalid image provided.");
  }

  // If already a remote URL, update directly
  if (/^https?:\/\//i.test(imageUriOrUrl)) {
    const res = await api.patch("/users/profile/image", { imageUrl: imageUriOrUrl });
    return res.data?.data?.imageUrl || res.data?.data?.user?.image || imageUriOrUrl;
  }

  // Upload local file to backend which stores it in Cloudinary and updates DB
  try {
    const formData = await createSingleImageFormData(imageUriOrUrl, "image");
    const res = await api.patch("/users/profile/image", formData);

    return (
      res.data?.data?.imageUrl ||
      res.data?.data?.user?.image ||
      res.data?.data?.image ||
      ""
    );
  } catch (err) {
    // If multipart upload fails and base64 fallback is present, try base64
    if (base64Fallback) {
      const dataUri = base64Fallback.startsWith("data:")
        ? base64Fallback
        : `data:image/jpeg;base64,${base64Fallback}`;
      const res = await api.patch("/users/profile/image", { image: dataUri });
      return (
        res.data?.data?.imageUrl ||
        res.data?.data?.user?.image ||
        res.data?.data?.image ||
        ""
      );
    }
    throw err;
  }
};

export const updateInitialProfileImageAPI = async (
  imageUrlOrUri: string,
  base64Fallback?: string | null
) => {
  return await uploadProfileImageAPI(imageUrlOrUri, base64Fallback);
};

export const getSessionUser = async () => {
  const session = await authClient.getSession();
  return session.data?.user || null;
};
