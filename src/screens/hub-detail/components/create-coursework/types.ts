export type AssessmentType = "ASSIGNMENT" | "QUIZ" | "PRESENTATION";
export type SubmissionType = "ONLINE" | "HAND";

export interface AttachmentItem {
  id?: string;
  name: string;
  url?: string;
  localUri?: string;
  size?: number;
  type?: string;
  publicId?: string;
  mimeType?: string;
}

export interface LinkItem {
  title: string;
  url: string;
}

export interface CourseworkFormData {
  title: string;
  description: string;
  type: AssessmentType;
  submissionType: SubmissionType;
  totalMarks: string;
  allowLateSubmission: boolean;
}

export interface CreateCourseworkPayload {
  title: string;
  description?: string;
  type: AssessmentType;
  submissionType: SubmissionType;
  totalMarks: number;
  deadline: string;
  allowLateSubmission?: boolean;
  attachments?: AttachmentItem[];
  links?: LinkItem[];
}

export interface CreateCourseworkModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCourseworkPayload) => void;
  isPending: boolean;
}
