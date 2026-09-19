import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { BENTO_COLORS } from "./constants";
import type { ForumProps, ForumPostItem } from "./types";
import { useForumFeed } from "./hooks/use-forum-feed";
import { ForumTopNav } from "./components/forum-top-nav";
import { ForumSearchBar } from "./components/forum-search-bar";
import { ForumFilterPills } from "./components/forum-filter-pills";
import { ForumCard } from "./components/forum-card";
import { ForumSkeleton } from "./components/forum-skeleton";
import { ForumEmptyState } from "./components/forum-empty-state";
import { ForumComposeModal } from "./components/forum-compose-modal";

export type { ForumProps };

export function Forum({
  embedded = false,
  isComposeVisible: externalIsComposeVisible,
  onOpenCompose,
  onCloseCompose,
}: ForumProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [internalIsComposeVisible, setInternalIsComposeVisible] = useState(false);

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

  return (
    <ContainerComponent {...(containerProps as any)}>
      {!embedded && (
        <ForumTopNav
          user={currentUser}
          onPressNotifications={handleNotificationsPress}
          onPressCompose={handleOpenCompose}
        />
      )}

      {/* Stable Search & Filter Bar placed outside FlatList to prevent unmounting/keyboard dismissal */}
      <View style={styles.headerContainer}>
        <ForumSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={clearSearch}
        />

        <ForumFilterPills
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          counts={counts}
        />
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
  itemSeparator: {
    height: 12,
  },
  listFooter: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
