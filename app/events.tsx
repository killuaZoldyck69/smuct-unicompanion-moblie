import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import api from "../src/services/api";
import { colors } from "../src/theme/colors";
import { typography } from "../src/theme/typography";
import { spacing, rounded, shadows } from "../src/theme/layout";

type TabType = "today" | "upcoming" | "past";

export default function CampusEventsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("today");

  // Fetch Events Data
  const {
    data: events,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["campusEvents"],
    queryFn: async () => {
      const response = await api.get("/events");
      return response.data?.data || [];
    },
  });

  // --- Filtering Logic ---
  const filteredEvents = React.useMemo(() => {
    if (!events) return [];

    const now = new Date();
    // Get start of today (12:00:00 AM) and end of today (11:59:59 PM)
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    ).getTime();

    return events.filter((e: any) => {
      const eventTime = new Date(e.eventDate).getTime();

      if (activeTab === "today") {
        return eventTime >= todayStart && eventTime <= todayEnd;
      } else if (activeTab === "upcoming") {
        return eventTime > todayEnd;
      } else if (activeTab === "past") {
        return eventTime < todayStart;
      }
      return false;
    });
  }, [events, activeTab]);

  // --- Render Event Card ---
  const renderEventCard = ({ item }: { item: any }) => {
    const eventDate = new Date(item.eventDate);
    const month = eventDate
      .toLocaleString("en-US", { month: "short" })
      .toUpperCase();
    const day = eventDate.getDate().toString().padStart(2, "0");
    const time = eventDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    // Check if the event is in the past (greyed out state)
    const isPast = activeTab === "past";

    return (
      <View style={[styles.card, isPast && styles.cardPast]}>
        {/* Left Side: Soft Colored Date Block */}
        <View style={[styles.dateBlock, isPast && styles.dateBlockPast]}>
          <Text style={[styles.dateMonth, isPast && styles.textPast]}>
            {month}
          </Text>
          <Text style={[styles.dateDay, isPast && styles.textPast]}>{day}</Text>
        </View>

        {/* Right Side: Event Details */}
        <View style={styles.contentBlock}>
          <Text
            style={[styles.eventTitle, isPast && styles.textPast]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          {item.description ? (
            <Text style={styles.eventDesc} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          {/* Time and Location Pills */}
          <View style={styles.pillsContainer}>
            <View style={styles.pill}>
              <Feather
                name="clock"
                size={12}
                color={colors.onSurfaceVariant}
                style={styles.pillIcon}
              />
              <Text style={styles.pillText}>{time}</Text>
            </View>

            {item.location ? (
              <View style={styles.pill}>
                <Feather
                  name="map-pin"
                  size={12}
                  color={colors.onSurfaceVariant}
                  style={styles.pillIcon}
                />
                <Text style={styles.pillText} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Campus Events</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "today" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("today")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "today" && styles.tabTextActive,
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "upcoming" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("upcoming")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "upcoming" && styles.tabTextActive,
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "past" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("past")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "past" && styles.tabTextActive,
            ]}
          >
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
          <Text style={styles.loadingText}>Loading Events...</Text>
        </View>
      ) : isError || filteredEvents.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="calendar"
            size={48}
            color={colors.surfaceContainerHighest}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>
            No{" "}
            {activeTab === "today"
              ? "Events Today"
              : activeTab === "upcoming"
                ? "Upcoming Events"
                : "Past Events"}
          </Text>
          <Text style={styles.emptyDesc}>
            Check back later for new campus activities.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderEventCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: spacing.stackLg,
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: "#F9FAFB",
  },
  backButton: { padding: spacing.stackSm },
  headerTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontWeight: "700",
  },

  // Tabs Styling
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.marginMobile,
    marginBottom: spacing.stackLg,
    gap: spacing.stackSm,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: rounded.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  tabButtonActive: {
    backgroundColor: "#1A1B4B",
  },
  tabText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  tabTextActive: {
    color: colors.onPrimary,
    fontWeight: "600",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.marginMobile,
  },
  loadingText: {
    ...typography.labelMd,
    color: colors.outline,
    marginTop: spacing.stackMd,
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
    paddingHorizontal: spacing.stackLg,
  },

  listContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.sectionBreak * 2,
  },

  // Card Styling to match image
  card: {
    flexDirection: "row",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  cardPast: {
    opacity: 0.7, // Dims the entire card slightly for past events
  },

  dateBlock: {
    width: 72,
    backgroundColor: "#E8E9FF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  dateBlockPast: {
    backgroundColor: "#F0F0F0",
  },
  dateMonth: {
    ...typography.labelMd,
    color: "#1A1B4B",
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  dateDay: {
    fontSize: 26,
    color: "#1A1B4B",
    fontWeight: "700",
  },
  textPast: {
    color: colors.outline,
  },

  contentBlock: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  eventTitle: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "600",
    marginBottom: 4,
  },
  eventDesc: {
    ...typography.bodyMd,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginBottom: 10,
    lineHeight: 18,
  },

  // Time & Location Pills
  pillsContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pillIcon: {
    marginRight: 6,
  },
  pillText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
});
