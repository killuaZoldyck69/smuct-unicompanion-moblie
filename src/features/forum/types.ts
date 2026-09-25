export interface StudentProfile {
  id?: string;
  studentId?: string | null;
  faculty?: string | null;
  department?: string | null;
  program?: string | null;
  batch?: string | null;
  currentSemester?: string | number | null;
  section?: string | null;
  isCR?: boolean;
  isTA?: boolean;
  skills?: string[];
  linkedInUrl?: string | null;
  personalWebsiteUrl?: string | null;
}

export interface TeacherProfile {
  id?: string;
  teacherId?: string | null;
  designation?: string | null;
  department?: string | null;
  faculty?: string | null;
  officeRoom?: string | null;
  consultationHours?: string | null;
  expertiseFields?: string[];
  linkedInUrl?: string | null;
  personalWebsiteUrl?: string | null;
}

export interface ForumAuthor {
  id: string;
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  image?: string | null;
  role?: string;
  studentProfile?: StudentProfile | null;
  teacherProfile?: TeacherProfile | null;
}

export interface ForumResponseItem {
  id: string;
  postId?: string;
  responderId?: string;
  parentId?: string | null;
  content: string;
  createdAt: string;
  updatedAt?: string;
  responder: ForumAuthor;
  replies?: ForumResponseItem[];
}

export interface ForumPostItem {
  id: string;
  title: string;
  description: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt?: string;
  authorId: string;
  author: ForumAuthor;
  _count?: {
    responses: number;
  };
  responses?: ForumResponseItem[];
}

export interface ForumCounts {
  total: number;
  open: number;
  resolved: number;
  myPosts: number;
}

export interface ForumFeedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  counts?: ForumCounts;
}

export interface ForumFeedResponse {
  posts: ForumPostItem[];
  meta?: ForumFeedMeta;
}

export interface CreateForumPostInput {
  title: string;
  description: string;
}

export interface UpdateForumPostInput {
  title?: string;
  description?: string;
}

export interface CreateForumResponseInput {
  content: string;
  parentId?: string | null;
}

