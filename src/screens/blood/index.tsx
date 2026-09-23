import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  Alert,
  BackHandler,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useInfiniteBloodFeed,
  useCreateBloodPost,
} from "@/features/blood/useBlood";
import { GetBloodFeedParams } from "@/services/blood-service";
import type { BloodPostItem } from "@/features/blood/types";
import {
  BENTO_COLORS,
  fontFamily,
  NewBloodPostForm,
} from "./constants";
import {
  formatBloodGroupSymbol,
  validateBloodPostInput,
} from "./utils";
import { BloodPostCard } from "./components/blood-post-card";
import { BloodHeroCard } from "./components/blood-hero-card";
import {
  BloodFilterModal,
  BloodFilterState,
} from "./components/blood-filter-modal";
import { ComposeBloodModal } from "./components/compose-blood-modal";
import {
  BloodSkeleton,
  BloodError,
  BloodEmpty,
} from "./components/blood-states";

export { BENTO_COLORS } from "./constants";
export { formatBloodGroup, formatBloodGroupSymbol } from "./utils";

const DEFAULT_FILTERS: BloodFilterState = {
  urgency: "ALL",
  status: "ACTIVE",
  bloodGroup: "ALL",
  myPostsOnly: false,
};

export function Blood() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useCurrentUser();

  // Search & Filters state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<BloodFilterState>(DEFAULT_FILTERS);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Debounce search query to prevent keyboard auto-closing and reduce queries
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [newPost, setNewPost] = useState<NewBloodPostForm>({
    patientName: "",
    patientCondition: "",
    bloodGroup: "A_POSITIVE",
    bagsNeeded: 1,
    location: "",
    urgency: "High",
    contactPhone: currentUser?.phoneNumber || "",
  });

  // Query parameters for server-side infinite pagination
  const queryParams = useMemo<GetBloodFeedParams>(() => {
    return {
      limit: 15,
      search: debouncedSearch.trim() || undefined,
      bloodGroup: filters.bloodGroup !== "ALL" ? filters.bloodGroup : undefined,
      urgency: filters.urgency !== "ALL" ? (filters.urgency as any) : undefined,
      isFulfilled:
        filters.status === "ACTIVE"
          ? false
          : filters.status === "FULFILLED"
          ? true
          : undefined,
      myPosts: filters.myPostsOnly ? true : undefined,
    };
  }, [debouncedSearch, filters]);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteBloodFeed(queryParams);

  const createPostMutation = useCreateBloodPost();

  const posts = useMemo(() => {
    return data?.pages.flatMap((page) => page.posts) ?? [];
  }, [data]);

  const counts = data?.pages[0]?.meta?.counts ?? {
    total: 0,
    active: 0,
    urgent: 0,
    fulfilled: 0,
    myPosts: 0,
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.urgency !== "ALL") count++;
    if (filters.status !== "ACTIVE") count++;
    if (filters.bloodGroup !== "ALL") count++;
    if (filters.myPostsOnly) count++;
    return count;
  }, [filters]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const verifyProfileAndCompose = useCallback(() => {
    if (!currentUser?.bloodGroup || !currentUser?.phoneNumber) {
      Alert.alert(
        "Profile Incomplete",
        "You must update your Profile to include your Blood Group and Phone Number before requesting or donating blood.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }
    setIsComposeVisible(true);
  }, [currentUser]);

  const handlePost = useCallback(() => {
    const { isValid, error } = validateBloodPostInput(newPost);
    if (!isValid) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: error || "All fields are required.",
      });
      return;
    }

    createPostMutation.mutate(newPost, {
      onSuccess: () => {
        Toast.show({ type: "success", text1: "Blood Request Published!" });
        setIsComposeVisible(false);
        setNewPost({
          patientName: "",
          patientCondition: "",
          bloodGroup: "A_POSITIVE",
          bagsNeeded: 1,
          location: "",
          urgency: "High",
          contactPhone: currentUser?.phoneNumber || "",
        });
      },
      onError: (err: any) => {
        Toast.show({
          type: "error",
          text1: "Failed to post",
          text2: err.message || "Network error. Please try again.",
        });
      },
    });
  }, [newPost, createPostMutation, currentUser]);

  useEffect(() => {
    if (!isComposeVisible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setIsComposeVisible(false);
      return true;
    });
    return () => sub.remove();
  }, [isComposeVisible]);

  const handleApplyFilters = useCallback((newFilters: BloodFilterState) => {
    setFilters(newFilters);
    setIsFilterModalVisible(false);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput("");
    setDebouncedSearch("");
    setIsFilterModalVisible(false);
  }, []);

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={BENTO_COLORS.crimson} />
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: BloodPostItem }) => <BloodPostCard item={item} />,
    [],
  );

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitlesContainer}>
          <Text style={styles.screenTitle}>Blood Bank Hub</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={verifyProfileAndCompose}
            style={styles.headerIconButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Request blood donation"
            activeOpacity={0.7}
          >
            <Feather name="plus" size={20} color={BENTO_COLORS.crimson} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/notices")}
            style={styles.headerIconButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View notices and notifications"
            activeOpacity={0.7}
          >
            <Feather name="bell" size={19} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Permanently Hoisted Search Bar & Filter Button (Prevents Keyboard Auto-Close) */}
      <View style={styles.topControlsContainer}>
        <View style={styles.searchBarWrapper}>
          <Feather
            name="search"
            size={16}
            color={BENTO_COLORS.subtleText}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location, hospital, patient..."
            placeholderTextColor={BENTO_COLORS.subtleText}
            value={searchInput}
            onChangeText={setSearchInput}
            accessible={true}
            accessibilityLabel="Search blood requests"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchInput.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchInput("");
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

        <TouchableOpacity
          style={[
            styles.filterIconButton,
            activeFilterCount > 0 && styles.filterIconButtonActive,
          ]}
          onPress={() => setIsFilterModalVisible(true)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Open filters modal, ${activeFilterCount} active filters`}
          activeOpacity={0.8}
        >
          <Feather
            name="sliders"
            size={18}
            color={
              activeFilterCount > 0 ? "#ffffff" : BENTO_COLORS.neutralText
            }
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active Filter Chips Strip */}
      {(activeFilterCount > 0 || debouncedSearch.length > 0) && (
        <View style={styles.activeFiltersStripWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeFiltersScroll}
          >
            {debouncedSearch.length > 0 && (
              <TouchableOpacity
                style={styles.filterChip}
                onPress={() => {
                  setSearchInput("");
                  setDebouncedSearch("");
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.filterChipText}>
                  "{debouncedSearch}"
                </Text>
                <Feather name="x" size={12} color={BENTO_COLORS.subtleText} />
              </TouchableOpacity>
            )}

            {filters.status !== "ACTIVE" && (
              <TouchableOpacity
                style={styles.filterChip}
                onPress={() =>
                  setFilters((prev) => ({ ...prev, status: "ACTIVE" }))
                }
                activeOpacity={0.7}
              >
                <Text style={styles.filterChipText}>
                  {filters.status === "ALL" ? "All Statuses" : "Fulfilled Only"}
                </Text>
                <Feather name="x" size={12} color={BENTO_COLORS.subtleText} />
              </TouchableOpacity>
            )}

            {filters.urgency !== "ALL" && (
              <TouchableOpacity
                style={styles.filterChip}
                onPress={() =>
                  setFilters((prev) => ({ ...prev, urgency: "ALL" }))
                }
                activeOpacity={0.7}
              >
                <Text style={styles.filterChipText}>
                  {filters.urgency} Urgency
                </Text>
                <Feather name="x" size={12} color={BENTO_COLORS.subtleText} />
              </TouchableOpacity>
            )}

            {filters.bloodGroup !== "ALL" && (
              <TouchableOpacity
                style={styles.filterChip}
                onPress={() =>
                  setFilters((prev) => ({ ...prev, bloodGroup: "ALL" }))
                }
                activeOpacity={0.7}
              >
                <Text style={styles.filterChipText}>
                  {formatBloodGroupSymbol(filters.bloodGroup)}
                </Text>
                <Feather name="x" size={12} color={BENTO_COLORS.subtleText} />
              </TouchableOpacity>
            )}

            {filters.myPostsOnly && (
              <TouchableOpacity
                style={styles.filterChip}
                onPress={() =>
                  setFilters((prev) => ({ ...prev, myPostsOnly: false }))
                }
                activeOpacity={0.7}
              >
                <Text style={styles.filterChipText}>My Requests</Text>
                <Feather name="x" size={12} color={BENTO_COLORS.subtleText} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.clearAllChip}
              onPress={handleResetFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.clearAllChipText}>Reset All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Virtualized Infinite Feed */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 120 : 130 },
        ]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === "android"}
        updateCellsBatchingPeriod={50}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <BloodHeroCard
            counts={counts}
            selectedFilter={filters.status}
            onPressStat={(type) => {
              if (type === "ALL") {
                setFilters((prev) => ({
                  ...prev,
                  status: "ALL",
                  urgency: "ALL",
                }));
              } else if (type === "ACTIVE") {
                setFilters((prev) => ({
                  ...prev,
                  urgency: "ALL",
                  status: "ACTIVE",
                }));
              } else if (type === "FULFILLED") {
                setFilters((prev) => ({
                  ...prev,
                  status: "FULFILLED",
                }));
              } else if (type === "URGENT") {
                setFilters((prev) => ({
                  ...prev,
                  urgency: "High",
                  status: "ACTIVE",
                }));
              }
            }}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <BloodSkeleton />
          ) : isError ? (
            <BloodError onRetry={refetch} />
          ) : (
            <BloodEmpty
              searchQuery={debouncedSearch}
              activeFilter={
                filters.urgency === "High"
                  ? "URGENT"
                  : filters.status === "FULFILLED"
                  ? "FULFILLED"
                  : "ALL"
              }
              onReset={handleResetFilters}
            />
          )
        }
        ListFooterComponent={renderFooter}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[BENTO_COLORS.crimson]}
            tintColor={BENTO_COLORS.crimson}
          />
        }
      />

      {/* Lazily mounted Filter Modal */}
      {isFilterModalVisible && (
        <BloodFilterModal
          visible={isFilterModalVisible}
          onClose={() => setIsFilterModalVisible(false)}
          filters={filters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          counts={counts}
        />
      )}

      {/* Lazily mounted Compose Blood Modal */}
      {isComposeVisible && (
        <ComposeBloodModal
          visible={isComposeVisible}
          form={newPost}
          onChangeForm={setNewPost}
          onSubmit={handlePost}
          onClose={() => setIsComposeVisible(false)}
          isSubmitting={createPostMutation.isPending}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
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
    alignItems: "flex-start",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  screenTitle: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.5,
  },
  topControlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 8,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
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
  filterIconButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: BENTO_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    position: "relative",
    ...BENTO_COLORS.shadow,
  },
  filterIconButtonActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: BENTO_COLORS.crimson,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  filterBadgeText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: "#ffffff",
  },
  activeFiltersStripWrapper: {
    marginBottom: 8,
  },
  activeFiltersScroll: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: "center",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
    ...BENTO_COLORS.shadow,
  },
  filterChipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: BENTO_COLORS.neutralText,
  },
  clearAllChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  clearAllChipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.crimson,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
