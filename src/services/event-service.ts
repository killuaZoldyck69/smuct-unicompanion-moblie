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
  createdAt: string;
}

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

export const getEvents = async (): Promise<CampusEventItem[]> => {
  const res = await api.get("/events");
  return res.data?.data || [];
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

export const deleteEvent = async (id: string) => {
  const res = await api.delete(`/events/${id}`);
  return res.data?.data;
};
export const deleteEventAPI = deleteEvent;
export const deleteCampusEventAPI = deleteEvent;
