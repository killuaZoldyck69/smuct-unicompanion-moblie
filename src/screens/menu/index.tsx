import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, Href } from "expo-router";
import { useCurrentUser } from "@/hooks/use-current-user";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { spacing, rounded, shadows } from "@/theme/layout";

const MENU_ITEMS = [
  // --- Student Specific ---
  {
    id: "exam_routines",
    title: "Exam Routines",
    icon: "file-text",
    roles: ["STUDENT"],
    route: "/exams",
  },
  {
    id: "complaints",
    title: "Complaint Box",
    icon: "message-square",
    roles: ["STUDENT"],
    route: "/complaints",
  },
  {
    id: "course_eval",
    title: "Course Evaluation",
    icon: "star",
    roles: ["STUDENT"],
    route: "/(tabs)/hubs",
  },

  // --- Student & Teacher Shared ---
  {
    id: "class_routines",
    title: "Class Routines",
    icon: "clock",
    roles: ["STUDENT", "TEACHER"],
    route: "/my-schedule",
  },
  {
    id: "academic_calendar",
    title: "Academic Calendar",
    icon: "calendar",
    roles: ["STUDENT", "TEACHER"],
    route: "/academic_calendar",
  },
  {
    id: "bus_schedule",
    title: "Bus Schedule",
    icon: "truck",
    roles: ["STUDENT", "TEACHER", "ADMIN"],
    route: "/bus-schedule",
  },
  {
    id: "campus_forum",
    title: "Campus Forum",
    icon: "message-circle",
    roles: ["STUDENT", "TEACHER", "ADMIN"],
    route: "/(tabs)/forum",
  },
  {
    id: "campus_events",
    title: "Campus Events",
    icon: "calendar",
    roles: ["STUDENT", "TEACHER", "ADMIN"],
    route: "/events",
  },
  {
    id: "help_complaints",
    title: "Help & Complaints",
    icon: "alert-octagon",
    roles: ["STUDENT", "TEACHER"],
    route: "/complaints",
  },
  {
    id: "alumni",
    title: "Alumni Network",
    icon: "award",
    roles: ["STUDENT", "TEACHER", "ADMIN"],
    route: "/alumni",
  },
  {
    id: "field_booking",
    title: "Book Field",
    icon: "target",
    roles: ["STUDENT", "TEACHER"],
    route: "/field-booking",
  },

  // --- ADMIN MANAGEMENT FEATURES ---
  {
    id: "admin_complaints",
    title: "Manage Complaints",
    icon: "inbox",
    roles: ["ADMIN"],
    route: "/admin/complaints",
  },
  {
    id: "admin_alumni",
    title: "Manage Alumni",
    icon: "database",
    roles: ["ADMIN"],
    route: "/admin/alumni",
  },
  {
    id: "admin_field_booking",
    title: "Field Requests",
    icon: "calendar",
    roles: ["ADMIN"],
    route: "/admin/field-booking",
  },
  {
    id: "manage_forum",
    title: "Manage Forum",
    icon: "message-square",
    roles: ["ADMIN"],
    route: "/admin/forum",
  },
  {
    id: "manage_buses",
    title: "Manage Buses",
    icon: "map",
    roles: ["ADMIN"],
    route: "/admin-bus-manage",
  },
  {
    id: "upload_notice",
    title: "Upload Notice",
    icon: "upload-cloud",
    roles: ["ADMIN"],
    route: "/admin/notices",
  },
  {
    id: "manage_blood",
    title: "Manage Blood Posts",
    icon: "droplet",
    roles: ["ADMIN"],
    route: "/admin/blood",
  },
  {
    id: "upload_event",
    title: "Event Schedule",
    icon: "calendar",
    roles: ["ADMIN"],
    route: "/admin/events",
  },
  {
    id: "manage_calendar",
    title: "Academic Calendar",
    icon: "calendar",
    roles: ["ADMIN"],
    route: "/admin/calendar",
  },
];

export function Menu() {
  const router = useRouter();
  const { role: userRole } = useCurrentUser();

  const accessibleMenuItems = MENU_ITEMS.filter((item) =>
    item.roles.includes(userRole || "STUDENT"),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Features</Text>
        <Text style={styles.headerSubtitle}>
          {userRole === "ADMIN"
            ? "Admin Controls"
            : userRole === "TEACHER"
              ? "Faculty Tools"
              : "Student Services"}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {accessibleMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridItem}
              onPress={() => router.push(item.route as Href)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={item.title}
            >
              <View style={styles.iconContainer}>
                <Feather
                  name={item.icon as any}
                  size={28}
                  color={colors.primaryContainer}
                />
              </View>
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.stackLg,
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  headerTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  headerSubtitle: {
    ...typography.bodyMd,
    color: colors.outline,
    marginTop: 2,
  },
  scrollContent: {
    padding: spacing.marginMobile,
    paddingBottom: spacing.sectionBreak * 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.stackMd,
  },
  gridItem: {
    width: "48%",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.lg,
    padding: spacing.stackLg,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.level1,
    marginBottom: spacing.stackSm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: rounded.full,
    backgroundColor: "#F0F4F8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.stackMd,
  },
  itemTitle: {
    ...typography.labelMd,
    color: colors.onSurface,
    textAlign: "center",
  },
});
