import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  RefreshControl,
  BackHandler,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useInfiniteCampusEvents } from "@/features/events/useEvents";
import { useCurrentUser } from "@/hooks/use-current-user";
import { CampusEventItem } from "@/services/event-service";
import { BENTO_COLORS, EventTabType, fontFamily } from "./constants";
import { EventCard } from "./components/event-card";
import { EventHeroCard } from "./components/event-hero-card";
import { EventTabFilters } from "./components/event-tab-filters";
import { EventDetailModal } from "./components/event-detail-modal";
import { CreateEventModal } from "./components/create-event-modal";
import {
  EventSkeleton,
  EventError,
  EventEmpty,
} from "./components/event-states";

export { BENTO_COLORS } from "./constants";
export {
  formatEventDate,
  formatEventTime,
  getEventDateComponents,
  safeShareEvent,
  safeCopyEvent,
} from "./utils";

export function EventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role, user } = useCurrentUser();
  const isAdmin = role === "ADMIN" || user?.role === "ADMIN";

  const [activeTab, setActiveTab] = useState<EventTabType>("upcoming");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<CampusEventItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<CampusEventItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Debounce search query to prevent unnecessary queries while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Infinite query for events with server-side pagination, tab filter, and search
  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteCampusEvents({
    tab: activeTab,
    search: debouncedSearch,
    limit: 10,
  });

  // Flattened events across paginated pages
  const events = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);

  // Aggregated tab counts & next upcoming event from first page
  const counts = useMemo(() => {
    return (
      data?.pages[0]?.counts ?? {
        upcoming: 0,
        today: 0,
        past: 0,
        all: 0,
      }
    );
  }, [data]);

  const nextUpcomingEvent = useMemo(() => {
    return data?.pages[0]?.nextUpcomingEvent ?? null;
  }, [data]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleResetFilters = useCallback(() => {
    setActiveTab("all");
    setSearchQuery("");
    setDebouncedSearch("");
  }, []);

  const handleToggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => {
      if (prev) {
        setSearchQuery("");
        setDebouncedSearch("");
      }
      return !prev;
    });
  }, []);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/menu");
    }
  }, [router]);

  const handleCloseCreate = useCallback(() => {
    setIsCreateOpen(false);
    setEditingEvent(null);
  }, []);

  const handleEditEvent = useCallback((event: CampusEventItem) => {
    setSelectedEvent(null);
    setEditingEvent(event);
    setIsCreateOpen(true);
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      if (isCreateOpen) {
        handleCloseCreate();
        return true;
      }
      if (selectedEvent) {
        setSelectedEvent(null);
        return true;
      }
      if (isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery("");
        setDebouncedSearch("");
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [isCreateOpen, selectedEvent, isSearchOpen, handleCloseCreate]);

  const renderItem = useCallback(
    ({ item, index }: { item: CampusEventItem; index: number }) => (
      <EventCard item={item} index={index} onPress={setSelectedEvent} />
    ),
    []
  );

  const keyExtractor = useCallback((item: CampusEventItem) => item.id, []);

  const ListHeader = useMemo(() => {
    return (
      <View style={styles.headerComponentContainer}>
        {/* Search Bar (Expandable) */}
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
                onPress={() => {
                  setSearchQuery("");
                  setDebouncedSearch("");
                }}
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

        {/* Hero Card */}
        <EventHeroCard counts={counts} nextEvent={nextUpcomingEvent} />

        {/* Horizontal Tab Filters */}
        <EventTabFilters
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          counts={counts}
        />
      </View>
    );
  }, [isSearchOpen, searchQuery, counts, nextUpcomingEvent, activeTab]);

  const ListEmpty = useMemo(() => {
    if (isLoading) {
      return <EventSkeleton />;
    }
    if (isError) {
      return <EventError onRetry={refetch} />;
    }
    return (
      <EventEmpty
        searchQuery={debouncedSearch}
        activeTab={activeTab}
        onReset={handleResetFilters}
      />
    );
  }, [isLoading, isError, debouncedSearch, activeTab, refetch, handleResetFilters]);

  const ListFooter = useMemo(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={BENTO_COLORS.deepNavy} />
          <Text style={styles.footerLoaderText}>Loading more events...</Text>
        </View>
      );
    }
    return <View style={{ height: insets.bottom > 0 ? insets.bottom + 80 : 96 }} />;
  }, [isFetchingNextPage, insets.bottom]);

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.headerIconButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={BENTO_COLORS.deepNavy} />
        </TouchableOpacity>

        <View style={styles.headerTitlesContainer}>
          <Text style={styles.screenTitle}>Campus Events</Text>
          <Text style={styles.screenSubtitle}>Programs, Fests & Activities</Text>
        </View>

        <TouchableOpacity
          onPress={handleToggleSearch}
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

      {/* Virtualized Infinite Scroll List */}
      <FlatList<CampusEventItem>
        data={events}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        contentContainerStyle={[
          styles.listContent,
          events.length === 0 && { flexGrow: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[BENTO_COLORS.deepNavy]}
            tintColor={BENTO_COLORS.deepNavy}
          />
        }
        removeClippedSubviews={Platform.OS === "android"}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
      />

      {/* Floating Action Button (FAB) - Admin Only */}
      {isAdmin && (
        <TouchableOpacity
          style={[
            styles.fab,
            { bottom: insets.bottom > 0 ? insets.bottom + 16 : 24 },
          ]}
          onPress={() => {
            setEditingEvent(null);
            setIsCreateOpen(true);
          }}
          activeOpacity={0.85}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Create new campus event"
        >
          <Feather name="plus" size={24} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Event Details Modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={handleEditEvent}
      />

      {/* Create / Edit Event Modal - Admin Only */}
      <CreateEventModal
        visible={isCreateOpen}
        onClose={handleCloseCreate}
        eventToEdit={editingEvent}
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
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
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
    fontSize: 11.5,
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  headerComponentContainer: {
    marginBottom: 10,
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 8,
  },
  footerLoaderText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    marginBottom: 14,
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
  fab: {
    position: "absolute",
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: BENTO_COLORS.deepNavy,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
