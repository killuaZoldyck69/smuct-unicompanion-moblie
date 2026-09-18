import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { BENTO_COLORS, fontFamily } from "./constants";
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

export function Forum({ embedded = false }: ForumProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isComposeVisible, setIsComposeVisible] = useState(false);

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

  const renderHeader = useCallback(() => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTitlesContainer}>
        <Text style={styles.screenTitle}>Campus Forum</Text>
        <Text style={styles.screenSubtitle}>
          Student Q&A & Community Discussions
        </Text>
      </View>

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
  ), [searchQuery, setSearchQuery, clearSearch, activeFilter, setActiveFilter, counts]);

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
  const fabBottom = insets.bottom > 0 ? insets.bottom + 86 : 98;

  return (
    <ContainerComponent {...(containerProps as any)}>
      {!embedded && (
        <ForumTopNav
          user={currentUser}
          onPressNotifications={handleNotificationsPress}
        />
      )}

      <FlatList
        data={filteredPosts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={renderItemSeparator}
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

      <TouchableOpacity
        style={[styles.fabBtn, { bottom: fabBottom }]}
        onPress={() => setIsComposeVisible(true)}
        activeOpacity={0.85}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Ask a question"
      >
        <Feather name="plus" size={24} color="#ffffff" />
      </TouchableOpacity>

      <ForumComposeModal
        visible={isComposeVisible}
        onClose={() => setIsComposeVisible(false)}
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
    paddingBottom: 2,
  },
  headerTitlesContainer: {
    marginTop: 4,
    marginBottom: 12,
  },
  screenTitle: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  itemSeparator: {
    height: 12,
  },
  fabBtn: {
    position: "absolute",
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: BENTO_COLORS.deepNavy,
    justifyContent: "center",
    alignItems: "center",
    ...BENTO_COLORS.heroShadow,
  },
});
