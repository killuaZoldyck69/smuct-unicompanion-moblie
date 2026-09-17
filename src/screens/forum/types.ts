import type {
  ForumPostItem,
  ForumAuthor,
  CreateForumPostInput,
} from "@/features/forum/types";

export type FilterType = "ALL" | "UNRESOLVED" | "RESOLVED" | "MY_POSTS";

export interface ForumCounts {
  total: number;
  open: number;
  resolved: number;
  myPosts: number;
}

export interface ForumProps {
  embedded?: boolean;
}

export interface FilterOption {
  key: FilterType;
  label: string;
  count: number;
}

export type { ForumPostItem, ForumAuthor, CreateForumPostInput };
