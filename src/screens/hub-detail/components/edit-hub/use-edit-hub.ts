import { useState, useCallback, useEffect, useMemo } from "react";
import {
  formatCourseName,
  formatCourseCode,
  formatCredit,
  formatBatch,
  formatSection,
  formatTermOffer,
  formatSemester,
} from "@/screens/hubs/components/create-hub";
import type {
  EditHubFormState,
  ExamState,
  DateTimePickerTarget,
  EditHubPayload,
} from "./types";
import type { ScheduleBlock } from "./types";
import {
  parseScheduleBlocks,
  parseExamState,
  buildSchedulePayload,
  buildExamPayload,
  mergeDatePart,
  mergeTimePart,
  isEditFormValid,
} from "./utils";

interface UseEditHubProps {
  isVisible: boolean;
  hubDetails: any;
  onSubmit: (payload: EditHubPayload) => void;
}

const EMPTY_FORM: EditHubFormState = {
  courseName: "",
  courseCode: "",
  credit: "",
  department: "",
  batch: "",
  section: "",
  semesterNumber: "",
  termOffer: "",
  meetUrl: "",
};

export function useEditHub({ isVisible, hubDetails, onSubmit }: UseEditHubProps) {
  const [form, setForm] = useState<EditHubFormState>(EMPTY_FORM);
  const [schedules, setSchedules] = useState<ScheduleBlock[]>([]);
  const [midterm, setMidterm] = useState<ExamState>({ date: null, room: "" });
  const [final, setFinal] = useState<ExamState>({ date: null, room: "" });
  const [activePicker, setActivePicker] = useState<DateTimePickerTarget | null>(null);
  const [activeDayPickerId, setActiveDayPickerId] = useState<string | null>(null);

  // Populate form from hubDetails whenever the modal opens
  useEffect(() => {
    if (!isVisible || !hubDetails) return;

    setForm({
      courseName: hubDetails.courseName ?? "",
      courseCode: hubDetails.courseCode ?? "",
      credit: hubDetails.credit != null ? String(hubDetails.credit) : "",
      department: hubDetails.department ?? "",
      batch: hubDetails.batch ?? "",
      section: hubDetails.section ?? "",
      semesterNumber:
        hubDetails.semesterNumber != null
          ? String(hubDetails.semesterNumber)
          : "",
      termOffer: hubDetails.termOffer ?? "",
      meetUrl: hubDetails.meetUrl ?? "",
    });

    setSchedules(parseScheduleBlocks(hubDetails));
    setMidterm(parseExamState(hubDetails, "Midterm"));
    setFinal(parseExamState(hubDetails, "Final"));
  }, [isVisible, hubDetails]);

  // Typed field updater with inline auto-formatting per field
  const updateField = useCallback(
    <K extends keyof EditHubFormState>(key: K, raw: string) => {
      const formatters: Partial<Record<keyof EditHubFormState, (v: string) => string>> = {
        courseName: formatCourseName,
        courseCode: formatCourseCode,
        credit: formatCredit,
        department: (v) => v.toUpperCase(),
        batch: formatBatch,
        section: formatSection,
        semesterNumber: formatSemester,
        termOffer: formatTermOffer,
      };
      const value = (formatters[key]?.(raw) ?? raw) as EditHubFormState[K];
      setForm((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
    },
    []
  );

  // --- Schedule operations ---
  const addSchedule = useCallback(() => {
    const start = new Date();
    start.setHours(10, 0, 0, 0);
    const end = new Date();
    end.setHours(11, 20, 0, 0);
    setSchedules((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        day: "Sunday",
        startTime: start,
        endTime: end,
        room: "",
      },
    ]);
  }, []);

  const removeSchedule = useCallback((id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateScheduleField = useCallback(
    (id: string, field: keyof ScheduleBlock, value: any) => {
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
      );
    },
    []
  );

  // --- Day picker ---
  const selectedDayForPicker = useMemo(
    () => schedules.find((s) => s.id === activeDayPickerId)?.day,
    [schedules, activeDayPickerId]
  );

  const handleSelectDay = useCallback(
    (day: string) => {
      if (activeDayPickerId) updateScheduleField(activeDayPickerId, "day", day);
      setActiveDayPickerId(null);
    },
    [activeDayPickerId, updateScheduleField]
  );

  // --- Native date/time picker ---
  const handlePickerChange = useCallback(
    (event: any, selectedDate?: Date) => {
      // Android fires dismissed as a separate event type
      if (!selectedDate || event?.type === "dismissed") {
        setActivePicker(null);
        return;
      }

      if (activePicker?.target === "schedule") {
        const field = activePicker.type === "start" ? "startTime" : "endTime";
        updateScheduleField(activePicker.id, field, selectedDate);
      } else if (activePicker?.target === "midterm") {
        setMidterm((prev) => ({
          ...prev,
          date:
            activePicker.mode === "date"
              ? mergeDatePart(prev.date, selectedDate)
              : mergeTimePart(prev.date, selectedDate),
        }));
      } else if (activePicker?.target === "final") {
        setFinal((prev) => ({
          ...prev,
          date:
            activePicker.mode === "date"
              ? mergeDatePart(prev.date, selectedDate)
              : mergeTimePart(prev.date, selectedDate),
        }));
      }

      setActivePicker(null);
    },
    [activePicker, updateScheduleField]
  );

  const pickerDateValue = useMemo((): Date => {
    if (!activePicker) return new Date();
    if (activePicker.target === "schedule") {
      const s = schedules.find((sch) => sch.id === activePicker.id);
      const val =
        activePicker.type === "start" ? s?.startTime : s?.endTime;
      return val instanceof Date && !isNaN(val.getTime()) ? val : new Date();
    }
    const examDate =
      activePicker.target === "midterm" ? midterm.date : final.date;
    return examDate instanceof Date && !isNaN(examDate.getTime())
      ? examDate
      : new Date();
  }, [activePicker, schedules, midterm.date, final.date]);

  // --- Submission ---
  const handleSubmit = useCallback(() => {
    const examEntries = [
      buildExamPayload("Midterm", midterm),
      buildExamPayload("Final", final),
    ].filter((e): e is NonNullable<typeof e> => e !== null);

    const payload: EditHubPayload = {
      courseName: form.courseName.trim(),
      courseCode: form.courseCode.trim() || undefined,
      credit: form.credit ? parseFloat(form.credit) : undefined,
      department: form.department.trim(),
      batch: form.batch.trim(),
      section: form.section.trim() || undefined,
      semesterNumber: form.semesterNumber
        ? parseInt(form.semesterNumber, 10)
        : undefined,
      termOffer: form.termOffer.trim(),
      meetUrl: form.meetUrl.trim() || null,
      weeklyClassSchedule: buildSchedulePayload(schedules),
      termExams: examEntries.length > 0 ? examEntries : undefined,
    };

    onSubmit(payload);
  }, [form, schedules, midterm, final, onSubmit]);

  const isFormValid = useMemo(
    () => isEditFormValid(form.courseName, form.department, form.batch),
    [form.courseName, form.department, form.batch]
  );

  return {
    form,
    updateField,
    schedules,
    addSchedule,
    removeSchedule,
    updateScheduleField,
    midterm,
    setMidterm,
    final,
    setFinal,
    activePicker,
    setActivePicker,
    activeDayPickerId,
    setActiveDayPickerId,
    selectedDayForPicker,
    handleSelectDay,
    handlePickerChange,
    pickerDateValue,
    handleSubmit,
    isFormValid,
  };
}
