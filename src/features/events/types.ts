export interface CampusEventItem {
  id: string;
  title: string;
  category: string;
  description: string;
  eventDate: string;
  location: string;
  organizer: string;
  registrationLink?: string | null;
  createdAt: string;
}

export interface CreateCampusEventInput {
  title: string;
  category: string;
  description: string;
  eventDate: string | Date;
  location: string;
  organizer: string;
  registrationLink?: string;
}

export interface UpdateCampusEventInput {
  title?: string;
  description?: string;
  eventDate?: string | Date;
  location?: string;
  organizer?: string;
  category?: string;
  registrationLink?: string;
}
