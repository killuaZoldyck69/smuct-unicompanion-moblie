export type MaterialSectionTab = "OFFICIAL" | "STUDENT_NOTES";

export interface MaterialAttachment {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

export interface MaterialLink {
  title?: string | null;
  url: string;
}

export interface MaterialItem {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  driveUrl: string;
  attachments?: MaterialAttachment[] | null;
  links?: MaterialLink[] | null;
  uploaderId: string;
  uploader?: {
    id: string;
    name: string;
    image?: string;
  };
  hubId?: string | null;
  isStudentNote: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMaterialPayload {
  title: string;
  description?: string;
  driveUrl: string;
  category?: string;
  isStudentNote: boolean;
  attachments?: MaterialAttachment[];
  links?: MaterialLink[];
}

