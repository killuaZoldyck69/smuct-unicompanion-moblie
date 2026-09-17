import type { AcademicProgram } from "@/data/programs";
import type { OnboardStudentInput } from "@/services/auth-service";

export interface BloodGroupOption {
  label: string;
  value: string;
}

export interface OnboardFormData {
  studentId: string;
  faculty: string;
  department: string;
  program: string;
  batch: string;
  currentSemester: string;
  section: string;
  bloodGroup: string;
  imageUri: string | null;
  imageBase64: string | null;
  imageMimeType: string;
}

export interface SanitizedOnboardData {
  payload: OnboardStudentInput;
  bloodGroup?: string;
  error?: string;
}

export type { AcademicProgram, OnboardStudentInput };
