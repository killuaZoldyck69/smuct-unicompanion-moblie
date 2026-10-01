import { AssessmentData, AssessmentTypeConfig } from "../assessment-details/types";

export interface ClassworkTabProps {
  hubId: string;
  hubDetails?: any;
  canManage: boolean;
  canSubmit?: boolean;
  isTeacher?: boolean;
  currentUserId?: string;
}

export interface RemainingDaysInfo {
  text: string;
  isOverdue: boolean;
  isUrgent: boolean;
}

export interface SubmissionTypeInfo {
  isHand: boolean;
  label: string;
  icon: "clipboard" | "globe";
}

export type { AssessmentData, AssessmentTypeConfig };
