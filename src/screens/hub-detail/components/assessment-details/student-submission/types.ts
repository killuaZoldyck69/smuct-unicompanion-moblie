import { AssessmentAttachment } from "../types";

export interface SubmissionLink {
  title: string;
  url: string;
}

export type SubmissionMethod = "ONLINE" | "OFFLINE";

export type ActiveDrawerType = "LINK" | "TEXT" | null;

export interface StudentSubmissionPayload {
  submittedUrl?: string;
  content?: string;
  attachments?: AssessmentAttachment[];
  links?: SubmissionLink[];
  status: "SUBMITTED" | "HAND_SUBMISSION";
  isLate?: boolean;
}
