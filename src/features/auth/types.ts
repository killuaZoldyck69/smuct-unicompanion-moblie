export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  emailVerified?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: any;
}

export interface OnboardStudentInput {
  studentId: string;
  faculty: string;
  department: string;
  program: string;
  batch: string;
  currentSemester: number;
  section: string;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
}

export interface UpdateProfileImageInput {
  imageUrl: string;
}
