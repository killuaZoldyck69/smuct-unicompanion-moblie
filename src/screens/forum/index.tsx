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
import { colors } from "@/theme/colors";
import type { ForumProps, ForumPostItem, FilterType } from "./types";
import { useForumFeed } from "./hooks/use-forum-feed";
import { ForumTopNav } from "./components/forum-top-nav";
import { ForumSearchBar } from "./components/forum-search-bar";
import { ForumFilterModal } from "./components/forum-filter-modal";
import { ForumCard } from "./components/forum-card";
import { ForumSkeleton } from "./components/forum-skeleton";
import { ForumEmptyState } from "./components/forum-empty-state";
import { ForumComposeModal } from "./components/forum-compose-modal";
import { ForumConfirmModal } from "./components/forum-confirm-modal";
import { UgcReportModal } from "./components/ugc/ugc-report-modal";

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
    isOffline,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    clearSearch,
    isRefreshing,
    onRefresh,
    isLoading,
    isError,
    filteredPosts,
    counts,
    loadMore,
    isFetchingNextPage,
    confirmModal,
    setConfirmModal,
    isConfirmLoading,
    handleResolve,
    handleDelete,
    reportTargetPost,
    setReportTargetPost,
    isSubmittingReport,
    handleReportPost,
    handleSubmitReport,
  } = useForumFeed();

  const handleCardPress = useCallback(
    (id: string) => {
      router.push(`/(tabs)/forum/${id}`);
    },
    [router],
  );

  const handleResetFilter = useCallback(() => {
    setActiveFilter("ALL");
  }, [setActiveFilter]);

  const renderItem = useCallback(
    ({ item }: { item: ForumPostItem }) => (
      <ForumCard
        item={item}
        onPress={handleCardPress}
        isAdmin={currentUser?.role === "ADMIN"}
        currentUserId={currentUser?.id}
        onResolve={handleResolve}
        onDelete={handleDelete}
        onReport={handleReportPost}
      />
    ),
    [
      handleCardPress,
      currentUser?.role,
      currentUser?.id,
      handleResolve,
      handleDelete,
      handleReportPost,
    ],
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
    if (isError) {
      return (
        <View style={styles.errorStateBox}>
          <View style={styles.errorIconHalo}>
            <Feather
              name={isOffline ? "wifi-off" : "alert-circle"}
              size={24}
              color={BENTO_COLORS.danger}
            />
          </View>
          <Text style={styles.errorTitle}>
            {isOffline ? "You're Offline" : "Unable to Load Discussions"}
          </Text>
          <Text style={styles.errorSubtitle}>
            {isOffline
              ? "Check your internet connection and tap Retry."
              : "Something went wrong while fetching forum posts."}
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={onRefresh}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Retry loading forum discussions"
          >
            <Feather name="refresh-cw" size={14} color="#ffffff" />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <ForumEmptyState
        searchQuery={searchQuery}
        activeFilter={activeFilter}
        onResetFilter={handleResetFilter}
      />
    );
  }, [
    isLoading,
    isError,
    isOffline,
    onRefresh,
    searchQuery,
    activeFilter,
    handleResetFilter,
  ]);

  const keyExtractor = useCallback((item: ForumPostItem) => item.id, []);

  const renderItemSeparator = useCallback(
    () => <View style={styles.itemSeparator} />,
    [],
  );

  const bottomPadding = insets.bottom > 0 ? insets.bottom + 110 : 124;
  const activeFilterCount = activeFilter !== "ALL" ? 1 : 0;

  const content = (
    <>
      {!embedded && (
        <ForumTopNav
          user={currentUser}
          onPressCompose={handleOpenCompose}
        />
      )}

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Feather name="wifi-off" size={13} color={colors.semantic.amber.deep} />
          <Text style={styles.offlineBannerText}>
            You&apos;re offline. Showing cached discussions.
          </Text>
        </View>
      )}

      <View style={styles.headerContainer}>
        <ForumSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={clearSearch}
          onPressFilter={() => setIsFilterModalVisible(true)}
          activeFilterCount={activeFilterCount}
        />

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
              hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
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

      {confirmModal && (
        <ForumConfirmModal
          visible={Boolean(confirmModal)}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.action}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          type={confirmModal.type}
          iconName={confirmModal.iconName}
          isLoading={isConfirmLoading}
        />
      )}

      {reportTargetPost && (
        <UgcReportModal
          visible={Boolean(reportTargetPost)}
          targetType="FORUM_POST"
          targetTitle={reportTargetPost.title}
          onClose={() => setReportTargetPost(null)}
          onSubmit={handleSubmitReport}
          isSubmitting={isSubmittingReport}
        />
      )}
    </>
  );

  if (embedded) {
    return <View style={styles.safeContainer}>{content}</View>;
  }

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      {content}
    </SafeAreaView>
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
    width: "100%",
    maxWidth: BENTO_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 2,
    width: "100%",
    maxWidth: BENTO_COLORS.contentMaxWidth,
    alignSelf: "center",
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
    borderRadius: BENTO_COLORS.pillRadius,
    paddingVertical: 5,
    paddingHorizontal: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.semantic.blue.border,
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
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
    marginBottom: 4,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.semantic.amber.soft,
    borderWidth: 1,
    borderColor: colors.semantic.amber.border,
    width: "90%",
    maxWidth: 680,
    alignSelf: "center",
  },
  offlineBannerText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: colors.semantic.amber.darkText,
  },
  errorStateBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 48,
    gap: 8,
  },
  errorIconHalo: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: BENTO_COLORS.dangerBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  errorTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    textAlign: "center",
  },
  errorSubtitle: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 48,
    backgroundColor: BENTO_COLORS.primaryBlue,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
