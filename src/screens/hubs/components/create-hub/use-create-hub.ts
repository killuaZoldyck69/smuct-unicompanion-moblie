import { useState, useCallback, useEffect, useMemo } from "react";
import Toast from "react-native-toast-message";
import {
  CreateHubFormState,
  ScheduleBlock,
  ActiveTimePickerState,
  CreateHubPayload,
} from "./types";
import {
  INITIAL_FORM_STATE,
  createDefaultScheduleBlock,
} from "./constants";
import {
  formatCourseName,
  formatCourseCode,
  formatCredit,
  formatBatch,
  formatSection,
  formatTermOffer,
  formatSemester,
  formatTimeDisplay,
  validateHubForm,
} from "./utils";

interface UseCreateHubProps {
  isVisible: boolean;
  currentUser: any;
  onSubmit: (payload: CreateHubPayload) => void;
}

export function useCreateHub({
  isVisible,
  currentUser,
  onSubmit,
}: UseCreateHubProps) {
  const isTeacher = currentUser?.role === "TEACHER";
  const isCR = currentUser?.studentProfile?.isCR === true;

  const [form, setForm] = useState<CreateHubFormState>(INITIAL_FORM_STATE);

  const [schedules, setSchedules] = useState<ScheduleBlock[]>([
    createDefaultScheduleBlock("Sunday"),
  ]);

  const [activePicker, setActivePicker] =
    useState<ActiveTimePickerState | null>(null);
  const [activeDayPickerId, setActiveDayPickerId] = useState<string | null>(
    null
  );

  const populateInitialData = useCallback(() => {
    if (isTeacher) {
      setForm((prev) => ({
        ...prev,
        teacherId: currentUser?.id || "",
      }));
    } else if (isCR) {
      const sp = currentUser?.studentProfile;
      setForm((prev) => ({
        ...prev,
        department: sp?.department || "",
        batch: sp?.batch || "",
        section: sp?.section || "",
        semesterNumber: sp?.currentSemester?.toString() || "",
        termOffer: sp?.currentTerm || "Fall 2026",
      }));
    }
  }, [isTeacher, isCR, currentUser]);

  useEffect(() => {
    if (isVisible) {
      populateInitialData();
    }
  }, [isVisible, populateInitialData]);

  const updateFormField = useCallback(
    <K extends keyof CreateHubFormState>(key: K, value: CreateHubFormState[K]) => {
      setForm((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
    },
    []
  );

  const handleResetForm = useCallback(() => {
    setForm(INITIAL_FORM_STATE);
    setSchedules([createDefaultScheduleBlock("Sunday")]);
    populateInitialData();
    Toast.show({ type: "info", text1: "Form Cleared" });
  }, [populateInitialData]);

  const addSchedule = useCallback(() => {
    setSchedules((prev) => [...prev, createDefaultScheduleBlock("Monday")]);
  }, []);

  const removeSchedule = useCallback((id: string) => {
    setSchedules((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((s) => s.id !== id);
    });
  }, []);

  const updateScheduleField = useCallback(
    (id: string, field: keyof ScheduleBlock, value: any) => {
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
      );
    },
    []
  );

  const handleTimeChange = useCallback(
    (event: any, selectedDate?: Date) => {
      if (activePicker && selectedDate) {
        const field = activePicker.type === "start" ? "startTime" : "endTime";
        updateScheduleField(activePicker.id, field, selectedDate);
      }
      setActivePicker(null);
    },
    [activePicker, updateScheduleField]
  );

  const handleCreate = useCallback(() => {
    const validation = validateHubForm(form, isCR);
    if (!validation.isValid) {
      return Toast.show({
        type: "error",
        text1: validation.errorTitle || "Invalid Form",
        text2: validation.errorMessage || "Please check all fields.",
      });
    }

    const courseCode = formatCourseCode(form.courseCode).trim();
    const courseName = formatCourseName(form.courseName).trim();
    const creditNum = parseFloat(formatCredit(form.credit));
    const department = form.department.trim();
    const batch = formatBatch(form.batch).trim();
    const semesterNumber = parseInt(formatSemester(form.semesterNumber), 10);
    const termOffer = formatTermOffer(form.termOffer).trim();
    const section = formatSection(form.section).trim() || undefined;

    const formattedSchedules = schedules.map((s) => ({
      day: s.day,
      startTime: formatTimeDisplay(s.startTime),
      endTime: formatTimeDisplay(s.endTime),
      room: s.room.trim() || "TBA",
    }));

    const payload: CreateHubPayload = {
      courseCode,
      courseName,
      credit: creditNum,
      department,
      batch,
      section,
      semesterNumber,
      termOffer,
      teacherId: form.teacherId || undefined,
      weeklyClassSchedule: formattedSchedules,
    };

    onSubmit(payload);
  }, [form, isCR, schedules, onSubmit]);

  const selectedPickerSchedule = useMemo(() => {
    return activePicker
      ? schedules.find((s) => s.id === activePicker.id) || null
      : null;
  }, [activePicker, schedules]);

  const pickerDateValue = useMemo(() => {
    if (!selectedPickerSchedule || !activePicker) return new Date();
    return activePicker.type === "start"
      ? selectedPickerSchedule.startTime
      : selectedPickerSchedule.endTime;
  }, [selectedPickerSchedule, activePicker]);

  return {
    form,
    setForm,
    updateFormField,
    schedules,
    addSchedule,
    removeSchedule,
    updateScheduleField,
    activePicker,
    setActivePicker,
    activeDayPickerId,
    setActiveDayPickerId,
    handleTimeChange,
    handleResetForm,
    handleCreate,
    isTeacher,
    isCR,
    pickerDateValue,
  };
}
