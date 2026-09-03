import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useBusSchedules } from "@/features/schedule/useSchedule";
import { BENTO_COLORS, DirectionFilter, fontFamily } from "./constants";
import { filterAndCountBusSchedules } from "./utils";
import { BusRouteCard } from "./components/bus-route-card";
import { BusHeroCard } from "./components/bus-hero-card";
import { BusFilterPills } from "./components/bus-filter-pills";
import {
  BusSkeleton,
  BusError,
  BusEmpty,
} from "./components/bus-states";

export { BENTO_COLORS } from "./constants";
export { filterAndCountBusSchedules } from "./utils";
export { BusRouteCard } from "./components/bus-route-card";

export function BusScheduleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role: userRole } = useCurrentUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: schedules,
    isLoading,
    isError,
    refetch,
  } = useBusSchedules();

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const { filteredSchedules, counts } = useMemo(() => {
    return filterAndCountBusSchedules(schedules, directionFilter, searchQuery);
  }, [schedules, directionFilter, searchQuery]);

  const handleResetFilters = useCallback(() => {
    setDirectionFilter("ALL");
    setSearchQuery("");
  }, []);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/menu");
    }
  }, [router]);

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.headerIconButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={BENTO_COLORS.deepNavy} />
        </TouchableOpacity>

        <View style={styles.headerTitlesContainer}>
          <Text style={styles.screenTitle}>Bus Schedule</Text>
          <Text style={styles.screenSubtitle}>
            University Transport Network
          </Text>
        </View>

        {userRole === "ADMIN" ? (
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => router.push("/admin-bus-manage")}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Manage bus routes"
            activeOpacity={0.7}
          >
            <Feather name="edit-2" size={18} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 42 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 40 : 56 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[BENTO_COLORS.deepNavy]}
            tintColor={BENTO_COLORS.deepNavy}
          />
        }
      >
        <View style={styles.searchBarWrapper}>
          <Feather
            name="search"
            size={16}
            color={BENTO_COLORS.subtleText}
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by stop or route (e.g. Kuril, Airport, Bus 15)..."
            placeholderTextColor={BENTO_COLORS.subtleText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessible={true}
            accessibilityLabel="Search bus routes and stops"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={{ padding: 4 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Feather
                name="x-circle"
                size={16}
                color={BENTO_COLORS.subtleText}
              />
            </TouchableOpacity>
          )}
        </View>

        <BusHeroCard counts={counts} />

        <BusFilterPills
          directionFilter={directionFilter}
          onSelectFilter={setDirectionFilter}
          counts={counts}
        />

        {isLoading ? (
          <BusSkeleton />
        ) : isError ? (
          <BusError onRetry={refetch} />
        ) : filteredSchedules.length === 0 ? (
          <BusEmpty
            searchQuery={searchQuery}
            directionFilter={directionFilter}
            onReset={handleResetFilters}
          />
        ) : (
          <View style={styles.cardsListContainer}>
            {filteredSchedules.map((item: any) => (
              <BusRouteCard key={item.id} item={item} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: BENTO_COLORS.background,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  headerTitlesContainer: {
    flex: 1,
    marginLeft: 14,
  },
  screenTitle: {
    fontFamily,
    fontSize: 22,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    fontFamily,
    fontSize: 12,
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.pillRadius,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  searchInput: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.neutralText,
    padding: 0,
  },
  cardsListContainer: {
    marginBottom: 16,
  },
});
