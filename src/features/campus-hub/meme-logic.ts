import type {
  Meme,
  MemeReactionType,
  ReactMemeResult,
} from "@/services/meme-service";

export const MEME_LIMITS = {
  MAX_CAPTION: 280,
  MAX_IMAGE_BYTES: 5 * 1024 * 1024,
  MAX_IMAGE_DIMENSION: 1600,
} as const;

export function createMemeIdempotencyKey(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const tail = Math.random().toString(36).slice(2, 6);
  return `meme_${Date.now()}_${rand}${tail}`;
}

export function sanitizeMemeCaption(
  caption: string | null | undefined,
): { caption: string | null; error?: string } {
  if (caption == null) {
    return { caption: null };
  }

  const normalized = String(caption)
    .replace(/\r\n?/g, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!normalized) {
    return { caption: null };
  }

  if (normalized.length > MEME_LIMITS.MAX_CAPTION) {
    return {
      caption: normalized,
      error: `Caption cannot exceed ${MEME_LIMITS.MAX_CAPTION} characters.`,
    };
  }

  return { caption: normalized };
}

export function applyOptimisticMemeReaction(
  meme: Meme,
  type: MemeReactionType,
): Meme {
  const currentReaction = meme.userReaction ?? null;
  let nextReaction: MemeReactionType | null = type;
  let nextLikes = Math.max(0, meme.likesCount ?? 0);
  let nextDislikes = Math.max(0, meme.dislikesCount ?? 0);

  if (currentReaction === type) {
    nextReaction = null;
    if (type === "LIKE") {
      nextLikes = Math.max(0, nextLikes - 1);
    } else {
      nextDislikes = Math.max(0, nextDislikes - 1);
    }
  } else if (currentReaction === null) {
    if (type === "LIKE") {
      nextLikes += 1;
    } else {
      nextDislikes += 1;
    }
  } else if (type === "LIKE") {
    nextLikes += 1;
    nextDislikes = Math.max(0, nextDislikes - 1);
  } else {
    nextDislikes += 1;
    nextLikes = Math.max(0, nextLikes - 1);
  }

  return {
    ...meme,
    userReaction: nextReaction,
    likesCount: nextLikes,
    dislikesCount: nextDislikes,
    popularityScore: nextLikes * 2 - nextDislikes,
  };
}

export function patchMemeWithReactionResult(
  meme: Meme,
  result: ReactMemeResult,
): Meme {
  const likesCount = Math.max(0, result.likesCount ?? meme.likesCount);
  const dislikesCount = Math.max(0, result.dislikesCount ?? meme.dislikesCount);
  return {
    ...meme,
    userReaction: result.userReaction,
    likesCount,
    dislikesCount,
    popularityScore: likesCount * 2 - dislikesCount,
  };
}

export interface MemeReportPreviewTarget {
  targetId: string;
  targetAuthor?: { name?: string | null } | null;
  targetLive?: {
    id?: string;
    contentPreview?: string | null;
    imageUrl?: string | null;
  } | null;
  targetSnapshot?: {
    contentPreview?: string | null;
    imageUrl?: string | null;
  } | null;
}

export interface ResolvedMemePreview {
  id: string;
  imageUrl: string;
  caption: string | null;
  authorName?: string;
}

export function resolveMemePreviewFromReport(
  report: MemeReportPreviewTarget | null | undefined,
): ResolvedMemePreview | null {
  if (!report) return null;
  const imageUrl =
    report.targetLive?.imageUrl?.trim() ||
    report.targetSnapshot?.imageUrl?.trim() ||
    "";
  if (!imageUrl) return null;

  const rawCaption =
    report.targetLive?.contentPreview ??
    report.targetSnapshot?.contentPreview ??
    null;
  const caption = rawCaption && rawCaption.trim() ? rawCaption.trim() : null;

  return {
    id: report.targetLive?.id || report.targetId,
    imageUrl,
    caption,
    authorName: report.targetAuthor?.name || undefined,
  };
}
