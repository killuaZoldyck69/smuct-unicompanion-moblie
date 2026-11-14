import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBusSchedulesAPI,
  createBusRouteAPI,
  deleteBusRouteAPI,
  getAcademicCalendarsAPI,
  getCurrentAcademicCalendarAPI,
  getUpcomingAcademicEventsAPI,
  getAdminCalendarsAPI,
  getCalendarByIdAPI,
  createAcademicCalendarAPI,
  updateAcademicCalendarAPI,
  updateCalendarStatusAPI,
  duplicateAcademicCalendarAPI,
  deleteAcademicCalendarAPI,
  createCalendarEventAPI,
  updateCalendarEventAPI,
  deleteCalendarEventAPI,
  importCalendarCsvAPI,
  getTeachersDirectoryAPI,
  CreateAcademicCalendarInput,
  UpdateAcademicCalendarInput,
  CreateEventInput,
  UpdateEventInput,
  CalendarStatus,
  AcademicCalendarItem,
  AcademicCalendarListResponse,
  AcademicEventItem,
} from "@/services/schedule-service";
import { CreateBusRouteInput } from "./types";

const calendarKeys = {
  all: ["academicCalendars"] as const,
  current: ["academicCalendar", "current"] as const,
  detail: (id: string) => ["academicCalendar", id] as const,
  admin: (status?: CalendarStatus, page = 1, limit = 25) =>
    ["adminCalendars", status ?? "all", page, limit] as const,
  upcoming: ["academicEvents", "upcoming"] as const,
};

const CALENDAR_CACHE = {
  staleTime: 1000 * 60 * 5,
  gcTime: 1000 * 60 * 30,
} as const;

const busKeys = {
  all: ["busSchedules"] as const,
};

// Bus Schedule

export const useBusSchedules = () =>
  useQuery({ queryKey: busKeys.all, queryFn: getBusSchedulesAPI });

export const useCreateBusRoute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBusRouteInput) => createBusRouteAPI(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: busKeys.all }),
  });
};

export const useDeleteBusRoute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBusRouteAPI(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: busKeys.all }),
  });
};

// Student Calendar

export const useAcademicCalendars = (enabled = true) =>
  useQuery<AcademicCalendarItem[], Error>({
    queryKey: calendarKeys.all,
    queryFn: () => getAcademicCalendarsAPI(),
    enabled,
    ...CALENDAR_CACHE,
  });

export const useCurrentAcademicCalendar = (enabled = true) =>
  useQuery<AcademicCalendarItem | null, Error>({
    queryKey: calendarKeys.current,
    queryFn: () => getCurrentAcademicCalendarAPI(),
    enabled,
    ...CALENDAR_CACHE,
  });

export const useUpcomingAcademicEvents = () =>
  useQuery<AcademicEventItem[], Error>({
    queryKey: calendarKeys.upcoming,
    queryFn: () => getUpcomingAcademicEventsAPI(),
    ...CALENDAR_CACHE,
  });

const invalidateCalendarQueries = (qc: ReturnType<typeof useQueryClient>, calendarId?: string) => {
  qc.invalidateQueries({ queryKey: ["academicCalendars"] });
  qc.invalidateQueries({ queryKey: ["academicCalendar"] });
  qc.invalidateQueries({ queryKey: ["adminCalendars"] });
  if (calendarId) {
    qc.invalidateQueries({ queryKey: calendarKeys.detail(calendarId) });
  }
};

// Admin Calendar

export const useAdminCalendars = (
  status?: CalendarStatus,
  page = 1,
  limit = 25,
  enabled = true,
) =>
  useQuery<AcademicCalendarListResponse, Error>({
    queryKey: calendarKeys.admin(status, page, limit),
    queryFn: () => getAdminCalendarsAPI(status, page, limit),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

export const useCalendarDetails = (id?: string) =>
  useQuery({
    queryKey: calendarKeys.detail(id ?? ""),
    queryFn: () => (id ? getCalendarByIdAPI(id) : null),
    enabled: !!id,
  });

export const useCreateCalendar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAcademicCalendarInput) => createAcademicCalendarAPI(data),
    onSuccess: () => {
      invalidateCalendarQueries(qc);
    },
  });
};

export const useUpdateCalendar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAcademicCalendarInput }) =>
      updateAcademicCalendarAPI(id, data),
    onSuccess: (_, { id }) => {
      invalidateCalendarQueries(qc, id);
    },
  });
};

export const useUpdateCalendarStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CalendarStatus }) =>
      updateCalendarStatusAPI(id, status),
    onSuccess: (_, { id }) => {
      invalidateCalendarQueries(qc, id);
      qc.invalidateQueries({ queryKey: calendarKeys.current });
    },
  });
};

export const useDuplicateCalendar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateAcademicCalendarAPI(id),
    onSuccess: () => {
      invalidateCalendarQueries(qc);
    },
  });
};

export const useDeleteCalendar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAcademicCalendarAPI(id),
    onSuccess: () => {
      invalidateCalendarQueries(qc);
      qc.invalidateQueries({ queryKey: calendarKeys.current });
    },
  });
};

export const useCreateCalendarEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ calendarId, data }: { calendarId: string; data: CreateEventInput }) =>
      createCalendarEventAPI(calendarId, data),
    onSuccess: (_, { calendarId }) => {
      invalidateCalendarQueries(qc, calendarId);
    },
  });
};

export const useUpdateCalendarEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      calendarId,
      eventId,
      data,
    }: {
      calendarId: string;
      eventId: string;
      data: UpdateEventInput;
    }) => updateCalendarEventAPI(calendarId, eventId, data),
    onSuccess: (_, { calendarId }) => {
      invalidateCalendarQueries(qc, calendarId);
    },
  });
};

export const useDeleteCalendarEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ calendarId, eventId }: { calendarId: string; eventId: string }) =>
      deleteCalendarEventAPI(calendarId, eventId),
    onSuccess: (_, { calendarId }) => {
      invalidateCalendarQueries(qc, calendarId);
    },
  });
};

export const useImportCalendarCsv = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ calendarId, csvContent }: { calendarId: string; csvContent: string }) =>
      importCalendarCsvAPI(calendarId, csvContent),
    onSuccess: (_, { calendarId }) => {
      invalidateCalendarQueries(qc, calendarId);
    },
  });
};

// Teacher Directory

export const useTeachersDirectory = () =>
  useQuery({ queryKey: ["teachersDirectory"], queryFn: getTeachersDirectoryAPI });
