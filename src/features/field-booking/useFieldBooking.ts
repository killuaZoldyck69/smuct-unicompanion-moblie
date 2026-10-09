import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFieldSettingsAPI,
  updateFieldSettingsAPI,
  getMyFieldBookingsAPI,
  getFieldScheduleAPI,
  getAllFieldBookingsAdminAPI,
  createFieldBookingAPI,
  updateFieldBookingStatusAPI,
  deleteFieldBookingAPI,
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

export const useAllFieldBookingsAdmin = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["allFieldBookings"],
    queryFn: getAllFieldBookingsAdminAPI,
    enabled: options?.enabled,
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

export const useUpdateFieldBookingStatus = (fixedId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      variables:
        | UpdateBookingStatusInput
        | { id: string; data: UpdateBookingStatusInput },
    ) => {
      const targetId =
        (variables as { id?: string }).id || fixedId;
      if (!targetId) {
        throw new Error("Booking ID is required to update status");
      }
      const data =
        "data" in variables
          ? (variables as { data: UpdateBookingStatusInput }).data
          : (variables as UpdateBookingStatusInput);
      return updateFieldBookingStatusAPI(targetId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allFieldBookings"] });
      queryClient.invalidateQueries({ queryKey: ["myFieldBookings"] });
      queryClient.invalidateQueries({ queryKey: ["fieldSchedule"] });
    },
  });
};

export const useDeleteFieldBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFieldBookingAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myFieldBookings"] });
      queryClient.invalidateQueries({ queryKey: ["fieldSchedule"] });
      queryClient.invalidateQueries({ queryKey: ["allFieldBookings"] });
    },
  });
};
