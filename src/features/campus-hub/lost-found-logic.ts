import type {
  LostFoundCategory,
  LostFoundClaimStatus,
  LostFoundStatus,
} from "@/services/lost-found-service";

export const LOST_FOUND_LIMITS = {
  MIN_TITLE: 2,
  MAX_TITLE: 150,
  MAX_DESCRIPTION: 3000,
  MAX_LOCATION: 150,
  MAX_QUESTION: 200,
  MAX_ANSWER: 200,
  MIN_CLAIM_MESSAGE: 5,
  MAX_CLAIM_MESSAGE: 1000,
  MAX_CLAIM_ANSWER: 300,
  MAX_IMAGES: 2,
  MAX_IMAGE_BYTES: 5 * 1024 * 1024,
  MAX_CLAIM_ATTEMPTS: 2,
} as const;

export const LOST_FOUND_CATEGORY_OPTIONS: readonly {
  key: LostFoundCategory;
  label: string;
}[] = [
  { key: "ID_CARD", label: "ID Card" },
  { key: "ELECTRONICS", label: "Electronics" },
  { key: "KEYS", label: "Keys" },
  { key: "WALLET", label: "Wallet & Purse" },
  { key: "BAGS", label: "Bags & Backpacks" },
  { key: "BOOKS", label: "Books & Notes" },
  { key: "DOCUMENTS", label: "Documents" },
  { key: "ACCESSORIES", label: "Accessories" },
  { key: "CLOTHING", label: "Clothing" },
  { key: "STATIONERY", label: "Stationery" },
  { key: "UMBRELLA", label: "Umbrella" },
  { key: "BOTTLE", label: "Water Bottle" },
  { key: "OTHER", label: "Other Item" },
];

export const CATEGORY_LABELS = Object.fromEntries(
  LOST_FOUND_CATEGORY_OPTIONS.map(({ key, label }) => [key, label]),
) as Record<LostFoundCategory, string>;

export type LostFoundFormType = "LOST" | "FOUND";

export interface LostFoundFormInput<TCategory extends string = string> {
  type: LostFoundFormType;
  title: string;
  description?: string | null;
  category: TCategory;
  location?: string | null;
  verificationQuestion?: string | null;
  verificationAnswer?: string | null;
  includeVerificationFields?: boolean;
}

export interface SanitizedLostFoundForm<TCategory extends string = string> {
  type: LostFoundFormType;
  title: string;
  description: string | null;
  category: TCategory;
  location: string | null;
  verificationQuestion?: string | null;
  verificationAnswer?: string | null;
}

/**
 * Validates and trims Lost & Found create/edit payloads.
 * Non-author administrators omit verification Q&A fields so finder secrets are preserved.
 */
export function validateLostFoundForm<TCategory extends string = string>(
  input: LostFoundFormInput<TCategory>,
): { error?: string; payload?: SanitizedLostFoundForm<TCategory> } {
  const title = (input.title ?? "").trim();
  if (title.length < LOST_FOUND_LIMITS.MIN_TITLE) {
    return {
      error: `Title must be at least ${LOST_FOUND_LIMITS.MIN_TITLE} characters.`,
    };
  }
  if (title.length > LOST_FOUND_LIMITS.MAX_TITLE) {
    return {
      error: `Title cannot exceed ${LOST_FOUND_LIMITS.MAX_TITLE} characters.`,
    };
  }

  const description = (input.description ?? "").trim() || null;
  if (description && description.length > LOST_FOUND_LIMITS.MAX_DESCRIPTION) {
    return {
      error: `Description cannot exceed ${LOST_FOUND_LIMITS.MAX_DESCRIPTION} characters.`,
    };
  }

  const location = (input.location ?? "").trim() || null;
  if (location && location.length > LOST_FOUND_LIMITS.MAX_LOCATION) {
    return {
      error: `Location cannot exceed ${LOST_FOUND_LIMITS.MAX_LOCATION} characters.`,
    };
  }

  const payload: SanitizedLostFoundForm<TCategory> = {
    type: input.type,
    title,
    description,
    category: input.category,
    location,
  };

  const canEditVerification = input.includeVerificationFields !== false;
  if (input.type === "LOST") {
    payload.verificationQuestion = null;
    payload.verificationAnswer = null;
  } else if (canEditVerification) {
    const question = (input.verificationQuestion ?? "").trim() || null;
    const answer = (input.verificationAnswer ?? "").trim() || null;
    if (question && question.length > LOST_FOUND_LIMITS.MAX_QUESTION) {
      return {
        error: `Verification question cannot exceed ${LOST_FOUND_LIMITS.MAX_QUESTION} characters.`,
      };
    }
    if (answer && answer.length > LOST_FOUND_LIMITS.MAX_ANSWER) {
      return {
        error: `Verification answer cannot exceed ${LOST_FOUND_LIMITS.MAX_ANSWER} characters.`,
      };
    }
    payload.verificationQuestion = question;
    payload.verificationAnswer = answer;
  }

  return { payload };
}

export function validateClaimForm(input: {
  message: string;
  answer?: string | null;
  hasVerificationQuestion?: boolean;
}): {
  error?: string;
  payload?: { message: string; answer: string | null };
} {
  const message = (input.message ?? "").trim();
  const answer = (input.answer ?? "").trim() || null;

  if (input.hasVerificationQuestion && !answer) {
    return { error: "Please answer the finder's verification question." };
  }

  if (message.length < LOST_FOUND_LIMITS.MIN_CLAIM_MESSAGE) {
    return {
      error: `Claim description must be at least ${LOST_FOUND_LIMITS.MIN_CLAIM_MESSAGE} characters.`,
    };
  }

  if (message.length > LOST_FOUND_LIMITS.MAX_CLAIM_MESSAGE) {
    return {
      error: `Claim description cannot exceed ${LOST_FOUND_LIMITS.MAX_CLAIM_MESSAGE} characters.`,
    };
  }

  if (answer && answer.length > LOST_FOUND_LIMITS.MAX_CLAIM_ANSWER) {
    return {
      error: `Verification answer cannot exceed ${LOST_FOUND_LIMITS.MAX_CLAIM_ANSWER} characters.`,
    };
  }

  return {
    payload: { message, answer },
  };
}

export function canAuthorReviewClaim(params: {
  isAuthor: boolean;
  claimStatus: LostFoundClaimStatus;
  postStatus: LostFoundStatus;
}): boolean {
  return (
    params.isAuthor &&
    params.claimStatus === "PENDING" &&
    params.postStatus === "ACTIVE"
  );
}

export function canResubmitRejectedClaim(params: {
  claimStatus?: LostFoundClaimStatus | null;
  attemptCount?: number | null;
  postStatus?: LostFoundStatus | null;
}): boolean {
  if (
    params.postStatus !== "ACTIVE" ||
    (params.claimStatus !== "REJECTED" && params.claimStatus !== "WITHDRAWN")
  ) {
    return false;
  }
  const attempts =
    typeof params.attemptCount === "number" ? params.attemptCount : 1;
  return attempts < LOST_FOUND_LIMITS.MAX_CLAIM_ATTEMPTS;
}

export type ClaimStatusTone = "amber" | "emerald" | "rose" | "slate";

export function getClaimStatusPresentation(status: LostFoundClaimStatus): {
  label: string;
  tone: ClaimStatusTone;
  description: string;
} {
  switch (status) {
    case "ACCEPTED":
      return {
        label: "Accepted • Verified",
        tone: "emerald",
        description:
          "Your claim was verified! Use the Safe Handover Card above to coordinate pickup.",
      };
    case "REJECTED":
      return {
        label: "Declined",
        tone: "rose",
        description: "This claim was not verified by the listing owner.",
      };
    case "WITHDRAWN":
      return {
        label: "Withdrawn",
        tone: "slate",
        description: "You withdrew this claim.",
      };
    case "PENDING":
    default:
      return {
        label: "Pending Review",
        tone: "amber",
        description:
          "The listing author will review your details and verify ownership.",
      };
  }
}

export function resolveLostFoundBackDestination(params: {
  canGoBack?: boolean;
  userRole?: string | null;
}): {
  action: "REPLACE";
  href: "/(tabs)/admin_campus_hubs" | "/(tabs)/forum";
  params: { section: "LOST_FOUND" };
} {
  // Root _layout uses <Slot />, so router.back() from outside (tabs) lands on
  // the initial Home tab instead of returning to the Campus Hub Lost & Found section.
  return {
    action: "REPLACE",
    href:
      params.userRole === "ADMIN"
        ? "/(tabs)/admin_campus_hubs"
        : "/(tabs)/forum",
    params: { section: "LOST_FOUND" },
  };
}
