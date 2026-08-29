export interface BloodAuthor {
  id: string;
  name: string;
  image?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  studentProfile?: any;
  teacherProfile?: any;
}

export interface BloodResponseItem {
  id: string;
  message?: string | null;
  createdAt: string;
  responder: BloodAuthor;
}

export interface BloodPostItem {
  id: string;
  patientName: string;
  patientCondition: string;
  bloodGroup: string;
  location: string;
  urgency: string;
  contactPhone: string;
  isFulfilled: boolean;
  createdAt: string;
  authorId: string;
  author: BloodAuthor;
  _count?: {
    responses: number;
  };
  responses?: BloodResponseItem[];
}

export interface CreateBloodPostInput {
  patientName: string;
  patientCondition: string;
  bloodGroup: string;
  location: string;
  urgency: string;
  contactPhone: string;
}

export interface RespondBloodPostInput {
  message?: string;
}
