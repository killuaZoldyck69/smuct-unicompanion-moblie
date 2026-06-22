import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import api from "../src/services/api";
import { colors } from "../src/theme/colors";
import { typography } from "../src/theme/typography";
import { spacing, rounded, shadows } from "../src/theme/layout";

// Define the correct order of days
const DAYS_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Helper to convert "10:30 AM" to minutes for chronological sorting
const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  try {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    let h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    if (h === 12 && modifier.toUpperCase() === "AM") h = 0;
    if (h !== 12 && modifier.toUpperCase() === "PM") h += 12;

    return h * 60 + m;
  } catch (e) {
    return 0;
  }
};

export default function MyScheduleScreen() {
  const router = useRouter();

  // Fetch my joined hubs
  const {
    data: myHubs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["myHubs"],
    queryFn: async () => {
      const response = await api.get("/hubs/my");
      return response.data?.data || [];
    },
  });

  // Parse and group the schedule data chronologically
  const scheduleSections = useMemo(() => {
    if (!myHubs || myHubs.length === 0) return [];

    const allClasses: any[] = [];

    // 1. Extract all classes from active hubs
    myHubs.forEach((membership: any) => {
      const hub = membership.hub;
      if (!hub || hub.isArchived) return;

      let scheduleArray = hub.weeklyClassSchedule;

      // Handle cases where Postgres returns it as a stringified JSON vs an Object array
      if (typeof scheduleArray === "string") {
        try {
          scheduleArray = JSON.parse(scheduleArray);
        } catch (e) {
          scheduleArray = [];
        }
      }

      if (Array.isArray(scheduleArray)) {
        scheduleArray.forEach((session: any) => {
          allClasses.push({
            id: `${hub.id}-${session.day}-${session.startTime}`,
            courseCode: hub.courseCode,
            courseName: hub.courseName,
            day: session.day,
            startTime: session.startTime,
            endTime: session.endTime,
            room: session.room,
            sortValue: timeToMinutes(session.startTime), // Numeric value for sorting
          });
        });
      }
    });

    // 2. Group by day and sort chronologically
    const grouped = DAYS_ORDER.map((day) => {
      const classesForDay = allClasses
        .filter((c) => c.day === day)
        .sort((a, b) => a.sortValue - b.sortValue);

      return {
        title: day,
        data: classesForDay,
      };
    }).filter((group) => group.data.length > 0); // Remove empty days

    return grouped;
  }, [myHubs]);

  // --- UI Renderers ---
  const renderClassCard = ({ item, index, section }: any) => {
    const isLast = index === section.data.length - 1;

    return (
      <View style={[styles.card, isLast && { marginBottom: spacing.stackLg }]}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeTextBig}>{item.startTime}</Text>
          <Text style={styles.timeTextSmall}>to {item.endTime}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoColumn}>
          <Text style={styles.courseCode}>{item.courseCode}</Text>
          <Text style={styles.courseName} numberOfLines={2}>
            {item.courseName}
          </Text>
          <View style={styles.roomRow}>
            <Feather
              name="map-pin"
              size={12}
              color={colors.outline}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.roomText}>Room: {item.room || "TBA"}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section: { title } }: any) => {
    const isToday =
      new Date().toLocaleDateString("en-US", { weekday: "long" }) === title;

    return (
      <View style={styles.sectionHeaderBox}>
        <Text
          style={[styles.sectionTitle, isToday && { color: colors.primary }]}
        >
          {title} {isToday && "(Today)"}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>My Schedule</Text>
          <Text style={styles.headerSubtitle}>Weekly Class Routine</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
        </View>
      ) : isError || scheduleSections.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="calendar"
            size={48}
            color={colors.surfaceContainerHighest}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>No Classes Found</Text>
          <Text style={styles.emptyDesc}>
            Join course hubs to automatically generate your weekly schedule.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={scheduleSections}
          keyExtractor={(item) => item.id}
          renderItem={renderClassCard}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  backButton: { marginRight: spacing.stackMd, padding: spacing.stackSm },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  headerSubtitle: { ...typography.bodyMd, color: colors.outline, marginTop: 2 },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.marginMobile,
  },
  emptyTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    marginBottom: spacing.stackSm,
  },
  emptyDesc: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: "center",
  },

  listContent: { padding: spacing.marginMobile, paddingBottom: 60 },

  sectionHeaderBox: {
    marginTop: spacing.stackLg,
    marginBottom: spacing.stackMd,
    paddingVertical: 4,
  },
  sectionTitle: {
    ...typography.titleLg,
    fontWeight: "800",
    color: colors.onSurface,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  card: {
    flexDirection: "row",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    marginBottom: spacing.stackMd,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },
  timeColumn: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  timeTextBig: {
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: "800",
  },
  timeTextSmall: {
    ...typography.labelSm,
    color: colors.outline,
    marginTop: 4,
  },
  divider: {
    width: 1,
    backgroundColor: colors.surfaceContainerHighest,
    marginHorizontal: spacing.stackLg,
  },
  infoColumn: {
    flex: 1,
    justifyContent: "center",
  },
  courseCode: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "800",
    marginBottom: 4,
  },
  courseName: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 8,
  },
  roomRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  roomText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontWeight: "700",
  },
});
