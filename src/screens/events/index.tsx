import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";

import Toast from "react-native-toast-message";

import {
  useInfiniteCampusEvents,
  useDeleteCampusEvent,
  useCampusEventById,
} from "@/features/events/useEvents";
import { useCurrentUser } from "@/hooks/use-current-user";
import { CampusEventItem } from "@/services/event-service";
import { BENTO_COLORS, EventTabType, fontFamily } from "./constants";
import { EventCard } from "./components/event-card";
import { EventTabFilters } from "./components/event-tab-filters";
import { EventFilterModal } from "./components/event-filter-modal";
import { EventDetailModal } from "./components/event-detail-modal";
import { CreateEventModal } from "./components/create-event-modal";
import { DeleteEventModal } from "./components/delete-event-modal";
import {
  EventLoading,
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

export interface EventsScreenProps {
  hasBackButton?: boolean;
  isStackScreen?: boolean;
  forceAdmin?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
}

export function EventsScreen({
  hasBackButton = false,
  isStackScreen = false,
  forceAdmin = false,
  headerTitle,
  headerSubtitle,
}: EventsScreenProps = {}) {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{
    tab?: EventTabType;
    category?: string;
    search?: string;
    eventId?: string;
  }>();

  const insets = useSafeAreaInsets();
  const { role, user } = useCurrentUser();
  const isAdmin = forceAdmin || role === "ADMIN" || user?.role === "ADMIN";

  const initialTab: EventTabType = useMemo(() => {
    if (
      searchParams.tab &&
      ["upcoming", "today", "past", "all"].includes(searchParams.tab)
    ) {
      return searchParams.tab as EventTabType;
    }
    return "upcoming";
  }, [searchParams.tab]);

  const initialCategory: string = useMemo(() => {
    if (searchParams.category) {
      return searchParams.category.toUpperCase();
    }
    return "ALL";
  }, [searchParams.category]);

  const [activeTab, setActiveTab] = useState<EventTabType>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.search || "");
  const [debouncedSearch, setDebouncedSearch] = useState<string>(searchParams.search || "");
  const [selectedEvent, setSelectedEvent] = useState<CampusEventItem | null>(
    null,
  );
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<CampusEventItem | null>(
    null,
  );
  const [eventToDelete, setEventToDelete] = useState<CampusEventItem | null>(
    null,
  );
  const [isDeletingCard, setIsDeletingCard] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  const deleteEventMutation = useDeleteCampusEvent();

  // Deep-linked direct event selection if eventId provided in URL/notification
  const deepLinkedEventQuery = useCampusEventById(searchParams.eventId || "");
  useEffect(() => {
    if (deepLinkedEventQuery.data && !selectedEvent) {
      setSelectedEvent(deepLinkedEventQuery.data);
    }
  }, [deepLinkedEventQuery.data]);

  // Sync state if URL params change externally
  useEffect(() => {
    if (
      searchParams.tab &&
      ["upcoming", "today", "past", "all"].includes(searchParams.tab) &&
      searchParams.tab !== activeTab
    ) {
      setActiveTab(searchParams.tab as EventTabType);
    }
    if (
      searchParams.category &&
      searchParams.category.toUpperCase() !== selectedCategory
    ) {
      setSelectedCategory(searchParams.category.toUpperCase());
    }
    if (searchParams.search !== undefined && searchParams.search !== searchQuery) {
      setSearchQuery(searchParams.search);
      setDebouncedSearch(searchParams.search.trim());
    }
  }, [searchParams.tab, searchParams.category, searchParams.search]);

  const onEndReachedCalledDuringMomentum = useRef(true);

  // Debounce search query to prevent unnecessary queries while typing (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Infinite query for events with server-side pagination, tab filter, category, and search
  const {
    data,
    isLoading,
    isPending,
    isFetching,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteCampusEvents({
    tab: activeTab,
    category: selectedCategory === "ALL" ? undefined : selectedCategory,
    search: debouncedSearch,
    limit: 10,
  });

  // Flattened events across paginated pages
  const events = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);

  const isDataLoading =
    isLoading ||
    isPending ||
    (isFetching &&
      !isFetchingNextPage &&
      !isRefreshing &&
      (!data || events.length === 0));

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
    setSelectedCategory("ALL");
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

  const handleDeleteCard = useCallback((item: CampusEventItem) => {
    setEventToDelete(item);
  }, []);

  const handleConfirmCardDelete = useCallback(async () => {
    if (!eventToDelete) return;
    setIsDeletingCard(true);
    try {
      await deleteEventMutation.mutateAsync(eventToDelete.id);
      Toast.show({
        type: "success",
        text1: "Event Deleted",
        text2: `"${eventToDelete.title}" has been deleted.`,
      });
      setEventToDelete(null);
    } catch {
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2: "Unable to delete event. Please try again.",
      });
    } finally {
      setIsDeletingCard(false);
    }
  }, [eventToDelete, deleteEventMutation]);

  useEffect(() => {
    const onBackPress = () => {
      if (isCreateOpen) {
        handleCloseCreate();
        return true;
      }
      if (isFilterModalOpen) {
        setIsFilterModalOpen(false);
        return true;
      }
      if (eventToDelete) {
        setEventToDelete(null);
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
      if (selectedCategory !== "ALL") {
        setSelectedCategory("ALL");
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [
    isCreateOpen,
    isFilterModalOpen,
    eventToDelete,
    selectedEvent,
    searchQuery,
    selectedCategory,
    handleCloseCreate,
  ]);

  const renderItem = useCallback(
    ({ item, index }: { item: CampusEventItem; index: number }) => (
      <EventCard
        item={item}
        index={index}
        onPress={setSelectedEvent}
        isAdmin={isAdmin}
        onEdit={handleEditEvent}
        onDelete={handleDeleteCard}
      />
    ),
    [isAdmin, handleEditEvent, handleDeleteCard],
  );

  const keyExtractor = useCallback((item: CampusEventItem) => item.id, []);

  const ListEmpty = useMemo(() => {
    if (isDataLoading) {
      return <EventLoading />;
    }
    if (isError) {
      return <EventError onRetry={refetch} />;
    }
    return (
      <EventEmpty
        searchQuery={debouncedSearch}
        category={selectedCategory}
        activeTab={activeTab}
        onReset={handleResetFilters}
      />
    );
  }, [
    isDataLoading,
    isError,
    debouncedSearch,
    selectedCategory,
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
      {/* ── Fixed Top Section: Header, Search Box, Category & Tab Filters ── */}
      <View style={styles.fixedTopSection}>
        {/* Top Header Row */}
        <View style={styles.heroRow}>
          {hasBackButton && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              activeOpacity={0.7}
            >
              <Feather
                name="arrow-left"
                size={20}
                color={BENTO_COLORS.deepNavy}
              />
            </TouchableOpacity>
          )}

          {/* Left: Title + subtitle */}
          <View style={styles.heroTitleGroup}>
            <Text style={styles.screenTitle}>
              {headerTitle || "Campus Events"}
            </Text>
            <Text style={styles.screenSubtitle}>
              {headerSubtitle || "Programs, Fests & Workshops"}
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

        {/* Permanent, Responsive Search Bar with Category Filter Button */}
        <View style={styles.searchRow}>
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

          {/* Category Filter Button */}
          <TouchableOpacity
            onPress={() => setIsFilterModalOpen(true)}
            style={[
              styles.filterBtn,
              selectedCategory !== "ALL" && styles.filterBtnActive,
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Filter campus events by category"
            activeOpacity={0.8}
          >
            <Feather
              name="filter"
              size={18}
              color={
                selectedCategory !== "ALL"
                  ? "#ffffff"
                  : BENTO_COLORS.deepNavy
              }
            />
            {selectedCategory !== "ALL" && <View style={styles.activeDot} />}
          </TouchableOpacity>
        </View>

        {/* Active Search & Category Badges */}
        {(debouncedSearch.length > 0 || selectedCategory !== "ALL") && (
          <View style={styles.activeFiltersRow}>
            {debouncedSearch.length > 0 && (
              <View style={styles.activeSearchBadgeRow}>
                <Text style={styles.activeSearchBadgeText} numberOfLines={1}>
                  "{debouncedSearch}"
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

            {selectedCategory !== "ALL" && (
              <View style={styles.activeCategoryBadgeRow}>
                <Text style={styles.activeCategoryBadgeText} numberOfLines={1}>
                  Category: {selectedCategory}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedCategory("ALL")}
                  style={styles.clearCategoryChip}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Clear category filter"
                >
                  <Feather name="x" size={11} color="#ffffff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Horizontal Tab Filters */}
        <EventTabFilters
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          counts={counts}
        />
      </View>

      {/* Virtualized Infinite Scroll List with Lazy Loading & Momentum Protection */}
      <FlatList<CampusEventItem>
        data={events}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        contentContainerStyle={[
          styles.listContent,
          events.length === 0 && { flexGrow: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
            {
              bottom: isStackScreen
                ? insets.bottom > 0
                  ? insets.bottom + 20
                  : 28
                : insets.bottom > 0
                  ? insets.bottom + 88
                  : 100,
            },
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
          <Feather
            name="plus"
            size={18}
            color="#ffffff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.fabText}>Create Event</Text>
        </TouchableOpacity>
      )}

      {/* Event Details Modal - Lazy Loaded on Demand */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={handleEditEvent}
          isAdmin={isAdmin}
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

      {/* Delete Confirmation Modal for Card Quick Delete */}
      <DeleteEventModal
        visible={!!eventToDelete}
        event={eventToDelete}
        isDeleting={isDeletingCard}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleConfirmCardDelete}
      />

      {/* Category Filter Bottom Sheet Modal */}
      <EventFilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedCategory={selectedCategory}
        onApplyCategory={setSelectedCategory}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },

  // ── Fixed Top Section (Header, Search, Tabs) ─────────────────
  fixedTopSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: BENTO_COLORS.background,
    zIndex: 10,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
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
    height: 130,
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
    paddingTop: 4,
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: BENTO_COLORS.searchRadius,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    ...BENTO_COLORS.shadow,
  },
  searchInput: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.neutralText,
    padding: 0,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: BENTO_COLORS.searchRadius,
    backgroundColor: BENTO_COLORS.white,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    ...BENTO_COLORS.shadow,
  },
  filterBtnActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  activeDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#38bdf8",
  },
  backButton: {
    marginRight: 12,
    marginTop: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BENTO_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    ...BENTO_COLORS.shadow,
  },
  activeFiltersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  activeSearchBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
  },
  activeSearchBadgeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
  },
  clearSearchChip: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  activeCategoryBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.25)",
  },
  activeCategoryBadgeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#b45309",
  },
  clearCategoryChip: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#b45309",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  cardsListContainer: {
    marginBottom: 16,
  },
  fab: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  fabText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
});
