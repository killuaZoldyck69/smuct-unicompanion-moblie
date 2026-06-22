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

// Helper to convert "10:30 AM" to minutes for chronological sorting
const timeToMinutes = (timeStr: string) => {
  if (!timeStr || timeStr === "TBA") return 0;
  try {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    let h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    if (h === 12 && modifier?.toUpperCase() === "AM") h = 0;
    if (h !== 12 && modifier?.toUpperCase() === "PM") h += 12;

    return h * 60 + m;
  } catch (e) {
    return 0;
  }
};

export default function ExamRoutineScreen() {
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

  // Parse and group the exam data chronologically
  const examSections = useMemo(() => {
    if (!myHubs || myHubs.length === 0) return [];

    const allExams: any[] = [];

    // 1. Extract all exams from active hubs
    myHubs.forEach((membership: any) => {
      const hub = membership.hub;
      if (!hub || hub.isArchived) return;

      let examsArray = hub.termExams;

      // Handle cases where Postgres returns it as a stringified JSON vs an Object array
      if (typeof examsArray === "string") {
        try {
          examsArray = JSON.parse(examsArray);
        } catch (e) {
          examsArray = [];
        }
      }

      if (Array.isArray(examsArray)) {
        examsArray.forEach((exam: any) => {
          if (exam.date) {
            allExams.push({
              id: `${hub.id}-${exam.type}`,
              courseCode: hub.courseCode,
              courseName: hub.courseName,
              type: exam.type, // "Midterm" or "Final"
              date: exam.date, // "YYYY-MM-DD"
              time: exam.time || "TBA",
              room: exam.room || "TBA",
              sortDate: new Date(`${exam.date}T00:00:00`).getTime(),
              sortTime: timeToMinutes(exam.time),
            });
          }
        });
      }
    });

    // 2. Sort all exams globally by Date
    allExams.sort((a, b) => a.sortDate - b.sortDate);

    // 3. Group by the formatted date string
    const groupedMap = new Map<string, any[]>();

    allExams.forEach((exam) => {
      // Create a readable header (e.g., "Monday, June 25, 2026")
      const formattedDate = new Date(exam.sortDate).toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        },
      );

      if (!groupedMap.has(formattedDate)) {
        groupedMap.set(formattedDate, []);
      }
      groupedMap.get(formattedDate)!.push(exam);
    });

    // 4. Convert map to SectionList array format and sort items within each day by Time
    return Array.from(groupedMap, ([title, data]) => ({
      title,
      data: data.sort((a, b) => a.sortTime - b.sortTime),
    }));
  }, [myHubs]);

  // --- UI Renderers ---
  const renderExamCard = ({ item, index, section }: any) => {
    const isLast = index === section.data.length - 1;
    const isFinal = item.type?.toLowerCase() === "final";

    return (
      <View style={[styles.card, isLast && { marginBottom: spacing.stackLg }]}>
        {/* Left Side: Time Column */}
        <View style={styles.timeColumn}>
          <Text style={styles.timeTextBig}>{item.time}</Text>
          <View style={[styles.typeBadge, isFinal && styles.typeBadgeFinal]}>
            <Text
              style={[
                styles.typeBadgeText,
                isFinal && styles.typeBadgeTextFinal,
              ]}
            >
              {item.type}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Right Side: Info Column */}
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
            <Text style={styles.roomText}>Room: {item.room}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section: { title } }: any) => {
    // Check if the exam date is today
    const todayStr = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const isToday = todayStr === title;

    return (
      <View style={styles.sectionHeaderBox}>
        <Text style={[styles.sectionTitle, isToday && { color: colors.error }]}>
          {title} {isToday && " (Today!)"}
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
          <Text style={styles.headerTitle}>Exam Routines</Text>
          <Text style={styles.headerSubtitle}>Upcoming Midterms & Finals</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
        </View>
      ) : isError || examSections.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="file-text"
            size={48}
            color={colors.surfaceContainerHighest}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>No Exams Scheduled</Text>
          <Text style={styles.emptyDesc}>
            Your instructors have not published any exam dates yet.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={examSections}
          keyExtractor={(item) => item.id}
          renderItem={renderExamCard}
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
    width: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  timeTextBig: {
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  typeBadge: {
    backgroundColor: colors.primaryContainer + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeBadgeText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: "800",
    fontSize: 10,
    textTransform: "uppercase",
  },
  typeBadgeFinal: {
    backgroundColor: colors.errorContainer,
  },
  typeBadgeTextFinal: {
    color: colors.error,
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
