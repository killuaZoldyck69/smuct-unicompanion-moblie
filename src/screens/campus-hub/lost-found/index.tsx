import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Keyboard,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { colors } from "@/theme/colors";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { extractApiErrorInfo } from "@/features/forum/forum-logic";
import {
  useInfiniteLostFoundFeed,
  useDeleteLostFoundPost,
} from "@/features/campus-hub/useLostFound";
import type {
  LostFoundPost,
  LostFoundCategory,
  GetLostFoundFeedParams,
} from "@/services/lost-found-service";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  titleFontFamily,
  timeAgo,
} from "../shared/design-tokens";
import { setCampusHubActiveSection } from "../shared/hub-state";
import { LostFoundFeedSkeleton } from "../shared/skeleton-loaders";
import { ComposeLostFoundModal } from "./compose-modal";
import { LostFoundDeleteModal } from "./components/lost-found-delete-modal";
import {
  TypeBadge,
  StatusBadge,
  CategoryBadge,
  LocationBadge,
  CATEGORY_LABELS,
} from "./components/status-badge";
import {
  FilterModal,
  type TypeFilter,
  type StatusFilter,
} from "./components/filter-modal";

const ACCENT = CAMPUS_HUB_COLORS.lostFoundAccent;
const ACCENT_FILL = CAMPUS_HUB_COLORS.lostFoundAccentFill;
const ACCENT_TEXT = CAMPUS_HUB_COLORS.lostFoundAccentText;

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
  const { isOffline } = useNetworkStatus();

  // Filters state
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<
    "ALL" | LostFoundCategory
  >("ALL");
  const [myPostsOnly, setMyPostsOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [internalComposeVisible, setInternalComposeVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const deleteMutation = useDeleteLostFoundPost();
  const [postToDelete, setPostToDelete] = useState<{
    id: string;
    title: string;
    type?: "LOST" | "FOUND";
    location?: string | null;
    image?: string | null;
  } | null>(null);

  const handleDelete = useCallback((post: LostFoundPost) => {
    setPostToDelete({
      id: post.id,
      title: post.title,
      type: post.type,
      location: post.location,
      image: post.images?.[0],
    });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!postToDelete || deleteMutation.isPending) return;
    if (isOffline) {
      Toast.show({
        type: "error",
        text1: "You're Offline",
        text2: "Reconnect to the internet before deleting this listing.",
      });
      return;
    }
    deleteMutation.mutate(postToDelete.id, {
      onSuccess: () => {
        setPostToDelete(null);
        Toast.show({
          type: "success",
          text1: "Post Deleted",
          text2: "Lost & Found post has been removed.",
        });
      },
      onError: (err: unknown) => {
        setPostToDelete(null);
        const info = extractApiErrorInfo(err, "Failed to delete post.");
        Toast.show({
          type: "error",
          text1: "Delete Failed",
          text2: info.message,
        });
      },
    });
  }, [postToDelete, isOffline, deleteMutation]);

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
    [],
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
  const closeInternalCompose = useCallback(
    () => setInternalComposeVisible(false),
    [],
  );
  const handleCloseCompose = externalOnCloseCompose ?? closeInternalCompose;

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

  // Overall quick stats (uses backend aggregate counts when available)
  const stats = useMemo(() => {
    const serverCounts = data?.pages?.[0]?.meta?.counts;
    if (serverCounts) {
      return {
        activeLost: serverCounts.activeLost,
        activeFound: serverCounts.activeFound,
        resolved: serverCounts.resolved,
      };
    }
    return {
      activeLost: posts.filter(
        (p) => p.type === "LOST" && p.status === "ACTIVE",
      ).length,
      activeFound: posts.filter(
        (p) => p.type === "FOUND" && p.status === "ACTIVE",
      ).length,
      resolved: posts.filter(
        (p) => p.status === "RESOLVED" || p.status === "CLAIMED",
      ).length,
    };
  }, [data?.pages, posts]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await refetch();
      if (result.isError && !isOffline) {
        Toast.show({
          type: "error",
          text1: "Refresh failed",
          text2: "Could not update listings. Showing cached data.",
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, isOffline]);

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
    [router],
  );

  const renderHeader = useCallback(() => {
    return (
      <View style={styles.statsBarContainer}>
        {/* Compact Modern Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statsBarHeader}>
            <View style={styles.statsBarTag}>
              <Feather name="shield" size={12} color={ACCENT_TEXT} />
              <Text style={styles.statsBarTagText}>
                CAMPUS HUB LOST & FOUND
              </Text>
            </View>
          </View>
          <View style={styles.statsBarRow}>
            <View style={styles.statCell}>
              <View
                style={[
                  styles.statDot,
                  { backgroundColor: CAMPUS_HUB_COLORS.lostRose },
                ]}
              />
              <Text style={styles.statCount} maxFontSizeMultiplier={1.25}>
                {stats.activeLost}
              </Text>
              <Text style={styles.statTitle}>Active Lost</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCell}>
              <View
                style={[
                  styles.statDot,
                  { backgroundColor: CAMPUS_HUB_COLORS.foundTeal },
                ]}
              />
              <Text style={styles.statCount} maxFontSizeMultiplier={1.25}>
                {stats.activeFound}
              </Text>
              <Text style={styles.statTitle}>Active Found</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCell}>
              <View
                style={[
                  styles.statDot,
                  { backgroundColor: CAMPUS_HUB_COLORS.resolvedGreen },
                ]}
              />
              <Text style={styles.statCount} maxFontSizeMultiplier={1.25}>
                {stats.resolved}
              </Text>
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
        isAdmin={currentUser?.role === "ADMIN"}
        onDelete={handleDelete}
        onPress={() => navigateToDetail(item.id)}
      />
    ),
    [currentUser?.id, currentUser?.role, handleDelete, navigateToDetail],
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
          <Text style={styles.endNoticeText}>
            You've reached the end of listings
          </Text>
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage, posts.length, hasNextPage]);

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return <LostFoundFeedSkeleton />;
    }
    if (isError) {
      return (
        <View style={styles.centerState}>
          <Feather
            name={isOffline ? "wifi-off" : "alert-circle"}
            size={36}
            color={CAMPUS_HUB_COLORS.dangerText}
          />
          <Text style={styles.stateTitle}>
            {isOffline ? "You're offline" : "Could not load posts"}
          </Text>
          <Text style={styles.stateSubtitle}>
            {isOffline
              ? "Reconnect to the internet to fetch the latest listings."
              : "Something went wrong while fetching listings."}
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.retryBtn,
              { backgroundColor: ACCENT_FILL },
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => refetch()}
            android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Retry loading lost and found posts"
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    const hasActiveFiltersOrSearch =
      activeFilterCount > 0 || debouncedSearch.length > 0;

    return (
      <View style={styles.emptyCard}>
        <Feather name="inbox" size={38} color={CAMPUS_HUB_COLORS.subtleText} />
        <Text style={styles.stateTitle}>No listings found</Text>
        <Text style={styles.stateSubtitle}>
          {debouncedSearch
            ? `No items matching "${debouncedSearch}".`
            : "No items match your active filters. Try adjusting them or post a new item."}
        </Text>
        {hasActiveFiltersOrSearch && (
          <Pressable
            style={({ pressed }) => [
              styles.resetEmptyBtn,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => {
              resetAllFilters();
              setSearchQuery("");
            }}
            android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Reset all filters and search"
          >
            <Feather
              name="rotate-ccw"
              size={13}
              color={CAMPUS_HUB_COLORS.white}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.resetEmptyBtnText}>Reset Filters & Search</Text>
          </Pressable>
        )}
      </View>
    );
  }, [
    isLoading,
    isError,
    isOffline,
    refetch,
    debouncedSearch,
    activeFilterCount,
    resetAllFilters,
  ]);

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
              placeholderTextColor={CAMPUS_HUB_COLORS.mutedInk}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => Keyboard.dismiss()}
              accessible
              accessibilityLabel="Search lost and found"
              returnKeyType="search"
              clearButtonMode="never"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery("")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                android_ripple={{
                  color: CAMPUS_HUB_COLORS.androidRipple,
                  borderless: true,
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Clear search query"
                style={({ pressed }) => [
                  styles.clearSearchBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Feather
                  name="x-circle"
                  size={16}
                  color={CAMPUS_HUB_COLORS.mutedInk}
                />
              </Pressable>
            )}
          </View>

          {/* Filter Modal Trigger Button */}
          <Pressable
            style={({ pressed }) => [
              styles.filterIconButton,
              activeFilterCount > 0 && styles.filterIconButtonActive,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => setIsFilterModalVisible(true)}
            android_ripple={{
              color:
                activeFilterCount > 0
                  ? CAMPUS_HUB_COLORS.androidRippleLight
                  : CAMPUS_HUB_COLORS.androidRipple,
            }}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Filter listings. ${activeFilterCount} active filters`}
          >
            <Feather
              name="sliders"
              size={18}
              color={
                activeFilterCount > 0
                  ? CAMPUS_HUB_COLORS.white
                  : CAMPUS_HUB_COLORS.neutralText
              }
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text
                  style={styles.filterBadgeText}
                  maxFontSizeMultiplier={1.25}
                >
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </Pressable>
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
                <Pressable
                  style={({ pressed }) => [
                    styles.activeChip,
                    pressed && { opacity: 0.75 },
                  ]}
                  onPress={() => setTypeFilter("ALL")}
                  hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
                  android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${typeFilter === "LOST" ? "Lost" : "Found"} filter`}
                >
                  <Text style={styles.activeChipText}>
                    {typeFilter === "LOST" ? "Lost" : "Found"}
                  </Text>
                  <Feather
                    name="x"
                    size={12}
                    color={CAMPUS_HUB_COLORS.lostFoundAccentText}
                  />
                </Pressable>
              )}
              {statusFilter !== "ALL" && (
                <Pressable
                  style={({ pressed }) => [
                    styles.activeChip,
                    pressed && { opacity: 0.75 },
                  ]}
                  onPress={() => setStatusFilter("ALL")}
                  hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
                  android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${statusFilter.toLowerCase()} status filter`}
                >
                  <Text style={styles.activeChipText}>
                    {statusFilter === "ACTIVE"
                      ? "Active"
                      : statusFilter === "CLOSED"
                        ? "Closed"
                        : "Resolved"}
                  </Text>
                  <Feather
                    name="x"
                    size={12}
                    color={CAMPUS_HUB_COLORS.lostFoundAccentText}
                  />
                </Pressable>
              )}
              {categoryFilter !== "ALL" && (
                <Pressable
                  style={({ pressed }) => [
                    styles.activeChip,
                    pressed && { opacity: 0.75 },
                  ]}
                  onPress={() => setCategoryFilter("ALL")}
                  hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
                  android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${CATEGORY_LABELS[categoryFilter] || categoryFilter} category filter`}
                >
                  <Text style={styles.activeChipText}>
                    {CATEGORY_LABELS[categoryFilter] || categoryFilter}
                  </Text>
                  <Feather
                    name="x"
                    size={12}
                    color={CAMPUS_HUB_COLORS.lostFoundAccentText}
                  />
                </Pressable>
              )}
              {myPostsOnly && (
                <Pressable
                  style={({ pressed }) => [
                    styles.activeChip,
                    pressed && { opacity: 0.75 },
                  ]}
                  onPress={() => setMyPostsOnly(false)}
                  hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
                  android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Remove My Posts filter"
                >
                  <Text style={styles.activeChipText}>My Posts</Text>
                  <Feather
                    name="x"
                    size={12}
                    color={CAMPUS_HUB_COLORS.lostFoundAccentText}
                  />
                </Pressable>
              )}
              <Pressable
                style={({ pressed }) => [
                  styles.clearAllBtn,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={resetAllFilters}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Clear all active filters"
              >
                <Text style={styles.clearAllText}>Clear All</Text>
              </Pressable>
            </ScrollView>
          </View>
        )}
      </View>

      {isOffline && (
        <View style={styles.bannerOuter}>
          <View style={styles.offlineBanner}>
            <Feather name="wifi-off" size={13} color={ACCENT_TEXT} />
            <Text style={styles.offlineBannerText}>
              You&apos;re offline — showing cached listings
            </Text>
          </View>
        </View>
      )}

      {isError && !isOffline && posts.length > 0 && (
        <View style={styles.bannerOuter}>
          <View style={styles.refreshErrorBanner}>
            <Feather
              name="alert-triangle"
              size={13}
              color={CAMPUS_HUB_COLORS.dangerText}
            />
            <Text style={styles.refreshErrorText}>
              Could not refresh listings — showing cached items
            </Text>
            <Pressable
              onPress={() => refetch()}
              hitSlop={8}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Retry refreshing listings"
              style={({ pressed }) => [
                styles.refreshErrorRetryBtn,
                pressed && { opacity: 0.75 },
              ]}
            >
              <Text style={styles.refreshErrorRetryText}>Retry</Text>
            </Pressable>
          </View>
        </View>
      )}

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
        ItemSeparatorComponent={renderSeparator}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === "android"}
        windowSize={7}
        initialNumToRender={8}
        maxToRenderPerBatch={6}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[ACCENT_FILL]}
            tintColor={ACCENT_FILL}
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

      {postToDelete && (
        <LostFoundDeleteModal
          visible={Boolean(postToDelete)}
          isDeleting={deleteMutation.isPending}
          postTitle={postToDelete.title}
          postType={postToDelete.type}
          postLocation={postToDelete.location}
          postImage={postToDelete.image}
          onConfirm={handleConfirmDelete}
          onClose={() => setPostToDelete(null)}
        />
      )}
    </View>
  );
}

interface LostFoundCardProps {
  post: LostFoundPost;
  onPress: () => void;
  currentUserId?: string;
  isAdmin?: boolean;
  onDelete?: (post: LostFoundPost) => void;
}

const LostFoundCard = React.memo(function LostFoundCard({
  post,
  onPress,
  currentUserId,
  isAdmin = false,
  onDelete,
}: LostFoundCardProps) {
  const isOwner = currentUserId === post.authorId;
  const isResolved = post.status === "RESOLVED" || post.status === "CLAIMED";
  const isClosed = post.status === "CLOSED";
  const isInactive = isResolved || isClosed;
  const claimCount = post._count?.claims ?? 0;
  const imageUri = post.images?.[0];
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [imageUri]);

  const hasImage = Boolean(imageUri && !imgError);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isInactive && styles.cardResolved,
        pressed && { opacity: 0.92 },
      ]}
      onPress={onPress}
      android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${post.type === "LOST" ? "Lost" : "Found"} item (${post.status.toLowerCase()}): ${post.title}.${post.category ? ` Category: ${CATEGORY_LABELS[post.category] || post.category}.` : ""}${post.location ? ` Location: ${post.location}.` : ""}`}
    >
      <View style={styles.cardLeft}>
        {/* Semantic Badges Row */}
        <View style={styles.cardTopRow}>
          <View style={styles.badgeGroup}>
            <TypeBadge type={post.type} />
            {post.category && <CategoryBadge category={post.category} />}
            {isInactive && <StatusBadge status={post.status} />}
          </View>
        </View>

        {/* Title & Description */}
        <Text
          style={[styles.cardTitle, isInactive && styles.cardTitleResolved]}
          numberOfLines={2}
        >
          {post.title}
        </Text>

        {!!post.description?.trim() && (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {post.description}
          </Text>
        )}

        {/* Key Facts Row: Location Badge */}
        {!!post.location && (
          <View style={styles.cardFooter}>
            <LocationBadge location={post.location} />
          </View>
        )}

        {/* Owner-only Claim notification badge */}
        {isOwner && claimCount > 0 && !isInactive && (
          <View style={styles.claimBadge}>
            <Feather
              name="inbox"
              size={11}
              color={CAMPUS_HUB_COLORS.skyAccentInk}
            />
            <Text style={styles.claimBadgeText} maxFontSizeMultiplier={1.25}>
              {claimCount}{" "}
              {claimCount === 1 ? "claim received" : "claims received"}
            </Text>
          </View>
        )}
      </View>

      {/* Right Column: 84x84 Framed Thumbnail + Posted Time + Admin Delete underneath */}
      <View style={styles.cardRightCol}>
        <View style={styles.thumbWrapper}>
          {hasImage ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.cardThumb}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
              onError={() => setImgError(true)}
            />
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
          <Feather
            name="clock"
            size={10}
            color={CAMPUS_HUB_COLORS.mutedInk}
          />
          <Text style={styles.imageTimeText} numberOfLines={1}>
            {timeAgo(post.createdAt)}
          </Text>
        </View>

        {/* Admin Delete Action Button moved under the thumbnail image */}
        {isAdmin && (
          <Pressable
            style={({ pressed }) => [
              styles.adminDeleteBtn,
              pressed && { opacity: 0.78 },
            ]}
            onPress={(e) => {
              e.stopPropagation?.();
              onDelete?.(post);
            }}
            android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Delete listing: ${post.title}`}
          >
            <Feather
              name="trash-2"
              size={11}
              color={colors.semantic.red.accent}
            />
            <Text style={styles.adminDeleteBtnText}>Delete</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  separator: {
    height: 12,
  },
  bannerOuter: {
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: 20,
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.semantic.amber.soft,
    borderWidth: 1,
    borderColor: colors.semantic.amber.border,
  },
  offlineBannerText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: ACCENT_TEXT,
    flex: 1,
  },
  refreshErrorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: CAMPUS_HUB_COLORS.dangerBg,
    borderWidth: 1,
    borderColor: colors.semantic.rose.border,
  },
  refreshErrorText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.dangerText,
    flex: 1,
  },
  refreshErrorRetryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderWidth: 1,
    borderColor: colors.semantic.rose.border,
  },
  refreshErrorRetryText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.dangerText,
  },
  topSearchContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  statsBarContainer: {
    marginBottom: 12,
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
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
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
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
    borderRadius: 12,
  },
  filterIconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    ...CAMPUS_HUB_COLORS.shadow,
    position: "relative",
    overflow: "hidden",
  },
  filterIconButtonActive: {
    backgroundColor: ACCENT_FILL,
    borderColor: ACCENT_FILL,
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
    borderColor: CAMPUS_HUB_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  filterBadgeText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.white,
    includeFontPadding: false,
    fontVariant: ["tabular-nums"],
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
    backgroundColor: colors.semantic.amber.tint,
    borderWidth: 1,
    borderColor: colors.semantic.amber.border,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    paddingVertical: 7,
    paddingHorizontal: 12,
    minHeight: 36,
    overflow: "hidden",
  },
  activeChipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.lostFoundAccentText,
  },
  clearAllBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    minHeight: 36,
    justifyContent: "center",
    borderRadius: 10,
    overflow: "hidden",
  },
  clearAllText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.mutedInk,
  },

  // Compact Modern Stats Bar
  statsBar: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
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
    color: ACCENT_TEXT,
    letterSpacing: 0.6,
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
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  statTitle: {
    fontFamily,
    fontSize: 10,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.mutedInk,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: CAMPUS_HUB_COLORS.subtleBorder,
  },

  // Cards
  card: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
    overflow: "hidden",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  cardResolved: {
    backgroundColor: colors.slate50,
    borderColor: colors.slate200,
  },
  cardLeft: {
    flex: 1,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    marginBottom: 2,
  },
  badgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
  },
  adminDeleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.semantic.red.softBorder,
    width: "100%",
    minHeight: 36,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.semantic.red.border,
    gap: 4,
    marginTop: 6,
    overflow: "hidden",
  },
  adminDeleteBtnText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
    color: colors.semantic.red.accent,
    letterSpacing: 0.1,
  },
  cardTitle: {
    fontFamily: titleFontFamily,
    fontSize: 15.5,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  cardTitleResolved: {
    color: CAMPUS_HUB_COLORS.mutedInk,
  },
  cardDesc: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.mutedInk,
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.mutedInk,
    flex: 1,
  },
  claimBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: CAMPUS_HUB_COLORS.skyTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    alignSelf: "flex-start",
    marginTop: 4,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.skyBorder,
  },
  claimBadgeText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.skyAccentInk,
    includeFontPadding: false,
    fontVariant: ["tabular-nums"],
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
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  stateTitle: {
    fontFamily: titleFontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    textAlign: "center",
  },
  stateSubtitle: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.mutedInk,
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
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  resetEmptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    backgroundColor: ACCENT_FILL,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    overflow: "hidden",
  },
  resetEmptyBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.white,
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
    color: CAMPUS_HUB_COLORS.mutedInk,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    overflow: "hidden",
  },
  retryBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.white,
  },
});
