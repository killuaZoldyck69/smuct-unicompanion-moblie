export interface AttachmentItem {
  name: string;
  url: string;
  size?: number;
  type?: string;
  publicId?: string;
}

export interface LinkItem {
  title: string;
  url: string;
}

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
  credit?: number;
  termOffer?: string;
  weeklyClassSchedule?: WeeklyClassScheduleItem[];
  department?: string;
  batch: string;
  semesterNumber?: number;
  semester?: number;
  teacherId?: string;
  title?: string;
  description?: string;
}

export interface UpdateHubInput {
  courseName?: string;
  courseCode?: string;
  credit?: number;
  department?: string;
  batch?: string;
  semesterNumber?: number;
  termOffer?: string;
  weeklyClassSchedule?: any;
  isReviewOpen?: boolean;
  termExams?: TermExamItem[];
  meetUrl?: string | null;
  isClassLive?: boolean;
}

export interface CreateAssessmentInput {
  title: string;
  description?: string;
  type: "ASSIGNMENT" | "QUIZ" | "PRESENTATION" | string;
  submissionType?: "ONLINE" | "HAND" | string;
  deadline: string | Date;
  startDate?: string | Date;
  totalMarks: number;
  status?: string;
  attachments?: AttachmentItem[];
  links?: LinkItem[];
}

export interface SubmitAssessmentInput {
  submittedUrl?: string;
  content?: string;
  attachments?: AttachmentItem[];
  links?: LinkItem[];
  status?: string;
  isLate?: boolean;
}

export interface CreateResourceInput {
  title: string;
  driveUrl?: string;
  description?: string;
  category?: string;
  fileType?: string;
  fileSize?: number;
  isStudentNote?: boolean;
  attachments?: AttachmentItem[];
  links?: LinkItem[];
}

export interface CreateAnnouncementInput {
  title?: string;
  content: string;
  attachedLinkUrl?: string;
  attachedLinkTitle?: string;
  attachments?: AttachmentItem[];
  links?: LinkItem[];
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
