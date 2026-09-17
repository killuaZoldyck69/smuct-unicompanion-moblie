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
} from "@/services/schedule-service";
import { CreateBusRouteInput } from "./types";

const calendarKeys = {
  all: ["academicCalendars"] as const,
  current: ["academicCalendar", "current"] as const,
  detail: (id: string) => ["academicCalendar", id] as const,
  admin: (status?: CalendarStatus) => ["adminCalendars", status] as const,
  upcoming: ["academicEvents", "upcoming"] as const,
};

const CALENDAR_CACHE = {
  staleTime: 1000 * 60 * 60 * 24,
  gcTime: 1000 * 60 * 60 * 48,
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

export const useAcademicCalendars = () =>
  useQuery({ queryKey: calendarKeys.all, queryFn: getAcademicCalendarsAPI, ...CALENDAR_CACHE });

export const useCurrentAcademicCalendar = () =>
  useQuery({ queryKey: calendarKeys.current, queryFn: getCurrentAcademicCalendarAPI, ...CALENDAR_CACHE });

export const useUpcomingAcademicEvents = () =>
  useQuery({ queryKey: calendarKeys.upcoming, queryFn: getUpcomingAcademicEventsAPI, ...CALENDAR_CACHE });

// Admin Calendar

export const useAdminCalendars = (status?: CalendarStatus) =>
  useQuery({
    queryKey: calendarKeys.admin(status),
    queryFn: () => getAdminCalendarsAPI(status),
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
      qc.invalidateQueries({ queryKey: calendarKeys.admin() });
      qc.invalidateQueries({ queryKey: calendarKeys.all });
    },
  });
};

export const useUpdateCalendar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAcademicCalendarInput }) =>
      updateAcademicCalendarAPI(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: calendarKeys.admin() });
      qc.invalidateQueries({ queryKey: calendarKeys.detail(id) });
      qc.invalidateQueries({ queryKey: calendarKeys.all });
    },
  });
};

export const useUpdateCalendarStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CalendarStatus }) =>
      updateCalendarStatusAPI(id, status),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: calendarKeys.admin() });
      qc.invalidateQueries({ queryKey: calendarKeys.detail(id) });
      qc.invalidateQueries({ queryKey: calendarKeys.all });
      qc.invalidateQueries({ queryKey: calendarKeys.current });
    },
  });
};

export const useDuplicateCalendar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateAcademicCalendarAPI(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: calendarKeys.admin() });
      qc.invalidateQueries({ queryKey: calendarKeys.all });
    },
  });
};

export const useDeleteCalendar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAcademicCalendarAPI(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: calendarKeys.admin() });
      qc.invalidateQueries({ queryKey: calendarKeys.all });
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
      qc.invalidateQueries({ queryKey: calendarKeys.detail(calendarId) });
      qc.invalidateQueries({ queryKey: calendarKeys.admin() });
      qc.invalidateQueries({ queryKey: calendarKeys.all });
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
      qc.invalidateQueries({ queryKey: calendarKeys.detail(calendarId) });
      qc.invalidateQueries({ queryKey: calendarKeys.admin() });
      qc.invalidateQueries({ queryKey: calendarKeys.all });
    },
  });
};

export const useDeleteCalendarEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ calendarId, eventId }: { calendarId: string; eventId: string }) =>
      deleteCalendarEventAPI(calendarId, eventId),
    onSuccess: (_, { calendarId }) => {
      qc.invalidateQueries({ queryKey: calendarKeys.detail(calendarId) });
      qc.invalidateQueries({ queryKey: calendarKeys.admin() });
      qc.invalidateQueries({ queryKey: calendarKeys.all });
    },
  });
};

export const useImportCalendarCsv = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ calendarId, csvContent }: { calendarId: string; csvContent: string }) =>
      importCalendarCsvAPI(calendarId, csvContent),
    onSuccess: (_, { calendarId }) => {
      qc.invalidateQueries({ queryKey: calendarKeys.detail(calendarId) });
      qc.invalidateQueries({ queryKey: calendarKeys.admin() });
      qc.invalidateQueries({ queryKey: calendarKeys.all });
    },
  });
};

// Teacher Directory

export const useTeachersDirectory = () =>
  useQuery({ queryKey: ["teachersDirectory"], queryFn: getTeachersDirectoryAPI });
