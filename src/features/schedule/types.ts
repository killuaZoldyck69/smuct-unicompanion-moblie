import type {
  AcademicCalendarItem,
  AcademicEventItem,
  CalendarStatus,
  EventCategory,
} from "@/services/calendar-service";

export type {
  AcademicCalendarItem,
  AcademicEventItem,
  CalendarStatus,
  EventCategory,
};

export interface BusRouteItem {
  id: string;
  routeName: string;
  departureTime: string;
  startPoint: string;
  endPoint: string;
  busNumber?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  stops: string[];
}

export interface TeacherDirectoryItem {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  phoneNumber?: string | null;
  teacherProfile?: {
    teacherId: string;
    designation: string;
    department: string;
    faculty: string;
    roomNumber?: string | null;
    researchInterests: string[];
    education: string[];
    officeHours: any[];
    linkedInUrl?: string | null;
    personalWebsiteUrl?: string | null;
    googleScholarUrl?: string | null;
  };
}

export interface CreateBusRouteInput {
  routeName: string;
  departureTime: string;
  startPoint: string;
  endPoint: string;
  busNumber?: string;
  driverName?: string;
  driverPhone?: string;
  stops?: string[];
}
