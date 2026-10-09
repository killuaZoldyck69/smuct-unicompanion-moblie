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

export interface FieldBookingUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
  phoneNumber?: string | null;
  studentProfile?: {
    studentId?: string;
    department?: string;
    program?: string;
    batch?: string;
    currentSemester?: number;
    section?: string;
  } | null;
  teacherProfile?: {
    teacherId?: string;
    designation?: string;
    department?: string;
    faculty?: string;
    officeRoom?: string | null;
  } | null;
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
  user?: FieldBookingUser;
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
  closedNotice?: string | null;
  closureReason?: string | null;
  maxAdvanceDays?: number;
  openTime?: string;
  closeTime?: string;
}

export interface BookingCountsSummary {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  counts?: BookingCountsSummary;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface GetBookingsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetScheduleQueryParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const getFieldSettings = async (): Promise<FieldBookingSettings> => {
  const res = await api.get("/field/settings");
  return res.data?.data;
};
export const getFieldSettingsAPI = getFieldSettings;

export const updateFieldSettings = async (
  data: UpdateFieldSettingsInput,
) => {
  const payload = {
    ...data,
    closedNotice:
      data.closedNotice !== undefined ? data.closedNotice : data.closureReason,
  };
  const res = await api.patch("/field/settings", payload);
  return res.data?.data;
};
export const updateFieldSettingsAPI = updateFieldSettings;

export const getMyFieldBookings = async (
  params?: GetBookingsQueryParams,
): Promise<PaginatedResponse<FieldBookingItem>> => {
  const res = await api.get("/field/my-bookings", { params });
  const data = Array.isArray(res.data?.data) ? res.data.data : [];
  const meta: PaginationMeta = res.data?.meta || {
    page: params?.page || 1,
    limit: params?.limit || data.length,
    total: data.length,
    totalPages: 1,
    hasMore: false,
  };
  return { data, meta };
};
export const getMyFieldBookingsAPI = getMyFieldBookings;

export const getFieldSchedule = async (
  params?: GetScheduleQueryParams,
): Promise<FieldBookingItem[]> => {
  const res = await api.get("/field/schedule", { params });
  return Array.isArray(res.data?.data) ? res.data.data : [];
};
export const getFieldScheduleAPI = getFieldSchedule;

export const getAllFieldBookingsAdmin = async (
  params?: GetBookingsQueryParams,
): Promise<PaginatedResponse<FieldBookingItem>> => {
  const res = await api.get("/field/bookings", { params });
  const data = Array.isArray(res.data?.data) ? res.data.data : [];
  const meta: PaginationMeta = res.data?.meta || {
    page: params?.page || 1,
    limit: params?.limit || data.length,
    total: data.length,
    totalPages: 1,
    hasMore: false,
  };
  return { data, meta };
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

export const deleteFieldBooking = async (id: string) => {
  const res = await api.delete(`/field/bookings/${id}`);
  return res.data;
};
export const deleteFieldBookingAPI = deleteFieldBooking;
