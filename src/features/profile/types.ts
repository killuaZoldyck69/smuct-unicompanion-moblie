export interface StudentProfileData {
  id: string;
  name: string;
  email: string;
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
  skills: string[];
  linkedInUrl?: string | null;
  personalWebsiteUrl?: string | null;
  isCR?: boolean;
}

export interface TeacherProfileData {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  teacherId: string;
  designation: string;
  department: string;
  faculty: string;
  roomNumber?: string | null;
  researchInterests: string[];
  education: string[];
  officeHours: any[];
  linkedInUrl?: string | null;
  personalWebsiteUrl?: string | null;
  googleScholarUrl?: string | null;
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
}

export interface UpdateTeacherProfileInput {
  name?: string;
  phoneNumber?: string;
  bloodGroup?: string;
  roomNumber?: string;
  researchInterests?: string[];
  education?: string[];
  officeHours?: any[];
  linkedInUrl?: string;
  personalWebsiteUrl?: string;
  googleScholarUrl?: string;
}
