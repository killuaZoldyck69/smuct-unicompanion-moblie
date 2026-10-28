import React, { useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";

import { useCurrentUser } from "@/hooks/use-current-user";
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
  const router = useRouter();
  const { user } = useCurrentUser();
  const { health, stats, isStatsLoading, isHealthFetching, isRefreshing, refetch } =
    useAdminDashboard();

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
            colors={["#4F46E5"]}
            tintColor="#4F46E5"
            progressViewOffset={insets.top + 8}
          />
        }
      >
        {/* 1. Hero Greeting (Title, Date, Bell, Avatar) */}
        <AdminHeroHeader
          userName={user?.name}
          userImage={user?.image}
          onPressBell={() => router.push("/(tabs)/notices")}
        />

        {/* 2. System Health Banner */}
        <SystemStatusBanner health={health} isFetching={isHealthFetching} />

        {/* 3. Academic Structure Stats (Programs, Departments, Faculties) */}
        <AcademicStatsBanner />

        {/* 4. Live Stats Overview Grid */}
        <StatsGrid stats={stats} isLoading={isStatsLoading} />

        {/* 4. Admin Quick Access Grid */}
        <QuickAccessGrid />

        {/* 5. Recent Activity Feed */}
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
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
