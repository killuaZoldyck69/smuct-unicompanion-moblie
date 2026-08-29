export interface CampusEventItem {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  organizer: string;
  category?: string | null;
  registrationLink?: string | null;
  createdAt: string;
}

export interface CreateCampusEventInput {
  title: string;
  description: string;
  eventDate: string | Date;
  location: string;
  organizer: string;
  category?: string;
  registrationLink?: string;
}
