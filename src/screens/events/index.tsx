import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  BackHandler,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useCampusEvents } from "@/features/events/useEvents";
import { CampusEventItem } from "@/services/event-service";
import { BENTO_COLORS, EventTabType, fontFamily } from "./constants";
import { filterAndSortEvents } from "./utils";
import { EventCard } from "./components/event-card";
import { EventHeroCard } from "./components/event-hero-card";
import { EventTabFilters } from "./components/event-tab-filters";
import { EventDetailModal } from "./components/event-detail-modal";
import {
  EventSkeleton,
  EventError,
  EventEmpty,
} from "./components/event-states";

export { BENTO_COLORS } from "./constants";
export {
  formatEventDate,
  formatEventTime,
  safeShareEvent,
  safeCopyEvent,
} from "./utils";

export function EventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<EventTabType>("upcoming");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<CampusEventItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const { data: events, isLoading, isError, refetch } = useCampusEvents();

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const { filteredEvents, counts, nextUpcomingEvent } = useMemo(() => {
    return filterAndSortEvents(events, activeTab, searchQuery);
  }, [events, activeTab, searchQuery]);

  const handleResetFilters = useCallback(() => {
    setActiveTab("all");
    setSearchQuery("");
  }, []);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/menu");
    }
  }, [router]);

  useEffect(() => {
    const onBackPress = () => {
      if (selectedEvent) {
        setSelectedEvent(null);
        return true;
      }
      if (isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery("");
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [selectedEvent, isSearchOpen]);

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
          <Text style={styles.screenTitle}>Campus Events</Text>
          <Text style={styles.screenSubtitle}>Programs, Fests & Activities</Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setIsSearchOpen((prev) => {
              if (prev) setSearchQuery("");
              return !prev;
            });
          }}
          style={[
            styles.headerIconButton,
            isSearchOpen && styles.headerIconButtonActive,
          ]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Toggle event search"
          activeOpacity={0.7}
        >
          <Feather
            name={isSearchOpen ? "x" : "search"}
            size={18}
            color={isSearchOpen ? "#ffffff" : BENTO_COLORS.deepNavy}
          />
        </TouchableOpacity>
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
        {isSearchOpen && (
          <View style={styles.searchBarWrapper}>
            <Feather
              name="search"
              size={16}
              color={BENTO_COLORS.subtleText}
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events by title, venue, or keyword..."
              placeholderTextColor={BENTO_COLORS.subtleText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              returnKeyType="search"
              accessible={true}
              accessibilityLabel="Search campus events"
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
        )}

        <EventHeroCard counts={counts} nextEvent={nextUpcomingEvent} />

        <EventTabFilters
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          counts={counts}
        />

        {isLoading ? (
          <EventSkeleton />
        ) : isError ? (
          <EventError onRetry={refetch} />
        ) : filteredEvents.length === 0 ? (
          <EventEmpty
            searchQuery={searchQuery}
            activeTab={activeTab}
            onReset={handleResetFilters}
          />
        ) : (
          <View style={styles.cardsListContainer}>
            {filteredEvents.map((item) => (
              <EventCard
                key={item.id}
                item={item}
                onPress={setSelectedEvent}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
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
  headerIconButtonActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  headerTitlesContainer: {
    alignItems: "center",
  },
  screenTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  screenSubtitle: {
    fontFamily,
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    marginBottom: 16,
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
