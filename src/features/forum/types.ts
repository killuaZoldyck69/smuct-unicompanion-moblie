export interface ForumAuthor {
  id: string;
  name: string;
  image?: string | null;
  role?: string;
  studentProfile?: any;
  teacherProfile?: any;
}

export interface ForumResponseItem {
  id: string;
  content: string;
  createdAt: string;
  responder: ForumAuthor;
}

export interface ForumPostItem {
  id: string;
  title: string;
  description: string;
  isResolved: boolean;
  createdAt: string;
  authorId: string;
  author: ForumAuthor;
  _count?: {
    responses: number;
  };
  responses?: ForumResponseItem[];
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
}
