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

export const MARKETPLACE_CATEGORY_LABELS = Object.fromEntries(
  MARKETPLACE_CATEGORIES.map((category) => [category.key, category.label]),
) as Record<MarketplaceCategory, string>;

export const CONDITIONS: { key: ItemCondition; label: string; desc: string }[] = [
  { key: "NEW", label: "Brand New", desc: "Never used, in original packaging" },
  { key: "LIKE_NEW", label: "Like New", desc: "Minimal use, no flaws or scratches" },
  { key: "GOOD", label: "Good Condition", desc: "Works perfectly with light cosmetic wear" },
  { key: "FAIR", label: "Fair Condition", desc: "Functional with visible signs of wear" },
];

export const MARKETPLACE_CONDITION_LABELS = Object.fromEntries(
  CONDITIONS.map((condition) => [condition.key, condition.label]),
) as Record<ItemCondition, string>;
