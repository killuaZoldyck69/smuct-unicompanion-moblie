import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useMarketplaceFeed,
  flattenFeedPages,
} from "@/features/campus-hub/useMarketplace";
import type {
  MarketplacePost,
  ListingType,
  ListingStatus,
  MarketplaceCategory,
  FeedQueryParams,
} from "@/services/marketplace-service";
import { CAMPUS_HUB_COLORS, fontFamily } from "../shared/design-tokens";
import { setCampusHubActiveSection } from "../shared/hub-state";
import { ComposeMarketplaceModal } from "./compose-modal";
import { MarketplaceHero } from "./components/marketplace-hero";
import {
  MarketplaceFilterModal,
  type MarketplaceTypeFilter,
  type MarketplaceStatusFilter,
  type MarketplaceCategoryFilter,
} from "./components/marketplace-filter-modal";
import { ListingCard } from "./components/listing-card";
import { MarketplaceSkeleton } from "./components/marketplace-skeleton";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const ACCENT = CAMPUS_HUB_COLORS.marketplaceAccent;
const SEARCH_DEBOUNCE_MS = 400;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface MarketplaceSectionProps {
  isComposeVisible?: boolean;
  onOpenCompose?: () => void;
  onCloseCompose?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function MarketplaceSection({
  isComposeVisible: externalIsComposeVisible,
  onOpenCompose: externalOnOpenCompose,
  onCloseCompose: externalOnCloseCompose,
}: MarketplaceSectionProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { user: currentUser } = useCurrentUser();

  // --- Filter state ---
  const [typeFilter, setTypeFilter] = useState<MarketplaceTypeFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<MarketplaceStatusFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<MarketplaceCategoryFilter>("ALL");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // --- Search with debounce ---
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((text: string) => {
    setSearchInput(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(text.trim());
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // --- Compose modal state ---
  const [internalComposeVisible, setInternalComposeVisible] = useState(false);
  const isComposeVisible =
    externalIsComposeVisible !== undefined
      ? externalIsComposeVisible
      : internalComposeVisible;

  // --- Responsive card width ---
  const cardWidth = useMemo(() => {
    const horizontalPadding = 40;
    const gap = 12;
    return Math.floor((windowWidth - horizontalPadding - gap) / 2);
  }, [windowWidth]);

  // --- Derived query params (server-side filtering) ---
  const feedParams = useMemo((): Omit<FeedQueryParams, "cursor" | "limit"> => {
    const params: Omit<FeedQueryParams, "cursor" | "limit"> = {};
    if (typeFilter !== "ALL") params.type = typeFilter as ListingType;
    if (statusFilter !== "ALL") params.status = statusFilter as ListingStatus;
    if (categoryFilter !== "ALL") params.category = categoryFilter as MarketplaceCategory;
    if (debouncedSearch) params.search = debouncedSearch;
    return params;
  }, [typeFilter, statusFilter, categoryFilter, debouncedSearch]);

  const activeFilterCount =
    (typeFilter !== "ALL" ? 1 : 0) +
    (statusFilter !== "ALL" ? 1 : 0) +
    (categoryFilter !== "ALL" ? 1 : 0);

  // --- Infinite query ---
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useMarketplaceFeed(feedParams);

  const posts = useMemo(() => flattenFeedPages(data), [data]);

  const totalCount = data?.pages[0]?.total ?? 0;

  // --- Pull-to-refresh ---
  const [isRefreshing, setIsRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // --- Infinite scroll trigger ---
  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // --- Navigation ---
  const navigateToDetail = useCallback(
    (id: string) => {
      setCampusHubActiveSection("MARKETPLACE");
      router.push(`/campus-hub/marketplace/${id}` as any);
    },
    [router]
  );

  // --- Filter handlers ---
  const handleResetFilters = useCallback(() => {
    setTypeFilter("ALL");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
  }, []);

  const handleApplyFilters = useCallback(
    (filters: {
      type: MarketplaceTypeFilter;
      status: MarketplaceStatusFilter;
      category: MarketplaceCategoryFilter;
    }) => {
      setTypeFilter(filters.type);
      setStatusFilter(filters.status);
      setCategoryFilter(filters.category);
    },
    []
  );

  // --- Compose handlers ---
  const handleOpenCompose = useCallback(() => {
    if (!currentUser) {
      return Toast.show({ type: "error", text1: "Please log in first." });
    }
    externalOnOpenCompose ? externalOnOpenCompose() : setInternalComposeVisible(true);
  }, [currentUser, externalOnOpenCompose]);

  const handleCloseCompose = useCallback(() => {
    externalOnCloseCompose ? externalOnCloseCompose() : setInternalComposeVisible(false);
  }, [externalOnCloseCompose]);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const renderItem = useCallback(
    ({ item }: { item: MarketplacePost }) => (
      <ListingCard
        post={item}
        cardWidth={cardWidth}
        onPress={() => navigateToDetail(item.id)}
      />
    ),
    [cardWidth, navigateToDetail]
  );

  const keyExtractor = useCallback((item: MarketplacePost) => item.id, []);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={ACCENT} />
      </View>
    );
  }, [isFetchingNextPage]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return <MarketplaceSkeleton cardWidth={cardWidth} />;
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconCircle}>
          <Feather
            name="shopping-bag"
            size={28}
            color={CAMPUS_HUB_COLORS.marketplaceAccentText}
          />
        </View>
        <Text style={styles.emptyTitle}>
          {debouncedSearch ? "No matching listings" : "No listings yet"}
        </Text>
        <Text style={styles.emptySubtitle}>
          {debouncedSearch
            ? `No items found for "${debouncedSearch}". Try a different keyword.`
            : "Be the first student to post something on campus."}
        </Text>
        {debouncedSearch ? (
          <TouchableOpacity
            style={styles.emptyActionBtn}
            onPress={() => {
              setSearchInput("");
              setDebouncedSearch("");
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyActionBtnText}>Clear Search</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.emptyActionBtn}
            onPress={handleOpenCompose}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={14} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.emptyActionBtnText}>Post a Listing</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [isLoading, debouncedSearch, cardWidth, handleOpenCompose]);

  const ListHeader = useMemo(
    () => (
      <>
        {/* Search & Filter Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInputBox}>
            <Feather
              name="search"
              size={16}
              color={CAMPUS_HUB_COLORS.subtleText}
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search textbooks, tech, dorm essentials..."
              placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
              value={searchInput}
              onChangeText={handleSearchChange}
              accessible
              accessibilityLabel="Search campus marketplace"
              returnKeyType="search"
            />
            {searchInput.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchInput("");
                  setDebouncedSearch("");
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather
                  name="x-circle"
                  size={16}
                  color={CAMPUS_HUB_COLORS.subtleText}
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
            onPress={() => setIsFilterModalOpen(true)}
            activeOpacity={0.8}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Filter marketplace. ${activeFilterCount} active filters`}
          >
            <Feather
              name="sliders"
              size={18}
              color={activeFilterCount > 0 ? "#ffffff" : CAMPUS_HUB_COLORS.deepNavy}
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <View style={styles.activeChipsRow}>
            {typeFilter !== "ALL" && (
              <FilterChip
                label={typeFilter === "SELLING" ? "For Sale" : "Wanted"}
                onRemove={() => setTypeFilter("ALL")}
              />
            )}
            {statusFilter !== "ALL" && (
              <FilterChip
                label={statusFilter === "ACTIVE" ? "Available" : "Sold"}
                onRemove={() => setStatusFilter("ALL")}
              />
            )}
            {categoryFilter !== "ALL" && (
              <FilterChip
                label={
                  categoryFilter.charAt(0) + categoryFilter.slice(1).toLowerCase()
                }
                onRemove={() => setCategoryFilter("ALL")}
              />
            )}
            <TouchableOpacity onPress={handleResetFilters} style={styles.clearAllBtn}>
              <Text style={styles.clearAllText}>Clear all</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Hero Stats Card */}
        <MarketplaceHero
          stats={{
            total: totalCount,
            selling: posts.filter((p) => p.type === "SELLING").length,
            buying: posts.filter((p) => p.type === "BUYING").length,
          }}
        />
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      searchInput,
      activeFilterCount,
      typeFilter,
      statusFilter,
      categoryFilter,
      totalCount,
      posts,
    ]
  );

  // --- Error state ---
  if (isError) {
    return (
      <View style={styles.centerState}>
        <View style={styles.errorIconWrap}>
          <Feather name="alert-circle" size={32} color={CAMPUS_HUB_COLORS.dangerText} />
        </View>
        <Text style={styles.stateTitle}>Could not load listings</Text>
        <Text style={styles.stateSubtitle}>
          There was an issue fetching marketplace items. Please check your connection.
        </Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => refetch()}
          activeOpacity={0.8}
        >
          <Feather name="refresh-cw" size={14} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <View style={{ flex: 1 }}>
      <FlatList<MarketplacePost>
        data={posts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[ACCENT]}
            tintColor={ACCENT}
          />
        }
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
        getItemLayout={(_data, index) => ({
          length: cardWidth + 12,
          offset: (cardWidth + 12) * Math.floor(index / 2),
          index,
        })}
      />

      <ComposeMarketplaceModal
        visible={isComposeVisible}
        onClose={handleCloseCompose}
        currentUser={currentUser}
      />

      <MarketplaceFilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <View style={styles.activeChip}>
      <Text style={styles.activeChipText}>{label}</Text>
      <TouchableOpacity
        onPress={onRemove}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Feather
          name="x"
          size={13}
          color={CAMPUS_HUB_COLORS.marketplaceAccentText}
        />
      </TouchableOpacity>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  searchInputBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  searchInput: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    ...CAMPUS_HUB_COLORS.shadow,
    position: "relative",
  },
  filterBtnActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  filterBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: CAMPUS_HUB_COLORS.dangerText,
    borderWidth: 1.5,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
  },
  activeChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
    alignItems: "center",
  },
  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  activeChipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
  },
  clearAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  clearAllText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  centerState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 30,
    gap: 12,
  },
  errorIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: CAMPUS_HUB_COLORS.dangerBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  stateTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    textAlign: "center",
  },
  stateSubtitle: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 19,
  },
  emptyCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 36,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 240,
  },
  emptyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ACCENT,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    marginTop: 12,
  },
  emptyActionBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: ACCENT,
    marginTop: 6,
  },
  retryBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
