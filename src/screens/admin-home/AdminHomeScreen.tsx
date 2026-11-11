import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { FONT_FAMILIES } from "@/theme/typography";
import { colors } from "@/theme/colors";
import { useAdminDashboard } from "./hooks/use-admin-dashboard";
import { AdminAmbientBackground } from "./components/AdminAmbientBackground";
import { AdminHeroHeader } from "./components/AdminHeroHeader";
import { SystemStatusBanner } from "./components/SystemStatusBanner";
import { AcademicStatsBanner } from "./components/AcademicStatsBanner";
import { StatsGrid } from "./components/StatsGrid";
import { QuickAccessGrid } from "./components/QuickAccessGrid";
import { ActivityFeed } from "./components/ActivityFeed";

export function AdminHomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useCurrentUser();
  const { isOffline } = useNetworkStatus();
  const {
    health,
    stats,
    isStatsLoading,
    isStatsError,
    isHealthFetching,
    isRefreshing,
    refetch,
  } = useAdminDashboard();

  // Ensure edge-to-edge translucent status bar every time screen is focused
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle("dark-content", true);
      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor("transparent", true);
        StatusBar.setTranslucent(true);
      }
    }, []),
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Decorative ambient background */}
      <AdminAmbientBackground topInset={insets.top} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            colors={[colors.semantic.indigo.solid]}
            tintColor={colors.semantic.indigo.solid}
            progressViewOffset={insets.top + 8}
          />
        }
      >
        {/* 1. Hero Greeting (Avatar, Name/Date, Cat Bell) */}
        <AdminHeroHeader
          userName={user?.name}
          userImage={user?.image}
        />

        {(isOffline || isStatsError) && (
          <View
            style={[
              styles.alertBanner,
              isStatsError && !isOffline && styles.alertBannerError,
            ]}
            accessible={true}
            accessibilityRole="alert"
          >
            <Feather
              name={isOffline ? "wifi-off" : "alert-circle"}
              size={15}
              color={
                isOffline
                  ? colors.semantic.amber.darkText
                  : colors.semantic.red.deep
              }
            />
            <Text
              style={[
                styles.alertText,
                isStatsError && !isOffline && styles.alertTextError,
              ]}
            >
              {isOffline
                ? "You are offline. Metrics may be unavailable until connectivity returns."
                : "Could not load live dashboard metrics."}
            </Text>
            <TouchableOpacity
              onPress={refetch}
              style={styles.retryPill}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Retry loading admin dashboard"
            >
              <Text style={styles.retryPillText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 2. System Health Banner */}
        <SystemStatusBanner health={health} isFetching={isHealthFetching} />

        {/* 3. Academic Structure Stats (Programs, Departments, Faculties) */}
        <AcademicStatsBanner />

        {/* 4. Live Stats Overview Grid */}
        <StatsGrid stats={stats} isLoading={isStatsLoading} />

        {/* 5. Admin Quick Access Grid */}
        <QuickAccessGrid />

        {/* 6. Recent Activity Feed */}
        <ActivityFeed
          items={stats?.recentActivity ?? []}
          isLoading={isStatsLoading}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.adminBackground,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: colors.semantic.amber.tint,
    borderWidth: 1,
    borderColor: colors.semantic.amber.border,
  },
  alertBannerError: {
    backgroundColor: colors.semantic.red.tint,
    borderColor: colors.semantic.red.border,
  },
  alertText: {
    flex: 1,
    fontFamily: FONT_FAMILIES.bodySemiBold,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: "600",
    color: colors.semantic.amber.darkText,
  },
  alertTextError: {
    color: colors.semantic.red.darkText,
  },
  retryPill: {
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  retryPillText: {
    fontFamily: FONT_FAMILIES.bodyBold,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700",
    color: colors.slate800,
  },
});
