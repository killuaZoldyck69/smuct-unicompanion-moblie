import api from "./api";
import { authClient } from "./auth-client";
import { createSingleImageFormData } from "./cloudinary-service";
import type { OnboardStudentInput } from "@/features/auth/types";

export type { OnboardStudentInput };

export const onboardStudentAPI = async (data: OnboardStudentInput) => {
  const res = await api.post("/students/onboard", data);
  return res.data;
};

/**
 * Uploads a compressed local avatar URI via multipart FormData (or updates an existing HTTPS URL).
 * Base64 JSON fallback is intentionally omitted per SHARED_CONTRACT.md §1 & §8 (Mobile-9).
 */
export const uploadProfileImageAPI = async (imageUriOrUrl: string) => {
  if (
    !imageUriOrUrl ||
    typeof imageUriOrUrl !== "string" ||
    !imageUriOrUrl.trim()
  ) {
    throw new Error("Invalid image provided.");
  }

  if (/^https?:\/\//i.test(imageUriOrUrl)) {
    const res = await api.patch("/students/profile/image", {
      imageUrl: imageUriOrUrl,
    });
    return (
      res.data?.data?.imageUrl ||
      res.data?.data?.user?.image ||
      res.data?.data?.image ||
      imageUriOrUrl
    );
  }

  const formData = await createSingleImageFormData(imageUriOrUrl, "image");
  const res = await api.patch("/students/profile/image", formData);

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
