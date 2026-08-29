export interface WeeklyClassScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
}

export interface TermExamItem {
  type: string;
  date?: string;
  time?: string;
  room?: string;
}

export interface CreateHubInput {
  courseCode: string;
  courseName: string;
  credit: number;
  termOffer: string;
  weeklyClassSchedule: WeeklyClassScheduleItem[];
  department: string;
  batch: string;
  semesterNumber: number;
  teacherId?: string;
}

export interface UpdateHubInput {
  courseName?: string;
  department?: string;
  batch?: string;
  termOffer?: string;
  weeklyClassSchedule?: any;
  isReviewOpen?: boolean;
  termExams?: TermExamItem[];
}

export interface CreateAssessmentInput {
  title: string;
  description?: string;
  type: "ASSIGNMENT" | "QUIZ" | "PRESENTATION";
  deadline: string | Date;
  totalMarks: number;
}

export interface CreateResourceInput {
  title: string;
  driveUrl: string;
  isStudentNote?: boolean;
}

export interface CreateAnnouncementInput {
  content: string;
  attachedLinkUrl?: string;
  attachedLinkTitle?: string;
}

export interface CreateDiscussionInput {
  title: string;
  content: string;
}

export interface SubmitReviewInput {
  rating: number;
  comment?: string;
  isAnonymous?: boolean;
  answers?: any;
}
