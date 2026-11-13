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
  Pressable,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useNetworkStatus } from "@/hooks/use-network-status";
import {
  useMarketplaceFeed,
  flattenFeedPages,
  useDeleteMarketplacePost,
} from "@/features/campus-hub/useMarketplace";
import {
  requireOnline,
  showApiErrorToast,
} from "@/features/campus-hub/useLostFoundUpload";
import { resolveMarketplaceErrorState } from "@/features/campus-hub/marketplace-logic";
import type {
  MarketplacePost,
  ListingType,
  ListingStatus,
  MarketplaceCategory,
  FeedQueryParams,
} from "@/services/marketplace-service";
import { colors } from "@/theme/colors";
import { CAMPUS_HUB_COLORS, fontFamily } from "../shared/design-tokens";
import { setCampusHubActiveSection } from "../shared/hub-state";
import { MARKETPLACE_CATEGORY_LABELS } from "./marketplace-constants";
import { ComposeMarketplaceModal } from "./compose-modal";
import { MarketplaceHero } from "./components/marketplace-hero";
import {
  MarketplaceFilterModal,
  type MarketplaceTypeFilter,
  type MarketplaceStatusFilter,
  type MarketplaceCategoryFilter,
} from "./components/marketplace-filter-modal";
import { ListingCard } from "./components/listing-card";
import { MarketplaceDeleteModal } from "./components/marketplace-delete-modal";
import { MarketplaceSkeleton } from "./components/marketplace-skeleton";

const ACCENT = CAMPUS_HUB_COLORS.marketplaceAccent;
const SEARCH_DEBOUNCE_MS = 400;

interface MarketplaceSectionProps {
  isComposeVisible?: boolean;
  onOpenCompose?: () => void;
  onCloseCompose?: () => void;
}

export function MarketplaceSection({
  isComposeVisible: externalIsComposeVisible,
  onOpenCompose: externalOnOpenCompose,
  onCloseCompose: externalOnCloseCompose,
}: MarketplaceSectionProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { user: currentUser } = useCurrentUser();
  const { isOffline } = useNetworkStatus();

  // --- Filter state ---
  const [typeFilter, setTypeFilter] = useState<MarketplaceTypeFilter>("ALL");
  const [statusFilter, setStatusFilter] =
    useState<MarketplaceStatusFilter>("ALL");
  const [categoryFilter, setCategoryFilter] =
    useState<MarketplaceCategoryFilter>("ALL");
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

  // --- Admin / Owner delete state ---
  const deleteMutation = useDeleteMarketplacePost();
  const [postToDelete, setPostToDelete] = useState<{
    id: string;
    title: string;
    price?: number | null;
    type?: ListingType;
    image?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(
    (
      id: string,
      title: string,
      price?: number | null,
      image?: string,
      type?: ListingType,
    ) => {
      setPostToDelete({ id, title, price, image, type });
    },
    [],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!postToDelete) return;
    if (!requireOnline(isOffline, "Reconnect to delete this listing.")) return;

    setIsDeleting(true);
    deleteMutation.mutate(postToDelete.id, {
      onSuccess: () => {
        setIsDeleting(false);
        setPostToDelete(null);
        Toast.show({
          type: "success",
          text1: "Listing Deleted",
          text2: "Item was removed from Marketplace.",
        });
      },
      onError: (err) => {
        setIsDeleting(false);
        setPostToDelete(null);
        showApiErrorToast(err, "Delete Failed", "Failed to delete listing.");
      },
    });
  }, [postToDelete, isOffline, deleteMutation]);

  // --- Responsive card width ---
  const cardWidth = useMemo(() => {
    const effectiveWidth = Math.min(
      windowWidth,
      CAMPUS_HUB_COLORS.contentMaxWidth,
    );
    const horizontalPadding = 40;
    const gap = 12;
    return Math.floor((effectiveWidth - horizontalPadding - gap) / 2);
  }, [windowWidth]);

  // --- Derived query params (server-side filtering) ---
  const feedParams = useMemo((): Omit<FeedQueryParams, "cursor" | "limit"> => {
    const params: Omit<FeedQueryParams, "cursor" | "limit"> = {};
    if (typeFilter !== "ALL") params.type = typeFilter as ListingType;
    if (statusFilter !== "ALL") params.status = statusFilter as ListingStatus;
    if (categoryFilter !== "ALL")
      params.category = categoryFilter as MarketplaceCategory;
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
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useMarketplaceFeed(feedParams);

  const posts = useMemo(() => flattenFeedPages(data), [data]);

  const firstPage = data?.pages[0];
  const totalCount = firstPage?.total ?? 0;
  const sellingCount =
    firstPage?.counts?.selling ??
    posts.filter((p) => p.type === "SELLING").length;
  const buyingCount =
    firstPage?.counts?.buying ??
    posts.filter((p) => p.type === "BUYING").length;

  // --- Pull-to-refresh ---
  const [isRefreshing, setIsRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    if (isOffline) {
      Toast.show({
        type: "info",
        text1: "You're offline",
        text2: "Reconnect to refresh marketplace listings.",
      });
      return;
    }
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [isOffline, refetch]);

  // --- Infinite scroll trigger ---
  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isOffline) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isOffline, fetchNextPage]);

  // --- Navigation ---
  const navigateToDetail = useCallback(
    (id: string) => {
      setCampusHubActiveSection("MARKETPLACE");
      router.push(`/campus-hub/marketplace/${id}` as any);
    },
    [router],
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
    [],
  );

  // --- Compose handlers ---
  const handleOpenCompose = useCallback(() => {
    if (!currentUser) {
      Toast.show({ type: "error", text1: "Please log in first." });
      return;
    }
    if (!requireOnline(isOffline, "Reconnect to create a new listing.")) return;
    if (externalOnOpenCompose) {
      externalOnOpenCompose();
    } else {
      setInternalComposeVisible(true);
    }
  }, [currentUser, isOffline, externalOnOpenCompose]);

  const handleCloseCompose = useCallback(() => {
    if (externalOnCloseCompose) {
      externalOnCloseCompose();
    } else {
      setInternalComposeVisible(false);
    }
  }, [externalOnCloseCompose]);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const renderItem = useCallback(
    ({ item }: { item: MarketplacePost }) => (
      <ListingCard
        post={item}
        cardWidth={cardWidth}
        isAdmin={currentUser?.role === "ADMIN"}
        onDelete={handleDelete}
        onPress={() => navigateToDetail(item.id)}
      />
    ),
    [cardWidth, currentUser?.role, handleDelete, navigateToDetail],
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

    if (isError) {
      const errorState = resolveMarketplaceErrorState({
        err: error,
        isOffline,
      });
      return (
        <View style={styles.centerState}>
          <View style={styles.errorIconWrap}>
            <Feather
              name={errorState === "offline" ? "wifi-off" : "alert-circle"}
              size={30}
              color={CAMPUS_HUB_COLORS.dangerText}
            />
          </View>
          <Text style={styles.stateTitle}>
            {errorState === "offline"
              ? "You're offline"
              : "Could not load listings"}
          </Text>
          <Text style={styles.stateSubtitle}>
            {errorState === "offline"
              ? "Reconnect to the internet to browse latest marketplace items."
              : "There was an issue fetching marketplace items. Please try again."}
          </Text>
          <View style={styles.errorActionsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.retryBtn,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => refetch()}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Try loading listings again"
            >
              <Feather
                name="refresh-cw"
                size={14}
                color={CAMPUS_HUB_COLORS.white}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.retryBtnText}>Try Again</Text>
            </Pressable>
            {(activeFilterCount > 0 || Boolean(debouncedSearch)) && (
              <Pressable
                style={({ pressed }) => [
                  styles.resetErrorBtn,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => {
                  setSearchInput("");
                  setDebouncedSearch("");
                  handleResetFilters();
                }}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Reset filters"
              >
                <Text style={styles.resetErrorBtnText}>Reset Filters</Text>
              </Pressable>
            )}
          </View>
        </View>
      );
    }

    const hasSearchOrFilter = Boolean(debouncedSearch) || activeFilterCount > 0;
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
          {hasSearchOrFilter ? "No matching listings" : "No listings yet"}
        </Text>
        <Text style={styles.emptySubtitle}>
          {debouncedSearch
            ? `No items found for "${debouncedSearch}". Try a different keyword.`
            : activeFilterCount > 0
              ? "No items match your active filters. Try widening your criteria."
              : "Be the first student to post something on campus."}
        </Text>
        {hasSearchOrFilter ? (
          <Pressable
            style={({ pressed }) => [
              styles.emptyActionBtn,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => {
              setSearchInput("");
              setDebouncedSearch("");
              handleResetFilters();
            }}
            android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Reset filters"
          >
            <Text style={styles.emptyActionBtnText}>Reset Filters</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.emptyActionBtn,
              pressed && { opacity: 0.85 },
            ]}
            onPress={handleOpenCompose}
            android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Post a listing"
          >
            <Feather
              name="plus"
              size={14}
              color={CAMPUS_HUB_COLORS.white}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.emptyActionBtnText}>Post a Listing</Text>
          </Pressable>
        )}
      </View>
    );
  }, [
    isLoading,
    isError,
    error,
    isOffline,
    cardWidth,
    debouncedSearch,
    activeFilterCount,
    refetch,
    handleResetFilters,
    handleOpenCompose,
  ]);

  const ListHeader = useMemo(
    () => (
      <>
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Feather
              name="wifi-off"
              size={13}
              color={CAMPUS_HUB_COLORS.lostFoundAccentInk}
            />
            <Text style={styles.offlineBannerText}>
              You're offline. Showing cached listings.
            </Text>
          </View>
        )}

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
              placeholder="Search essentials..."
              placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
              value={searchInput}
              onChangeText={handleSearchChange}
              accessible
              accessibilityLabel="Search campus marketplace"
              returnKeyType="search"
              numberOfLines={1}
              multiline={false}
            />
            {searchInput.length > 0 && (
              <Pressable
                onPress={() => {
                  setSearchInput("");
                  setDebouncedSearch("");
                }}
                style={({ pressed }) => pressed && { opacity: 0.7 }}
                android_ripple={{
                  color: CAMPUS_HUB_COLORS.androidRipple,
                  borderless: true,
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Feather
                  name="x-circle"
                  size={16}
                  color={CAMPUS_HUB_COLORS.subtleText}
                />
              </Pressable>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.filterBtn,
              activeFilterCount > 0 && styles.filterBtnActive,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => setIsFilterModalOpen(true)}
            android_ripple={{
              color:
                activeFilterCount > 0
                  ? CAMPUS_HUB_COLORS.androidRippleLight
                  : CAMPUS_HUB_COLORS.androidRipple,
            }}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Filter marketplace. ${activeFilterCount} active filters`}
          >
            <Feather
              name="sliders"
              size={18}
              color={
                activeFilterCount > 0
                  ? CAMPUS_HUB_COLORS.white
                  : CAMPUS_HUB_COLORS.deepNavy
              }
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text
                  style={styles.filterBadgeText}
                  maxFontSizeMultiplier={1.15}
                >
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </Pressable>
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
                label={
                  statusFilter === "ACTIVE"
                    ? "Available"
                    : statusFilter === "SOLD"
                      ? "Sold"
                      : "Closed"
                }
                onRemove={() => setStatusFilter("ALL")}
              />
            )}
            {categoryFilter !== "ALL" && (
              <FilterChip
                label={
                  MARKETPLACE_CATEGORY_LABELS[categoryFilter] ?? categoryFilter
                }
                onRemove={() => setCategoryFilter("ALL")}
              />
            )}
            <Pressable
              onPress={handleResetFilters}
              style={({ pressed }) => [
                styles.clearAllBtn,
                pressed && { opacity: 0.7 },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Clear all filters"
            >
              <Text style={styles.clearAllText}>Clear all</Text>
            </Pressable>
          </View>
        )}

        {/* Hero Stats Card */}
        <MarketplaceHero
          stats={{
            total: totalCount,
            selling: sellingCount,
            buying: buyingCount,
          }}
        />
      </>
    ),
    [
      isOffline,
      searchInput,
      handleSearchChange,
      activeFilterCount,
      typeFilter,
      statusFilter,
      categoryFilter,
      handleResetFilters,
      totalCount,
      sellingCount,
      buyingCount,
    ],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <View style={styles.outerWrap}>
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
        removeClippedSubviews={Platform.OS === "android"}
        maxToRenderPerBatch={8}
        windowSize={7}
        initialNumToRender={8}
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

      {postToDelete && (
        <MarketplaceDeleteModal
          visible={Boolean(postToDelete)}
          isDeleting={isDeleting}
          postTitle={postToDelete.title}
          postPrice={postToDelete.price}
          postType={postToDelete.type}
          postImage={postToDelete.image}
          onConfirm={handleConfirmDelete}
          onClose={() => setPostToDelete(null)}
        />
      )}
    </View>
  );
}

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <View style={styles.activeChip}>
      <Text style={styles.activeChipText} maxFontSizeMultiplier={1.2}>
        {label}
      </Text>
      <Pressable
        onPress={onRemove}
        style={({ pressed }) => pressed && { opacity: 0.7 }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        android_ripple={{
          color: CAMPUS_HUB_COLORS.androidRipple,
          borderless: true,
        }}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Remove ${label} filter`}
      >
        <Feather
          name="x"
          size={13}
          color={CAMPUS_HUB_COLORS.marketplaceAccentText}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    flex: 1,
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentLight,
    borderWidth: 1,
    borderColor: colors.semantic.amber.border,
  },
  offlineBannerText: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.lostFoundAccentInk,
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
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  searchInput: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.neutralText,
    paddingVertical: 0,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: CAMPUS_HUB_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
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
    borderColor: CAMPUS_HUB_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.white,
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
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
    backgroundColor: CAMPUS_HUB_COLORS.resolvedGreenBg,
    borderWidth: 1,
    borderColor: colors.semantic.emerald.mintBorder,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  activeChipText: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
    includeFontPadding: false,
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
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 10,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  errorIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CAMPUS_HUB_COLORS.dangerBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  stateTitle: {
    fontFamily,
    fontSize: 16,
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
  errorActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  resetErrorBtn: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    overflow: "hidden",
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  resetErrorBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  emptyCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 36,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
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
    minHeight: 48,
    backgroundColor: ACCENT,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    overflow: "hidden",
    marginTop: 12,
  },
  emptyActionBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.white,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    overflow: "hidden",
    backgroundColor: ACCENT,
  },
  retryBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.white,
  },
});
