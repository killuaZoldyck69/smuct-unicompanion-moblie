export interface ComplaintItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: "PENDING" | "RESOLVED" | "REJECTED";
  isAnonymous: boolean;
  adminRemarks?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export interface ComplaintStats {
  all: number;
  pending: number;
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
  status: "PENDING" | "RESOLVED" | "REJECTED";
  adminRemarks?: string | null;
}

export interface GetMyComplaintsParams {
  status?: string;
  page?: number;
  limit?: number;
}
