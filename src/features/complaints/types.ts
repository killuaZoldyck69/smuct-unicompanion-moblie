export type ComplaintStatus = "PENDING" | "ACCEPTED" | "RESOLVED" | "REJECTED";

export interface ComplaintUser {
  id: string;
  name: string;
  email?: string;
  image?: string | null;
  role?: string;
  studentProfile?: {
    studentId?: string;
    department?: string;
    batch?: string;
    program?: string;
  } | null;
  teacherProfile?: {
    teacherId?: string;
    department?: string;
    designation?: string;
  } | null;
}

export interface ComplaintItem {
  id: string;
  userId?: string | null;
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  isAnonymous: boolean;
  adminRemarks?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: ComplaintUser | null;
}

export interface ComplaintStats {
  all: number;
  pending: number;
  accepted: number;
  resolved: number;
  rejected: number;
}

export interface CreateComplaintInput {
  title: string;
  description: string;
  category: string;
  isAnonymous?: boolean;
}

export interface UpdateComplaintInput {
  title?: string;
  description?: string;
  category?: string;
  isAnonymous?: boolean;
}

export interface UpdateComplaintStatusInput {
  status: ComplaintStatus;
  adminRemarks?: string | null;
}

export interface GetMyComplaintsParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface AdminGetComplaintsParams {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}
