import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useInfiniteLostFoundFeed } from "@/features/campus-hub/useLostFound";
import type {
  LostFoundPost,
  LostFoundType,
  LostFoundStatus,
  LostFoundCategory,
  GetLostFoundFeedParams,
} from "@/services/lost-found-service";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  timeAgo,
} from "../shared/design-tokens";
import { setCampusHubActiveSection } from "../shared/hub-state";
import { ComposeLostFoundModal } from "./compose-modal";
import {
  TypeBadge,
  StatusBadge,
  CategoryBadge,
} from "./components/status-badge";
import {
  FilterModal,
  type TypeFilter,
  type StatusFilter,
} from "./components/filter-modal";

const CATEGORY_LABELS: Record<string, string> = {
  ID_CARD: "ID Card",
  ELECTRONICS: "Electronics",
  KEYS: "Keys",
  BOOKS: "Books",
  CLOTHING: "Clothing",
  OTHER: "Other",
};

const ACCENT = CAMPUS_HUB_COLORS.lostFoundAccent;

export interface LostFoundSectionProps {
  isComposeVisible?: boolean;
  onCloseCompose?: () => void;
}

export function LostFoundSection({
  isComposeVisible: externalIsComposeVisible,
  onCloseCompose: externalOnCloseCompose,
}: LostFoundSectionProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useCurrentUser();

  // Filters state
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | LostFoundCategory>("ALL");
  const [myPostsOnly, setMyPostsOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [internalComposeVisible, setInternalComposeVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const activeFilterCount = useMemo(() => {
    return (
      (typeFilter !== "ALL" ? 1 : 0) +
      (statusFilter !== "ALL" ? 1 : 0) +
      (categoryFilter !== "ALL" ? 1 : 0) +
      (myPostsOnly ? 1 : 0)
    );
  }, [typeFilter, statusFilter, categoryFilter, myPostsOnly]);

  const resetAllFilters = useCallback(() => {
    setTypeFilter("ALL");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setMyPostsOnly(false);
  }, []);

  const handleApplyFilters = useCallback(
    (filters: {
      type: TypeFilter;
      status: StatusFilter;
      category: "ALL" | LostFoundCategory;
      myPosts: boolean;
    }) => {
      setTypeFilter(filters.type);
      setStatusFilter(filters.status);
      setCategoryFilter(filters.category);
      setMyPostsOnly(filters.myPosts);
    },
    []
  );

  // Debounce search query to relieve frontend and trigger server-side query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const isComposeVisible =
    externalIsComposeVisible !== undefined
      ? externalIsComposeVisible
      : internalComposeVisible;
  const handleCloseCompose =
    externalOnCloseCompose || (() => setInternalComposeVisible(false));

  // Construct query parameters for server-side filtering & search
  const queryParams = useMemo<GetLostFoundFeedParams>(() => {
    const p: GetLostFoundFeedParams = {};

    if (typeFilter !== "ALL") p.type = typeFilter;
    if (statusFilter !== "ALL") p.status = statusFilter;
    if (categoryFilter !== "ALL") p.category = categoryFilter;
    if (myPostsOnly) p.myPosts = true;
    if (debouncedSearch.length > 0) p.search = debouncedSearch;

    return p;
  }, [typeFilter, statusFilter, categoryFilter, myPostsOnly, debouncedSearch]);

  // Infinite query for lazy loading
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteLostFoundFeed(queryParams);

  // Flatten paginated posts
  const posts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data]);

  // Overall quick stats
  const stats = useMemo(() => {
    return {
      activeLost: posts.filter((p) => p.type === "LOST" && p.status === "ACTIVE").length,
      activeFound: posts.filter((p) => p.type === "FOUND" && p.status === "ACTIVE").length,
      resolved: posts.filter((p) => p.status === "RESOLVED" || p.status === "CLAIMED").length,
    };
  }, [posts]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const navigateToDetail = useCallback(
    (id: string) => {
      setCampusHubActiveSection("LOST_FOUND");
      router.push(`/campus-hub/lost-found/${id}` as any);
    },
    [router]
  );

  const toggleMyPosts = useCallback(() => {
    if (!currentUser) {
      Toast.show({ type: "info", text1: "Sign in to view your posts" });
      return;
    }
    setMyPostsOnly((prev) => !prev);
  }, [currentUser]);

  const renderHeader = useCallback(() => {
    return (
      <View style={styles.statsBarContainer}>
        {/* Compact Modern Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statsBarHeader}>
            <View style={styles.statsBarTag}>
              <Feather name="shield" size={12} color={ACCENT} />
              <Text style={styles.statsBarTagText}>CAMPUS HUB LOST & FOUND</Text>
            </View>
            <Text style={styles.statsBarSub}>Verified Community Board</Text>
          </View>
          <View style={styles.statsBarRow}>
            <View style={styles.statCell}>
              <View style={[styles.statDot, { backgroundColor: CAMPUS_HUB_COLORS.lostRose }]} />
              <Text style={styles.statCount}>{stats.activeLost}</Text>
              <Text style={styles.statTitle}>Active Lost</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCell}>
              <View style={[styles.statDot, { backgroundColor: CAMPUS_HUB_COLORS.foundTeal }]} />
              <Text style={styles.statCount}>{stats.activeFound}</Text>
              <Text style={styles.statTitle}>Active Found</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCell}>
              <View style={[styles.statDot, { backgroundColor: CAMPUS_HUB_COLORS.resolvedGreen }]} />
              <Text style={styles.statCount}>{stats.resolved}</Text>
              <Text style={styles.statTitle}>Reunited</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }, [stats]);

  const renderItem = useCallback(
    ({ item }: { item: LostFoundPost }) => (
      <LostFoundCard
        post={item}
        currentUserId={currentUser?.id}
        onPress={() => navigateToDetail(item.id)}
      />
    ),
    [currentUser?.id, navigateToDetail]
  );

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={ACCENT} />
        </View>
      );
    }
    if (posts.length > 5 && !hasNextPage) {
      return (
        <View style={styles.endNotice}>
          <Text style={styles.endNoticeText}>You've reached the end of listings</Text>
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage, posts.length, hasNextPage]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      );
    }
    return (
      <View style={styles.emptyCard}>
        <Feather name="inbox" size={38} color={CAMPUS_HUB_COLORS.subtleText} />
        <Text style={styles.stateTitle}>No listings found</Text>
        <Text style={styles.stateSubtitle}>
          {debouncedSearch
            ? `No items matching "${debouncedSearch}".`
            : "No items match your active filters. Try adjusting them or post a new item."}
        </Text>
      </View>
    );
  }, [isLoading, debouncedSearch]);

  if (isError) {
    return (
      <View style={styles.centerState}>
        <Feather name="alert-circle" size={36} color={CAMPUS_HUB_COLORS.dangerText} />
        <Text style={styles.stateTitle}>Could not load posts</Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: ACCENT }]}
          onPress={() => refetch()}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Retry loading lost and found posts"
        >
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Fixed Search Bar + Filter Icon Row (Placed outside FlatList to prevent unmounting/keyboard dismissal) */}
      <View style={styles.topSearchContainer}>
        <View style={styles.searchFilterRow}>
          <View style={styles.searchInputContainer}>
            <Feather
              name="search"
              size={16}
              color={CAMPUS_HUB_COLORS.subtleText}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search lost & found by title or location..."
              placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessible
              accessibilityLabel="Search lost and found"
              returnKeyType="search"
              clearButtonMode="never"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Clear search query"
                style={styles.clearSearchBtn}
              >
                <Feather name="x-circle" size={16} color={CAMPUS_HUB_COLORS.subtleText} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Modal Trigger Button */}
          <TouchableOpacity
            style={[
              styles.filterIconButton,
              activeFilterCount > 0 && styles.filterIconButtonActive,
            ]}
            onPress={() => setIsFilterModalVisible(true)}
            activeOpacity={0.8}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Filter listings. ${activeFilterCount} active filters`}
          >
            <Feather
              name="sliders"
              size={18}
              color={activeFilterCount > 0 ? "#ffffff" : CAMPUS_HUB_COLORS.neutralText}
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Active Filter Chips Strip */}
        {activeFilterCount > 0 && (
          <View style={styles.activeChipsRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeChipsContent}
              keyboardShouldPersistTaps="handled"
            >
              {typeFilter !== "ALL" && (
                <TouchableOpacity
                  style={styles.activeChip}
                  onPress={() => setTypeFilter("ALL")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.activeChipText}>
                    {typeFilter === "LOST" ? "Lost" : "Found"}
                  </Text>
                  <Feather name="x" size={12} color={CAMPUS_HUB_COLORS.lostFoundAccentText} />
                </TouchableOpacity>
              )}
              {statusFilter !== "ALL" && (
                <TouchableOpacity
                  style={styles.activeChip}
                  onPress={() => setStatusFilter("ALL")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.activeChipText}>
                    {statusFilter === "ACTIVE" ? "Active" : "Resolved"}
                  </Text>
                  <Feather name="x" size={12} color={CAMPUS_HUB_COLORS.lostFoundAccentText} />
                </TouchableOpacity>
              )}
              {categoryFilter !== "ALL" && (
                <TouchableOpacity
                  style={styles.activeChip}
                  onPress={() => setCategoryFilter("ALL")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.activeChipText}>
                    {CATEGORY_LABELS[categoryFilter] || categoryFilter}
                  </Text>
                  <Feather name="x" size={12} color={CAMPUS_HUB_COLORS.lostFoundAccentText} />
                </TouchableOpacity>
              )}
              {myPostsOnly && (
                <TouchableOpacity
                  style={styles.activeChip}
                  onPress={() => setMyPostsOnly(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.activeChipText}>My Posts</Text>
                  <Feather name="x" size={12} color={CAMPUS_HUB_COLORS.lostFoundAccentText} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.clearAllBtn}
                onPress={resetAllFilters}
                activeOpacity={0.7}
              >
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[ACCENT]}
            tintColor={ACCENT}
          />
        }
      />

      {/* Post Creation Modal */}
      <ComposeLostFoundModal
        visible={isComposeVisible}
        onClose={handleCloseCompose}
        currentUser={currentUser}
      />

      {/* Filter Options Modal */}
      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        myPostsOnly={myPostsOnly}
        onApply={handleApplyFilters}
        onReset={resetAllFilters}
        currentUser={currentUser}
      />
    </View>
  );
}

interface LostFoundCardProps {
  post: LostFoundPost;
  onPress: () => void;
  currentUserId?: string;
}

const LostFoundCard = React.memo(function LostFoundCard({
  post,
  onPress,
  currentUserId,
}: LostFoundCardProps) {
  const isOwner = currentUserId === post.authorId;
  const isResolved = post.status === "RESOLVED" || post.status === "CLAIMED";
  const claimCount = post._count?.claims ?? 0;
  const hasImage = Boolean(post.images?.[0]);

  return (
    <TouchableOpacity
      style={[styles.card, isResolved && styles.cardResolved]}
      onPress={onPress}
      activeOpacity={0.85}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${post.type === "LOST" ? "Lost" : "Found"} item: ${post.title}. Location: ${post.location}.`}
    >
      <View style={styles.cardLeft}>
        {/* Semantic Badges Row */}
        <View style={styles.cardTopRow}>
          <TypeBadge type={post.type} />
          {post.category && <CategoryBadge category={post.category} />}
          {isResolved && <StatusBadge status="RESOLVED" />}
        </View>

        {/* Title & Description */}
        <Text style={[styles.cardTitle, isResolved && styles.cardTitleResolved]} numberOfLines={2}>
          {post.title}
        </Text>

        <Text style={styles.cardDesc} numberOfLines={2}>
          {post.description}
        </Text>

        {/* Key Facts Row: Location */}
        <View style={styles.cardFooter}>
          <Feather name="map-pin" size={11} color={CAMPUS_HUB_COLORS.subtleText} />
          <Text style={styles.locationText} numberOfLines={1}>
            {post.location}
          </Text>
        </View>

        {/* Owner-only Claim notification badge */}
        {isOwner && claimCount > 0 && !isResolved && (
          <View style={styles.claimBadge}>
            <Feather name="inbox" size={11} color="#0284c7" />
            <Text style={styles.claimBadgeText}>
              {claimCount} {claimCount === 1 ? "claim received" : "claims received"}
            </Text>
          </View>
        )}
      </View>

      {/* Right Column: 84x84 Framed Thumbnail + Posted Time underneath */}
      <View style={styles.cardRightCol}>
        <View style={styles.thumbWrapper}>
          {hasImage ? (
            <Image source={{ uri: post.images[0] }} style={styles.cardThumb} />
          ) : (
            <View style={styles.thumbPlaceholder}>
              <Feather
                name={post.type === "LOST" ? "search" : "gift"}
                size={22}
                color={CAMPUS_HUB_COLORS.subtleText}
              />
            </View>
          )}
        </View>

        {/* Time directly under the card image */}
        <View style={styles.imageTimeRow}>
          <Feather name="clock" size={10} color={CAMPUS_HUB_COLORS.subtleText} />
          <Text style={styles.imageTimeText} numberOfLines={1}>
            {timeAgo(post.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  topSearchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  statsBarContainer: {
    marginBottom: 12,
  },
  searchFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    paddingHorizontal: 16,
    height: 46,
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
  },
  clearSearchBtn: {
    padding: 4,
  },
  filterIconButton: {
    width: 46,
    height: 46,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
    position: "relative",
  },
  filterIconButtonActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: CAMPUS_HUB_COLORS.dangerText,
    borderWidth: 1.5,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  filterBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
  },
  activeChipsRow: {
    marginBottom: 12,
  },
  activeChipsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  activeChipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.lostFoundAccentText,
  },
  clearAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  clearAllText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
  },

  // Compact Modern Stats Bar
  statsBar: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  statsBarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statsBarTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statsBarTagText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: ACCENT,
    letterSpacing: 0.6,
  },
  statsBarSub: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
    fontWeight: "500",
  },
  statsBarRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  statCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  statCount: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  statTitle: {
    fontFamily,
    fontSize: 10,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: CAMPUS_HUB_COLORS.subtleBorder,
  },

  // Cards
  card: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  cardResolved: {
    backgroundColor: "#fcfdfd",
    borderColor: "#e2e8f0",
  },
  cardLeft: {
    flex: 1,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 2,
  },
  cardTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    lineHeight: 20,
  },
  cardTitleResolved: {
    color: "#475569",
  },
  cardDesc: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
    flex: 1,
  },
  claimBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    alignSelf: "flex-start",
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  claimBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: "#0369a1",
  },

  // Right Column: Thumbnail + Time underneath
  cardRightCol: {
    alignItems: "center",
    width: 84,
  },
  thumbWrapper: {
    width: 84,
    height: 84,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  cardThumb: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  thumbPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  imageTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    marginTop: 6,
    width: "100%",
  },
  imageTimeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
  },

  // States & Loaders
  centerState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  stateTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    textAlign: "center",
  },
  stateSubtitle: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 34,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  footerLoader: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  endNotice: {
    paddingVertical: 16,
    alignItems: "center",
  },
  endNoticeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  retryBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
