export type HubRole = "TEACHER" | "CR" | "TA" | "STUDENT";

export interface StudentProfileData {
  studentId?: string | null;
  department?: string | null;
  batch?: string | null;
  currentSemester?: number | null;
  section?: string | null;
  program?: string | null;
}

export interface TeacherProfileData {
  teacherId?: string | null;
  department?: string | null;
  designation?: string | null;
  faculty?: string | null;
  officeRoom?: string | null;
  consultationHours?: string | null;
}

export interface MemberUserData {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  phoneNumber?: string | null;
  role?: string;
  studentProfile?: StudentProfileData | null;
  teacherProfile?: TeacherProfileData | null;
}

export interface CourseHubMember {
  id: string;
  hubId?: string;
  userId?: string;
  role: HubRole;
  joinedAt?: string;
  user: MemberUserData;
}

export interface MemberCounts {
  total: number;
  teachers: number;
  students: number;
}
