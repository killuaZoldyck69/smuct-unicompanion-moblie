import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import api from "../../src/services/api";
import { authClient } from "../../src/services/auth-client";
import { shadows } from "../../src/theme/layout";

// --- Helpers ---
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning,";
  if (hour < 18) return "Good Afternoon,";
  return "Good Evening,";
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

// Pastel UI configurations for Quick Actions
const QUICK_ACTIONS = [
  {
    id: "schedule",
    title: "Routine",
    icon: "clock",
    route: "/my-schedule",
    bg: "#d0e4ff",
    color: "#1e3a8a",
  },
  {
    id: "bus",
    title: "Bus",
    icon: "truck",
    route: "/bus-schedule",
    bg: "#d1fae5",
    color: "#065f46",
  },
  {
    id: "events",
    title: "Events",
    icon: "calendar",
    route: "/events",
    bg: "#f3e8ff",
    color: "#6b21a8",
  },
  {
    id: "blood",
    title: "Blood",
    icon: "droplet",
    route: "/blood",
    bg: "#ffe4e6",
    color: "#be123c",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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

  // Fetch Weather Data
  const { data: weather } = useQuery({
    queryKey: ["weather_compact"],
    queryFn: async () => {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=23.8103&longitude=90.4125&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&hourly=temperature_2m,weather_code&timezone=auto",
      );
      return res.json();
    },
    staleTime: 1000 * 60 * 15,
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

    return weather.hourly.time
      .slice(closestIndex, closestIndex + 12)
      .map((t: string, i: number) => ({
        time: t,
        temp: weather.hourly.temperature_2m[closestIndex + i],
        code: weather.hourly.weather_code[closestIndex + i],
      }));
  }, [weather]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* --- 1. HEADER GREETING --- */}
        <View style={styles.header}>
          <View style={styles.headerTextCol}>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
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

        {/* --- 2. WEATHER WIDGET --- */}
        {weather?.current && (
          <View style={styles.weatherWidget}>
            <View style={styles.weatherTopRow}>
              {/* Left: Huge Temp & White Icon Block */}
              <View style={styles.weatherTopLeft}>
                <Text style={styles.weatherHugeTemp}>
                  {Math.round(weather.current.temperature_2m)}°
                </Text>
                <View style={styles.weatherIconBlock}>
                  <Feather
                    name={
                      getWeatherDetails(weather.current.weather_code)
                        .icon as any
                    }
                    size={32}
                    color="#0284c7" // Cloud blue color from mockup
                  />
                </View>
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

            <View style={styles.weatherDivider} />

            {/* Middle: Hourly Forecast (Horizontal) */}
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
                    color="#ffffff"
                    style={{ marginVertical: 12 }}
                  />
                  <Text style={styles.weatherSmallTemp}>
                    {Math.round(hour.temp)}°
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* --- 3. QUICK ACTIONS --- */}
        <View style={styles.quickActionsContainer}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionBtn}
              onPress={() => router.push(action.route as any)}
            >
              <View
                style={[styles.actionIconBox, { backgroundColor: action.bg }]}
              >
                <Feather
                  name={action.icon as any}
                  size={24}
                  color={action.color}
                />
              </View>
              <Text style={[styles.actionText, { color: action.color }]}>
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- 4. TODAY'S CLASSES --- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Today's Classes</Text>
          <TouchableOpacity onPress={() => router.push("/my-schedule")}>
            <Text style={styles.seeAllText}>See Routine</Text>
          </TouchableOpacity>
        </View>

        {isLoadingHubs ? (
          <ActivityIndicator color="#131b2e" style={{ marginVertical: 20 }} />
        ) : todaysClasses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather
              name="coffee"
              size={32}
              color="#c6c6cd"
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
                  <Text style={styles.classTimeText}>
                    {cls.startTime} - {cls.endTime}
                  </Text>
                </View>
                <Text style={styles.courseName} numberOfLines={2}>
                  {cls.courseCode}: {cls.courseName}
                </Text>
                <View style={styles.roomRow}>
                  <Feather
                    name="map-pin"
                    size={14}
                    color="#854d0e"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.roomText}>{cls.room || "TBA"}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* --- 5. LATEST NOTICES --- */}
        <View style={[styles.sectionHeaderRow, { marginTop: 32 }]}>
          <Text style={styles.sectionTitle}>Recent Notices</Text>
          <TouchableOpacity onPress={() => router.push("/notices")}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {isLoadingNotices ? (
          <ActivityIndicator color="#131b2e" style={{ marginVertical: 20 }} />
        ) : !notices || notices.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>No recent notices.</Text>
          </View>
        ) : (
          <View style={styles.noticeContainerCard}>
            {notices.slice(0, 3).map((notice: any, index: number) => {
              // Cycle through pastel icon backgrounds for notices
              const iconColors = [
                { bg: "#e0f2fe", icon: "#0284c7" },
                { bg: "#d1fae5", icon: "#059669" },
                { bg: "#fce7f3", icon: "#be123c" },
              ];
              const colorTheme = iconColors[index % iconColors.length];

              return (
                <TouchableOpacity
                  key={notice.id}
                  style={[
                    styles.noticeRow,
                    index !== Math.min(notices.length, 3) - 1 &&
                      styles.noticeDivider,
                  ]}
                  onPress={() => router.push("/notices")}
                >
                  <View
                    style={[
                      styles.noticeIconBox,
                      { backgroundColor: colorTheme.bg },
                    ]}
                  >
                    <Feather name="bell" size={18} color={colorTheme.icon} />
                  </View>
                  <View style={styles.noticeTextCol}>
                    <Text style={styles.noticeTitle} numberOfLines={1}>
                      {notice.title}
                    </Text>
                    <Text style={styles.noticeDate}>
                      Published on{" "}
                      {new Date(notice.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// --- ISOLATED NEW DESIGN THEME (Soft Campus Bento) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fb" },
  scrollContent: { paddingBottom: 120 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTextCol: { flex: 1, paddingRight: 16 },
  greetingText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    color: "#76777d",
    fontWeight: "600",
    marginBottom: 4,
  },
  nameText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 24,
    color: "#131b2e",
    fontWeight: "800",
    marginBottom: 8,
  },

  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#d1fae5", // Mint background
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  roleText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 10,
    color: "#065f46",
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  avatarImage: { width: 56, height: 56, borderRadius: 28 },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#131b2e",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarFallbackText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "800",
  },

  // --- WEATHER WIDGET ---
  weatherWidget: {
    backgroundColor: "#131b2e", // Deep Navy
    marginHorizontal: 20,
    borderRadius: 32, // Bento squircle
    padding: 24,
    ...shadows.level1,
  },
  weatherTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weatherTopLeft: { flexDirection: "row", alignItems: "center" },
  weatherHugeTemp: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 56,
    fontWeight: "800",
    color: "#ffffff",
    marginRight: 16,
  },
  weatherIconBlock: {
    backgroundColor: "#ffffff",
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  weatherTopRight: { alignItems: "flex-end", flex: 1 },
  weatherConditionText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "700",
    marginBottom: 6,
  },
  weatherSubText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 12,
    color: "#c6c6cd",
    fontWeight: "500",
    marginBottom: 2,
  },

  weatherDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 24,
  },
  weatherScroll: { gap: 24, paddingRight: 16 },

  weatherHourCol: { alignItems: "center", minWidth: 44 },
  weatherSmallTime: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 12,
    color: "#c6c6cd",
    fontWeight: "600",
  },
  weatherSmallTemp: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "700",
  },

  // --- QUICK ACTIONS ---
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 24,
  },
  actionBtn: { alignItems: "center", width: "22%" },
  actionIconBox: {
    width: 64,
    height: 64,
    borderRadius: 24, // Squircle
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 14,
    fontWeight: "700",
  },

  // --- SECTIONS ---
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 32,
  },
  sectionTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 20,
    color: "#131b2e",
    fontWeight: "800",
  },
  seeAllText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 14,
    color: "#1e3a8a",
    fontWeight: "700",
  },

  // --- TODAY'S CLASSES ---
  horizontalList: { paddingHorizontal: 20, gap: 16 },
  classCard: {
    width: 260,
    backgroundColor: "#fef08a", // Bento Yellow
    padding: 24,
    borderRadius: 32,
    ...shadows.level1,
  },
  classTimeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    marginBottom: 16,
  },
  classTimeText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 12,
    color: "#131b2e",
    fontWeight: "800",
  },
  courseName: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 18,
    color: "#131b2e",
    fontWeight: "800",
    marginBottom: 16,
    lineHeight: 24,
  },
  roomRow: { flexDirection: "row", alignItems: "center", marginTop: "auto" },
  roomText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 14,
    color: "#854d0e",
    fontWeight: "700",
  },

  // --- NOTICES ---
  noticeContainerCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 32,
    padding: 12,
    ...shadows.level1,
  },
  noticeRow: { flexDirection: "row", alignItems: "center", padding: 12 },
  noticeDivider: { borderBottomWidth: 1, borderBottomColor: "#f2f4f6" },
  noticeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  noticeTextCol: { flex: 1, paddingRight: 12 },
  noticeTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    color: "#131b2e",
    fontWeight: "800",
    marginBottom: 4,
  },
  noticeDate: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 12,
    color: "#76777d",
    fontWeight: "500",
  },

  // --- EMPTY STATES ---
  emptyCard: {
    marginHorizontal: 20,
    padding: 32,
    backgroundColor: "#ffffff",
    borderRadius: 32,
    alignItems: "center",
  },
  emptyCardText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    color: "#131b2e",
    fontWeight: "800",
    marginBottom: 4,
  },
  emptyCardSub: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 14,
    color: "#76777d",
    fontWeight: "500",
  },
});
