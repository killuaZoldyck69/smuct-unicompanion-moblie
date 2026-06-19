import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import api from "../src/services/api";
import { authClient } from "../src/services/auth-client";
import { colors } from "../src/theme/colors";
import { typography } from "../src/theme/typography";
import { spacing, rounded, shadows } from "../src/theme/layout";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Individual Card Component with Local State ---
const BusRouteCard = ({ item }: { item: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasStops = item.stops && item.stops.length > 0;

  const toggleExpand = () => {
    // Adds a smooth sliding animation when the card opens/closes
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.card}>
      {/* Top Row: Route Icon, Name, and Time Badge */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={hasStops ? toggleExpand : undefined}
        style={styles.cardHeader}
      >
        <View style={styles.routeHeaderInfo}>
          <View style={styles.iconWrapper}>
            <Feather name="truck" size={20} color={colors.primaryContainer} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.routeText} numberOfLines={2}>
              {item.route}
            </Text>
            {item.busNumber && item.busNumber !== "N/A" && (
              <Text style={styles.busNumberText}>Bus: {item.busNumber}</Text>
            )}
          </View>
        </View>

        <View style={styles.timeBadge}>
          <Text style={styles.timeText}>{item.departureTime}</Text>
        </View>
      </TouchableOpacity>

      {/* Expand/Collapse Toggle Bar */}
      {hasStops && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleExpand}
          style={styles.toggleBar}
        >
          <Text style={styles.toggleText}>
            {isExpanded ? "Hide Stops" : `View Routes`}
          </Text>
          <Feather
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.outline}
          />
        </TouchableOpacity>
      )}

      {/* Collapsible Vertical Timeline */}
      {isExpanded && hasStops && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          <View style={styles.timelineContainer}>
            {item.stops.map((stop: string, idx: number) => {
              const isLast = idx === item.stops.length - 1;
              const isEndpoint = idx === 0 || isLast;

              return (
                <View key={idx} style={styles.stopRow}>
                  {/* Visual Timeline Graphic */}
                  <View style={styles.timelineGraphic}>
                    <View
                      style={[
                        styles.dot,
                        isEndpoint ? styles.dotSolid : styles.dotHollow,
                      ]}
                    />
                    {!isLast && <View style={styles.verticalLine} />}
                  </View>

                  {/* Stop Name Text */}
                  <Text
                    style={[styles.stopText, isEndpoint && styles.stopTextBold]}
                  >
                    {stop}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

export default function BusScheduleScreen() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userRole = (session?.user as any)?.role || "STUDENT";

  // Fetch Bus Schedules
  const {
    data: schedules,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["busSchedules"],
    queryFn: async () => {
      const response = await api.get("/buses");
      return response.data?.data || [];
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Bus Schedule</Text>
          <Text style={styles.headerSubtitle}>
            University Transport Timings
          </Text>
        </View>

        {/* Admin Only Manage Button */}
        {userRole === "ADMIN" && (
          <TouchableOpacity
            style={styles.manageBtn}
            onPress={() => router.push("/admin-bus-manage")}
          >
            <Feather name="edit-2" size={18} color={colors.onPrimary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
          <Text style={styles.loadingText}>Loading Schedules...</Text>
        </View>
      ) : isError || !schedules || schedules.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="map"
            size={48}
            color={colors.surfaceContainerHighest}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>No Schedules Found</Text>
          <Text style={styles.emptyDesc}>
            There are currently no active bus routes available.
          </Text>
        </View>
      ) : (
        <FlatList
          data={schedules}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BusRouteCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: spacing.stackLg,
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  backButton: { marginRight: spacing.stackMd, padding: spacing.stackSm },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  headerSubtitle: { ...typography.bodyMd, color: colors.outline, marginTop: 2 },
  manageBtn: {
    backgroundColor: colors.primaryContainer,
    padding: 12,
    borderRadius: rounded.full,
    ...shadows.level1,
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
    padding: spacing.marginMobile,
    paddingBottom: spacing.sectionBreak * 2,
  },

  // Card Design
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    marginBottom: spacing.stackLg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  routeHeaderInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: spacing.stackMd,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: rounded.full,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.stackMd,
  },
  titleContainer: { flex: 1, justifyContent: "center" },
  routeText: {
    ...typography.titleLg,
    color: colors.onSurface,
    marginBottom: 4,
  },
  busNumberText: { ...typography.labelSm, color: colors.onSurfaceVariant },

  timeBadge: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: "700",
  },

  // Expand/Collapse Toggle
  toggleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: rounded.md,
    marginTop: spacing.stackLg,
  },
  toggleText: {
    ...typography.labelSm,
    color: colors.outline,
    fontWeight: "600",
  },

  // Expanded Content Area
  expandedContent: { overflow: "hidden" },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceContainerHighest,
    marginVertical: spacing.stackLg,
  },
  timelineContainer: { paddingLeft: spacing.stackSm },
  stopRow: { flexDirection: "row", alignItems: "flex-start" },
  timelineGraphic: {
    width: 20,
    alignItems: "center",
    marginRight: spacing.stackMd,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    zIndex: 2,
  },
  dotSolid: { backgroundColor: colors.primaryContainer },
  dotHollow: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: colors.surfaceContainerHigh,
  },
  verticalLine: {
    width: 2,
    height: 30,
    backgroundColor: colors.surfaceContainerHigh,
    position: "absolute",
    top: 14,
    bottom: -10,
    zIndex: 1,
  },
  stopText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    paddingBottom: spacing.stackLg,
  },
  stopTextBold: { color: colors.onSurface, fontWeight: "600" },
});
