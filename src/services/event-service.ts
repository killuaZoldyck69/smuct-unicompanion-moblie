import api from "./api";

export interface CampusEventItem {
  id: string;
  title: string;
  description: string;
  date?: string;
  eventDate?: string;
  location: string;
  imageUrl?: string | null;
  organizer?: string;
  category?: string | null;
  registrationLink?: string | null;
  interestedCount?: number;
  isInterested?: boolean;
  createdAt: string;
}

export const toggleEventInterestedAPI = async (
  id: string
): Promise<{ isInterested: boolean; interestedCount: number }> => {
  const res = await api.post(`/events/${id}/interested`);
  return res.data?.data;
};

export const getEventInterestedAPI = async (
  id: string
): Promise<{ isInterested: boolean; interestedCount: number }> => {
  const res = await api.get(`/events/${id}/interested`);
  return res.data?.data;
};

export interface CreateCampusEventInput {
  title: string;
  description: string;
  date?: string;
  eventDate?: string | Date;
  location: string;
  imageUrl?: string;
  organizer?: string;
  category?: string;
  registrationLink?: string;
}

export interface EventTabCounts {
  all: number;
  upcoming: number;
  today: number;
  past: number;
}

export interface EventsPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
}

export interface PaginatedEventsResponse {
  items: CampusEventItem[];
  pagination: EventsPagination;
  counts: EventTabCounts;
  nextUpcomingEvent: CampusEventItem | null;
}

export interface GetEventsQueryParams {
  page?: number;
  limit?: number;
  tab?: "all" | "upcoming" | "today" | "past";
  search?: string;
  sortBy?: "eventDate" | "createdAt" | "title";
  sortOrder?: "asc" | "desc";
}

export const getCampusEventsPaginatedAPI = async (
  params?: GetEventsQueryParams
): Promise<PaginatedEventsResponse> => {
  const res = await api.get("/events", { params });
  return res.data?.data;
};

export const getEvents = async (
  params?: GetEventsQueryParams
): Promise<CampusEventItem[]> => {
  const res = await api.get("/events", { params });
  const data = res.data?.data;
  if (data && Array.isArray(data.items)) {
    return data.items;
  }
  return Array.isArray(data) ? data : [];
};
export const getEventsAPI = getEvents;
export const getCampusEventsAPI = getEvents;

export const getEventById = async (id: string): Promise<CampusEventItem> => {
  const res = await api.get(`/events/${id}`);
  return res.data?.data;
};
export const getEventByIdAPI = getEventById;
export const getCampusEventByIdAPI = getEventById;

export const createEvent = async (data: CreateCampusEventInput) => {
  const res = await api.post("/events", data);
  return res.data?.data;
};
export const createEventAPI = createEvent;
export const createCampusEventAPI = createEvent;

export interface UpdateCampusEventInput {
  title?: string;
  description?: string;
  date?: string;
  eventDate?: string | Date;
  location?: string;
  imageUrl?: string;
  organizer?: string;
  category?: string;
  registrationLink?: string;
}

export const updateEvent = async (id: string, data: UpdateCampusEventInput) => {
  const res = await api.patch(`/events/${id}`, data);
  return res.data?.data;
};
export const updateEventAPI = updateEvent;
export const updateCampusEventAPI = updateEvent;

export const deleteEvent = async (id: string) => {
  const res = await api.delete(`/events/${id}`);
  return res.data?.data;
};
export const deleteEventAPI = deleteEvent;
export const deleteCampusEventAPI = deleteEvent;
