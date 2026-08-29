import api from "./api";

export interface FieldBookingSettings {
  id?: string;
  isBookingOpen?: boolean;
  closureReason?: string | null;
  openingTime?: string;
  closingTime?: string;
  openTime?: string;
  closeTime?: string;
  maxAdvanceDays?: number;
}

export interface FieldBookingItem {
  id: string;
  purpose: string;
  bookingDate?: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | string;
  adminFeedback?: string | null;
  createdAt: string;
  userId?: string;
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

export interface UpdateBookingStatusInput {
  status: "APPROVED" | "REJECTED" | "PENDING" | "CANCELLED";
  remarks?: string;
  adminFeedback?: string;
}

export interface UpdateFieldSettingsInput {
  isBookingOpen?: boolean;
  closureReason?: string;
  maxAdvanceDays?: number;
  openTime?: string;
  closeTime?: string;
}

export const getFieldSettings = async (): Promise<FieldBookingSettings> => {
  const res = await api.get("/field/settings");
  return res.data?.data;
};
export const getFieldSettingsAPI = getFieldSettings;

export const updateFieldSettings = async (
  data: UpdateFieldSettingsInput,
) => {
  const res = await api.patch("/field/settings", data);
  return res.data?.data;
};
export const updateFieldSettingsAPI = updateFieldSettings;

export const getMyFieldBookings = async (): Promise<FieldBookingItem[]> => {
  const res = await api.get("/field/my-bookings");
  return res.data?.data || [];
};
export const getMyFieldBookingsAPI = getMyFieldBookings;

export const getFieldSchedule = async (): Promise<FieldBookingItem[]> => {
  const res = await api.get("/field/schedule");
  return res.data?.data || [];
};
export const getFieldScheduleAPI = getFieldSchedule;

export const getAllFieldBookingsAdmin = async (): Promise<FieldBookingItem[]> => {
  const res = await api.get("/field/bookings");
  return res.data?.data || [];
};
export const getAllFieldBookingsAdminAPI = getAllFieldBookingsAdmin;

export const createFieldBooking = async (data: CreateFieldBookingInput) => {
  const res = await api.post("/field/book", data);
  return res.data?.data;
};
export const createFieldBookingAPI = createFieldBooking;

export const updateFieldBookingStatus = async (
  id: string,
  data: UpdateBookingStatusInput,
) => {
  const res = await api.patch(`/field/bookings/${id}/status`, data);
  return res.data?.data;
};
export const updateFieldBookingStatusAPI = updateFieldBookingStatus;
