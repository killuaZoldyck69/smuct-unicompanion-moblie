import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { BENTO_COLORS, fontFamily } from "./constants";
import type { ForumProps } from "./types";
import { useForumFeed } from "./hooks/use-forum-feed";
import { ForumTopNav } from "./components/forum-top-nav";
import { ForumSearchBar } from "./components/forum-search-bar";
import { ForumHeroCard } from "./components/forum-hero-card";
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
      router.push(`/forum/${id}`);
    },
    [router],
  );

  const handleNotificationsPress = useCallback(() => {
    router.push("/(tabs)/notices");
  }, [router]);

  const handleResetFilter = useCallback(() => {
    setActiveFilter("ALL");
  }, [setActiveFilter]);

  const ContainerComponent = embedded ? View : SafeAreaView;
  const containerProps = embedded
    ? { style: styles.safeContainer }
    : { style: styles.safeContainer, edges: ["top" as const] };

  const bottomPadding = insets.bottom > 0 ? insets.bottom + 120 : 132;
  const fabBottom = insets.bottom > 0 ? insets.bottom + 92 : 104;

  return (
    <ContainerComponent {...(containerProps as any)}>
      {!embedded && (
        <ForumTopNav
          user={currentUser}
          onPressNotifications={handleNotificationsPress}
        />
      )}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[BENTO_COLORS.deepNavy]}
            tintColor={BENTO_COLORS.deepNavy}
          />
        }
      >
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

        <ForumHeroCard counts={counts} />

        <ForumFilterPills
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          counts={counts}
        />

        {isLoading ? (
          <ForumSkeleton />
        ) : filteredPosts.length === 0 ? (
          <ForumEmptyState
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            onResetFilter={handleResetFilter}
          />
        ) : (
          <View style={styles.cardsListContainer}>
            {filteredPosts.map((item) => (
              <ForumCard
                key={item.id}
                item={item}
                onPress={handleCardPress}
              />
            ))}
          </View>
        )}
      </ScrollView>

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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  headerTitlesContainer: {
    marginTop: 4,
    marginBottom: 14,
  },
  screenTitle: {
    fontFamily,
    fontSize: 26,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  cardsListContainer: {
    gap: 14,
  },
  fabBtn: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BENTO_COLORS.deepNavy,
    justifyContent: "center",
    alignItems: "center",
    ...BENTO_COLORS.heroShadow,
  },
});
