import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  requireOnline,
  scheduleSuccessToast,
  showApiErrorToast,
} from "@/features/campus-hub/campus-hub-upload";
import {
  useDeleteMeme,
  useInfiniteMemesFeed,
  useReactToMeme,
  useReportMeme,
} from "@/features/campus-hub/useMemes";
import { useAcceptUgcTerms, useUgcTermsStatus } from "@/features/ugc/useUgcModeration";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { UgcGuidelinesModal } from "@/screens/forum/components/ugc/ugc-guidelines-modal";
import { UgcReportModal } from "@/screens/forum/components/ugc/ugc-report-modal";
import type { Meme, MemeAuthor, MemeFilter } from "@/services/meme-service";
import type { UgcReportReason } from "@/services/ugc-service";
import { colors } from "@/theme/colors";
import { AuthorDetailsModal, type AuthorProfileModalData } from "../shared/author-modal";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  getCampusHubTabBottomPadding,
} from "../shared/design-tokens";
import { MemeFeedSkeleton } from "../shared/skeleton-loaders";
import { MemeCard } from "./components/meme-card";
import { MemeComposeModal } from "./components/meme-compose-modal";
import { MemeDeleteModal } from "./components/meme-delete-modal";
import { MemeEditModal } from "./components/meme-edit-modal";
import { MemeFeedEmptyState } from "./components/meme-empty-state";
import { MemeImageModal } from "./components/meme-image-modal";
import { MemeOptionsModal } from "./components/meme-options-modal";

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
  const { isOffline } = useNetworkStatus();
  const [activeFilter, setActiveFilter] = useState<MemeFilter>("latest");
  const [internalComposeVisible, setInternalComposeVisible] = useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewCaption, setPreviewCaption] = useState<string | null>(null);
  const [previewAuthor, setPreviewAuthor] = useState<string | undefined>(undefined);

  const [selectedAuthor, setSelectedAuthor] = useState<AuthorProfileModalData | null>(null);
  const [memeForOptions, setMemeForOptions] = useState<Meme | null>(null);
  const [memeToEdit, setMemeToEdit] = useState<Meme | null>(null);
  const [pendingEditAfterTerms, setPendingEditAfterTerms] = useState<Meme | null>(null);
  const [memeToDelete, setMemeToDelete] = useState<string | null>(null);
  const [memeToReport, setMemeToReport] = useState<Meme | null>(null);
  const deleteLockRef = useRef(false);

  const { data: ugcTerms } = useUgcTermsStatus(user?.id);
  const acceptTermsMutation = useAcceptUgcTerms(user?.id);
  const needsUgcAcceptanceForCompose =
    Boolean(externalComposeVisible || internalComposeVisible) && ugcTerms?.accepted === false;
  const showGuidelinesModal = needsUgcAcceptanceForCompose || Boolean(pendingEditAfterTerms);
  const isComposeModalVisible =
    Boolean(externalComposeVisible || internalComposeVisible) && !needsUgcAcceptanceForCompose;

  const handleCloseCompose = useCallback(() => {
    externalOnCloseCompose?.();
    setInternalComposeVisible(false);
  }, [externalOnCloseCompose]);

  const handleOpenCompose = useCallback(() => {
    if (!requireOnline(isOffline, "Reconnect to the internet before posting a meme.")) return;
    setInternalComposeVisible(true);
  }, [isOffline]);

  const {
    data,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteMemesFeed(activeFilter);

  const { mutate: reactToMemeMutate } = useReactToMeme();
  const deleteMutation = useDeleteMeme();
  const reportMutation = useReportMeme();

  const allMemes = useMemo(() => (data?.pages ? data.pages.flatMap((page) => page.memes) : []), [data]);

  const handleReact = useCallback(
    (memeId: string, type: "LIKE" | "DISLIKE") => {
      if (!requireOnline(isOffline, "Reconnect to the internet before reacting to memes.")) return;
      reactToMemeMutate(
        { memeId, type },
        { onError: (err) => showApiErrorToast(err, "Reaction Failed", "Could not update your reaction.") },
      );
    },
    [isOffline, reactToMemeMutate],
  );

  const handleOpenOptions = useCallback((meme: Meme) => setMemeForOptions(meme), []);

  const handleEditFromOptions = useCallback(() => {
    if (!memeForOptions) return;
    if (!requireOnline(isOffline, "Reconnect to the internet before editing your caption.")) return;
    if (ugcTerms && !ugcTerms.accepted) {
      setPendingEditAfterTerms(memeForOptions);
      return;
    }
    setMemeToEdit(memeForOptions);
  }, [memeForOptions, isOffline, ugcTerms]);

  const handleDeleteFromOptions = useCallback(() => {
    if (memeForOptions) setMemeToDelete(memeForOptions.id);
  }, [memeForOptions]);

  const handleReportFromOptions = useCallback(() => {
    if (!memeForOptions) return;
    if (!requireOnline(isOffline, "Reconnect to the internet before reporting content.")) return;
    setMemeToReport(memeForOptions);
  }, [memeForOptions, isOffline]);

  const handleDeleteDirect = useCallback((id: string) => setMemeToDelete(id), []);

  const handleConfirmDelete = useCallback(() => {
    if (!memeToDelete || deleteLockRef.current || deleteMutation.isPending) return;
    if (!requireOnline(isOffline, "Reconnect to the internet before deleting this meme.")) return;
    deleteLockRef.current = true;
    deleteMutation.mutate(memeToDelete, {
      onSuccess: () => {
        deleteLockRef.current = false;
        setMemeToDelete(null);
        scheduleSuccessToast("Meme Deleted", "The meme was removed from Campus Hub.");
      },
      onError: (err) => {
        deleteLockRef.current = false;
        setMemeToDelete(null);
        showApiErrorToast(err, "Delete Failed", "Could not delete meme.");
      },
    });
  }, [memeToDelete, isOffline, deleteMutation]);

  const handleSubmitReport = useCallback(
    ({ reason, details }: { reason: UgcReportReason; details?: string }) => {
      if (!memeToReport || reportMutation.isPending) return;
      if (!requireOnline(isOffline, "Reconnect to the internet before submitting a report.")) return;
      reportMutation.mutate(
        { memeId: memeToReport.id, reason, details },
        {
          onSuccess: () => {
            setMemeToReport(null);
            scheduleSuccessToast(
              "Report Submitted",
              "Hidden from your feed and queued for moderator review.",
            );
          },
          onError: (err) => showApiErrorToast(err, "Report Failed", "Could not submit your report."),
        },
      );
    },
    [memeToReport, isOffline, reportMutation],
  );

  const handleAcceptGuidelines = useCallback(() => {
    if (!requireOnline(isOffline, "Reconnect to the internet to accept community guidelines.")) return;
    acceptTermsMutation.mutate(undefined, {
      onSuccess: () => {
        if (pendingEditAfterTerms) {
          const target = pendingEditAfterTerms;
          setPendingEditAfterTerms(null);
          setMemeToEdit(target);
        }
      },
      onError: (err) => showApiErrorToast(err, "Agreement Failed", "Could not accept community guidelines."),
    });
  }, [isOffline, acceptTermsMutation, pendingEditAfterTerms]);

  const handleDismissGuidelines = useCallback(() => {
    setPendingEditAfterTerms(null);
    if (needsUgcAcceptanceForCompose) handleCloseCompose();
  }, [needsUgcAcceptanceForCompose, handleCloseCompose]);

  const handlePreviewImage = useCallback(
    (imageUrl: string, caption?: string | null, authorName?: string) => {
      setPreviewImage(imageUrl);
      setPreviewCaption(caption ?? null);
      setPreviewAuthor(authorName);
    },
    [],
  );

  const handleClosePreview = useCallback(() => {
    setPreviewImage(null);
    setPreviewCaption(null);
    setPreviewAuthor(undefined);
  }, []);

  const handleViewProfile = useCallback((author: MemeAuthor) => setSelectedAuthor(author), []);

  const renderItem = useCallback(
    ({ item }: { item: Meme }) => (
      <MemeCard
        meme={item}
        currentUserId={user?.id}
        userRole={user?.role ?? undefined}
        onReact={handleReact}
        onOptions={handleOpenOptions}
        onDeleteDirect={handleDeleteDirect}
        onPreviewImage={handlePreviewImage}
        onViewProfile={handleViewProfile}
      />
    ),
    [user?.id, user?.role, handleReact, handleOpenOptions, handleDeleteDirect, handlePreviewImage, handleViewProfile],
  );

  const renderListFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={CAMPUS_HUB_COLORS.memeAccent} />
      </View>
    );
  }, [isFetchingNextPage]);

  const renderEmptyState = useCallback(
    () => (
      <MemeFeedEmptyState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isOffline={isOffline}
        activeFilter={activeFilter}
        onRetry={() => {
          void refetch();
        }}
        onOpenCompose={handleOpenCompose}
      />
    ),
    [isLoading, isError, error, isOffline, activeFilter, refetch, handleOpenCompose],
  );

  const listBottomPadding = useMemo(() => getCampusHubTabBottomPadding(insets.bottom), [insets.bottom]);

  return (
    <View style={styles.container}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Feather name="wifi-off" size={14} color={colors.semantic.amber.darkText} />
          <Text style={styles.offlineBannerText}>You&apos;re offline. Showing cached memes only.</Text>
        </View>
      )}

      <View style={styles.filterRow}>
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.value;
          return (
            <TouchableOpacity
              key={tab.value}
              style={[styles.filterPill, isActive && styles.filterPillActive]}
              onPress={() => setActiveFilter(tab.value)}
              hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
              accessible={true}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Filter by ${tab.label}`}
              activeOpacity={0.75}
            >
              <Feather
                name={tab.icon}
                size={13}
                color={isActive ? colors.white : CAMPUS_HUB_COLORS.subtleText}
              />
              <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading && allMemes.length === 0 ? (
        <MemeFeedSkeleton />
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
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
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

      <MemeComposeModal visible={isComposeModalVisible} onClose={handleCloseCompose} />
      <MemeImageModal
        visible={!!previewImage}
        imageUrl={previewImage}
        caption={previewCaption}
        authorName={previewAuthor}
        onClose={handleClosePreview}
      />
      <AuthorDetailsModal
        visible={!!selectedAuthor}
        author={selectedAuthor}
        isOwnProfile={Boolean(selectedAuthor && user?.id === selectedAuthor.id)}
        onClose={() => setSelectedAuthor(null)}
      />
      <MemeOptionsModal
        visible={!!memeForOptions}
        isAuthor={user?.id === memeForOptions?.authorId}
        isAdmin={user?.role === "ADMIN"}
        onClose={() => setMemeForOptions(null)}
        onEdit={handleEditFromOptions}
        onDelete={handleDeleteFromOptions}
        onReport={handleReportFromOptions}
      />
      <MemeEditModal visible={!!memeToEdit} meme={memeToEdit} onClose={() => setMemeToEdit(null)} />
      <MemeDeleteModal
        visible={!!memeToDelete}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setMemeToDelete(null)}
      />
      <UgcReportModal
        visible={Boolean(memeToReport)}
        targetType="MEME_POST"
        targetTitle={
          memeToReport?.caption ||
          (memeToReport?.author?.name ? `Meme by ${memeToReport.author.name}` : undefined)
        }
        onClose={() => !reportMutation.isPending && setMemeToReport(null)}
        onSubmit={handleSubmitReport}
        isSubmitting={reportMutation.isPending}
      />
      <UgcGuidelinesModal
        visible={showGuidelinesModal}
        onClose={handleDismissGuidelines}
        onAccept={handleAcceptGuidelines}
        isSubmitting={acceptTermsMutation.isPending}
        isOffline={isOffline}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CAMPUS_HUB_COLORS.background },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.semantic.amber.tint,
    borderWidth: 1,
    borderColor: colors.semantic.amber.border,
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
    width: "92%",
  },
  offlineBannerText: { fontFamily, fontSize: 12, fontWeight: "600", color: colors.semantic.amber.darkText, flex: 1 },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 2,
    paddingBottom: 10,
    gap: 8,
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    ...CAMPUS_HUB_COLORS.shadow,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  filterPillActive: { backgroundColor: CAMPUS_HUB_COLORS.memeAccent, borderColor: CAMPUS_HUB_COLORS.memeAccent },
  filterPillText: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
    includeFontPadding: false,
  },
  filterPillTextActive: { color: CAMPUS_HUB_COLORS.white },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 2,
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  listEmpty: { flex: 1 },
  footerLoader: { paddingVertical: 20, alignItems: "center" },
});
