import { Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Href } from "expo-router";

export const BENTO_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  cardRadius: 24,
  pillRadius: 9999,
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  heroShadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
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

export interface MenuItemConfig {
  id: string;
  title: string;
  desc: string;
  category: "ACADEMIC" | "CAMPUS" | "SUPPORT" | "ADMIN";
  icon: keyof typeof Feather.glyphMap;
  roles: string[];
  route: Href;
  theme: {
    bg: string;
    badge: string;
    iconColor: string;
  };
}

export const CATEGORY_LABELS: Record<MenuCategoryKey, string> = {
  ALL: "All Services",
  ACADEMIC: "Academic",
  CAMPUS: "Campus Life",
  SUPPORT: "Support & Aid",
  ADMIN: "Admin Tools",
};

export const ALL_MENU_ITEMS: MenuItemConfig[] = [
  // Academic Services
  {
    id: "exam_routines",
    title: "Exam Routines",
    desc: "Mid & final exam timetable",
    category: "ACADEMIC",
    icon: "award",
    roles: ["STUDENT"],
    route: "/exams" as Href,
    theme: {
      bg: "#fefce8",
      badge: "#fde68a",
      iconColor: "#b45309",
    },
  },
  {
    id: "class_routines",
    title: "Class Routines",
    desc: "Weekly schedule & rooms",
    category: "ACADEMIC",
    icon: "clock",
    roles: ["STUDENT", "TEACHER"],
    route: "/(tabs)/my-schedule" as Href,
    theme: {
      bg: "#ecfdf5",
      badge: "#a7f3d0",
      iconColor: "#047857",
    },
  },
  {
    id: "academic_calendar",
    title: "Academic Calendar",
    desc: "Semester milestones & dates",
    category: "ACADEMIC",
    icon: "calendar",
    roles: ["STUDENT", "TEACHER"],
    route: "/academic_calendar" as Href,
    theme: {
      bg: "#f0f7ff",
      badge: "#c1dcff",
      iconColor: "#0284c7",
    },
  },
  {
    id: "course_eval",
    title: "Course Evaluation",
    desc: "Hub ratings & assessments",
    category: "ACADEMIC",
    icon: "star",
    roles: ["STUDENT"],
    route: "/(tabs)/hubs" as Href,
    theme: {
      bg: "#fefce8",
      badge: "#fde68a",
      iconColor: "#d97706",
    },
  },
  {
    id: "cgpa_calculator",
    title: "CGPA Calculator",
    desc: "Estimate semester results",
    category: "ACADEMIC",
    icon: "percent",
    roles: ["STUDENT"],
    route: "/cgpa-calculator" as Href,
    theme: {
      bg: "#ecfdf5",
      badge: "#a7f3d0",
      iconColor: "#047857",
    },
  },

  // Campus Life
  {
    id: "noticeboard",
    title: "Noticeboard",
    desc: "Official announcements",
    category: "CAMPUS",
    icon: "bell",
    roles: ["STUDENT", "TEACHER", "ADMIN"],
    route: "/(tabs)/notices" as Href,
    theme: {
      bg: "#fff1f2",
      badge: "#fecdd3",
      iconColor: "#be123c",
    },
  },
  {
    id: "bus_schedule",
    title: "Bus Schedule",
    desc: "Campus routes & timings",
    category: "CAMPUS",
    icon: "truck",
    roles: ["STUDENT", "TEACHER", "ADMIN"],
    route: "/bus-schedule" as Href,
    theme: {
      bg: "#f0f7ff",
      badge: "#bae6fd",
      iconColor: "#0369a1",
    },
  },
  {
    id: "campus_events",
    title: "Campus Events",
    desc: "Convocations & programs",
    category: "CAMPUS",
    icon: "activity",
    roles: ["STUDENT", "TEACHER", "ADMIN"],
    route: "/events" as Href,
    theme: {
      bg: "#ecfdf5",
      badge: "#a7f3d0",
      iconColor: "#059669",
    },
  },
  {
    id: "campus_forum",
    title: "Campus Forum",
    desc: "Discussions & student posts",
    category: "CAMPUS",
    icon: "message-circle",
    roles: ["STUDENT", "TEACHER", "ADMIN"],
    route: "/(tabs)/forum" as Href,
    theme: {
      bg: "#f0f7ff",
      badge: "#c1dcff",
      iconColor: "#0284c7",
    },
  },
  {
    id: "field_booking",
    title: "Book Field",
    desc: "Sports ground reservation",
    category: "CAMPUS",
    icon: "target",
    roles: ["STUDENT", "TEACHER"],
    route: "/field-booking" as Href,
    theme: {
      bg: "#ecfdf5",
      badge: "#a7f3d0",
      iconColor: "#047857",
    },
  },

  // Support & Aid
  {
    id: "blood_donation",
    title: "Blood Aid",
    desc: "Emergency donor requests",
    category: "SUPPORT",
    icon: "heart",
    roles: ["STUDENT", "TEACHER", "ADMIN"],
    route: "/(tabs)/blood" as Href,
    theme: {
      bg: "#fff1f2",
      badge: "#fecdd3",
      iconColor: "#dc2626",
    },
  },
  {
    id: "complaints",
    title: "Complaint Box",
    desc: "Report issues & feedback",
    category: "SUPPORT",
    icon: "alert-octagon",
    roles: ["STUDENT", "TEACHER"],
    route: "/complaints" as Href,
    theme: {
      bg: "#fff1f2",
      badge: "#fecdd3",
      iconColor: "#e11d48",
    },
  },
  {
    id: "alumni",
    title: "Alumni Network",
    desc: "Connect with graduates",
    category: "SUPPORT",
    icon: "users",
    roles: ["STUDENT", "TEACHER", "ADMIN"],
    route: "/alumni" as Href,
    theme: {
      bg: "#fefce8",
      badge: "#fde68a",
      iconColor: "#b45309",
    },
  },

  // Admin Management Controls
  {
    id: "admin_complaints",
    title: "Manage Complaints",
    desc: "Review student grievances",
    category: "ADMIN",
    icon: "inbox",
    roles: ["ADMIN"],
    route: "/admin/complaints" as Href,
    theme: {
      bg: "#fff1f2",
      badge: "#fecdd3",
      iconColor: "#be123c",
    },
  },
  {
    id: "admin_alumni",
    title: "Manage Alumni",
    desc: "Alumni directory controls",
    category: "ADMIN",
    icon: "database",
    roles: ["ADMIN"],
    route: "/admin/alumni" as Href,
    theme: {
      bg: "#fefce8",
      badge: "#fde68a",
      iconColor: "#b45309",
    },
  },
  {
    id: "admin_field_booking",
    title: "Field Requests",
    desc: "Review booking requests",
    category: "ADMIN",
    icon: "check-square",
    roles: ["ADMIN"],
    route: "/admin/field-booking" as Href,
    theme: {
      bg: "#ecfdf5",
      badge: "#a7f3d0",
      iconColor: "#047857",
    },
  },
  {
    id: "manage_forum",
    title: "Manage Forum",
    desc: "Moderation & announcements",
    category: "ADMIN",
    icon: "message-square",
    roles: ["ADMIN"],
    route: "/admin/forum" as Href,
    theme: {
      bg: "#f0f7ff",
      badge: "#c1dcff",
      iconColor: "#0284c7",
    },
  },
  {
    id: "manage_buses",
    title: "Manage Buses",
    desc: "Fleet routes & scheduling",
    category: "ADMIN",
    icon: "map",
    roles: ["ADMIN"],
    route: "/admin-bus-manage" as Href,
    theme: {
      bg: "#f0f7ff",
      badge: "#bae6fd",
      iconColor: "#0369a1",
    },
  },
  {
    id: "upload_notice",
    title: "Upload Notice",
    desc: "Publish official notices",
    category: "ADMIN",
    icon: "upload-cloud",
    roles: ["ADMIN"],
    route: "/admin/notices" as Href,
    theme: {
      bg: "#fff1f2",
      badge: "#fecdd3",
      iconColor: "#be123c",
    },
  },
  {
    id: "manage_blood",
    title: "Manage Blood",
    desc: "Moderate donor posts",
    category: "ADMIN",
    icon: "droplet",
    roles: ["ADMIN"],
    route: "/admin/blood" as Href,
    theme: {
      bg: "#fff1f2",
      badge: "#fecdd3",
      iconColor: "#dc2626",
    },
  },
  {
    id: "upload_event",
    title: "Event Schedule",
    desc: "Add & edit campus events",
    category: "ADMIN",
    icon: "calendar",
    roles: ["ADMIN"],
    route: "/admin/events" as Href,
    theme: {
      bg: "#ecfdf5",
      badge: "#a7f3d0",
      iconColor: "#047857",
    },
  },
  {
    id: "manage_calendar",
    title: "Academic Calendar",
    desc: "Term dates & holidays",
    category: "ADMIN",
    icon: "calendar",
    roles: ["ADMIN"],
    route: "/admin/calendar" as Href,
    theme: {
      bg: "#f0f7ff",
      badge: "#c1dcff",
      iconColor: "#0284c7",
    },
  },
];
