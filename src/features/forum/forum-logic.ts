import type {
  ForumPostItem,
  ForumResponseItem,
  ForumResponseReactionResult,
  ForumResponseReactionType,
} from "./types.ts";

export const FORUM_LIMITS = {
  MAX_TITLE_LENGTH: 150,
  MIN_TITLE_LENGTH: 5,
  MAX_DESCRIPTION_LENGTH: 3000,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_HTML_LENGTH: 12000,
  MAX_RESPONSE_LENGTH: 2000,
} as const;

/**
 * Strips HTML markup into readable plain text for character counting and sharing.
 */
export function stripHtmlToPlainText(html: string | undefined | null): string {
  if (!html) return "";
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * Validates and normalizes forum post title and description against contract limits:
 * 5..150 chars for title, 10..3000 plain-text chars and <=12000 HTML chars for description.
 */
export function sanitizeForumPost(input: {
  title: string;
  description: string;
}): { title: string; description: string; plainText: string; error?: string } {
  const cleanTitle = (input.title || "")
    .trim()
    .slice(0, FORUM_LIMITS.MAX_TITLE_LENGTH);
  const cleanDescription = (input.description || "").trim();
  const plainText = stripHtmlToPlainText(cleanDescription).replace(/\s+/g, " ").trim();

  if (!cleanTitle) {
    return {
      title: "",
      description: cleanDescription,
      plainText,
      error: "Please enter a question title.",
    };
  }

  if (cleanTitle.length < FORUM_LIMITS.MIN_TITLE_LENGTH) {
    return {
      title: cleanTitle,
      description: cleanDescription,
      plainText,
      error: "Question title must be at least 5 characters.",
    };
  }

  if (!cleanDescription || !plainText) {
    return {
      title: cleanTitle,
      description: "",
      plainText: "",
      error: "Please provide details and context for your question.",
    };
  }

  if (plainText.length < FORUM_LIMITS.MIN_DESCRIPTION_LENGTH) {
    return {
      title: cleanTitle,
      description: cleanDescription,
      plainText,
      error: "Please provide at least 10 characters of details and context.",
    };
  }

  if (plainText.length > FORUM_LIMITS.MAX_DESCRIPTION_LENGTH) {
    return {
      title: cleanTitle,
      description: cleanDescription,
      plainText,
      error: `Description cannot exceed ${FORUM_LIMITS.MAX_DESCRIPTION_LENGTH} characters.`,
    };
  }

  if (cleanDescription.length > FORUM_LIMITS.MAX_DESCRIPTION_HTML_LENGTH) {
    return {
      title: cleanTitle,
      description: cleanDescription,
      plainText,
      error: "Formatted content is too large. Please simplify or shorten your post.",
    };
  }

  return {
    title: cleanTitle,
    description: cleanDescription,
    plainText,
  };
}

/**
 * Counts top-level responses plus all nested replies so detail headers align with `_count.responses`.
 */
export function countTotalThreadResponses(
  responses?: ForumResponseItem[] | null,
): number {
  if (!Array.isArray(responses)) return 0;
  return responses.reduce(
    (total, item) => total + 1 + countTotalThreadResponses(item.replies),
    0,
  );
}

/**
 * Formats a clean plain-text message for the native Share sheet without raw HTML tags.
 */
export function formatShareMessage(title: string, description: string): string {
  const cleanTitle = (title || "").trim();
  const cleanBody = stripHtmlToPlainText(description);
  const bodySection = cleanBody ? `\n\n${cleanBody}` : "";
  return `SMUCT Campus Forum: "${cleanTitle}"${bodySection}\n\nJoin the discussion on SMUCT UniCompanion!`;
}

/**
 * Computes next reaction counts and `userReaction` when toggling or switching LIKE/DISLIKE.
 */
export function applyOptimisticReaction(
  item: ForumResponseItem,
  type: ForumResponseReactionType,
): ForumResponseItem {
  const currentReaction = item.userReaction ?? null;
  let likesCount = item.likesCount ?? 0;
  let dislikesCount = item.dislikesCount ?? 0;
  let nextReaction: ForumResponseReactionType | null = type;

  if (currentReaction === type) {
    nextReaction = null;
    if (type === "LIKE") {
      likesCount = Math.max(0, likesCount - 1);
    } else {
      dislikesCount = Math.max(0, dislikesCount - 1);
    }
  } else {
    if (currentReaction === "LIKE") {
      likesCount = Math.max(0, likesCount - 1);
    } else if (currentReaction === "DISLIKE") {
      dislikesCount = Math.max(0, dislikesCount - 1);
    }

    if (type === "LIKE") {
      likesCount += 1;
    } else {
      dislikesCount += 1;
    }
  }

  return {
    ...item,
    likesCount,
    dislikesCount,
    userReaction: nextReaction,
  };
}

function updateResponseTree(
  responses: ForumResponseItem[] | undefined,
  responseId: string,
  updater: (item: ForumResponseItem) => ForumResponseItem,
): ForumResponseItem[] | undefined {
  if (!Array.isArray(responses)) return responses;
  return responses.map((item) => {
    const updatedItem = item.id === responseId ? updater(item) : item;
    if (Array.isArray(updatedItem.replies) && updatedItem.replies.length > 0) {
      return {
        ...updatedItem,
        replies: updateResponseTree(updatedItem.replies, responseId, updater),
      };
    }
    return updatedItem;
  });
}

export function applyOptimisticReactionToThread(
  post: ForumPostItem,
  responseId: string,
  type: ForumResponseReactionType,
): ForumPostItem {
  return {
    ...post,
    responses: updateResponseTree(post.responses, responseId, (item) =>
      applyOptimisticReaction(item, type),
    ),
  };
}

export function patchReactionResultInThread(
  post: ForumPostItem,
  result: ForumResponseReactionResult,
): ForumPostItem {
  return {
    ...post,
    responses: updateResponseTree(post.responses, result.responseId, (item) => ({
      ...item,
      likesCount: result.likesCount,
      dislikesCount: result.dislikesCount,
      userReaction: result.userReaction,
    })),
  };
}

export interface ApiErrorInfo {
  status?: number;
  code?: string;
  message: string;
}

/**
 * Extracts HTTP status, structured error code (e.g. `UGC_TERMS_REQUIRED`), and display message.
 */
export function extractApiErrorInfo(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): ApiErrorInfo {
  if (!err || typeof err !== "object") {
    return { message: typeof err === "string" && err ? err : fallback };
  }

  const record = err as Record<string, any>;
  const responseData = record.response?.data as Record<string, any> | undefined;
  const status =
    typeof record.response?.status === "number"
      ? record.response.status
      : typeof record.status === "number"
        ? record.status
        : undefined;
  const code =
    typeof responseData?.code === "string"
      ? responseData.code
      : typeof record.code === "string" && record.code !== "ERR_BAD_REQUEST"
        ? record.code
        : undefined;
  const message =
    (typeof responseData?.message === "string" && responseData.message) ||
    (typeof responseData?.error === "string" && responseData.error) ||
    (typeof record.message === "string" && record.message) ||
    fallback;

  return { status, code, message };
}
