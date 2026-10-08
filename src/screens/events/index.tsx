import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
  Image,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { useInfiniteCampusEvents } from "@/features/events/useEvents";
import { useCurrentUser } from "@/hooks/use-current-user";
import { CampusEventItem } from "@/services/event-service";
import { BENTO_COLORS, EventTabType, fontFamily } from "./constants";
import { EventCard } from "./components/event-card";
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
  const insets = useSafeAreaInsets();
  const { role, user } = useCurrentUser();
  const isAdmin = role === "ADMIN" || user?.role === "ADMIN";

  const [activeTab, setActiveTab] = useState<EventTabType>("upcoming");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<CampusEventItem | null>(
    null,
  );
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<CampusEventItem | null>(
    null,
  );
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const onEndReachedCalledDuringMomentum = useRef(true);

  // Debounce search query to prevent unnecessary queries while typing (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);

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

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleMomentumScrollBegin = useCallback(() => {
    onEndReachedCalledDuringMomentum.current = false;
  }, []);

  const handleEndReached = useCallback(() => {
    if (
      !onEndReachedCalledDuringMomentum.current &&
      !isLoading &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      onEndReachedCalledDuringMomentum.current = true;
      fetchNextPage();
    }
  }, [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleResetFilters = useCallback(() => {
    setActiveTab("all");
    setSearchQuery("");
    setDebouncedSearch("");
  }, []);

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
      if (searchQuery.length > 0) {
        setSearchQuery("");
        setDebouncedSearch("");
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [isCreateOpen, selectedEvent, searchQuery, handleCloseCreate]);

  const renderItem = useCallback(
    ({ item, index }: { item: CampusEventItem; index: number }) => (
      <EventCard item={item} index={index} onPress={setSelectedEvent} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: CampusEventItem) => item.id, []);

  const ListHeader = useMemo(() => {
    return (
      <View style={styles.headerComponentContainer}>
        {/* Permanent, Responsive Search Bar */}
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
              accessibilityLabel="Clear search query"
            >
              <Feather
                name="x-circle"
                size={16}
                color={BENTO_COLORS.subtleText}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Active Search Filter Badge Feedback */}
        {debouncedSearch.length > 0 && (
          <View style={styles.activeSearchBadgeRow}>
            <Text style={styles.activeSearchBadgeText} numberOfLines={1}>
              Results for "{debouncedSearch}"
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setDebouncedSearch("");
              }}
              style={styles.clearSearchChip}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Clear search filter"
            >
              <Feather name="x" size={11} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Horizontal Tab Filters */}
        <EventTabFilters
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          counts={counts}
        />
      </View>
    );
  }, [searchQuery, debouncedSearch, counts, activeTab]);

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
  }, [
    isLoading,
    isError,
    debouncedSearch,
    activeTab,
    refetch,
    handleResetFilters,
  ]);

  const ListFooter = useMemo(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={BENTO_COLORS.deepNavy} />
          <Text style={styles.footerLoaderText}>Loading more events...</Text>
        </View>
      );
    }
    if (!hasNextPage && events.length > 0) {
      return (
        <View style={styles.endOfListContainer}>
          <View style={styles.endOfListDot} />
          <Text style={styles.endOfListText}>You're all caught up</Text>
          <View
            style={{ height: insets.bottom > 0 ? insets.bottom + 90 : 100 }}
          />
        </View>
      );
    }
    // Extra space so content is not hidden behind the floating tab bar
    return (
      <View style={{ height: insets.bottom > 0 ? insets.bottom + 110 : 120 }} />
    );
  }, [isFetchingNextPage, hasNextPage, events.length, insets.bottom]);

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      {/* ── Header (ExploreHeader-style) ── */}
      <View style={styles.heroContainer}>
        <View style={styles.heroRow}>
          {/* Left: Title + subtitle */}
          <View style={styles.heroTitleGroup}>
            <Text style={styles.screenTitle}>Campus Events</Text>
            <Text style={styles.screenSubtitle}>
              Programs, Fests, Workshops & Activities
            </Text>
          </View>

          <View style={styles.heroIllustrationWrap} pointerEvents="none">
            <Image
              source={require("@/assets/header-bg-images/event-screen-bg-2.png")}
              style={styles.heroIllustration}
              resizeMode="contain"
              accessible={false}
            />
          </View>
        </View>
      </View>

      {/* Virtualized Infinite Scroll List with Lazy Loading & Momentum Protection */}
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
        onMomentumScrollBegin={handleMomentumScrollBegin}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[BENTO_COLORS.deepNavy]}
            tintColor={BENTO_COLORS.deepNavy}
          />
        }
        removeClippedSubviews={Platform.OS === "android"}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={5}
      />

      {/* Floating Action Button (FAB) - Admin Only */}
      {isAdmin && (
        <TouchableOpacity
          style={[
            styles.fab,
            { bottom: insets.bottom > 0 ? insets.bottom + 88 : 100 },
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

      {/* Event Details Modal - Lazy Loaded on Demand */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={handleEditEvent}
        />
      )}

      {/* Create / Edit Event Modal - Admin Only - Lazy Loaded on Demand */}
      {isCreateOpen && (
        <CreateEventModal
          visible={isCreateOpen}
          onClose={handleCloseCreate}
          eventToEdit={editingEvent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },

  // ── Header (mirrors ExploreHeader) ────────────────────────────
  heroContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: BENTO_COLORS.background,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  heroTitleGroup: {
    flex: 1,
    paddingTop: 6,
  },
  heroIllustrationWrap: {
    width: 110,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -20,
  },
  heroIllustration: {
    width: 250,
    height: 120,
    opacity: 0.7,
  },
  screenTitle: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  screenSubtitle: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.subtleText,
    marginTop: 7,
    fontWeight: "500",
    zIndex: 10,
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
  endOfListContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  endOfListDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#cbd5e1",
    marginBottom: 6,
  },
  endOfListText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
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
    marginBottom: 10,
    ...BENTO_COLORS.shadow,
  },
  searchInput: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.neutralText,
    padding: 0,
  },
  activeSearchBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.15)",
  },
  activeSearchBadgeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
    flex: 1,
  },
  clearSearchChip: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
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
