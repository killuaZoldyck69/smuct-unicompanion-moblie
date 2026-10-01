import { Feather } from "@expo/vector-icons";

export type AssessmentTypeEnum = "ASSIGNMENT" | "QUIZ" | "CT" | "PRESENTATION" | "EXAM" | string;

export interface AssessmentAttachment {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

export interface AssessmentLink {
  title?: string;
  url: string;
}

export interface AssessmentSubmission {
  id: string;
  assessmentId: string;
  studentId: string;
  student?: {
    id: string;
    name: string;
    avatar?: string;
    studentId?: string;
  };
  submittedUrl?: string;
  content?: string;
  attachments?: AssessmentAttachment[];
  marks?: number | null;
  feedback?: string | null;
  status?: string;
  isLate?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AssessmentData {
  id: string;
  hubId: string;
  title: string;
  description?: string | null;
  type: AssessmentTypeEnum;
  submissionType?: "ONLINE" | "HAND" | "OFFLINE";
  status?: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "CLOSED" | "ARCHIVED" | string;
  deadline?: string;
  startDate?: string;
  totalMarks: number;
  attachments?: AssessmentAttachment[] | null;
  links?: AssessmentLink[] | null;
  submissions?: AssessmentSubmission[];
}

export interface AssessmentTypeConfig {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
  iconColor: string;
  iconBorder: string;
}

export interface GradingStudentTarget {
  submissionId: string;
  userId: string;
  name: string;
}

export interface AssessmentDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  assessment?: AssessmentData | null;
  hubId: string;
  canManage: boolean;
  canSubmit?: boolean;
  currentUserId?: string;
  hubMembers?: any[];
  onEdit?: (item: AssessmentData) => void;
  onDelete?: (assessmentId: string) => void;
}
