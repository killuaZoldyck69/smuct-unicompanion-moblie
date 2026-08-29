import api from "./api";

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
  createdAt: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademicCalendarInput {
  title: string;
  semester: string;
  academicYear?: number;
  isGlobal?: boolean;
  targetFaculties?: string[];
  targetDepartments?: string[];
  status?: CalendarStatus;
  events?: Partial<AcademicEventItem>[];
}

export interface UpdateAcademicCalendarInput {
  title?: string;
  semester?: string;
  academicYear?: number;
  isGlobal?: boolean;
  targetFaculties?: string[];
  targetDepartments?: string[];
  isActive?: boolean;
}

export interface CreateEventInput {
  title: string;
  description?: string | null;
  category?: EventCategory;
  startDate: string;
  endDate?: string | null;
  weekNumber?: number | null;
  isHoliday?: boolean;
  isAllDay?: boolean;
  remarks?: string | null;
}

export interface UpdateEventInput {
  title?: string;
  description?: string | null;
  category?: EventCategory;
  startDate?: string;
  endDate?: string | null;
  weekNumber?: number | null;
  isHoliday?: boolean;
  isAllDay?: boolean;
  remarks?: string | null;
}

export interface CsvValidationError {
  rowNumber: number;
  field: string;
  message: string;
  rawValue?: string;
}

export interface CsvValidationWarning {
  rowNumber: number;
  field: string;
  message: string;
}

export interface CsvDiffItem {
  status: "NEW" | "UPDATED" | "UNCHANGED";
  title: string;
  category: string;
  startDate: string;
  endDate?: string | null;
  details?: string;
}

export interface CsvValidationResult {
  isValid: boolean;
  totalRows: number;
  validRowsCount: number;
  errorCount: number;
  warningCount: number;
  errors: CsvValidationError[];
  warnings: CsvValidationWarning[];
  parsedEvents: Array<{
    rowNumber: number;
    title: string;
    description?: string | null;
    category: EventCategory;
    startDate: string;
    endDate?: string | null;
    weekNumber?: number | null;
    isHoliday: boolean;
    isAllDay: boolean;
    remarks?: string | null;
  }>;
  diffSummary?: {
    newCount: number;
    updatedCount: number;
    unchangedCount: number;
    diffs: CsvDiffItem[];
  };
}

// ==========================================
// STUDENT & COMMON API
// ==========================================

export const getAcademicCalendars = async (): Promise<AcademicCalendarItem[]> => {
  const res = await api.get("/calendars");
  return res.data?.data || [];
};
export const getAcademicCalendarsAPI = getAcademicCalendars;

export const getCurrentAcademicCalendar = async (): Promise<AcademicCalendarItem | null> => {
  const res = await api.get("/calendars/current");
  return res.data?.data || null;
};
export const getCurrentAcademicCalendarAPI = getCurrentAcademicCalendar;

export const getUpcomingAcademicEvents = async (): Promise<AcademicEventItem[]> => {
  const res = await api.get("/calendars/events/upcoming");
  return res.data?.data || [];
};
export const getUpcomingAcademicEventsAPI = getUpcomingAcademicEvents;

export const getCalendarById = async (id: string): Promise<AcademicCalendarItem> => {
  const res = await api.get(`/calendars/${id}`);
  return res.data?.data;
};
export const getCalendarByIdAPI = getCalendarById;

// ==========================================
// ADMIN API
// ==========================================

export const getAdminCalendars = async (
  status?: CalendarStatus,
): Promise<AcademicCalendarItem[]> => {
  const res = await api.get("/calendars/admin/all", {
    params: status ? { status } : undefined,
  });
  return res.data?.data || [];
};
export const getAdminCalendarsAPI = getAdminCalendars;

export const createAcademicCalendar = async (
  data: CreateAcademicCalendarInput,
): Promise<AcademicCalendarItem> => {
  const res = await api.post("/calendars", data);
  return res.data?.data;
};
export const createAcademicCalendarAPI = createAcademicCalendar;

export const updateAcademicCalendar = async (
  id: string,
  data: UpdateAcademicCalendarInput,
): Promise<AcademicCalendarItem> => {
  const res = await api.put(`/calendars/${id}`, data);
  return res.data?.data;
};
export const updateAcademicCalendarAPI = updateAcademicCalendar;

export const updateCalendarStatus = async (
  id: string,
  status: CalendarStatus,
): Promise<AcademicCalendarItem> => {
  const res = await api.patch(`/calendars/${id}/status`, { status });
  return res.data?.data;
};
export const updateCalendarStatusAPI = updateCalendarStatus;

export const duplicateAcademicCalendar = async (
  id: string,
): Promise<AcademicCalendarItem> => {
  const res = await api.post(`/calendars/${id}/duplicate`);
  return res.data?.data;
};
export const duplicateAcademicCalendarAPI = duplicateAcademicCalendar;

export const deleteAcademicCalendar = async (id: string) => {
  const res = await api.delete(`/calendars/${id}`);
  return res.data?.data;
};
export const deleteAcademicCalendarAPI = deleteAcademicCalendar;

// Event CRUD
export const createCalendarEvent = async (
  calendarId: string,
  data: CreateEventInput,
): Promise<AcademicEventItem> => {
  const res = await api.post(`/calendars/${calendarId}/events`, data);
  return res.data?.data;
};
export const createCalendarEventAPI = createCalendarEvent;

export const updateCalendarEvent = async (
  calendarId: string,
  eventId: string,
  data: UpdateEventInput,
): Promise<AcademicEventItem> => {
  const res = await api.put(`/calendars/${calendarId}/events/${eventId}`, data);
  return res.data?.data;
};
export const updateCalendarEventAPI = updateCalendarEvent;

export const deleteCalendarEvent = async (
  calendarId: string,
  eventId: string,
) => {
  const res = await api.delete(`/calendars/${calendarId}/events/${eventId}`);
  return res.data?.data;
};
export const deleteCalendarEventAPI = deleteCalendarEvent;

// CSV Operations
export const validateCalendarCsv = async (
  csvContent: string,
  calendarId?: string,
): Promise<CsvValidationResult> => {
  const res = await api.post("/calendars/validate-csv", {
    csvContent,
    calendarId,
  });
  return res.data?.data;
};
export const validateCalendarCsvAPI = validateCalendarCsv;

export const importCalendarCsv = async (
  calendarId: string,
  csvContent: string,
): Promise<{ calendar: AcademicCalendarItem; importedCount: number; warnings: CsvValidationWarning[] }> => {
  const res = await api.post(`/calendars/${calendarId}/import-csv`, {
    csvContent,
  });
  return res.data?.data;
};
export const importCalendarCsvAPI = importCalendarCsv;

export const exportCalendarCsv = async (calendarId: string): Promise<string> => {
  const res = await api.get(`/calendars/${calendarId}/export-csv`, {
    responseType: "text",
  });
  return res.data;
};
export const exportCalendarCsvAPI = exportCalendarCsv;

export const getCalendarTemplateCsv = async (): Promise<string> => {
  const res = await api.get("/calendars/template/csv", {
    responseType: "text",
  });
  return res.data;
};
export const getCalendarTemplateCsvAPI = getCalendarTemplateCsv;
