import type {
  ItemCondition,
  ListingStatus,
  ListingType,
  MarketplaceCategory,
} from "@/services/marketplace-service";

export const MARKETPLACE_LIMITS = {
  MIN_TITLE: 2,
  MAX_TITLE: 150,
  MIN_DESCRIPTION_PLAIN: 5,
  MAX_DESCRIPTION_PLAIN: 3000,
  MAX_DESCRIPTION_HTML: 12000,
  MIN_COMMENT: 1,
  MAX_COMMENT: 1000,
  MAX_PRICE: 10000000,
  MAX_IMAGES: 4,
  MAX_IMAGE_BYTES: 5 * 1024 * 1024,
} as const;

const BD_PHONE_REGEX = /^\+8801[3-9]\d{8}$/;

export function extractMarketplacePlainText(
  html?: string | null,
): string {
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

export function normalizeBangladeshiPhoneInput(raw: string): string {
  const digits = (raw ?? "").replace(/[^\d+]/g, "");
  if (!digits) return "";
  if (digits.startsWith("+880")) {
    return digits.slice(0, 14);
  }
  if (digits.startsWith("880")) {
    return `+${digits}`.slice(0, 14);
  }
  if (digits.startsWith("0")) {
    return `+88${digits}`.slice(0, 14);
  }
  if (digits.startsWith("1")) {
    return `+880${digits}`.slice(0, 14);
  }
  return digits.slice(0, 14);
}

export interface MarketplaceFormInput {
  type: ListingType;
  title: string;
  description: string;
  price?: string | number | null;
  category: MarketplaceCategory;
  condition?: ItemCondition | null;
  contactPhone: string;
  images?: string[];
}

export interface SanitizedMarketplaceForm {
  type: ListingType;
  title: string;
  description: string;
  price: number;
  category: MarketplaceCategory;
  condition: ItemCondition | null;
  contactPhone: string;
  images: string[];
}

export function validateMarketplaceForm(
  input: MarketplaceFormInput,
): { error?: string; payload?: SanitizedMarketplaceForm } {
  const title = extractMarketplacePlainText(input.title)
    .replace(/\s+/g, " ")
    .trim();

  if (title.length < MARKETPLACE_LIMITS.MIN_TITLE) {
    return {
      error: `Title must be at least ${MARKETPLACE_LIMITS.MIN_TITLE} characters.`,
    };
  }
  if (title.length > MARKETPLACE_LIMITS.MAX_TITLE) {
    return {
      error: `Title cannot exceed ${MARKETPLACE_LIMITS.MAX_TITLE} characters.`,
    };
  }

  const description = (input.description ?? "").trim();
  const plainDescription = extractMarketplacePlainText(description);
  if (plainDescription.length < MARKETPLACE_LIMITS.MIN_DESCRIPTION_PLAIN) {
    return {
      error: `Description must contain at least ${MARKETPLACE_LIMITS.MIN_DESCRIPTION_PLAIN} characters of readable details.`,
    };
  }
  if (plainDescription.length > MARKETPLACE_LIMITS.MAX_DESCRIPTION_PLAIN) {
    return {
      error: `Description cannot exceed ${MARKETPLACE_LIMITS.MAX_DESCRIPTION_PLAIN.toLocaleString()} characters.`,
    };
  }
  if (description.length > MARKETPLACE_LIMITS.MAX_DESCRIPTION_HTML) {
    return {
      error: "Description formatting exceeds maximum allowed size.",
    };
  }

  let parsedPrice = 0;
  if (
    input.price !== undefined &&
    input.price !== null &&
    String(input.price).trim() !== ""
  ) {
    parsedPrice = Number(String(input.price).trim());
    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0 ||
      parsedPrice > MARKETPLACE_LIMITS.MAX_PRICE
    ) {
      return {
        error: "Enter a valid non-negative price up to ৳10,000,000.",
      };
    }
  }

  const normalizedPhone = normalizeBangladeshiPhoneInput(input.contactPhone);
  if (!BD_PHONE_REGEX.test(normalizedPhone)) {
    return {
      error:
        "Enter a valid Bangladeshi phone number (e.g. +8801712345678).",
    };
  }

  const images = Array.isArray(input.images)
    ? input.images.slice(0, MARKETPLACE_LIMITS.MAX_IMAGES)
    : [];

  return {
    payload: {
      type: input.type,
      title,
      description,
      price: parsedPrice,
      category: input.category,
      condition: input.type === "SELLING" ? (input.condition ?? "GOOD") : null,
      contactPhone: normalizedPhone,
      images,
    },
  };
}

export function validateMarketplaceComment(rawContent: string): {
  error?: string;
  content?: string;
} {
  const content = (rawContent ?? "").trim();
  if (content.length < MARKETPLACE_LIMITS.MIN_COMMENT) {
    return { error: "Please write a comment before sending." };
  }
  if (content.length > MARKETPLACE_LIMITS.MAX_COMMENT) {
    return {
      error: `Comment cannot exceed ${MARKETPLACE_LIMITS.MAX_COMMENT} characters.`,
    };
  }
  return { content };
}

export function clampImageIndex(index: number, imageCount: number): number {
  if (imageCount <= 0) return 0;
  return Math.min(Math.max(0, Math.floor(index)), imageCount - 1);
}

export function getMarketplaceStatusBadgeText(
  status: ListingStatus,
  type: ListingType,
): string {
  if (status === "SOLD") {
    return type === "SELLING" ? "Sold" : "Fulfilled";
  }
  if (status === "CLOSED") {
    return "Closed";
  }
  return type === "SELLING" ? "For Sale" : "Wanted";
}

export function resolveMarketplaceBackDestination(params: {
  userRole?: string | null;
}): {
  action: "REPLACE";
  href: "/(tabs)/admin_campus_hubs" | "/(tabs)/forum";
  params: { section: "MARKETPLACE" };
} {
  return {
    action: "REPLACE",
    href:
      params.userRole === "ADMIN"
        ? "/(tabs)/admin_campus_hubs"
        : "/(tabs)/forum",
    params: { section: "MARKETPLACE" },
  };
}

export function resolveMarketplaceErrorState(params: {
  err: unknown;
  isOffline: boolean;
}): "offline" | "notFound" | "generic" {
  const e = params.err as {
    response?: { status?: number };
    code?: string;
  } | null;
  const status = e?.response?.status;
  if (status === 404) return "notFound";
  if (params.isOffline || !status || e?.code === "ECONNABORTED") {
    return "offline";
  }
  return "generic";
}
