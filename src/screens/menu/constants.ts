import { Platform, ImageSourcePropType } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Href } from "expo-router";

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const BENTO_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  mutedText: "#94a3b8",
  cardRadius: 22,
  heroRadius: 24,
  pillRadius: 9999,
  subtleBorder: "rgba(19, 27, 46, 0.06)",
  shadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  heroShadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 6,
  },
} as const;

export const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export type MenuCategoryKey = "ALL" | "ACADEMIC" | "CAMPUS" | "SUPPORT" | "ADMIN";

export interface CategoryTheme {
  label: string;
  badgeBg: string;
  badgeBorder: string;
  accentText: string;
  tagBg: string;
  tagText: string;
}

export const CATEGORY_THEMES: Record<Exclude<MenuCategoryKey, "ALL">, CategoryTheme> = {
  ACADEMIC: {
    label: "Academic",
    badgeBg: "#eff6ff",
    badgeBorder: "rgba(37, 99, 235, 0.12)",
    accentText: "#1d4ed8",
    tagBg: "#dbeafe",
    tagText: "#1e40af",
  },
  CAMPUS: {
    label: "Campus Life",
    badgeBg: "#ecfdf5",
    badgeBorder: "rgba(5, 150, 105, 0.12)",
    accentText: "#047857",
    tagBg: "#d1fae5",
    tagText: "#065f46",
  },
  SUPPORT: {
    label: "Support & Aid",
    badgeBg: "#fff1f2",
    badgeBorder: "rgba(225, 29, 72, 0.12)",
    accentText: "#be123c",
    tagBg: "#ffe4e6",
    tagText: "#9f1239",
  },
  ADMIN: {
    label: "Admin Tools",
    badgeBg: "#f5f3ff",
    badgeBorder: "rgba(124, 58, 237, 0.12)",
    accentText: "#6d28d9",
    tagBg: "#ede9fe",
    tagText: "#5b21b6",
  },
};

export interface MenuItemConfig {
  id: string;
  title: string;
  desc: string;
  category: "ACADEMIC" | "CAMPUS" | "SUPPORT" | "ADMIN";
  assetIcon: ImageSourcePropType;
  fallbackIcon: keyof typeof Feather.glyphMap;
  roles: string[];
  route: Href;
}

export const CATEGORY_LABELS: Record<MenuCategoryKey, string> = {
  ALL: "All Services",
  ACADEMIC: "Academic",
  CAMPUS: "Campus Life",
  SUPPORT: "Support & Aid",
  ADMIN: "Admin Tools",
};

export const ALL_MENU_ITEMS: MenuItemConfig[] = [
  // -------------------------------------------------------------
  // Academic Services (5 Features)
  // -------------------------------------------------------------
  {
    id: "exam_routines",
    title: "Exam Routines",
    desc: "Mid & final exam timetable",
    category: "ACADEMIC",
    assetIcon: require("@/assets/icons/exam-time.png"),
    fallbackIcon: "award",
    roles: ["STUDENT"],
    route: "/exams" as Href,
  },
  {
    id: "class_routines",
    title: "Class Routines",
    desc: "Weekly schedule & room guides",
    category: "ACADEMIC",
    assetIcon: require("@/assets/icons/program.png"),
    fallbackIcon: "clock",
    roles: ["STUDENT", "TEACHER"],
    route: "/(tabs)/my-schedule" as Href,
  },
  {
    id: "academic_calendar",
    title: "Academic Calendar",
    desc: "Semester milestones & dates",
    category: "ACADEMIC",
    assetIcon: require("@/assets/icons/calendar.png"),
    fallbackIcon: "calendar",
    roles: ["STUDENT", "TEACHER"],
    route: "/academic_calendar" as Href,
  },
  {
    id: "course_eval",
    title: "Course Hub",
    desc: "Hub ratings & assessments",
    category: "ACADEMIC",
    assetIcon: require("@/assets/icons/lecture.png"),
    fallbackIcon: "star",
    roles: ["STUDENT"],
    route: "/(tabs)/hubs" as Href,
  },
  {
    id: "cgpa_calculator",
    title: "CGPA Calculator",
    desc: "Estimate semester results",
    category: "ACADEMIC",
    assetIcon: require("@/assets/icons/grades.png"),
    fallbackIcon: "percent",
    roles: ["STUDENT"],
    route: "/cgpa-calculator" as Href,
  },

  // -------------------------------------------------------------
  // Campus Life (5 Features)
  // -------------------------------------------------------------
  {
    id: "noticeboard",
    title: "Noticeboard",
    desc: "Official announcements",
    category: "CAMPUS",
    assetIcon: require("@/assets/icons/notice.png"),
    fallbackIcon: "bell",
    roles: ["STUDENT", "TEACHER", "ADMIN"],
    route: "/(tabs)/notices" as Href,
  },
  {
    id: "bus_schedule",
    title: "Bus Schedule",
    desc: "Campus routes & timings",
    category: "CAMPUS",
    assetIcon: require("@/assets/icons/bus.png"),
    fallbackIcon: "truck",
    roles: ["STUDENT", "TEACHER", "ADMIN"],
    route: "/bus-schedule" as Href,
  },
  {
    id: "campus_events",
    title: "Campus Events",
    desc: "Convocations & programs",
    category: "CAMPUS",
    assetIcon: require("@/assets/icons/event-list.png"),
    fallbackIcon: "activity",
    roles: ["STUDENT", "TEACHER", "ADMIN"],
    route: "/events" as Href,
  },
  {
    id: "campus_forum",
    title: "Campus Forum",
    desc: "Discussions & student posts",
    category: "CAMPUS",
    assetIcon: require("@/assets/icons/forum.png"),
    fallbackIcon: "message-circle",
    roles: ["STUDENT", "TEACHER", "ADMIN"],
    route: "/(tabs)/forum" as Href,
  },
  {
    id: "field_booking",
    title: "Book Field",
    desc: "Sports ground reservation",
    category: "CAMPUS",
    assetIcon: require("@/assets/icons/soccer-field.png"),
    fallbackIcon: "target",
    roles: ["STUDENT", "TEACHER"],
    route: "/field-booking" as Href,
  },

  // -------------------------------------------------------------
  // Support & Aid (3 Features)
  // -------------------------------------------------------------
  {
    id: "blood_donation",
    title: "Blood Aid",
    desc: "Emergency donor requests",
    category: "SUPPORT",
    assetIcon: require("@/assets/icons/blood-bag.png"),
    fallbackIcon: "heart",
    roles: ["STUDENT", "TEACHER", "ADMIN"],
    route: "/(tabs)/blood" as Href,
  },
  {
    id: "complaints",
    title: "Complaint Box",
    desc: "Report issues & feedback",
    category: "SUPPORT",
    assetIcon: require("@/assets/icons/complain.png"),
    fallbackIcon: "alert-octagon",
    roles: ["STUDENT", "TEACHER"],
    route: "/complaints" as Href,
  },
  {
    id: "alumni",
    title: "Alumni Network",
    desc: "Connect with graduates",
    category: "SUPPORT",
    assetIcon: require("@/assets/icons/alumni.png"),
    fallbackIcon: "users",
    roles: ["STUDENT", "TEACHER", "ADMIN"],
    route: "/alumni" as Href,
  },

  // -------------------------------------------------------------
  // Admin Management Controls (Admin Role Only)
  // -------------------------------------------------------------
  {
    id: "admin_complaints",
    title: "Manage Complaints",
    desc: "Review student grievances",
    category: "ADMIN",
    assetIcon: require("@/assets/icons/complain.png"),
    fallbackIcon: "inbox",
    roles: ["ADMIN"],
    route: "/admin/complaints" as Href,
  },
  {
    id: "admin_alumni",
    title: "Manage Alumni",
    desc: "Alumni directory controls",
    category: "ADMIN",
    assetIcon: require("@/assets/icons/alumni.png"),
    fallbackIcon: "database",
    roles: ["ADMIN"],
    route: "/admin/alumni" as Href,
  },
  {
    id: "admin_field_booking",
    title: "Field Requests",
    desc: "Review booking requests",
    category: "ADMIN",
    assetIcon: require("@/assets/icons/soccer-field.png"),
    fallbackIcon: "check-square",
    roles: ["ADMIN"],
    route: "/admin/field-booking" as Href,
  },
  {
    id: "manage_forum",
    title: "Manage Forum",
    desc: "Moderation & announcements",
    category: "ADMIN",
    assetIcon: require("@/assets/icons/forum.png"),
    fallbackIcon: "message-square",
    roles: ["ADMIN"],
    route: "/admin/forum" as Href,
  },
  {
    id: "manage_buses",
    title: "Manage Buses",
    desc: "Fleet routes & scheduling",
    category: "ADMIN",
    assetIcon: require("@/assets/icons/bus.png"),
    fallbackIcon: "map",
    roles: ["ADMIN"],
    route: "/admin-bus-manage" as Href,
  },
  {
    id: "upload_notice",
    title: "Upload Notice",
    desc: "Publish official notices",
    category: "ADMIN",
    assetIcon: require("@/assets/icons/notice.png"),
    fallbackIcon: "upload-cloud",
    roles: ["ADMIN"],
    route: "/admin/notices" as Href,
  },
  {
    id: "manage_blood",
    title: "Manage Blood",
    desc: "Moderate donor posts",
    category: "ADMIN",
    assetIcon: require("@/assets/icons/blood-bag.png"),
    fallbackIcon: "droplet",
    roles: ["ADMIN"],
    route: "/admin/blood" as Href,
  },
  {
    id: "upload_event",
    title: "Event Schedule",
    desc: "Add & edit campus events",
    category: "ADMIN",
    assetIcon: require("@/assets/icons/event-list.png"),
    fallbackIcon: "calendar",
    roles: ["ADMIN"],
    route: "/admin/events" as Href,
  },
  {
    id: "manage_calendar",
    title: "Admin Calendar",
    desc: "Term dates & holidays",
    category: "ADMIN",
    assetIcon: require("@/assets/icons/calendar.png"),
    fallbackIcon: "calendar",
    roles: ["ADMIN"],
    route: "/admin_calendar" as Href,
  },
];
