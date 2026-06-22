import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import api from "../../src/services/api";
import { authClient } from "../../src/services/auth-client";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded, shadows } from "../../src/theme/layout";

// --- Helpers ---
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

// Translates WMO weather codes to UI-friendly icons and text
const getWeatherDetails = (code: number) => {
  if (code === 0) return { icon: "sun", text: "Clear" };
  if (code <= 3) return { icon: "cloud", text: "Cloudy" };
  if (code <= 48) return { icon: "cloud", text: "Fog" };
  if (code <= 55) return { icon: "cloud-drizzle", text: "Drizzle" };
  if (code <= 65) return { icon: "cloud-rain", text: "Rain" };
  if (code <= 77) return { icon: "cloud-snow", text: "Snow" };
  if (code <= 99) return { icon: "cloud-lightning", text: "Storm" };
  return { icon: "sun", text: "Clear" };
};

const formatHour = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
  });
};

const QUICK_ACTIONS = [
  {
    id: "schedule",
    title: "Routine",
    icon: "clock",
    route: "/my-schedule",
    color: "#4CAF50",
  },
  {
    id: "bus",
    title: "Bus",
    icon: "truck",
    route: "/bus-schedule",
    color: "#2196F3",
  },
  {
    id: "events",
    title: "Events",
    icon: "calendar",
    route: "/events",
    color: "#9C27B0",
  },
  {
    id: "blood",
    title: "Blood",
    icon: "droplet",
    route: "/blood",
    color: "#F44336",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user as any;
  const userRole = user?.role || "STUDENT";

  // --- Fetch Data ---
  const { data: myHubs, isLoading: isLoadingHubs } = useQuery({
    queryKey: ["myHubs"],
    queryFn: async () => (await api.get("/hubs/my")).data?.data || [],
  });

  const { data: notices, isLoading: isLoadingNotices } = useQuery({
    queryKey: ["notices"],
    queryFn: async () => (await api.get("/notices")).data?.data || [],
  });

  // Fetch Weather Data (Now ONLY Current & Hourly)
  const { data: weather } = useQuery({
    queryKey: ["weather_compact"],
    queryFn: async () => {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=23.8103&longitude=90.4125&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&hourly=temperature_2m,weather_code&timezone=auto",
      );
      return res.json();
    },
    staleTime: 1000 * 60 * 15, // 15 mins cache
  });

  // --- Calculate Today's Classes ---
  const todaysClasses = useMemo(() => {
    if (!myHubs || myHubs.length === 0) return [];
    const todayStr = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });
    const classesToday: any[] = [];

    myHubs.forEach((membership: any) => {
      const hub = membership.hub;
      if (!hub || hub.isArchived) return;

      let scheduleArray = hub.weeklyClassSchedule;
      if (typeof scheduleArray === "string") {
        try {
          scheduleArray = JSON.parse(scheduleArray);
        } catch (e) {
          scheduleArray = [];
        }
      }

      if (Array.isArray(scheduleArray)) {
        scheduleArray.forEach((session: any) => {
          if (session.day === todayStr) {
            classesToday.push({
              id: `${hub.id}-${session.startTime}`,
              courseCode: hub.courseCode,
              courseName: hub.courseName,
              startTime: session.startTime,
              endTime: session.endTime,
              room: session.room,
            });
          }
        });
      }
    });
    return classesToday;
  }, [myHubs]);

  // --- Extract Hourly Forecast ---
  const hourlyForecast = useMemo(() => {
    if (!weather?.hourly) return [];
    const now = new Date().getTime();
    let closestIndex = 0;
    let minDiff = Infinity;

    weather.hourly.time.forEach((t: string, i: number) => {
      const diff = Math.abs(new Date(t).getTime() - now);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    });

    // Return next 12 hours
    return weather.hourly.time
      .slice(closestIndex, closestIndex + 12)
      .map((t: string, i: number) => ({
        time: t,
        temp: weather.hourly.temperature_2m[closestIndex + i],
        code: weather.hourly.weather_code[closestIndex + i],
      }));
  }, [weather]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- HEADER GREETING --- */}
        <View style={styles.header}>
          <View style={styles.headerTextCol}>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.nameText} numberOfLines={1}>
              {user?.name || "Welcome Back!"}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{userRole}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push("/profile")}>
            {user?.image ? (
              <Image source={{ uri: user.image }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* --- COMPACT WEATHER WIDGET --- */}
        {weather?.current && (
          <View style={styles.weatherWidget}>
            <View style={styles.weatherTopRow}>
              {/* Left: Huge Temp & Icon */}
              <View style={styles.weatherTopLeft}>
                <Feather
                  name={
                    getWeatherDetails(weather.current.weather_code).icon as any
                  }
                  size={48}
                  color="#FFB300"
                  style={{ marginRight: 12 }}
                />
                <Text style={styles.weatherHugeTemp}>
                  {Math.round(weather.current.temperature_2m)}°
                </Text>
              </View>

              {/* Right: Text Conditions */}
              <View style={styles.weatherTopRight}>
                <Text style={styles.weatherConditionText}>
                  {getWeatherDetails(weather.current.weather_code).text}
                </Text>
                <Text style={styles.weatherSubText}>
                  Precip: {weather.current.precipitation}mm
                </Text>
                <Text style={styles.weatherSubText}>
                  Humidity: {weather.current.relative_humidity_2m}%
                </Text>
                <Text style={styles.weatherSubText}>
                  Wind: {weather.current.wind_speed_10m}km/h
                </Text>
              </View>
            </View>

            {/* Middle: Hourly Forecast (Horizontal) */}
            <View style={styles.weatherDivider} />
            <Text style={styles.weatherSectionTitle}>Today's Timeline</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.weatherScroll}
            >
              {hourlyForecast.map((hour: any, idx: number) => (
                <View key={idx} style={styles.weatherHourCol}>
                  <Text style={styles.weatherSmallTime}>
                    {idx === 0 ? "Now" : formatHour(hour.time)}
                  </Text>
                  <Feather
                    name={getWeatherDetails(hour.code).icon as any}
                    size={20}
                    color="#FFF"
                    style={{ marginVertical: 8 }}
                  />
                  <Text style={styles.weatherSmallTemp}>
                    {Math.round(hour.temp)}°
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* --- QUICK ACTIONS --- */}
        <View style={styles.quickActionsContainer}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionBtn}
              onPress={() => router.push(action.route as any)}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: action.color + "15" },
                ]}
              >
                <Feather
                  name={action.icon as any}
                  size={24}
                  color={action.color}
                />
              </View>
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- TODAY'S CLASSES --- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Today's Classes</Text>
          <TouchableOpacity onPress={() => router.push("/my-schedule")}>
            <Text style={styles.seeAllText}>See Routine</Text>
          </TouchableOpacity>
        </View>

        {isLoadingHubs ? (
          <ActivityIndicator
            color={colors.primaryContainer}
            style={{ marginVertical: 20 }}
          />
        ) : todaysClasses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather
              name="coffee"
              size={32}
              color={colors.outline}
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.emptyCardText}>
              No classes scheduled for today.
            </Text>
            <Text style={styles.emptyCardSub}>Enjoy your free time!</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {todaysClasses.map((cls) => (
              <View key={cls.id} style={styles.classCard}>
                <View style={styles.classTimeBadge}>
                  <Text style={styles.classTimeText}>{cls.startTime}</Text>
                </View>
                <Text style={styles.courseCode}>{cls.courseCode}</Text>
                <Text style={styles.courseName} numberOfLines={2}>
                  {cls.courseName}
                </Text>
                <View style={styles.roomRow}>
                  <Feather
                    name="map-pin"
                    size={12}
                    color={colors.outline}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.roomText}>{cls.room || "TBA"}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* --- LATEST NOTICES --- */}
        <View style={[styles.sectionHeaderRow, { marginTop: spacing.stackLg }]}>
          <Text style={styles.sectionTitle}>Recent Notices</Text>
          <TouchableOpacity onPress={() => router.push("/notices")}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {isLoadingNotices ? (
          <ActivityIndicator
            color={colors.primaryContainer}
            style={{ marginVertical: 20 }}
          />
        ) : !notices || notices.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>No recent notices.</Text>
          </View>
        ) : (
          <View style={styles.noticeList}>
            {notices.slice(0, 3).map((notice: any) => (
              <TouchableOpacity
                key={notice.id}
                style={styles.noticeRow}
                onPress={() => router.push("/notices")}
              >
                <View style={styles.noticeIconBox}>
                  <Feather name="bell" size={16} color={colors.primary} />
                </View>
                <View style={styles.noticeTextCol}>
                  <Text style={styles.noticeTitle} numberOfLines={1}>
                    {notice.title}
                  </Text>
                  <Text style={styles.noticeDate}>
                    {new Date(notice.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={16}
                  color={colors.outline}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 100 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  headerTextCol: { flex: 1, paddingRight: 16 },
  greetingText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: 2,
  },
  nameText: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontWeight: "800",
    marginBottom: 6,
  },

  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaryContainer + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: rounded.sm,
  },
  roleText: {
    ...typography.labelSm,
    color: colors.primaryContainer,
    fontWeight: "800",
    fontSize: 10,
  },

  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceContainerHighest,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarFallbackText: {
    ...typography.titleLg,
    color: colors.onPrimary,
    fontWeight: "700",
  },

  // --- WEATHER WIDGET (Compact Dark Theme) ---
  weatherWidget: {
    backgroundColor: "#202124",
    margin: spacing.marginMobile,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    ...shadows.level1,
  },
  weatherTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weatherTopLeft: { flexDirection: "row", alignItems: "center" },
  weatherHugeTemp: { fontSize: 48, fontWeight: "800", color: "#FFF" },
  weatherTopRight: { alignItems: "flex-end" },
  weatherConditionText: {
    ...typography.bodyLg,
    color: "#FFF",
    fontWeight: "700",
    marginBottom: 4,
  },
  weatherSubText: {
    ...typography.labelSm,
    color: "#A0ABBA",
    fontSize: 11,
    marginBottom: 2,
  },

  weatherDivider: {
    height: 1,
    backgroundColor: "#3C4043",
    marginVertical: spacing.stackLg,
  },
  weatherSectionTitle: {
    ...typography.labelSm,
    color: "#A0ABBA",
    marginBottom: spacing.stackMd,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  weatherScroll: { gap: 16, paddingRight: spacing.stackLg },

  // Hourly Column
  weatherHourCol: { alignItems: "center", width: 44 },
  weatherSmallTime: { ...typography.labelSm, color: "#A0ABBA", fontSize: 10 },
  weatherSmallTemp: { ...typography.labelMd, color: "#FFF", fontWeight: "700" },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.marginMobile,
    marginTop: spacing.stackSm,
  },
  actionBtn: { alignItems: "center", width: "22%" },
  actionIconBox: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    ...typography.labelSm,
    color: colors.onSurface,
    fontWeight: "600",
  },

  // Sections
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.marginMobile,
    marginBottom: spacing.stackMd,
    marginTop: spacing.stackLg,
  },
  sectionTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontWeight: "800",
  },
  seeAllText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "700",
  },

  // Classes
  horizontalList: {
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.stackMd,
  },
  classCard: {
    width: 220,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.stackLg,
    borderRadius: rounded.xl,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },
  classTimeBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  classTimeText: {
    ...typography.labelSm,
    color: colors.onPrimary,
    fontWeight: "800",
  },
  courseCode: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: "800",
    marginBottom: 4,
  },
  courseName: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: 12,
    height: 40,
  },
  roomRow: { flexDirection: "row", alignItems: "center", marginTop: "auto" },
  roomText: { ...typography.labelSm, color: colors.outline, fontWeight: "600" },

  // Notices
  noticeList: { paddingHorizontal: spacing.marginMobile },
  noticeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    padding: 16,
    borderRadius: rounded.lg,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  noticeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryContainer + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  noticeTextCol: { flex: 1, paddingRight: 12 },
  noticeTitle: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: 4,
  },
  noticeDate: { ...typography.labelSm, color: colors.outline, fontSize: 11 },

  // Empties
  emptyCard: {
    marginHorizontal: spacing.marginMobile,
    padding: spacing.stackLg,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderStyle: "dashed",
  },
  emptyCardText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptyCardSub: { ...typography.labelSm, color: colors.outline },
});
