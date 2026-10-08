import React from "react";
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

import { useCurrentUser } from "@/hooks/use-current-user";
import { useMyHubs } from "@/features/hubs/useHubs";
import { useNotices } from "@/features/notices/useNotices";
import { useWeatherForecast } from "@/hooks/use-weather-forecast";
import { useTodaysClassesData } from "@/hooks/use-todays-classes";
import { shadows } from "@/theme/layout";
import { WeatherWidget } from "./components/weather-widget";
import { TodaysClassesSection } from "./components/todays-classes-section";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning,";
  if (hour < 18) return "Good Afternoon,";
  return "Good Evening,";
};

const QUICK_ACTIONS = [
  {
    id: "bus",
    title: "Bus Route",
    assetIcon: require("@/assets/icons/bus.png"),
    route: "/bus-schedule",
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    id: "exams",
    title: "Exams",
    assetIcon: require("@/assets/icons/exam-time.png"),
    route: "/(tabs)/exams",
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    id: "blood",
    title: "Blood Aid",
    assetIcon: require("@/assets/icons/blood-bag.png"),
    route: "/(tabs)/blood",
    color: "#dc2626",
    bg: "#fef2f2",
  },
  {
    id: "calendar",
    title: "Calendar",
    assetIcon: require("@/assets/icons/calendar.png"),
    route: "/academic_calendar",
    color: "#059669",
    bg: "#ecfdf5",
  },
];

export function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { user } = useCurrentUser();

  // --- Fetch Data using Feature Hooks ---
  const { data: myHubs, isLoading: isLoadingHubs } = useMyHubs();
  const { data: notices, isLoading: isLoadingNotices } = useNotices();
  const { weather, hourlyForecast } = useWeatherForecast();
  const {
    classes: todaysClasses,
    stats: todayStats,
    liveClass,
    nextClass,
  } = useTodaysClassesData(myHubs);

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
          {/* Left: Avatar */}
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View profile"
          >
            {user?.image ? (
              <Image
                source={{ uri: user.image }}
                style={styles.avatarImage}
                accessible={true}
                accessibilityLabel={`${user.name || "User"}'s profile picture`}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Centre: Greeting + Name */}
          <View style={styles.headerTextCol}>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.nameText} numberOfLines={1}>
              {user?.name || "Welcome Back!"}
            </Text>
          </View>

          {/* Right: Notification Bell */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/notices")}
            style={styles.notifBtn}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Feather name="bell" size={20} color="#131b2e" />
          </TouchableOpacity>
        </View>

        {/* --- 2. WEATHER WIDGET --- */}
        <WeatherWidget weather={weather} hourlyForecast={hourlyForecast} />

        {/* --- 3. QUICK ACTIONS --- */}
        <View style={styles.quickActionsContainer}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionBtn}
              onPress={() => router.push(action.route as any)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={action.title}
            >
              <View
                style={[styles.actionIconBox, { backgroundColor: action.bg }]}
              >
                <Image
                  source={action.assetIcon}
                  style={styles.actionIconImage}
                  resizeMode="contain"
                />
              </View>
              <Text
                style={[styles.actionText, { color: action.color }]}
                numberOfLines={1}
              >
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- 4. TODAY'S CLASSES --- */}
        <TodaysClassesSection
          classes={todaysClasses}
          stats={todayStats}
          liveClass={liveClass}
          nextClass={nextClass}
          isLoading={isLoadingHubs}
        />

        {/* --- 5. LATEST NOTICES --- */}
        <View style={[styles.sectionHeaderRow, { marginTop: 32 }]}>
          <Text style={styles.sectionTitle}>Recent Notices</Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/notices")}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View all notices"
          >
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
                  onPress={() => router.push("/(tabs)/notices")}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Notice: ${notice.title}`}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fb" },
  scrollContent: { paddingBottom: 120 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 12,
  },
  headerTextCol: {
    flex: 1,
  },
  greetingText: {
    fontSize: 13,
    color: "#76777d",
    fontWeight: "600",
    marginBottom: 1,
  },
  nameText: {
    fontSize: 20,
    color: "#131b2e",
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.08)",
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },

  avatarImage: { width: 46, height: 46, borderRadius: 23 },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#131b2e",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarFallbackText: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "800",
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
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionIconImage: {
    width: 32,
    height: 32,
  },
  actionText: {
    fontSize: 13,
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
    fontSize: 18,
    color: "#131b2e",
    fontWeight: "700",
  },
  seeAllText: {
    fontSize: 14,
    color: "#1e3a8a",
    fontWeight: "700",
  },



  // --- NOTICES ---
  noticeContainerCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 18,
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
    fontSize: 14,
    color: "#131b2e",
    fontWeight: "600",
    marginBottom: 3,
  },
  noticeDate: {
    fontSize: 12,
    color: "#76777d",
    fontWeight: "400",
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
    fontSize: 16,
    color: "#131b2e",
    fontWeight: "800",
    marginBottom: 4,
  },
  emptyCardSub: {
    fontSize: 14,
    color: "#76777d",
    fontWeight: "500",
  },
});
