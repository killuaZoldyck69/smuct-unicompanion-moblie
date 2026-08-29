export interface FieldBookingSettings {
  id: string;
  isBookingOpen: boolean;
  maxAdvanceDays: number;
  openTime: string;
  closeTime: string;
  closureReason?: string | null;
}

export interface FieldBookingItem {
  id: string;
  purpose: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  adminFeedback?: string | null;
  createdAt: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string | null;
  };
}

export interface CreateFieldBookingInput {
  purpose: string;
  startTime: string;
  endTime: string;
}

export interface UpdateFieldSettingsInput {
  isBookingOpen?: boolean;
  maxAdvanceDays?: number;
  openTime?: string;
  closeTime?: string;
  closureReason?: string;
}

export interface UpdateBookingStatusInput {
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  adminFeedback?: string;
}
