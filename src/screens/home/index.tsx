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
    route: "/exams",
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

  const { user, role: userRole } = useCurrentUser();

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
          <View style={styles.headerTextCol}>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.nameText} numberOfLines={1}>
              {user?.name || "Welcome Back!"}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{userRole}</Text>
            </View>
          </View>

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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTextCol: { flex: 1, paddingRight: 16 },
  greetingText: {
    fontSize: 16,
    color: "#76777d",
    fontWeight: "600",
    marginBottom: 4,
  },
  nameText: {
    fontSize: 24,
    color: "#131b2e",
    fontWeight: "800",
    marginBottom: 8,
  },

  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  roleText: {
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
    fontSize: 24,
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
    fontSize: 20,
    color: "#131b2e",
    fontWeight: "800",
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
    fontSize: 16,
    color: "#131b2e",
    fontWeight: "800",
    marginBottom: 4,
  },
  noticeDate: {
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
