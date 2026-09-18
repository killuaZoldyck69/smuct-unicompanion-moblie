import type {
  ForumPostItem,
  ForumAuthor,
  CreateForumPostInput,
  UpdateForumPostInput,
  CreateForumResponseInput,
  ForumResponseItem,
  ForumCounts,
  ForumFeedResponse,
  StudentProfile,
  TeacherProfile,
} from "@/features/forum/types";

export type FilterType = "ALL" | "UNRESOLVED" | "RESOLVED" | "MY_POSTS";

export interface ForumProps {
  embedded?: boolean;
}

export interface FilterOption {
  key: FilterType;
  label: string;
  count: number;
}

export type {
  ForumPostItem,
  ForumAuthor,
  CreateForumPostInput,
  UpdateForumPostInput,
  CreateForumResponseInput,
  ForumResponseItem,
  ForumCounts,
  ForumFeedResponse,
  StudentProfile,
  TeacherProfile,
};
