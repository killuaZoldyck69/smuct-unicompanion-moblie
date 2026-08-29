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

// ==========================================
// BUS SCHEDULE HOOKS
// ==========================================

export const useBusSchedules = () => {
  return useQuery({
    queryKey: ["busSchedules"],
    queryFn: getBusSchedulesAPI,
  });
};

export const useCreateBusRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBusRouteInput) => createBusRouteAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["busSchedules"] });
    },
  });
};

export const useDeleteBusRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBusRouteAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["busSchedules"] });
    },
  });
};

// ==========================================
// STUDENT CALENDAR HOOKS
// ==========================================

export const useAcademicCalendars = () => {
  return useQuery({
    queryKey: ["academicCalendars"],
    queryFn: getAcademicCalendarsAPI,
  });
};

export const useCurrentAcademicCalendar = () => {
  return useQuery({
    queryKey: ["academicCalendar", "current"],
    queryFn: getCurrentAcademicCalendarAPI,
  });
};

export const useUpcomingAcademicEvents = () => {
  return useQuery({
    queryKey: ["academicEvents", "upcoming"],
    queryFn: getUpcomingAcademicEventsAPI,
  });
};

// ==========================================
// ADMIN CALENDAR HOOKS
// ==========================================

export const useAdminCalendars = (status?: CalendarStatus) => {
  return useQuery({
    queryKey: ["adminCalendars", status],
    queryFn: () => getAdminCalendarsAPI(status),
  });
};

export const useCalendarDetails = (id?: string) => {
  return useQuery({
    queryKey: ["academicCalendar", id],
    queryFn: () => (id ? getCalendarByIdAPI(id) : null),
    enabled: !!id,
  });
};

export const useCreateCalendar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAcademicCalendarInput) =>
      createAcademicCalendarAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCalendars"] });
      queryClient.invalidateQueries({ queryKey: ["academicCalendars"] });
    },
  });
};

export const useUpdateCalendar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAcademicCalendarInput }) =>
      updateAcademicCalendarAPI(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["adminCalendars"] });
      queryClient.invalidateQueries({ queryKey: ["academicCalendar", id] });
      queryClient.invalidateQueries({ queryKey: ["academicCalendars"] });
    },
  });
};

export const useUpdateCalendarStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CalendarStatus }) =>
      updateCalendarStatusAPI(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["adminCalendars"] });
      queryClient.invalidateQueries({ queryKey: ["academicCalendar", id] });
      queryClient.invalidateQueries({ queryKey: ["academicCalendars"] });
      queryClient.invalidateQueries({ queryKey: ["academicCalendar", "current"] });
    },
  });
};

export const useDuplicateCalendar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateAcademicCalendarAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCalendars"] });
      queryClient.invalidateQueries({ queryKey: ["academicCalendars"] });
    },
  });
};

export const useDeleteCalendar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAcademicCalendarAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCalendars"] });
      queryClient.invalidateQueries({ queryKey: ["academicCalendars"] });
      queryClient.invalidateQueries({ queryKey: ["academicCalendar", "current"] });
    },
  });
};

export const useCreateCalendarEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ calendarId, data }: { calendarId: string; data: CreateEventInput }) =>
      createCalendarEventAPI(calendarId, data),
    onSuccess: (_, { calendarId }) => {
      queryClient.invalidateQueries({ queryKey: ["academicCalendar", calendarId] });
      queryClient.invalidateQueries({ queryKey: ["adminCalendars"] });
      queryClient.invalidateQueries({ queryKey: ["academicCalendars"] });
    },
  });
};

export const useUpdateCalendarEvent = () => {
  const queryClient = useQueryClient();
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
      queryClient.invalidateQueries({ queryKey: ["academicCalendar", calendarId] });
      queryClient.invalidateQueries({ queryKey: ["adminCalendars"] });
      queryClient.invalidateQueries({ queryKey: ["academicCalendars"] });
    },
  });
};

export const useDeleteCalendarEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ calendarId, eventId }: { calendarId: string; eventId: string }) =>
      deleteCalendarEventAPI(calendarId, eventId),
    onSuccess: (_, { calendarId }) => {
      queryClient.invalidateQueries({ queryKey: ["academicCalendar", calendarId] });
      queryClient.invalidateQueries({ queryKey: ["adminCalendars"] });
      queryClient.invalidateQueries({ queryKey: ["academicCalendars"] });
    },
  });
};

export const useImportCalendarCsv = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ calendarId, csvContent }: { calendarId: string; csvContent: string }) =>
      importCalendarCsvAPI(calendarId, csvContent),
    onSuccess: (_, { calendarId }) => {
      queryClient.invalidateQueries({ queryKey: ["academicCalendar", calendarId] });
      queryClient.invalidateQueries({ queryKey: ["adminCalendars"] });
      queryClient.invalidateQueries({ queryKey: ["academicCalendars"] });
    },
  });
};

// ==========================================
// TEACHER DIRECTORY HOOKS
// ==========================================

export const useTeachersDirectory = () => {
  return useQuery({
    queryKey: ["teachersDirectory"],
    queryFn: getTeachersDirectoryAPI,
  });
};
