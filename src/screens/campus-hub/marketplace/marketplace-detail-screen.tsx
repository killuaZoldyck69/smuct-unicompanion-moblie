import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useReducer,
} from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  StyleSheet,
  Keyboard,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useNetworkStatus } from "@/hooks/use-network-status";
import {
  useMarketplacePost,
  useDeleteMarketplacePost,
  useMarkMarketplaceSold,
  useUpdateMarketplaceStatus,
  useAddMarketplaceComment,
  useDeleteMarketplaceComment,
  useUpdateMarketplaceComment,
  useReportMarketplaceContent,
} from "@/features/campus-hub/useMarketplace";
import {
  requireOnline,
  showApiErrorToast,
  useUgcTermsRetry,
} from "@/features/campus-hub/useLostFoundUpload";
import {
  clampImageIndex,
  resolveMarketplaceBackDestination,
  resolveMarketplaceErrorState,
  validateMarketplaceComment,
} from "@/features/campus-hub/marketplace-logic";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  formatCampusUserSubtitle,
} from "@/screens/campus-hub/shared/design-tokens";
import {
  InlineComments,
  CommentInputBar,
  type ReplyTarget,
  type Comment,
} from "@/screens/campus-hub/shared/inline-comments";
import {
  AuthorDetailsModal,
  type AuthorProfileModalData,
} from "@/screens/campus-hub/shared/author-modal";
import { ImageViewerModal } from "@/screens/campus-hub/shared/image-viewer-modal";
import { UgcGuidelinesModal } from "@/screens/forum/components/ugc/ugc-guidelines-modal";
import { UgcReportModal } from "@/screens/forum/components/ugc/ugc-report-modal";
import { MarketplaceDeleteModal } from "@/screens/campus-hub/marketplace/components/marketplace-delete-modal";
import { MarketplaceSoldModal } from "@/screens/campus-hub/marketplace/components/marketplace-sold-modal";
import { EditMarketplaceModal } from "@/screens/campus-hub/marketplace/edit-modal";
import { MarketplaceDetailSkeleton } from "../shared/skeleton-loaders";
import { setCampusHubActiveSection } from "@/screens/campus-hub";
import { colors } from "@/theme/colors";
import type { MarketplaceComment } from "@/services/marketplace-service";
import type { UgcReportReason } from "@/services/ugc-service";

// Detail sub-components
import { MPDetailHeader } from "./components/detail/mp-detail-header";
import { MPImageGallery } from "./components/detail/mp-image-gallery";
import { MPListingInfoCard } from "./components/detail/mp-listing-info-card";

const ACCENT = CAMPUS_HUB_COLORS.marketplaceAccent;
const EDIT_THRESHOLD_MS = 10_000;

type ModalState = {
  imageViewer: boolean;
  delete: boolean;
  sold: boolean;
  edit: boolean;
};

type ModalAction =
  | { type: "OPEN"; modal: keyof ModalState }
  | { type: "CLOSE"; modal: keyof ModalState };

const initialModalState: ModalState = {
  imageViewer: false,
  delete: false,
  sold: false,
  edit: false,
};

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case "OPEN":
      return { ...state, [action.modal]: true };
    case "CLOSE":
      return { ...state, [action.modal]: false };
    default:
      return state;
  }
}

type PendingCommentAction =
  | { type: "add"; content: string; parentId?: string }
  | { type: "edit"; commentId: string; content: string };

interface ReportTarget {
  targetType: "MARKETPLACE_POST" | "MARKETPLACE_COMMENT";
  targetId: string;
  targetTitle: string;
}

export function MarketplaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser, role: currentUserRole } = useCurrentUser();
  const { isOffline } = useNetworkStatus();
  const isAdmin = currentUserRole === "ADMIN";

  // Gallery state
  const [selectedImage, setSelectedImage] = useState(0);

  // Author & Report modal state
  const [selectedAuthor, setSelectedAuthor] =
    useState<AuthorProfileModalData | null>(null);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);

  // Comment state
  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const isEditMode = editingComment !== null;
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Dynamic keyboard avoiding behavior to prevent stale offset on Android dismiss
  const [keyboardBehavior, setKeyboardBehavior] = useState<
    "height" | "padding" | undefined
  >(undefined);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardBehavior(Platform.OS === "ios" ? "padding" : "height");
      },
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardBehavior(undefined);
      },
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const [modals, dispatchModal] = useReducer(modalReducer, initialModalState);
  const openModal = useCallback(
    (modal: keyof ModalState) => dispatchModal({ type: "OPEN", modal }),
    [],
  );
  const closeModal = useCallback(
    (modal: keyof ModalState) => dispatchModal({ type: "CLOSE", modal }),
    [],
  );

  // ---------------------------------------------------------------------------
  // Queries & Mutations
  // ---------------------------------------------------------------------------
  const {
    data: post,
    isLoading,
    isError,
    error,
    refetch,
  } = useMarketplacePost(id);
  const deleteMutation = useDeleteMarketplacePost();
  const soldMutation = useMarkMarketplaceSold();
  const updateStatusMutation = useUpdateMarketplaceStatus();
  const addCommentMutation = useAddMarketplaceComment(id);
  const updateCommentMutation = useUpdateMarketplaceComment(id);
  const deleteCommentMutation = useDeleteMarketplaceComment(id);
  const reportMutation = useReportMarketplaceContent(id);

  const {
    showGuidelines,
    setShowGuidelines,
    isAcceptingGuidelines,
    queuePayload,
    clearQueuedPayload,
    handleUgcError,
    acceptGuidelines,
  } = useUgcTermsRetry<PendingCommentAction>(currentUser?.id);

  // Clamp gallery selection if photos were removed on edit
  useEffect(() => {
    const count = post?.images?.length ?? 0;
    setSelectedImage((prev) => clampImageIndex(prev, count));
  }, [post?.images?.length]);

  const isAuthor = useMemo(
    () => Boolean(currentUser?.id && currentUser.id === post?.authorId),
    [currentUser?.id, post?.authorId],
  );

  const isSelling = post?.type === "SELLING";
  const isSold = post?.status === "SOLD";
  const isCommentsLocked = Boolean(post && post.status !== "ACTIVE");

  const isEdited = useMemo(() => {
    if (!post?.updatedAt || !post?.createdAt) return false;
    const created = new Date(post.createdAt).getTime();
    const updated = new Date(post.updatedAt).getTime();
    return (
      !isNaN(created) &&
      !isNaN(updated) &&
      updated - created > EDIT_THRESHOLD_MS
    );
  }, [post?.createdAt, post?.updatedAt]);

  const authorSubtitle = useMemo(
    () => formatCampusUserSubtitle(post?.author, ""),
    [post?.author],
  );

  const authorInitial = useMemo(
    () => (post?.author?.name ?? "U").charAt(0).toUpperCase(),
    [post?.author?.name],
  );

  const comments = useMemo(
    () => (post?.comments ?? []) as MarketplaceComment[],
    [post?.comments],
  );

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  const handleBack = useCallback(() => {
    setCampusHubActiveSection("MARKETPLACE");
    const destination = resolveMarketplaceBackDestination({
      userRole: currentUserRole,
    });
    router.replace({
      pathname: destination.href as any,
      params: destination.params,
    });
  }, [currentUserRole, router]);

  const handleCancelEdit = useCallback(() => {
    setEditingComment(null);
    setCommentText("");
  }, []);

  // Android hardware back — modal dismiss priority chain
  useEffect(() => {
    const onBackPress = () => {
      if (showGuidelines) {
        clearQueuedPayload();
        setShowGuidelines(false);
        return true;
      }
      if (reportTarget) {
        setReportTarget(null);
        return true;
      }
      if (modals.imageViewer) {
        closeModal("imageViewer");
        return true;
      }
      if (selectedAuthor) {
        setSelectedAuthor(null);
        return true;
      }
      if (isEditMode) {
        handleCancelEdit();
        return true;
      }
      if (replyTarget) {
        setReplyTarget(null);
        return true;
      }
      if (modals.delete) {
        closeModal("delete");
        return true;
      }
      if (modals.sold) {
        closeModal("sold");
        return true;
      }
      if (modals.edit) {
        closeModal("edit");
        return true;
      }
      handleBack();
      return true;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [
    showGuidelines,
    clearQueuedPayload,
    setShowGuidelines,
    reportTarget,
    modals,
    selectedAuthor,
    isEditMode,
    replyTarget,
    handleCancelEdit,
    handleBack,
    closeModal,
  ]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleConfirmDelete = useCallback(() => {
    if (!requireOnline(isOffline, "Reconnect to delete this listing.")) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        closeModal("delete");
        Toast.show({ type: "info", text1: "Listing deleted" });
        handleBack();
      },
      onError: (err) => {
        showApiErrorToast(
          err,
          "Delete Failed",
          "Could not delete this listing.",
        );
      },
    });
  }, [id, isOffline, deleteMutation, handleBack, closeModal]);

  const handleConfirmSold = useCallback(() => {
    if (!requireOnline(isOffline, "Reconnect to update listing status."))
      return;
    soldMutation.mutate(id, {
      onSuccess: () => {
        closeModal("sold");
        Toast.show({
          type: "success",
          text1: isSelling ? "Marked as Sold!" : "Marked as Fulfilled!",
        });
      },
      onError: (err) => {
        showApiErrorToast(
          err,
          "Status Update Failed",
          "Failed to update listing status.",
        );
      },
    });
  }, [id, isOffline, isSelling, soldMutation, closeModal]);

  const handleCloseListing = useCallback(() => {
    if (!requireOnline(isOffline, "Reconnect to close this listing.")) return;
    Alert.alert(
      "Close Listing?",
      "This listing will be hidden from the main marketplace feed and comments will be locked. You can reopen it anytime.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Close Listing",
          style: "destructive",
          onPress: () => {
            updateStatusMutation.mutate(
              { id, status: "CLOSED" },
              {
                onSuccess: () => {
                  Toast.show({ type: "info", text1: "Listing closed" });
                },
                onError: (err) => {
                  showApiErrorToast(
                    err,
                    "Close Failed",
                    "Could not close this listing.",
                  );
                },
              },
            );
          },
        },
      ],
    );
  }, [id, isOffline, updateStatusMutation]);

  const handleReopenListing = useCallback(() => {
    if (!requireOnline(isOffline, "Reconnect to reopen this listing.")) return;
    updateStatusMutation.mutate(
      { id, status: "ACTIVE" },
      {
        onSuccess: () => {
          Toast.show({ type: "success", text1: "Listing reopened!" });
        },
        onError: (err) => {
          showApiErrorToast(
            err,
            "Reopen Failed",
            "Could not reopen this listing.",
          );
        },
      },
    );
  }, [id, isOffline, updateStatusMutation]);

  const handleContact = useCallback(() => {
    if (!post?.contactPhone) return;
    const phone = post.contactPhone.replace(/\s+/g, "");
    Linking.openURL(`tel:${phone}`).catch(() =>
      Toast.show({ type: "error", text1: "Cannot open phone dialer" }),
    );
  }, [post?.contactPhone]);

  const executePendingCommentAction = useCallback(
    (action: PendingCommentAction) => {
      if (action.type === "edit") {
        updateCommentMutation.mutate(
          { commentId: action.commentId, content: action.content },
          {
            onSuccess: () => {
              setEditingComment(null);
              setCommentText("");
              Toast.show({ type: "success", text1: "Comment updated" });
            },
            onError: (err) => {
              if (handleUgcError(err)) return;
              showApiErrorToast(
                err,
                "Update Failed",
                "Failed to update comment.",
              );
            },
          },
        );
        return;
      }

      addCommentMutation.mutate(
        { content: action.content, parentId: action.parentId },
        {
          onSuccess: () => {
            setCommentText("");
            setReplyTarget(null);
            Toast.show({
              type: "success",
              text1: action.parentId ? "Reply posted" : "Comment posted",
            });
          },
          onError: (err) => {
            if (handleUgcError(err)) return;
            showApiErrorToast(err, "Comment Failed", "Failed to post comment.");
          },
        },
      );
    },
    [addCommentMutation, updateCommentMutation, handleUgcError],
  );

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      if (!requireOnline(isOffline, "Reconnect to delete this comment."))
        return;
      deleteCommentMutation.mutate(commentId, {
        onSuccess: () => {
          Toast.show({ type: "success", text1: "Comment deleted" });
        },
        onError: (err) => {
          showApiErrorToast(err, "Delete Failed", "Failed to delete comment.");
        },
      });
    },
    [isOffline, deleteCommentMutation],
  );

  const handleStartReply = useCallback(
    (targetId: string, authorName: string) => {
      setEditingComment(null);
      setReplyTarget({ id: targetId, authorName });
      inputRef.current?.focus();
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    },
    [],
  );

  const handleStartEdit = useCallback((comment: Comment) => {
    setReplyTarget(null);
    setEditingComment(comment);
    setCommentText(comment.content);
    inputRef.current?.focus();
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, []);

  const handleSendComment = useCallback(() => {
    if (!requireOnline(isOffline, "Reconnect to post your comment.")) return;
    const validation = validateMarketplaceComment(commentText);
    if (validation.error || !validation.content) {
      Toast.show({
        type: "error",
        text1: "Invalid Comment",
        text2: validation.error || "Please enter a valid comment.",
      });
      return;
    }

    if (isEditMode && editingComment) {
      const action: PendingCommentAction = {
        type: "edit",
        commentId: editingComment.id,
        content: validation.content,
      };
      queuePayload(action, executePendingCommentAction);
      executePendingCommentAction(action);
      return;
    }

    const action: PendingCommentAction = {
      type: "add",
      content: validation.content,
      parentId: replyTarget?.id,
    };
    queuePayload(action, executePendingCommentAction);
    executePendingCommentAction(action);
  }, [
    isOffline,
    commentText,
    isEditMode,
    editingComment,
    replyTarget?.id,
    queuePayload,
    executePendingCommentAction,
  ]);

  const handleAcceptGuidelines = useCallback(() => {
    if (
      !requireOnline(isOffline, "Reconnect to accept community guidelines.")
    ) {
      return;
    }
    acceptGuidelines();
  }, [acceptGuidelines, isOffline]);

  const handleSubmitReport = useCallback(
    ({ reason, details }: { reason: UgcReportReason; details?: string }) => {
      if (!reportTarget) return;
      if (!requireOnline(isOffline, "Reconnect to submit your report.")) return;

      reportMutation.mutate(
        {
          targetType: reportTarget.targetType,
          targetId: reportTarget.targetId,
          reason,
          details,
        },
        {
          onSuccess: () => {
            setReportTarget(null);
            Toast.show({
              type: "success",
              text1: "Report Submitted",
              text2: "Thank you. Our moderation team will review it.",
            });
          },
          onError: (err) => {
            showApiErrorToast(
              err,
              "Report Failed",
              "Could not submit your report.",
            );
          },
        },
      );
    },
    [reportTarget, isOffline, reportMutation],
  );

  const handleOpenViewer = useCallback(
    (idx?: number) => {
      if (typeof idx === "number") {
        setSelectedImage(clampImageIndex(idx, post?.images?.length ?? 0));
      }
      openModal("imageViewer");
    },
    [openModal, post?.images?.length],
  );

  const handleViewAuthor = useCallback((author: AuthorProfileModalData) => {
    setSelectedAuthor(author);
  }, []);

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return <MarketplaceDetailSkeleton />;
  }

  if (isError || !post) {
    const errorState = resolveMarketplaceErrorState({ err: error, isOffline });
    const isTransient = errorState === "offline" || errorState === "generic";
    const errorTitle =
      errorState === "offline"
        ? "You're offline"
        : errorState === "generic"
          ? "Couldn't load listing"
          : "Listing not found";
    const errorSubtitle =
      errorState === "offline"
        ? "Reconnect to the internet to load this listing and latest comments."
        : errorState === "generic"
          ? "Something went wrong while fetching this listing."
          : "This listing may have been removed or is no longer available.";

    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <View style={styles.errorIconWrap}>
          <Feather
            name={errorState === "offline" ? "wifi-off" : "alert-circle"}
            size={32}
            color={CAMPUS_HUB_COLORS.dangerText}
          />
        </View>
        <Text style={styles.errorText}>{errorTitle}</Text>
        <Text style={styles.errorSubtext}>{errorSubtitle}</Text>
        <View style={styles.errorActionsRow}>
          {isTransient && (
            <Pressable
              onPress={() => refetch()}
              style={({ pressed }) => [
                styles.retryBtn,
                pressed && { opacity: 0.8 },
              ]}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Retry loading listing"
            >
              <Feather
                name="refresh-cw"
                size={14}
                color={CAMPUS_HUB_COLORS.deepNavy}
                style={styles.backBtnIcon}
              />
              <Text style={styles.retryBtnText}>Retry</Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backBtn,
              pressed && { opacity: 0.85 },
            ]}
            android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back to Campus Hub"
          >
            <Feather
              name="arrow-left"
              size={14}
              color={CAMPUS_HUB_COLORS.white}
              style={styles.backBtnIcon}
            />
            <Text style={styles.backBtnText}>Back to Hub</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const lockedNotice =
    post.status === "SOLD"
      ? isSelling
        ? "This item is marked as sold. Comments are closed."
        : "This request is fulfilled. Comments are closed."
      : "This listing is closed. Comments are closed.";

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={keyboardBehavior}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView style={styles.flexFill} edges={["top"]}>
        <View style={styles.tabletFrame}>
          <MPDetailHeader
            isSelling={isSelling}
            onBack={handleBack}
            onReportPost={
              !isAuthor
                ? () =>
                    setReportTarget({
                      targetType: "MARKETPLACE_POST",
                      targetId: post.id,
                      targetTitle: post.title,
                    })
                : undefined
            }
          />

          {isOffline && (
            <View style={styles.offlineBanner}>
              <Feather
                name="wifi-off"
                size={13}
                color={CAMPUS_HUB_COLORS.lostFoundAccentInk}
              />
              <Text style={styles.offlineBannerText}>
                You're offline. Viewing cached details — actions require a
                connection.
              </Text>
            </View>
          )}

          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollFlex}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <MPImageGallery
              images={post.images}
              selectedIndex={selectedImage}
              status={post.status}
              isSold={isSold}
              onSelectIndex={setSelectedImage}
              onOpenViewer={handleOpenViewer}
            />

            <MPListingInfoCard
              post={post}
              isAuthor={isAuthor}
              isAdmin={isAdmin}
              isEdited={isEdited}
              authorSubtitle={authorSubtitle}
              authorInitial={authorInitial}
              isUpdatingStatus={updateStatusMutation.isPending}
              onViewAuthor={handleViewAuthor}
              onContact={handleContact}
              onEdit={() => openModal("edit")}
              onMarkSold={() => openModal("sold")}
              onCloseListing={handleCloseListing}
              onReopenListing={handleReopenListing}
              onDelete={() => openModal("delete")}
            />

            <InlineComments
              comments={comments as any}
              currentUserId={currentUser?.id}
              listingAuthorId={post.authorId}
              accent={ACCENT}
              onStartReply={handleStartReply}
              onStartEdit={handleStartEdit}
              onDeleteComment={handleDeleteComment}
              onReportComment={(comment) =>
                setReportTarget({
                  targetType: "MARKETPLACE_COMMENT",
                  targetId: comment.id,
                  targetTitle: comment.content,
                })
              }
              onViewAuthorProfile={handleViewAuthor as any}
            />
          </ScrollView>

          <CommentInputBar
            replyTarget={replyTarget}
            onCancelReply={() => setReplyTarget(null)}
            isEditMode={isEditMode}
            onCancelEdit={handleCancelEdit}
            text={commentText}
            onChangeText={setCommentText}
            onSubmit={handleSendComment}
            isSubmitting={
              addCommentMutation.isPending || updateCommentMutation.isPending
            }
            accent={ACCENT}
            inputRef={inputRef}
            isLocked={isCommentsLocked}
            lockedMessage={lockedNotice}
          />
        </View>
      </SafeAreaView>

      {/* Modals — rendered outside SafeAreaView for full-screen coverage */}
      <AuthorDetailsModal
        visible={!!selectedAuthor}
        onClose={() => setSelectedAuthor(null)}
        author={selectedAuthor}
        isOwnProfile={Boolean(
          selectedAuthor?.id && selectedAuthor.id === currentUser?.id,
        )}
      />

      <ImageViewerModal
        visible={modals.imageViewer}
        images={post.images}
        initialIndex={selectedImage}
        onClose={() => closeModal("imageViewer")}
      />

      <MarketplaceDeleteModal
        visible={modals.delete}
        isDeleting={deleteMutation.isPending}
        postTitle={post.title}
        postPrice={post.price}
        postType={post.type}
        postImage={post.images?.[0]}
        onConfirm={handleConfirmDelete}
        onClose={() => closeModal("delete")}
      />

      <MarketplaceSoldModal
        visible={modals.sold}
        isSubmitting={soldMutation.isPending}
        itemTitle={post.title}
        itemPrice={post.price}
        isSelling={isSelling}
        onConfirm={handleConfirmSold}
        onClose={() => closeModal("sold")}
      />

      <EditMarketplaceModal
        visible={modals.edit}
        onClose={() => closeModal("edit")}
        post={post}
        currentUser={currentUser}
      />

      <UgcReportModal
        visible={Boolean(reportTarget)}
        targetType={reportTarget?.targetType ?? "MARKETPLACE_POST"}
        targetTitle={reportTarget?.targetTitle}
        onClose={() => setReportTarget(null)}
        onSubmit={handleSubmitReport}
        isSubmitting={reportMutation.isPending}
      />

      <UgcGuidelinesModal
        visible={showGuidelines}
        onClose={() => {
          clearQueuedPayload();
          setShowGuidelines(false);
        }}
        onAccept={handleAcceptGuidelines}
        isSubmitting={isAcceptingGuidelines}
        isOffline={isOffline}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  flexFill: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  tabletFrame: {
    flex: 1,
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentLight,
    borderWidth: 1,
    borderColor: colors.semantic.amber.border,
  },
  offlineBannerText: {
    flex: 1,
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.lostFoundAccentInk,
  },
  scrollFlex: {
    flex: 1,
  },
  scroll: {
    paddingTop: 8,
    paddingBottom: 84,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    gap: 12,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  errorIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: CAMPUS_HUB_COLORS.dangerBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  errorText: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  errorSubtext: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
  },
  errorActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    overflow: "hidden",
  },
  retryBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    backgroundColor: CAMPUS_HUB_COLORS.deepNavy,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    overflow: "hidden",
  },
  backBtnIcon: {
    marginRight: 6,
  },
  backBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.white,
  },
});
