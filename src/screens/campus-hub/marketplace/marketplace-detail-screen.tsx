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
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useMarketplacePost,
  useDeleteMarketplacePost,
  useMarkMarketplaceSold,
  useAddMarketplaceComment,
  useDeleteMarketplaceComment,
} from "@/features/campus-hub/useMarketplace";
import { CAMPUS_HUB_COLORS, fontFamily } from "@/screens/campus-hub/shared/design-tokens";
import {
  InlineComments,
  CommentInputBar,
  type ReplyTarget,
} from "@/screens/campus-hub/shared/inline-comments";
import {
  AuthorDetailsModal,
  type AuthorProfileModalData,
} from "@/screens/campus-hub/shared/author-modal";
import { ImageViewerModal } from "@/screens/campus-hub/shared/image-viewer-modal";
import { MarketplaceDeleteModal } from "@/screens/campus-hub/marketplace/components/marketplace-delete-modal";
import { MarketplaceSoldModal } from "@/screens/campus-hub/marketplace/components/marketplace-sold-modal";
import { EditMarketplaceModal } from "@/screens/campus-hub/marketplace/edit-modal";
import { setCampusHubActiveSection } from "@/screens/campus-hub";
import type { MarketplaceComment } from "@/services/marketplace-service";

// Detail sub-components
import { MPDetailHeader } from "./components/detail/mp-detail-header";
import { MPImageGallery } from "./components/detail/mp-image-gallery";
import { MPListingInfoCard } from "./components/detail/mp-listing-info-card";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const ACCENT = CAMPUS_HUB_COLORS.marketplaceAccent;
const EDIT_THRESHOLD_MS = 10_000;

// ---------------------------------------------------------------------------
// Modal state reducer
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export function MarketplaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();

  // Gallery state
  const [selectedImage, setSelectedImage] = useState(0);

  // Author modal state
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorProfileModalData | null>(null);

  // Comment state
  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Consolidated modal visibility
  const [modals, dispatchModal] = useReducer(modalReducer, initialModalState);
  const openModal = useCallback(
    (modal: keyof ModalState) => dispatchModal({ type: "OPEN", modal }),
    []
  );
  const closeModal = useCallback(
    (modal: keyof ModalState) => dispatchModal({ type: "CLOSE", modal }),
    []
  );

  // ---------------------------------------------------------------------------
  // Queries & Mutations
  // ---------------------------------------------------------------------------
  const { data: post, isLoading, isError } = useMarketplacePost(id);
  const deleteMutation = useDeleteMarketplacePost();
  const soldMutation = useMarkMarketplaceSold();
  const addCommentMutation = useAddMarketplaceComment(id);
  const deleteCommentMutation = useDeleteMarketplaceComment(id);

  // ---------------------------------------------------------------------------
  // Derived values — all memoised to avoid redundant recalculation
  // ---------------------------------------------------------------------------
  const isAuthor = useMemo(
    () => Boolean(currentUser?.id && currentUser.id === post?.authorId),
    [currentUser?.id, post?.authorId]
  );

  const isSelling = post?.type === "SELLING";
  const isSold = post?.status === "SOLD";

  const isEdited = useMemo(() => {
    if (!post?.updatedAt || !post?.createdAt) return false;
    const created = new Date(post.createdAt).getTime();
    const updated = new Date(post.updatedAt).getTime();
    return !isNaN(created) && !isNaN(updated) && updated - created > EDIT_THRESHOLD_MS;
  }, [post?.createdAt, post?.updatedAt]);

  const authorDept = useMemo(
    () =>
      post?.author?.studentProfile?.department ??
      post?.author?.teacherProfile?.department ??
      post?.author?.role ??
      "",
    [post?.author]
  );

  const authorInitial = useMemo(
    () => (post?.author?.name ?? "U").charAt(0).toUpperCase(),
    [post?.author?.name]
  );

  const comments = useMemo(
    () => (post?.comments ?? []) as MarketplaceComment[],
    [post?.comments]
  );

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  const handleBack = useCallback(() => {
    setCampusHubActiveSection("MARKETPLACE");
    router.replace({
      pathname: "/(tabs)/forum",
      params: { section: "MARKETPLACE" },
    });
  }, [router]);

  // Android hardware back — modal dismiss priority chain
  useEffect(() => {
    const onBackPress = () => {
      if (modals.imageViewer) { closeModal("imageViewer"); return true; }
      if (selectedAuthor) { setSelectedAuthor(null); return true; }
      if (replyTarget) { setReplyTarget(null); return true; }
      if (modals.delete) { closeModal("delete"); return true; }
      if (modals.sold) { closeModal("sold"); return true; }
      if (modals.edit) { closeModal("edit"); return true; }
      handleBack();
      return true;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [modals, selectedAuthor, replyTarget, handleBack, closeModal]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleConfirmDelete = useCallback(() => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        closeModal("delete");
        Toast.show({ type: "info", text1: "Listing deleted" });
        handleBack();
      },
      onError: () => {
        Toast.show({ type: "error", text1: "Failed to delete listing." });
      },
    });
  }, [id, deleteMutation, handleBack, closeModal]);

  const handleConfirmSold = useCallback(() => {
    soldMutation.mutate(id, {
      onSuccess: () => {
        closeModal("sold");
        Toast.show({ type: "success", text1: "Marked as Sold!" });
      },
      onError: () => {
        Toast.show({ type: "error", text1: "Failed to update status." });
      },
    });
  }, [id, soldMutation, closeModal]);

  const handleContact = useCallback(() => {
    if (!post?.contactPhone) return;
    const phone = post.contactPhone.replace(/\s+/g, "");
    Linking.openURL(`tel:${phone}`).catch(() =>
      Toast.show({ type: "error", text1: "Cannot open phone dialer" })
    );
  }, [post?.contactPhone]);

  const handleAddComment = useCallback(
    (content: string, parentId?: string | null) => {
      addCommentMutation.mutate(
        { content, parentId: parentId ?? undefined },
        {
          onError: () =>
            Toast.show({ type: "error", text1: "Failed to post comment" }),
        }
      );
    },
    [addCommentMutation]
  );

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      deleteCommentMutation.mutate(commentId, {
        onError: () =>
          Toast.show({ type: "error", text1: "Failed to delete comment" }),
      });
    },
    [deleteCommentMutation]
  );

  const handleStartReply = useCallback(
    (targetId: string, authorName: string) => {
      setReplyTarget({ id: targetId, authorName });
      inputRef.current?.focus();
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    },
    []
  );

  const handleSendComment = useCallback(() => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    handleAddComment(trimmed, replyTarget?.id);
    setCommentText("");
    setReplyTarget(null);
  }, [commentText, replyTarget, handleAddComment]);

  const handleViewAuthor = useCallback((author: AuthorProfileModalData) => {
    setSelectedAuthor(author);
  }, []);

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator size="large" color={ACCENT} />
      </SafeAreaView>
    );
  }

  if (isError || !post) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <View style={styles.errorIconWrap}>
          <Feather name="alert-circle" size={32} color={CAMPUS_HUB_COLORS.dangerText} />
        </View>
        <Text style={styles.errorText}>Listing not found</Text>
        <Text style={styles.errorSubtext}>
          This listing may have been removed or is no longer available.
        </Text>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.8}>
          <Feather name="arrow-left" size={14} color="#ffffff" style={styles.backBtnIcon} />
          <Text style={styles.backBtnText}>Back to Hub</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView style={styles.flexFill} edges={["top"]}>
        <MPDetailHeader isSelling={isSelling} onBack={handleBack} />

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
            isSold={isSold}
            onSelectIndex={setSelectedImage}
            onOpenViewer={() => openModal("imageViewer")}
          />

          <MPListingInfoCard
            post={post}
            isAuthor={isAuthor}
            isEdited={isEdited}
            authorDept={authorDept}
            authorInitial={authorInitial}
            onViewAuthor={handleViewAuthor}
            onContact={handleContact}
            onEdit={() => openModal("edit")}
            onMarkSold={() => openModal("sold")}
            onDelete={() => openModal("delete")}
          />

          <InlineComments
            comments={comments as any}
            currentUserId={currentUser?.id}
            accent={ACCENT}
            onStartReply={handleStartReply}
            onDeleteComment={handleDeleteComment}
            onViewAuthorProfile={handleViewAuthor as any}
          />
        </ScrollView>

        <CommentInputBar
          replyTarget={replyTarget}
          onCancelReply={() => setReplyTarget(null)}
          text={commentText}
          onChangeText={setCommentText}
          onSubmit={handleSendComment}
          isSubmitting={addCommentMutation.isPending}
          accent={ACCENT}
          inputRef={inputRef}
        />
      </SafeAreaView>

      {/* Modals — rendered outside SafeAreaView for full-screen coverage */}
      <AuthorDetailsModal
        visible={!!selectedAuthor}
        onClose={() => setSelectedAuthor(null)}
        author={selectedAuthor}
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
      />
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Styles — screen-level only (component styles live in each component file)
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  flexFill: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  scrollFlex: {
    flex: 1,
  },
  scroll: {
    paddingTop: 8,
    paddingBottom: 36,
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
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAMPUS_HUB_COLORS.deepNavy,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    marginTop: 8,
  },
  backBtnIcon: {
    marginRight: 6,
  },
  backBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
