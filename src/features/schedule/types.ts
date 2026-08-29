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

export type EventCategory =
  | "CLASS"
  | "REGISTRATION"
  | "DEADLINE"
  | "EXAM"
  | "HOLIDAY"
  | "MAKEUP_CLASS"
  | "RESULT"
  | "ACADEMIC"
  | "OTHER";

export type CalendarStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface AcademicEventItem {
  id: string;
  calendarId: string;
  title: string;
  description?: string | null;
  category: EventCategory;
  startDate: string;
  endDate?: string | null;
  weekNumber?: number | null;
  isHoliday: boolean;
  isAllDay: boolean;
  remarks?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicCalendarItem {
  id: string;
  title: string;
  semester: string;
  academicYear: number;
  status: CalendarStatus;
  isActive: boolean;
  isGlobal: boolean;
  targetFaculties: string[];
  targetDepartments: string[];
  publishedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  events?: AcademicEventItem[];
  _count?: {
    events: number;
  };
  createdAt?: string;
  updatedAt?: string;
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
