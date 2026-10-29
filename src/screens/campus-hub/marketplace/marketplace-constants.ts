import { Feather } from "@expo/vector-icons";
import type {
  MarketplaceCategory,
  ItemCondition,
} from "@/services/marketplace-service";

export interface CategoryItem {
  key: MarketplaceCategory;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  description: string;
}

export const MARKETPLACE_CATEGORIES: CategoryItem[] = [
  {
    key: "TEXTBOOKS",
    label: "Textbooks & Notes",
    icon: "book-open",
    description: "Course books, slides, guides & lecture notes",
  },
  {
    key: "ELECTRONICS",
    label: "Electronics & Gadgets",
    icon: "cpu",
    description: "Tablets, headphones, power banks & smart gadgets",
  },
  {
    key: "CALCULATORS",
    label: "Scientific Calculators",
    icon: "hash",
    description: "Casio FX series, scientific & graphing calculators",
  },
  {
    key: "COMPUTERS_ACCESSORIES",
    label: "Laptops & PC Parts",
    icon: "monitor",
    description: "Laptops, monitors, RAM, SSDs, keyboards & mice",
  },
  {
    key: "LAB_DRAWING_TOOLS",
    label: "Lab & Drawing Tools",
    icon: "pen-tool",
    description: "Drafting boards, T-squares, aprons & architecture tools",
  },
  {
    key: "STATIONERY",
    label: "Stationery & Supplies",
    icon: "edit-3",
    description: "Notebooks, geometry boxes, pens & art kits",
  },
  {
    key: "MOBILE_ACCESSORIES",
    label: "Phones & Accessories",
    icon: "smartphone",
    description: "Smartphones, chargers, cables, earbuds & cases",
  },
  {
    key: "CYCLES_VEHICLES",
    label: "Cycles & Transport",
    icon: "navigation",
    description: "Bicycles, locks, helmets & campus commute gear",
  },
  {
    key: "ROOM_HOSTEL_ESSENTIALS",
    label: "Hostel & Room Essentials",
    icon: "home",
    description: "Electric kettles, study lamps, bedsheets & fans",
  },
  {
    key: "FURNITURE",
    label: "Furniture & Desks",
    icon: "archive",
    description: "Study tables, chairs, bookshelves & organizers",
  },
  {
    key: "SPORTS_FITNESS",
    label: "Sports & Fitness",
    icon: "activity",
    description: "Cricket, football, badminton, gym gear & weights",
  },
  {
    key: "CLOTHING",
    label: "Clothing & Uniforms",
    icon: "tag",
    description: "Lab coats, university hoodies, jackets & fashion",
  },
  {
    key: "OTHER",
    label: "Other Campus Items",
    icon: "grid",
    description: "Miscellaneous student gear & daily campus items",
  },
];

export const MARKETPLACE_CATEGORY_LABELS: Record<MarketplaceCategory, string> = {
  TEXTBOOKS: "Textbooks & Notes",
  ELECTRONICS: "Electronics & Gadgets",
  CALCULATORS: "Scientific Calculators",
  COMPUTERS_ACCESSORIES: "Laptops & PC Parts",
  LAB_DRAWING_TOOLS: "Lab & Drawing Tools",
  STATIONERY: "Stationery & Supplies",
  MOBILE_ACCESSORIES: "Phones & Accessories",
  CYCLES_VEHICLES: "Cycles & Transport",
  ROOM_HOSTEL_ESSENTIALS: "Hostel & Room Essentials",
  FURNITURE: "Furniture & Desks",
  SPORTS_FITNESS: "Sports & Fitness",
  CLOTHING: "Clothing & Uniforms",
  OTHER: "Other Campus Items",
};

export const CONDITIONS: { key: ItemCondition; label: string; desc: string }[] = [
  { key: "NEW", label: "Brand New", desc: "Never used, in original packaging" },
  { key: "LIKE_NEW", label: "Like New", desc: "Minimal use, no flaws or scratches" },
  { key: "GOOD", label: "Good Condition", desc: "Works perfectly with light cosmetic wear" },
  { key: "FAIR", label: "Fair Condition", desc: "Functional with visible signs of wear" },
];

/**
 * Normalizes input string to a valid Bangladeshi phone number starting with +880
 * Example: "01956014045" -> "+8801956014045"
 *          "1956014045"  -> "+8801956014045"
 *          "+8801956014045" -> "+8801956014045"
 */
export function formatBangladeshiPhone(input: string): string {
  if (!input) return "+880";

  let cleaned = input.trim();

  // If user cleared everything, keep prefix
  if (cleaned.length === 0 || cleaned === "+") {
    return "+880";
  }

  // Strip non-digits
  let digits = cleaned.replace(/\D/g, "");

  // If starts with 880, strip the country code
  if (digits.startsWith("880")) {
    digits = digits.slice(3);
  }

  // If starts with 0 (e.g. 017..., 019...), strip the leading 0
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Cap at 10 digits (the 1 + 9 digits of a BD mobile number)
  return `+880${digits.slice(0, 10)}`;
}

export function isValidBangladeshiPhone(phone: string): boolean {
  if (!phone || phone.length !== 14) return false;
  // +880 followed by 1, then operator digit 3-9, then 8 digits
  return /^\+8801[3-9]\d{8}$/.test(phone);
}
