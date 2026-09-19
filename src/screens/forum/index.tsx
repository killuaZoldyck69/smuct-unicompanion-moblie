import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { BENTO_COLORS, fontFamily } from "./constants";
import type { ForumProps, ForumPostItem, FilterType } from "./types";
import { useForumFeed } from "./hooks/use-forum-feed";
import { ForumTopNav } from "./components/forum-top-nav";
import { ForumSearchBar } from "./components/forum-search-bar";
import { ForumFilterModal } from "./components/forum-filter-modal";
import { ForumCard } from "./components/forum-card";
import { ForumSkeleton } from "./components/forum-skeleton";
import { ForumEmptyState } from "./components/forum-empty-state";
import { ForumComposeModal } from "./components/forum-compose-modal";

export type { ForumProps };

const getFilterLabel = (filter: FilterType): string => {
  switch (filter) {
    case "UNRESOLVED":
      return "Needs Help";
    case "RESOLVED":
      return "Resolved";
    case "MY_POSTS":
      return "My Discussions";
    default:
      return "All";
  }
};

export function Forum({
  embedded = false,
  isComposeVisible: externalIsComposeVisible,
  onOpenCompose,
  onCloseCompose,
}: ForumProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [internalIsComposeVisible, setInternalIsComposeVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const isComposeVisible =
    externalIsComposeVisible !== undefined
      ? externalIsComposeVisible
      : internalIsComposeVisible;

  const handleOpenCompose = useCallback(() => {
    if (onOpenCompose) {
      onOpenCompose();
    } else {
      setInternalIsComposeVisible(true);
    }
  }, [onOpenCompose]);

  const handleCloseCompose = useCallback(() => {
    if (onCloseCompose) {
      onCloseCompose();
    } else {
      setInternalIsComposeVisible(false);
    }
  }, [onCloseCompose]);

  const {
    currentUser,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    clearSearch,
    isRefreshing,
    onRefresh,
    isLoading,
    filteredPosts,
    counts,
    loadMore,
    isFetchingNextPage,
  } = useForumFeed();

  const handleCardPress = useCallback(
    (id: string) => {
      router.push(`/(tabs)/forum/${id}`);
    },
    [router],
  );

  const handleNotificationsPress = useCallback(() => {
    router.push("/(tabs)/notices");
  }, [router]);

  const handleResetFilter = useCallback(() => {
    setActiveFilter("ALL");
  }, [setActiveFilter]);

  const renderItem = useCallback(
    ({ item }: { item: ForumPostItem }) => (
      <ForumCard item={item} onPress={handleCardPress} />
    ),
    [handleCardPress],
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.listFooter}>
        <ActivityIndicator size="small" color={BENTO_COLORS.deepNavy} />
      </View>
    );
  }, [isFetchingNextPage]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return <ForumSkeleton />;
    }
    return (
      <ForumEmptyState
        searchQuery={searchQuery}
        activeFilter={activeFilter}
        onResetFilter={handleResetFilter}
      />
    );
  }, [isLoading, searchQuery, activeFilter, handleResetFilter]);

  const keyExtractor = useCallback((item: ForumPostItem) => item.id, []);

  const renderItemSeparator = useCallback(
    () => <View style={styles.itemSeparator} />,
    [],
  );

  const ContainerComponent = embedded ? View : SafeAreaView;
  const containerProps = embedded
    ? { style: styles.safeContainer }
    : { style: styles.safeContainer, edges: ["top" as const] };

  const bottomPadding = insets.bottom > 0 ? insets.bottom + 110 : 124;
  const activeFilterCount = activeFilter !== "ALL" ? 1 : 0;

  return (
    <ContainerComponent {...(containerProps as any)}>
      {!embedded && (
        <ForumTopNav
          user={currentUser}
          onPressNotifications={handleNotificationsPress}
          onPressCompose={handleOpenCompose}
        />
      )}

      {/* Stable Search Bar & Filter Modal Trigger */}
      <View style={styles.headerContainer}>
        <ForumSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={clearSearch}
          onPressFilter={() => setIsFilterModalVisible(true)}
          activeFilterCount={activeFilterCount}
        />

        {/* Active Filter Chip Strip */}
        {activeFilter !== "ALL" && (
          <View style={styles.activeFilterRow}>
            <TouchableOpacity
              style={styles.activeChip}
              onPress={handleResetFilter}
              activeOpacity={0.7}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Active filter: ${getFilterLabel(activeFilter)}. Tap to clear.`}
            >
              <Text style={styles.activeChipText}>
                {getFilterLabel(activeFilter)}
              </Text>
              <Feather name="x" size={12} color={BENTO_COLORS.primaryBlue} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearFilterBtn}
              onPress={handleResetFilter}
              activeOpacity={0.7}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Clear discussion filter"
            >
              <Text style={styles.clearFilterBtnText}>Clear filter</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ItemSeparatorComponent={renderItemSeparator}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === "android"}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[BENTO_COLORS.deepNavy]}
            tintColor={BENTO_COLORS.deepNavy}
          />
        }
      />

      <ForumFilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        counts={counts}
      />

      <ForumComposeModal
        visible={isComposeVisible}
        onClose={handleCloseCompose}
        onSuccess={onRefresh}
      />
    </ContainerComponent>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 2,
  },
  activeFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.skyBg,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  activeChipText: {
    fontSize: 12,
    fontFamily,
    fontWeight: "700",
    color: BENTO_COLORS.primaryBlue,
  },
  clearFilterBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearFilterBtnText: {
    fontSize: 12,
    fontFamily,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  itemSeparator: {
    height: 12,
  },
  listFooter: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
