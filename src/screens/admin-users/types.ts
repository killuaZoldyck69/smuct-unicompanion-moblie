export type TabType = "STUDENT" | "TEACHER";

export type RoleStatusTag = "ALL" | "CR";

export type RoleAction = "MAKE_CR" | "REMOVE_ROLE";

export interface StudentProfile {
  studentId?: string | null;
  program?: string | null;
  department?: string | null;
  faculty?: string | null;
  batch?: string | number | null;
  currentSemester?: string | number | null;
  section?: string | null;
  isCR?: boolean | null;
  linkedInUrl?: string | null;
  personalWebsiteUrl?: string | null;
}

export interface AcademicQualification {
  degree: string;
  institution: string;
  year?: string | number;
  honors?: string;
}

export interface ConsultationSlot {
  days: string;
  time: string;
}

export interface TeacherProfile {
  teacherId?: string | null;
  designation?: string | null;
  administrativeRole?: string | null;
  department?: string | null;
  faculty?: string | null;
  officeRoom?: string | null;
  dayOff?: string | null;
  advisoryBatch?: string | number | null;
  expertiseFields?: string | string[] | null;
  consultationSlots?: ConsultationSlot[] | any | null;
  academicQualifications?: AcademicQualification[] | any | null;
  linkedInUrl?: string | null;
  personalWebsiteUrl?: string | null;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  image?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  isRestricted?: boolean;
  studentProfile?: StudentProfile | null;
  teacherProfile?: TeacherProfile | null;
}

export interface UpdateAdminTeacherProfilePayload {
  name?: string;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  designation?: string;
  administrativeRole?: string | null;
  department?: string;
  faculty?: string;
  officeRoom?: string | null;
  dayOff?: string | null;
  advisoryBatch?: number | null;
  academicQualifications?: any;
  expertiseFields?: string[];
  linkedInUrl?: string | null;
  personalWebsiteUrl?: string | null;
  consultationSlots?: Array<{ day: string; startTime: string; endTime: string }> | null;
}

export interface UpdateAdminStudentProfilePayload {
  name?: string;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  studentId?: string;
  faculty?: string;
  department?: string;
  program?: string;
  batch?: string;
  currentSemester?: number;
  section?: string;
  currentTerm?: string | null;
  isCR?: boolean;
  skills?: string[];
  linkedInUrl?: string | null;
  personalWebsiteUrl?: string | null;
}

