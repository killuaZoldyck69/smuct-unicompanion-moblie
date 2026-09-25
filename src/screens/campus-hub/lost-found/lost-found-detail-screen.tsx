import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  BackHandler,
  StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useLostFoundPost,
  useDeleteLostFoundPost,
  useLostFoundClaims,
  useAcceptLostFoundClaim,
  useRejectLostFoundClaim,
  useWithdrawLostFoundClaim,
  usePossibleMatches,
} from "@/features/campus-hub/useLostFound";
import { CAMPUS_HUB_COLORS, fontFamily } from "@/screens/campus-hub/shared/design-tokens";
import {
  AuthorDetailsModal,
  type AuthorProfileModalData,
} from "@/screens/campus-hub/shared/author-modal";
import { ImageViewerModal } from "@/screens/campus-hub/shared/image-viewer-modal";
import { setCampusHubActiveSection } from "@/screens/campus-hub";
import { ClaimModal } from "@/screens/campus-hub/lost-found/components/claim-modal";
import { HandoverCard } from "@/screens/campus-hub/lost-found/components/handover-card";
import { AcceptConfirmationSheet } from "@/screens/campus-hub/lost-found/components/accept-confirmation-sheet";
import { EditLostFoundModal } from "./edit-modal";
import { LostFoundDeleteModal } from "./components/lost-found-delete-modal";
import type { LostFoundClaim } from "@/services/lost-found-service";

// Detail sub-components
import { LFDetailHeader } from "./components/detail/lf-detail-header";
import { LFImageGallery } from "./components/detail/lf-image-gallery";
import { LFInfoCard } from "./components/detail/lf-info-card";
import { LFPossibleMatches } from "./components/detail/lf-possible-matches";
import { LFClaimsSection } from "./components/detail/lf-claims-section";
import { LFMyClaimCard } from "./components/detail/lf-my-claim-card";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const ACCENT = CAMPUS_HUB_COLORS.lostFoundAccent;
const EDIT_THRESHOLD_MS = 10_000;

// ---------------------------------------------------------------------------
// Modal state reducer
// ---------------------------------------------------------------------------
type ModalState = {
  imageViewer: boolean;
  claim: boolean;
  edit: boolean;
  delete: boolean;
  acceptSheet: boolean;
};

type ModalAction =
  | { type: "OPEN"; modal: keyof ModalState }
  | { type: "CLOSE"; modal: keyof ModalState };

const initialModalState: ModalState = {
  imageViewer: false,
  claim: false,
  edit: false,
  delete: false,
  acceptSheet: false,
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
export function LostFoundDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: currentUser, role: currentUserRole } = useCurrentUser();
  const isAdmin = currentUserRole === "ADMIN";

  // Image gallery
  const [selectedImage, setSelectedImage] = useState(0);
  const [viewerImages, setViewerImages] = useState<string[]>([]);

  // Author modal
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorProfileModalData | null>(null);

  // Claim being acted on
  const [claimToAccept, setClaimToAccept] = useState<LostFoundClaim | null>(null);

  // Modal state
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
  // Queries & mutations
  // ---------------------------------------------------------------------------
  const { data: post, isLoading, isError, refetch } = useLostFoundPost(id);
  const { data: matches } = usePossibleMatches(id);
  const { data: claimsData, isLoading: isClaimsLoading } = useLostFoundClaims(id);

  const deleteMutation = useDeleteLostFoundPost();
  const acceptClaimMutation = useAcceptLostFoundClaim(id);
  const rejectClaimMutation = useRejectLostFoundClaim(id);
  const withdrawClaimMutation = useWithdrawLostFoundClaim(id);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------
  const isAuthor = useMemo(
    () => Boolean(currentUser?.id && currentUser.id === post?.authorId),
    [currentUser?.id, post?.authorId]
  );
  const canDelete = isAuthor || isAdmin;

  const isEdited = useMemo(
    () =>
      Boolean(
        post?.updatedAt &&
          post?.createdAt &&
          new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() >
            EDIT_THRESHOLD_MS
      ),
    [post?.updatedAt, post?.createdAt]
  );

  const claims = useMemo(() => claimsData ?? [], [claimsData]);
  const myClaim = useMemo(
    () => post?.myClaim ?? claims.find((c) => c.claimantId === currentUser?.id),
    [post?.myClaim, claims, currentUser?.id]
  );

  const isLost = post?.type === "LOST";
  const isResolved = post?.status === "RESOLVED" || post?.status === "CLAIMED";
  const claimButtonLabel = isLost ? "I Found This Item" : "This Item Is Mine";

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  const handleBack = useCallback(() => {
    setCampusHubActiveSection("LOST_FOUND");
    router.replace({
      pathname: "/(tabs)/forum",
      params: { section: "LOST_FOUND" },
    });
  }, [router]);

  // Android back-press — dismiss modals in priority order
  useEffect(() => {
    const onBackPress = () => {
      if (modals.imageViewer) { closeModal("imageViewer"); return true; }
      if (selectedAuthor) { setSelectedAuthor(null); return true; }
      if (modals.claim) { closeModal("claim"); return true; }
      if (modals.edit) { closeModal("edit"); return true; }
      if (modals.delete) { closeModal("delete"); return true; }
      if (modals.acceptSheet) { closeModal("acceptSheet"); return true; }
      handleBack();
      return true;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [modals, selectedAuthor, handleBack, closeModal]);

  // ---------------------------------------------------------------------------
  // Image viewer helpers
  // ---------------------------------------------------------------------------
  const openProofImageViewer = useCallback(
    (url: string) => {
      setViewerImages([url]);
      setSelectedImage(0);
      openModal("imageViewer");
    },
    [openModal]
  );

  const openPostImageViewer = useCallback(
    (idx: number) => {
      if (!post?.images?.length) return;
      setViewerImages(post.images);
      setSelectedImage(idx);
      openModal("imageViewer");
    },
    [post?.images, openModal]
  );

  // ---------------------------------------------------------------------------
  // Action handlers
  // ---------------------------------------------------------------------------
  const handleEditPress = useCallback(() => {
    openModal("edit");
  }, [openModal]);

  const handleDeletePress = useCallback(() => {
    openModal("delete");
  }, [openModal]);

  const handleConfirmDelete = useCallback(() => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        closeModal("delete");
        Toast.show({ type: "info", text1: "Listing deleted" });
        handleBack();
      },
      onError: (err: Error) => {
        Toast.show({
          type: "error",
          text1: "Failed to delete post",
          text2: err.message || "Please try again.",
        });
      },
    });
  }, [id, deleteMutation, handleBack, closeModal]);

  const handleOpenAcceptSheet = useCallback(
    (claim: LostFoundClaim) => {
      setClaimToAccept(claim);
      openModal("acceptSheet");
    },
    [openModal]
  );

  const handleCloseAcceptSheet = useCallback(() => {
    closeModal("acceptSheet");
    setClaimToAccept(null);
  }, [closeModal]);

  const handleConfirmAcceptClaim = useCallback(() => {
    if (!claimToAccept) return;
    acceptClaimMutation.mutate(claimToAccept.id, {
      onSuccess: () => {
        handleCloseAcceptSheet();
        Toast.show({
          type: "success",
          text1: "Claim Accepted!",
          text2: "Item marked resolved. Mutual contact details are now revealed.",
        });
        refetch();
      },
      onError: (err: Error & { response?: { data?: { message?: string } } }) => {
        Toast.show({
          type: "error",
          text1: "Action failed",
          text2: err.response?.data?.message ?? err.message,
        });
      },
    });
  }, [claimToAccept, acceptClaimMutation, handleCloseAcceptSheet, refetch]);

  const handleRejectClaim = useCallback(
    (claimId: string) => {
      Alert.alert("Decline Claim", "Are you sure you want to decline this claim?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: () => {
            rejectClaimMutation.mutate(claimId, {
              onSuccess: () => {
                Toast.show({ type: "info", text1: "Claim declined" });
                refetch();
              },
              onError: (err: Error & { response?: { data?: { message?: string } } }) => {
                Toast.show({
                  type: "error",
                  text1: "Failed to decline claim",
                  text2: err.response?.data?.message ?? err.message,
                });
              },
            });
          },
        },
      ]);
    },
    [rejectClaimMutation, refetch]
  );

  const handleWithdrawClaim = useCallback(
    (claimId: string) => {
      Alert.alert("Withdraw Claim", "Are you sure you want to withdraw your claim?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Withdraw",
          style: "destructive",
          onPress: () => {
            withdrawClaimMutation.mutate(claimId, {
              onSuccess: () => {
                Toast.show({ type: "info", text1: "Claim withdrawn" });
                refetch();
              },
              onError: (err: Error & { response?: { data?: { message?: string } } }) => {
                Toast.show({
                  type: "error",
                  text1: "Withdraw failed",
                  text2: err.response?.data?.message ?? err.message,
                });
              },
            });
          },
        },
      ]);
    },
    [withdrawClaimMutation, refetch]
  );

  const handleClaimPress = useCallback(() => {
    if (!currentUser) {
      return Toast.show({ type: "error", text1: "Please log in first" });
    }
    openModal("claim");
  }, [currentUser, openModal]);

  const handleMatchPress = useCallback(
    (matchId: string) => {
      router.push(`/campus-hub/lost-found/${matchId}` as any);
    },
    [router]
  );

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
        <Feather name="alert-circle" size={36} color={CAMPUS_HUB_COLORS.dangerText} />
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <LFDetailHeader
        isLost={isLost}
        onBack={handleBack}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <LFImageGallery
          images={post.images}
          selectedIndex={selectedImage}
          onSelectIndex={setSelectedImage}
          onOpenViewer={openPostImageViewer}
        />

        <LFInfoCard
          post={post}
          isAuthor={canDelete}
          isEdited={isEdited}
          onViewAuthor={handleViewAuthor}
          onEdit={handleEditPress}
          onDelete={handleDeletePress}
        />

        <LFPossibleMatches
          matches={matches ?? []}
          isLost={isLost}
          onPressMatch={handleMatchPress}
        />

        {isResolved && post.handoverData && (
          <View style={styles.handoverSection}>
            <HandoverCard
              counterpart={post.handoverData.counterpart}
              role={post.handoverData.role}
              onViewProfile={() =>
                setSelectedAuthor(post.handoverData!.counterpart as AuthorProfileModalData)
              }
            />
          </View>
        )}

        {isAuthor && (
          <LFClaimsSection
            claims={claims}
            isLoading={isClaimsLoading}
            claimToAcceptId={claimToAccept?.id}
            isAccepting={acceptClaimMutation.isPending}
            isRejecting={rejectClaimMutation.isPending}
            onAccept={handleOpenAcceptSheet}
            onReject={handleRejectClaim}
            onImagePress={openProofImageViewer}
            onViewClaimant={handleViewAuthor as any}
          />
        )}

        {!isAuthor && myClaim && (
          <LFMyClaimCard
            claim={myClaim}
            isResolved={isResolved}
            isWithdrawing={withdrawClaimMutation.isPending}
            onOpenProof={openProofImageViewer}
            onWithdraw={handleWithdrawClaim}
          />
        )}
      </ScrollView>

      {/* Docked claim CTA */}
      {!isAuthor && !myClaim && !isResolved && (
        <View style={[styles.dockedFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={styles.claimCtaBtn}
            onPress={handleClaimPress}
            activeOpacity={0.85}
            accessible
            accessibilityRole="button"
            accessibilityLabel={claimButtonLabel}
          >
            <Feather
              name={isLost ? "check-square" : "user-check"}
              size={18}
              color="#ffffff"
              style={styles.claimCtaIcon}
            />
            <Text style={styles.claimCtaBtnText}>{claimButtonLabel}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modals */}
      <EditLostFoundModal
        visible={modals.edit}
        onClose={() => closeModal("edit")}
        post={post}
      />

      <LostFoundDeleteModal
        visible={modals.delete}
        isDeleting={deleteMutation.isPending}
        postTitle={post.title}
        postType={post.type}
        postLocation={post.location}
        postImage={post.images?.[0]}
        onConfirm={handleConfirmDelete}
        onClose={() => closeModal("delete")}
      />

      <AcceptConfirmationSheet
        visible={modals.acceptSheet}
        claim={claimToAccept}
        isLoading={acceptClaimMutation.isPending}
        onConfirm={handleConfirmAcceptClaim}
        onClose={handleCloseAcceptSheet}
      />

      <ClaimModal
        visible={modals.claim}
        onClose={() => closeModal("claim")}
        post={post}
        onSuccess={() => refetch()}
      />

      <ImageViewerModal
        visible={modals.imageViewer}
        images={viewerImages}
        initialIndex={selectedImage}
        onClose={() => closeModal("imageViewer")}
      />

      <AuthorDetailsModal
        visible={Boolean(selectedAuthor)}
        author={selectedAuthor}
        onClose={() => setSelectedAuthor(null)}
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 12,
  },
  errorText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccent,
  },
  backBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
  },
  handoverSection: {
    marginTop: 4,
  },
  dockedFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  claimCtaBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccent,
    height: 50,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  claimCtaIcon: {
    marginRight: 8,
  },
  claimCtaBtnText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
});
