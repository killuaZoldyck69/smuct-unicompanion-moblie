import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import {
  useInfiniteMemesFeed,
  useReactToMeme,
  useDeleteMeme,
} from "@/features/campus-hub/useMemes";
import { useCurrentUser } from "@/hooks/use-current-user";
import { CAMPUS_HUB_COLORS, fontFamily } from "../shared/design-tokens";
import {
  AuthorDetailsModal,
  type AuthorProfileModalData,
} from "../shared/author-modal";
import type { MemeFilter, Meme } from "@/services/meme-service";
import { MemeCard } from "./components/meme-card";
import { MemeComposeModal } from "./components/meme-compose-modal";
import { MemeImageModal } from "./components/meme-image-modal";
import { MemeDeleteModal } from "./components/meme-delete-modal";

const FILTER_TABS: { label: string; value: MemeFilter; icon: keyof typeof Feather.glyphMap }[] = [
  { label: "Latest", value: "latest", icon: "clock" },
  { label: "Popular", value: "popular", icon: "trending-up" },
  { label: "My Memes", value: "mine", icon: "user" },
];

interface MemesSectionProps {
  isComposeVisible?: boolean;
  onCloseCompose?: () => void;
}

export const MemesSection = React.memo(function MemesSection({
  isComposeVisible: externalComposeVisible,
  onCloseCompose: externalOnCloseCompose,
}: MemesSectionProps) {
  const insets = useSafeAreaInsets();
  const { user } = useCurrentUser();
  const [activeFilter, setActiveFilter] = useState<MemeFilter>("latest");
  const [internalComposeVisible, setInternalComposeVisible] = useState(false);

  // Full-size preview modal state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewCaption, setPreviewCaption] = useState<string | null>(null);
  const [previewAuthor, setPreviewAuthor] = useState<string | undefined>(undefined);

  // Author Profile modal state
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorProfileModalData | null>(null);

  // Custom Delete Confirmation modal state
  const [memeToDelete, setMemeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isComposeOpen = externalComposeVisible ?? internalComposeVisible;
  const handleCloseCompose = useCallback(() => {
    if (externalOnCloseCompose) {
      externalOnCloseCompose();
    }
    setInternalComposeVisible(false);
  }, [externalOnCloseCompose]);

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteMemesFeed(activeFilter);

  const reactMutation = useReactToMeme();
  const deleteMutation = useDeleteMeme();

  const allMemes = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.memes);
  }, [data]);

  const handleReact = useCallback(
    (memeId: string, type: "LIKE" | "DISLIKE") => {
      reactMutation.mutate({ memeId, type });
    },
    [reactMutation]
  );

  const handleDeleteRequest = useCallback((memeId: string) => {
    setMemeToDelete(memeId);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!memeToDelete) return;
    setIsDeleting(true);

    deleteMutation.mutate(memeToDelete, {
      onSuccess: () => {
        setIsDeleting(false);
        setMemeToDelete(null);
        Toast.show({
          type: "success",
          text1: "Meme Deleted",
          text2: "Your meme was removed from Campus Hub.",
        });
      },
      onError: (err: any) => {
        setIsDeleting(false);
        setMemeToDelete(null);
        Toast.show({
          type: "error",
          text1: "Delete Failed",
          text2: err.message || "Could not delete meme.",
        });
      },
    });
  }, [memeToDelete, deleteMutation]);

  const handlePreviewImage = useCallback(
    (imageUrl: string, caption?: string | null, authorName?: string) => {
      setPreviewImage(imageUrl);
      setPreviewCaption(caption ?? null);
      setPreviewAuthor(authorName);
    },
    []
  );

  const handleClosePreview = useCallback(() => {
    setPreviewImage(null);
    setPreviewCaption(null);
    setPreviewAuthor(undefined);
  }, []);

  const handleViewProfile = useCallback((author: any) => {
    setSelectedAuthor(author);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Meme }) => (
      <MemeCard
        meme={item}
        currentUserId={user?.id}
        userRole={user?.role ?? undefined}
        onReact={handleReact}
        onDelete={handleDeleteRequest}
        onPreviewImage={handlePreviewImage}
        onViewProfile={handleViewProfile}
      />
    ),
    [user?.id, user?.role, handleReact, handleDeleteRequest, handlePreviewImage, handleViewProfile]
  );

  const renderListFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={CAMPUS_HUB_COLORS.memeAccent} />
      </View>
    );
  }, [isFetchingNextPage]);

  const renderEmptyState = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Feather name="smile" size={36} color={CAMPUS_HUB_COLORS.memeAccent} />
        </View>
        <Text style={styles.emptyTitle}>
          {activeFilter === "mine" ? "No Memes Posted Yet" : "No Memes Found"}
        </Text>
        <Text style={styles.emptySubtitle}>
          {activeFilter === "mine"
            ? "You haven't posted any memes yet. Share one with campus!"
            : "Be the first to bring some laughter to Campus Hub today."}
        </Text>
        <TouchableOpacity
          style={styles.emptyActionBtn}
          onPress={() => setInternalComposeVisible(true)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Post your first meme"
        >
          <Feather name="plus" size={16} color="#ffffff" />
          <Text style={styles.emptyActionText}>Upload a Meme</Text>
        </TouchableOpacity>
      </View>
    );
  }, [isLoading, activeFilter]);

  const listBottomPadding = useMemo(() => {
    return insets.bottom > 0 ? insets.bottom + 110 : 120;
  }, [insets.bottom]);

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.value;
          return (
            <TouchableOpacity
              key={tab.value}
              style={[
                styles.filterPill,
                isActive && styles.filterPillActive,
              ]}
              onPress={() => setActiveFilter(tab.value)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${tab.label}`}
              activeOpacity={0.75}
            >
              <Feather
                name={tab.icon}
                size={13}
                color={isActive ? "#ffffff" : CAMPUS_HUB_COLORS.subtleText}
              />
              <Text
                style={[
                  styles.filterPillText,
                  isActive && styles.filterPillTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Meme Feed */}
      {isLoading && allMemes.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CAMPUS_HUB_COLORS.memeAccent} />
          <Text style={styles.loadingText}>Loading campus memes...</Text>
        </View>
      ) : (
        <FlatList
          data={allMemes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: listBottomPadding },
            allMemes.length === 0 && styles.listEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[CAMPUS_HUB_COLORS.memeAccent]}
              tintColor={CAMPUS_HUB_COLORS.memeAccent}
            />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderListFooter}
          ListEmptyComponent={renderEmptyState}
          initialNumToRender={3}
          maxToRenderPerBatch={4}
          windowSize={5}
          removeClippedSubviews={Platform.OS === "android"}
        />
      )}

      {/* Compose Modal */}
      <MemeComposeModal
        visible={isComposeOpen}
        onClose={handleCloseCompose}
      />

      {/* Full-Screen Image Modal */}
      <MemeImageModal
        visible={!!previewImage}
        imageUrl={previewImage}
        caption={previewCaption}
        authorName={previewAuthor}
        onClose={handleClosePreview}
      />

      {/* Author Profile View Modal */}
      <AuthorDetailsModal
        visible={!!selectedAuthor}
        author={selectedAuthor}
        onClose={() => setSelectedAuthor(null)}
      />

      {/* Custom Delete Confirmation Modal */}
      <MemeDeleteModal
        visible={!!memeToDelete}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setMemeToDelete(null)}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    ...CAMPUS_HUB_COLORS.shadow,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.04)",
  },
  filterPillActive: {
    backgroundColor: CAMPUS_HUB_COLORS.memeAccent,
    borderColor: CAMPUS_HUB_COLORS.memeAccent,
  },
  filterPillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  filterPillTextActive: {
    color: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
  },
  listEmpty: {
    flex: 1,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 30,
    gap: 12,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: CAMPUS_HUB_COLORS.memeAccentLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  emptySubtitle: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
  },
  emptyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: CAMPUS_HUB_COLORS.memeAccent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    marginTop: 8,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  emptyActionText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
