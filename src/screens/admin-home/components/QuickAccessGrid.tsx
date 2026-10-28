import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const QUICK_ACCESS_ICONS = {
  manageStudents: require("@/assets/icons/user-management.png"),
  addRegistration: require("@/assets/icons/add-teacher.png"),
  postNotice: require("@/assets/icons/notice.png"),
  community: require("@/assets/icons/forum.png"),
  calendar: require("@/assets/icons/calendar.png"),
  systemMonitor: require("@/assets/icons/system-monitor.png"),
} as const;

export const QuickAccessGrid = React.memo(function QuickAccessGrid() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>QUICK ACCESS</Text>

      {/* Row 1: Manage Students & Add Registration */}
      <View style={styles.row}>
        {/* 1. Manage Students */}
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => router.push("/(tabs)/admin_users")}
          activeOpacity={0.75}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Manage Students: Student records and directory"
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#EFF6FF" }]}>
              <Image
                source={QUICK_ACCESS_ICONS.manageStudents}
                style={styles.iconImage}
                resizeMode="contain"
              />
            </View>
            <Feather name="arrow-right" size={18} color="#3B82F6" />
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>
            Manage Students
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={2}>
            {"Student records &\ndirectory"}
          </Text>
        </TouchableOpacity>

        {/* 2. Add Registration */}
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => router.push("/(tabs)/admin_add_teacher")}
          activeOpacity={0.75}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Add Registration: New faculty and students"
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#ECFDF5" }]}>
              <Image
                source={QUICK_ACCESS_ICONS.addRegistration}
                style={styles.iconImage}
                resizeMode="contain"
              />
            </View>
            <Feather name="arrow-right" size={18} color="#10B981" />
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>
            Add Registration
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={2}>
            New faculty & students
          </Text>
        </TouchableOpacity>
      </View>

      {/* Row 2: Post Notice & Community */}
      <View style={styles.row}>
        {/* 3. Post Notice */}
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => router.push("/(tabs)/notices")}
          activeOpacity={0.75}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Post Notice: Broadcast announcements"
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#FFFBEB" }]}>
              <Image
                source={QUICK_ACCESS_ICONS.postNotice}
                style={styles.iconImage}
                resizeMode="contain"
              />
            </View>
            <Feather name="arrow-right" size={18} color="#F59E0B" />
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>
            Post Notice
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={2}>
            Broadcast announcements
          </Text>
        </TouchableOpacity>

        {/* 4. Community */}
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => router.push("/(tabs)/community")}
          activeOpacity={0.75}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Community: Review campus forum"
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#FFF1F2" }]}>
              <Image
                source={QUICK_ACCESS_ICONS.community}
                style={styles.iconImage}
                resizeMode="contain"
              />
            </View>
            <Feather name="arrow-right" size={18} color="#E11D48" />
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>
            Community
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={2}>
            Review campus forum
          </Text>
        </TouchableOpacity>
      </View>

      {/* Wide Row 1: Academic Calendar */}
      <TouchableOpacity
        style={styles.wideCard}
        onPress={() => router.push("/(tabs)/admin_calendar")}
        activeOpacity={0.75}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Academic Calendar: Manage academic events and terms"
      >
        <View style={[styles.wideIconWrap, { backgroundColor: "#ECFDF5" }]}>
          <Image
            source={QUICK_ACCESS_ICONS.calendar}
            style={styles.wideIconImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.wideTextBlock}>
          <Text style={styles.wideTitle} numberOfLines={1}>
            Academic Calendar
          </Text>
          <Text style={styles.wideSubtitle} numberOfLines={1}>
            Manage academic events & terms
          </Text>
        </View>
        <Feather name="arrow-right" size={18} color="#94A3B8" />
      </TouchableOpacity>

      {/* Wide Row 2: System Monitor */}
      <TouchableOpacity
        style={styles.wideCard}
        onPress={() => router.push("/admin/system-monitor")}
        activeOpacity={0.75}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="System Monitor: Health, server logs and diagnostics"
      >
        <View style={[styles.wideIconWrap, { backgroundColor: "#EEF2FF" }]}>
          <Image
            source={QUICK_ACCESS_ICONS.systemMonitor}
            style={styles.wideIconImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.wideTextBlock}>
          <Text style={styles.wideTitle} numberOfLines={1}>
            System Monitor
          </Text>
          <Text style={styles.wideSubtitle} numberOfLines={1}>
            Health, server logs & diagnostics
          </Text>
        </View>
        <Feather name="arrow-right" size={18} color="#94A3B8" />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8E9BAE",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  gridCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 15,
    fontWeight: "500",
  },
  wideCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 12,
    gap: 12,
  },
  wideIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  wideTextBlock: {
    flex: 1,
  },
  wideTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  wideSubtitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  iconImage: {
    width: 22,
    height: 22,
  },
  wideIconImage: {
    width: 24,
    height: 24,
  },
});
