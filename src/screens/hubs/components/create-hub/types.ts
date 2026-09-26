export interface ScheduleBlock {
  id: string;
  day: string;
  startTime: Date;
  endTime: Date;
  room: string;
}

export interface CreateHubFormState {
  courseName: string;
  courseCode: string;
  credit: string;
  department: string;
  batch: string;
  section: string;
  semesterNumber: string;
  termOffer: string;
  teacherId: string;
}

export interface WeeklySchedulePayload {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface CreateHubPayload {
  courseCode: string;
  courseName: string;
  credit: number;
  department: string;
  batch: string;
  section?: string;
  semesterNumber: number;
  termOffer: string;
  teacherId?: string;
  weeklyClassSchedule: WeeklySchedulePayload[];
}

export interface CreateHubModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateHubPayload) => void;
  isPending: boolean;
  teachers?: any[];
  isLoadingTeachers?: boolean;
  currentUser: any;
}

export type TimePickerType = "start" | "end";

export interface ActiveTimePickerState {
  id: string;
  type: TimePickerType;
}
