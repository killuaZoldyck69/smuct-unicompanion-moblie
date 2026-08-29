export interface ComplaintItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "PENDING" | "RESOLVED" | "REJECTED";
  adminFeedback?: string | null;
  createdAt: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    studentProfile?: any;
    teacherProfile?: any;
  };
}

export interface CreateComplaintInput {
  title: string;
  description: string;
  category: string;
}

export interface UpdateComplaintStatusInput {
  status: "PENDING" | "RESOLVED" | "REJECTED";
  adminFeedback?: string;
}
