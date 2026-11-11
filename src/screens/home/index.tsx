import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { NotificationBell } from "@/components/ui/notification-bell";
import { useMyHubsSchedule } from "@/features/hubs/useHubs";
import { useNotices } from "@/features/notices/useNotices";
import { useWeatherForecast } from "@/hooks/use-weather-forecast";
import { useTodaysClassesData } from "@/hooks/use-todays-classes";
import { shadows } from "@/theme/layout";
import { FONT_FAMILIES } from "@/theme/typography";
import { WeatherWidget } from "./components/weather-widget";
import { TodaysClassesSection } from "./components/todays-classes-section";
import {
  NoticeListSkeleton,
  WeatherWidgetSkeleton,
} from "./components/home-loading-skeletons";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning,";
  if (hour < 18) return "Good Afternoon,";
  return "Good Evening,";
};

const QUICK_ACTION_BUS = {
  id: "bus",
  title: "Bus Route",
  assetIcon: require("@/assets/icons/bus.png"),
  route: "/bus-schedule",
  color: "#2563eb",
  bg: "#eff6ff",
};

const QUICK_ACTION_EXAMS = {
  id: "exams",
  title: "Exams",
  assetIcon: require("@/assets/icons/exam-time.png"),
  route: "/(tabs)/exams",
  color: "#7c3aed",
  bg: "#f5f3ff",
};

const QUICK_ACTION_HUBS = {
  id: "hubs",
  title: "Course Hubs",
  assetIcon: require("@/assets/icons/lecture.png"),
  route: "/(tabs)/hubs",
  color: "#7c3aed",
  bg: "#f5f3ff",
};

const QUICK_ACTION_BLOOD = {
  id: "blood",
  title: "Blood Aid",
  assetIcon: require("@/assets/icons/blood-bag.png"),
  route: "/(tabs)/blood",
  color: "#dc2626",
  bg: "#fef2f2",
};

const QUICK_ACTION_CALENDAR = {
  id: "calendar",
  title: "Calendar",
  assetIcon: require("@/assets/icons/calendar.png"),
  route: "/academic_calendar",
  color: "#059669",
  bg: "#ecfdf5",
};

export function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { user, role, refetch: refetchUser } = useCurrentUser();
  const { isOffline } = useNetworkStatus();
  const [avatarError, setAvatarError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.image]);

  const quickActions = useMemo(
    () => [
      QUICK_ACTION_BUS,
      role === "TEACHER" ? QUICK_ACTION_HUBS : QUICK_ACTION_EXAMS,
      QUICK_ACTION_BLOOD,
      QUICK_ACTION_CALENDAR,
    ],
    [role],
  );

  // --- Fetch Data using Feature Hooks ---
  const {
    data: myHubs,
    isLoading: isLoadingHubs,
    isError: isHubsError,
    refetch: refetchHubs,
  } = useMyHubsSchedule();
  const {
    data: notices,
    isLoading: isLoadingNotices,
    isError: isNoticesError,
    refetch: refetchNotices,
  } = useNotices({ page: 1, limit: 3 });
  const {
    weather,
    hourlyForecast,
    isLoading: isLoadingWeather,
    refetch: refetchWeather,
  } = useWeatherForecast();
  const {
    classes: todaysClasses,
    stats: todayStats,
    liveClass,
    nextClass,
  } = useTodaysClassesData(myHubs);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        refetchUser(),
        refetchHubs(),
        refetchNotices(),
        refetchWeather(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchUser, refetchHubs, refetchNotices, refetchWeather]);

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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#1e3a8a"]}
            tintColor="#1e3a8a"
          />
        }
      >
        {/* --- 1. HEADER GREETING --- */}
        <View style={styles.header}>
          {/* Left: Avatar */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View profile"
          >
            {user?.image && !avatarError ? (
              <Image
                source={{ uri: user.image }}
                style={styles.avatarImage}
                onError={() => setAvatarError(true)}
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

          {/* Right: Notifications */}
          <NotificationBell style={styles.notifBtn} useCatAnimation />
        </View>

        {isOffline && (
          <View
            style={styles.offlineBanner}
            accessible={true}
            accessibilityRole="alert"
          >
            <Feather name="wifi-off" size={14} color="#92400e" />
            <Text style={styles.offlineBannerText}>
              You are offline. Showing cached campus data where available.
            </Text>
          </View>
        )}

        {/* --- 2. WEATHER WIDGET --- */}
        {isLoadingWeather ? (
          <WeatherWidgetSkeleton />
        ) : (
          <WeatherWidget weather={weather} hourlyForecast={hourlyForecast} />
        )}

        {/* --- 3. QUICK ACTIONS --- */}
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionBtn}
              onPress={() => {
                if (
                  Platform.OS === "web" &&
                  typeof document !== "undefined" &&
                  document.activeElement instanceof HTMLElement
                ) {
                  document.activeElement.blur();
                }
                router.push(action.route as any);
              }}
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
                adjustsFontSizeToFit
                minimumFontScale={0.85}
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
          isError={isHubsError}
          onRetry={refetchHubs}
          userRole={role}
        />

        {/* --- 5. LATEST NOTICES --- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Notices</Text>
          <TouchableOpacity
            onPress={() => {
              if (
                Platform.OS === "web" &&
                typeof document !== "undefined" &&
                document.activeElement instanceof HTMLElement
              ) {
                document.activeElement.blur();
              }
              router.push({
                pathname: "/(tabs)/notices",
                params: { noticeId: "" },
              });
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View all notices"
          >
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {isLoadingNotices ? (
          <NoticeListSkeleton />
        ) : isNoticesError && (!notices || notices.length === 0) ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>Unable to load notices</Text>
            <Text style={styles.emptyCardSub}>
              Check your connection and pull down or tap below to retry.
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => refetchNotices()}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Retry loading notices"
            >
              <Feather name="refresh-cw" size={13} color="#1e3a8a" />
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
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
                  onPress={() => {
                    if (
                      Platform.OS === "web" &&
                      typeof document !== "undefined" &&
                      document.activeElement instanceof HTMLElement
                    ) {
                      document.activeElement.blur();
                    }
                    router.push({
                      pathname: "/(tabs)/notices",
                      params: { noticeId: notice.id },
                    });
                  }}
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
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  headerTextCol: {
    flex: 1,
    gap: 2,
  },
  greetingText: {
    fontFamily: FONT_FAMILIES.bodySemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: "#64748b",
    fontWeight: "600",
  },
  nameText: {
    fontFamily: FONT_FAMILIES.titleExtraBold,
    fontSize: 21,
    lineHeight: 26,
    color: "#131b2e",
    fontWeight: "800",
    letterSpacing: -0.35,
  },

  notifBtn: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },

  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  offlineBannerText: {
    flex: 1,
    fontFamily: FONT_FAMILIES.bodySemiBold,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: "600",
    color: "#92400e",
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
    fontFamily: FONT_FAMILIES.titleExtraBold,
    fontSize: 19,
    lineHeight: 24,
    color: "#ffffff",
    fontWeight: "800",
  },

  // --- QUICK ACTIONS ---
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 22,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
  },
  actionIconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionIconImage: {
    width: 30,
    height: 30,
  },
  actionText: {
    fontFamily: FONT_FAMILIES.bodyBold,
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: "700",
    textAlign: "center",
  },

  // --- SECTIONS ---
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 26,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILIES.titleBold,
    fontSize: 19,
    lineHeight: 24,
    color: "#131b2e",
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontFamily: FONT_FAMILIES.bodyBold,
    fontSize: 13.5,
    lineHeight: 18,
    color: "#1e3a8a",
    fontWeight: "700",
  },

  // --- NOTICES ---
  noticeContainerCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...shadows.level1,
  },
  noticeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 14,
  },
  noticeDivider: { borderBottomWidth: 1, borderBottomColor: "#f2f4f6" },
  noticeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  noticeTextCol: { flex: 1, gap: 3 },
  noticeTitle: {
    fontFamily: FONT_FAMILIES.bodySemiBold,
    fontSize: 14.5,
    lineHeight: 20,
    color: "#131b2e",
    fontWeight: "600",
  },
  noticeDate: {
    fontFamily: FONT_FAMILIES.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    color: "#64748b",
    fontWeight: "500",
  },

  // --- EMPTY STATES ---
  emptyCard: {
    marginHorizontal: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...shadows.level1,
  },
  emptyCardText: {
    fontFamily: FONT_FAMILIES.titleBold,
    fontSize: 15.5,
    lineHeight: 21,
    color: "#131b2e",
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  emptyCardSub: {
    fontFamily: FONT_FAMILIES.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    color: "#64748b",
    fontWeight: "500",
    textAlign: "center",
    maxWidth: 280,
  },
  retryBtn: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryBtnText: {
    fontFamily: FONT_FAMILIES.bodyBold,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    color: "#1e3a8a",
  },
});
