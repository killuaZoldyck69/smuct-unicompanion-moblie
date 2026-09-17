import { decode } from "base64-arraybuffer";
import { supabase } from "@/services/supabase";
import type { OnboardFormData, SanitizedOnboardData } from "./types";
import { MIN_SEMESTER, MAX_SEMESTER, MAX_SECTION_LENGTH } from "./constants";

export function sanitizeOnboardForm(form: OnboardFormData): SanitizedOnboardData {
  const studentId = (form.studentId || "").trim();
  const program = (form.program || "").trim();
  const faculty = (form.faculty || "").trim();
  const department = (form.department || "").trim();
  const batch = (form.batch || "").trim();
  const section = (form.section || "")
    .trim()
    .toUpperCase()
    .slice(0, MAX_SECTION_LENGTH);

  if (!studentId) {
    return { payload: {} as any, error: "Please enter your Student ID." };
  }
  if (!program) {
    return { payload: {} as any, error: "Please select your Academic Program." };
  }

  const semesterNum = parseInt(form.currentSemester, 10);
  if (
    isNaN(semesterNum) ||
    semesterNum < MIN_SEMESTER ||
    semesterNum > MAX_SEMESTER
  ) {
    return {
      payload: {} as any,
      error: `Semester must be a valid number between ${MIN_SEMESTER} and ${MAX_SEMESTER}.`,
    };
  }

  if (!section) {
    return { payload: {} as any, error: "Please enter your Class Section." };
  }
  if (!batch) {
    return { payload: {} as any, error: "Please enter your Batch." };
  }

  return {
    payload: {
      studentId,
      faculty,
      department,
      program,
      batch,
      currentSemester: semesterNum,
      section,
    },
    bloodGroup: form.bloodGroup || undefined,
  };
}

export async function uploadAvatarToSupabase(
  studentId: string,
  imageBase64: string,
  imageMimeType: string = "image/jpeg",
): Promise<string> {
  const safeId = studentId.replace(/[^a-zA-Z0-9_-]/g, "");
  const fileExt = imageMimeType.split("/").pop() || "jpg";
  const fileName = `${Date.now()}-${safeId}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, decode(imageBase64), {
      contentType: imageMimeType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Avatar upload failed: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}
