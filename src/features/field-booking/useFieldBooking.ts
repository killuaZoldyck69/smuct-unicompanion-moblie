import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFieldSettingsAPI,
  updateFieldSettingsAPI,
  getMyFieldBookingsAPI,
  getFieldScheduleAPI,
  getAllFieldBookingsAdminAPI,
  createFieldBookingAPI,
  updateFieldBookingStatusAPI,
} from "@/services/field-service";
import {
  CreateFieldBookingInput,
  UpdateBookingStatusInput,
  UpdateFieldSettingsInput,
} from "./types";

export const useFieldSettings = () => {
  return useQuery({
    queryKey: ["fieldSettings"],
    queryFn: getFieldSettingsAPI,
  });
};

export const useMyFieldBookings = () => {
  return useQuery({
    queryKey: ["myFieldBookings"],
    queryFn: getMyFieldBookingsAPI,
  });
};

export const useFieldSchedule = () => {
  return useQuery({
    queryKey: ["fieldSchedule"],
    queryFn: getFieldScheduleAPI,
  });
};

export const useAllFieldBookingsAdmin = () => {
  return useQuery({
    queryKey: ["allFieldBookings"],
    queryFn: getAllFieldBookingsAdminAPI,
  });
};

export const useCreateFieldBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFieldBookingInput) => createFieldBookingAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myFieldBookings"] });
      queryClient.invalidateQueries({ queryKey: ["fieldSchedule"] });
      queryClient.invalidateQueries({ queryKey: ["allFieldBookings"] });
    },
  });
};

export const useUpdateFieldSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateFieldSettingsInput) => updateFieldSettingsAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fieldSettings"] });
    },
  });
};

export const useUpdateFieldBookingStatus = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBookingStatusInput) =>
      updateFieldBookingStatusAPI(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allFieldBookings"] });
      queryClient.invalidateQueries({ queryKey: ["myFieldBookings"] });
      queryClient.invalidateQueries({ queryKey: ["fieldSchedule"] });
    },
  });
};
