import { useState, useMemo, useCallback } from "react";
import Toast from "react-native-toast-message";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useCreateFieldBooking } from "@/features/field-booking/useFieldBooking";
import { NativePickerMode } from "../types";
import { toISODateString, calculateDurationString } from "../utils";

interface UseFieldBookingFormOptions {
  onSuccess?: () => void;
}

export function useFieldBookingForm(
  optionsOrCallback?: UseFieldBookingFormOptions | (() => void)
) {
  const onSuccessCallback =
    typeof optionsOrCallback === "function"
      ? optionsOrCallback
      : optionsOrCallback?.onSuccess;

  const [purpose, setPurpose] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // default to tomorrow
    return d;
  });
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("16:30");
  const [nativePickerMode, setNativePickerMode] = useState<NativePickerMode>(null);

  const createBookingMutation = useCreateFieldBooking();

  const selectedDateStr = useMemo(() => toISODateString(selectedDate), [selectedDate]);

  const durationInfo = useMemo(() => {
    return calculateDurationString(selectedDateStr, startTime, endTime);
  }, [selectedDateStr, startTime, endTime]);

  const applyDateOffset = useCallback((days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setSelectedDate(d);
  }, []);

  const applyUpcomingWeekend = useCallback((dayOfWeek: number) => {
    const d = new Date();
    const current = d.getDay();
    let diff = dayOfWeek - current;
    if (diff <= 0) diff += 7;
    d.setDate(d.getDate() + diff);
    setSelectedDate(d);
  }, []);

  const applyTimeSlotPreset = useCallback((start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
  }, []);

  const handleNativePickerChange = useCallback(
    (_event: DateTimePickerEvent, date?: Date) => {
      const mode = nativePickerMode;
      setNativePickerMode(null);
      if (!date) return;

      if (mode === "date") {
        setSelectedDate(date);
      } else if (mode === "start") {
        const h = String(date.getHours()).padStart(2, "0");
        const m = String(date.getMinutes()).padStart(2, "0");
        setStartTime(`${h}:${m}`);
      } else if (mode === "end") {
        const h = String(date.getHours()).padStart(2, "0");
        const m = String(date.getMinutes()).padStart(2, "0");
        setEndTime(`${h}:${m}`);
      }
    },
    [nativePickerMode]
  );

  const resetForm = useCallback(() => {
    setPurpose("");
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
    setStartTime("14:00");
    setEndTime("16:30");
  }, []);

  const handleSubmit = useCallback(() => {
    const cleanPurpose = purpose.trim().slice(0, 80);
    if (!cleanPurpose) {
      Toast.show({
        type: "error",
        text1: "Missing Purpose",
        text2: "Please specify the purpose or match name.",
      });
      return;
    }

    if (!durationInfo.isValid) {
      Toast.show({
        type: "error",
        text1: "Invalid Time Slot",
        text2: durationInfo.durationText || "End time must be after start time.",
      });
      return;
    }

    const [sy, sm, sd] = selectedDateStr.split("-").map(Number);
    const [sh, smin] = startTime.split(":").map(Number);
    const [eh, emin] = endTime.split(":").map(Number);

    const start = new Date(sy, sm - 1, sd, sh, smin, 0);
    const end = new Date(sy, sm - 1, sd, eh, emin, 0);

    createBookingMutation.mutate(
      {
        purpose: cleanPurpose,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      },
      {
        onSuccess: () => {
          Toast.show({
            type: "success",
            text1: "Booking Request Submitted",
            text2: "Campus administration will review your slot.",
          });
          resetForm();
          onSuccessCallback?.();
        },
        onError: (err: any) => {
          const errorMessage =
            err.response?.data?.message ||
            err.response?.data?.error ||
            "This time slot is already reserved or conflicts with another event.";

          Toast.show({
            type: "error",
            text1: "Booking Failed",
            text2: errorMessage,
          });
        },
      }
    );
  }, [
    purpose,
    durationInfo,
    selectedDateStr,
    startTime,
    endTime,
    createBookingMutation,
    resetForm,
    onSuccessCallback,
  ]);

  return {
    purpose,
    setPurpose,
    selectedDate,
    setSelectedDate,
    selectedDateStr,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    nativePickerMode,
    setNativePickerMode,
    durationInfo,
    isSubmitting: createBookingMutation.isPending,
    isPending: createBookingMutation.isPending,
    applyDateOffset,
    applyUpcomingWeekend,
    applyTimeSlotPreset,
    selectPreset: applyTimeSlotPreset,
    handleNativePickerChange,
    resetForm,
    handleSubmit,
  };
}
