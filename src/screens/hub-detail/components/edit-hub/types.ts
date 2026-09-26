import type { ScheduleBlock } from "@/screens/hubs/components/create-hub";

export type { ScheduleBlock };

export interface EditHubFormState {
  courseName: string;
  courseCode: string;
  credit: string;
  department: string;
  batch: string;
  section: string;
  semesterNumber: string;
  termOffer: string;
  meetUrl: string;
}

export interface ExamState {
  date: Date | null;
  room: string;
}

export interface TermExamPayload {
  type: "Midterm" | "Final";
  date?: string;
  time?: string;
  room?: string;
}

export interface WeeklySchedulePayload {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface EditHubPayload {
  courseName: string;
  courseCode?: string;
  credit?: number;
  department: string;
  batch: string;
  section?: string;
  semesterNumber?: number;
  termOffer: string;
  meetUrl: string | null;
  weeklyClassSchedule: WeeklySchedulePayload[];
  termExams?: TermExamPayload[];
}

export interface EditHubModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (payload: EditHubPayload) => void;
  isPending: boolean;
  hubDetails: any;
}

// Discriminated union keeps native picker dispatch exhaustive and type-safe
export type DateTimePickerTarget =
  | { target: "schedule"; id: string; type: "start" | "end" }
  | { target: "midterm"; mode: "date" | "time" }
  | { target: "final"; mode: "date" | "time" };
