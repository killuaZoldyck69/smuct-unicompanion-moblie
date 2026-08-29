export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  image?: string | null;
  phoneNumber?: string | null;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalHubs: number;
  totalComplaints: number;
  totalEvents: number;
}
