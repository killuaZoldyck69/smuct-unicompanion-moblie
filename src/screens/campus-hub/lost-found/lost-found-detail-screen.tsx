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
  Pressable,
  Modal,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  BackHandler,
  Platform,
  StyleSheet,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { colors } from "@/theme/colors";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { extractApiErrorInfo } from "@/features/forum/forum-logic";
import { resolveLostFoundBackDestination } from "@/features/campus-hub/lost-found-logic";
import {
  useLostFoundPost,
  useDeleteLostFoundPost,
  useUpdateLostFoundStatus,
  useLostFoundClaims,
  useAcceptLostFoundClaim,
  useRejectLostFoundClaim,
  useWithdrawLostFoundClaim,
  useReportLostFoundPost,
} from "@/features/campus-hub/useLostFound";
import { UgcReportModal } from "@/screens/forum/components/ugc/ugc-report-modal";
import type { UgcReportReason } from "@/services/ugc-service";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  titleFontFamily,
} from "@/screens/campus-hub/shared/design-tokens";
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
import { LostFoundDetailSkeleton } from "../shared/skeleton-loaders";
import type {
  LostFoundClaim,
  LostFoundStatus,
} from "@/services/lost-found-service";

// Detail sub-components
import { LFDetailHeader } from "./components/detail/lf-detail-header";
import { LFImageGallery } from "./components/detail/lf-image-gallery";
import { LFInfoCard } from "./components/detail/lf-info-card";
import { LFClaimsSection } from "./components/detail/lf-claims-section";
import { LFMyClaimCard } from "./components/detail/lf-my-claim-card";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
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
  report: boolean;
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
  report: false,
};

type PendingActionConfirm =
  | {
      kind: "REJECT_CLAIM";
      claimId: string;
      title: string;
      message: string;
      confirmLabel: string;
      tone: "danger" | "primary";
    }
  | {
      kind: "WITHDRAW_CLAIM";
      claimId: string;
      title: string;
      message: string;
      confirmLabel: string;
      tone: "danger" | "primary";
    }
  | {
      kind: "CHANGE_STATUS";
      status: LostFoundStatus;
      title: string;
      message: string;
      confirmLabel: string;
      tone: "danger" | "primary";
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
  const { isOffline } = useNetworkStatus();
  const isAdmin = currentUserRole === "ADMIN";

  // Image gallery & fullscreen viewer
  const [selectedImage, setSelectedImage] = useState(0);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  // Author modal
  const [selectedAuthor, setSelectedAuthor] =
    useState<AuthorProfileModalData | null>(null);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // Claim being acted on
  const [claimToAccept, setClaimToAccept] = useState<LostFoundClaim | null>(
    null,
  );
  const [pendingConfirm, setPendingConfirm] =
    useState<PendingActionConfirm | null>(null);

  // Modal state
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
  // Queries & mutations
  // ---------------------------------------------------------------------------
  const {
    data: post,
    isLoading,
    isError,
    error,
    refetch,
  } = useLostFoundPost(id);

  const isAuthor = useMemo(
    () => Boolean(currentUser?.id && currentUser.id === post?.authorId),
    [currentUser?.id, post?.authorId],
  );
  const canViewClaims = isAuthor || isAdmin;

  const {
    data: claimsData,
    isLoading: isClaimsLoading,
    isError: isClaimsError,
    refetch: refetchClaims,
  } = useLostFoundClaims(id, canViewClaims);

  const handleManualRefresh = useCallback(async () => {
    setIsManualRefreshing(true);
    try {
      const results = await Promise.all([
        refetch(),
        canViewClaims ? refetchClaims() : Promise.resolve(null),
      ]);
      if (results[0]?.isError && !isOffline) {
        Toast.show({
          type: "error",
          text1: "Refresh failed",
          text2: "Could not refresh listing details.",
        });
      }
    } finally {
      setIsManualRefreshing(false);
    }
  }, [refetch, canViewClaims, refetchClaims, isOffline]);

  const deleteMutation = useDeleteLostFoundPost();
  const statusMutation = useUpdateLostFoundStatus();
  const acceptClaimMutation = useAcceptLostFoundClaim(id);
  const rejectClaimMutation = useRejectLostFoundClaim(id);
  const withdrawClaimMutation = useWithdrawLostFoundClaim(id);
  const reportMutation = useReportLostFoundPost(id);
  const isConfirmPending =
    rejectClaimMutation.isPending ||
    withdrawClaimMutation.isPending ||
    statusMutation.isPending;

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const isEdited = useMemo(
    () =>
      Boolean(
        post?.updatedAt &&
        post?.createdAt &&
        new Date(post.updatedAt).getTime() -
          new Date(post.createdAt).getTime() >
          EDIT_THRESHOLD_MS,
      ),
    [post?.updatedAt, post?.createdAt],
  );

  const claims = useMemo(() => claimsData ?? [], [claimsData]);
  const myClaim = useMemo(
    () => post?.myClaim ?? claims.find((c) => c.claimantId === currentUser?.id),
    [post?.myClaim, claims, currentUser?.id],
  );

  const isLost = post?.type === "LOST";
  const isResolved = post?.status === "RESOLVED" || post?.status === "CLAIMED";
  const claimButtonLabel = isLost ? "I Found This Item" : "This Item Is Mine";

  // Clamp selected gallery index if post images array shrinks after edit
  useEffect(() => {
    const len = post?.images?.length ?? 0;
    if (len === 0 && selectedImage !== 0) {
      setSelectedImage(0);
    } else if (len > 0 && selectedImage >= len) {
      setSelectedImage(len - 1);
    }
  }, [post?.images?.length, selectedImage]);

  // ---------------------------------------------------------------------------
  // Navigation & Status Handlers
  // ---------------------------------------------------------------------------
  const handleBack = useCallback(() => {
    setCampusHubActiveSection("LOST_FOUND");
    const destination = resolveLostFoundBackDestination({
      userRole: currentUserRole,
    });
    router.replace({
      pathname: destination.href as any,
      params: destination.params,
    });
  }, [currentUserRole, router]);

  // Android back-press — dismiss modals in priority order
  useEffect(() => {
    const onBackPress = () => {
      if (modals.imageViewer) {
        closeModal("imageViewer");
        return true;
      }
      if (selectedAuthor) {
        setSelectedAuthor(null);
        return true;
      }
      if (pendingConfirm) {
        if (!isConfirmPending) {
          setPendingConfirm(null);
        }
        return true;
      }
      if (modals.report) {
        if (!reportMutation.isPending) {
          closeModal("report");
        }
        return true;
      }
      if (modals.claim) {
        closeModal("claim");
        return true;
      }
      if (modals.edit) {
        closeModal("edit");
        return true;
      }
      if (modals.delete) {
        if (!deleteMutation.isPending) {
          closeModal("delete");
        }
        return true;
      }
      if (modals.acceptSheet) {
        if (!acceptClaimMutation.isPending) {
          closeModal("acceptSheet");
          setClaimToAccept(null);
        }
        return true;
      }
      handleBack();
      return true;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [
    modals,
    selectedAuthor,
    pendingConfirm,
    isConfirmPending,
    reportMutation.isPending,
    deleteMutation.isPending,
    acceptClaimMutation.isPending,
    handleBack,
    closeModal,
  ]);

  // ---------------------------------------------------------------------------
  // Image viewer helpers
  // ---------------------------------------------------------------------------
  const openProofImageViewer = useCallback(
    (url: string) => {
      setViewerImages([url]);
      setViewerInitialIndex(0);
      openModal("imageViewer");
    },
    [openModal],
  );

  const openPostImageViewer = useCallback(
    (idx: number) => {
      if (!post?.images?.length) return;
      setViewerImages(post.images);
      setViewerInitialIndex(idx);
      openModal("imageViewer");
    },
    [post?.images, openModal],
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
    if (isOffline) {
      Toast.show({
        type: "error",
        text1: "You're Offline",
        text2: "Reconnect to the internet before deleting this listing.",
      });
      return;
    }
    if (deleteMutation.isPending) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        closeModal("delete");
        Toast.show({ type: "info", text1: "Listing deleted" });
        handleBack();
      },
      onError: (err) => {
        const info = extractApiErrorInfo(err, "Please try again.");
        Toast.show({
          type: "error",
          text1: "Failed to delete post",
          text2: info.message,
        });
      },
    });
  }, [id, isOffline, deleteMutation, handleBack, closeModal]);

  const handleOpenAcceptSheet = useCallback(
    (claim: LostFoundClaim) => {
      setClaimToAccept(claim);
      openModal("acceptSheet");
    },
    [openModal],
  );

  const handleCloseAcceptSheet = useCallback(() => {
    closeModal("acceptSheet");
    setClaimToAccept(null);
  }, [closeModal]);

  const handleConfirmAcceptClaim = useCallback(() => {
    if (isOffline) {
      Toast.show({
        type: "error",
        text1: "You're Offline",
        text2: "Reconnect to the internet before accepting a claim.",
      });
      return;
    }
    if (!claimToAccept || acceptClaimMutation.isPending) return;
    acceptClaimMutation.mutate(claimToAccept.id, {
      onSuccess: () => {
        handleCloseAcceptSheet();
        Toast.show({
          type: "success",
          text1: "Claim Accepted!",
          text2:
            "Item marked resolved. Mutual contact details are now revealed.",
        });
      },
      onError: (err) => {
        const info = extractApiErrorInfo(err, "Could not accept claim.");
        Toast.show({
          type: "error",
          text1: "Action failed",
          text2: info.message,
        });
      },
    });
  }, [isOffline, claimToAccept, acceptClaimMutation, handleCloseAcceptSheet]);

  const handleRejectClaim = useCallback((claimId: string) => {
    setPendingConfirm({
      kind: "REJECT_CLAIM",
      claimId,
      title: "Decline Claim?",
      message:
        "Are you sure you want to decline this claim? The claimant will be notified.",
      confirmLabel: "Decline Claim",
      tone: "danger",
    });
  }, []);

  const handleWithdrawClaim = useCallback((claimId: string) => {
    setPendingConfirm({
      kind: "WITHDRAW_CLAIM",
      claimId,
      title: "Withdraw Claim?",
      message:
        "Are you sure you want to withdraw your submitted claim? You can submit at most 2 claims total per listing.",
      confirmLabel: "Withdraw",
      tone: "danger",
    });
  }, []);

  const handleRequestStatusChange = useCallback(
    (nextStatus: LostFoundStatus) => {
      if (nextStatus === "CLOSED") {
        setPendingConfirm({
          kind: "CHANGE_STATUS",
          status: "CLOSED",
          title: "Close Listing?",
          message:
            "Closing this listing will hide claim actions. Pending claims remain visible to you, and you can reopen it later.",
          confirmLabel: "Close Listing",
          tone: "danger",
        });
        return;
      }
      if (nextStatus === "RESOLVED") {
        setPendingConfirm({
          kind: "CHANGE_STATUS",
          status: "RESOLVED",
          title: "Mark as Resolved?",
          message:
            "Mark this item as resolved / reunited so no further claims are accepted?",
          confirmLabel: "Mark Resolved",
          tone: "primary",
        });
        return;
      }
      setPendingConfirm({
        kind: "CHANGE_STATUS",
        status: "ACTIVE",
        title: "Reopen Listing?",
        message:
          "Reopening restores this post to active status and revokes any prior accepted handover.",
        confirmLabel: "Reopen Listing",
        tone: "primary",
      });
    },
    [],
  );

  const handleExecutePendingConfirm = useCallback(() => {
    if (isOffline) {
      Toast.show({
        type: "error",
        text1: "You're Offline",
        text2: "Reconnect to the internet before performing this action.",
      });
      return;
    }
    if (!pendingConfirm || isConfirmPending) return;
    if (pendingConfirm.kind === "REJECT_CLAIM") {
      rejectClaimMutation.mutate(pendingConfirm.claimId, {
        onSuccess: () => {
          setPendingConfirm(null);
          Toast.show({ type: "info", text1: "Claim declined" });
        },
        onError: (err) => {
          const info = extractApiErrorInfo(err, "Failed to decline claim.");
          Toast.show({
            type: "error",
            text1: "Failed to decline claim",
            text2: info.message,
          });
        },
      });
      return;
    }

    if (pendingConfirm.kind === "WITHDRAW_CLAIM") {
      withdrawClaimMutation.mutate(pendingConfirm.claimId, {
        onSuccess: () => {
          setPendingConfirm(null);
          Toast.show({ type: "info", text1: "Claim withdrawn" });
        },
        onError: (err) => {
          const info = extractApiErrorInfo(err, "Withdraw failed.");
          Toast.show({
            type: "error",
            text1: "Withdraw failed",
            text2: info.message,
          });
        },
      });
      return;
    }

    statusMutation.mutate(
      { id, status: pendingConfirm.status },
      {
        onSuccess: () => {
          const applied = pendingConfirm.status;
          setPendingConfirm(null);
          Toast.show({
            type: "success",
            text1:
              applied === "ACTIVE"
                ? "Listing Reopened"
                : applied === "CLOSED"
                  ? "Listing Closed"
                  : "Listing Resolved",
          });
        },
        onError: (err) => {
          const info = extractApiErrorInfo(err, "Could not update status.");
          Toast.show({
            type: "error",
            text1: "Status Update Failed",
            text2: info.message,
          });
        },
      },
    );
  }, [
    id,
    isOffline,
    pendingConfirm,
    isConfirmPending,
    rejectClaimMutation,
    withdrawClaimMutation,
    statusMutation,
  ]);

  const handleClaimPress = useCallback(() => {
    if (!currentUser) {
      return Toast.show({ type: "error", text1: "Please log in first" });
    }
    if (isOffline) {
      return Toast.show({
        type: "error",
        text1: "You're Offline",
        text2: "Reconnect to the internet to submit a claim.",
      });
    }
    openModal("claim");
  }, [currentUser, isOffline, openModal]);

  const handleOpenReport = useCallback(() => {
    if (!currentUser) {
      return Toast.show({ type: "error", text1: "Please log in first" });
    }
    openModal("report");
  }, [currentUser, openModal]);

  const handleSubmitReport = useCallback(
    (payload: { reason: UgcReportReason; details?: string }) => {
      if (isOffline) {
        Toast.show({
          type: "error",
          text1: "You're Offline",
          text2: "Reconnect to the internet before submitting a report.",
        });
        return;
      }
      reportMutation.mutate(payload, {
        onSuccess: () => {
          closeModal("report");
          Toast.show({
            type: "success",
            text1: "Report Submitted",
            text2: "Thank you. Moderators will review this listing.",
          });
        },
        onError: (err) => {
          const info = extractApiErrorInfo(err, "Could not submit report.");
          Toast.show({
            type: "error",
            text1: "Report Failed",
            text2: info.message,
          });
        },
      });
    },
    [isOffline, reportMutation, closeModal],
  );

  const handleViewAuthor = useCallback((author: AuthorProfileModalData) => {
    setSelectedAuthor(author);
  }, []);

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return <LostFoundDetailSkeleton />;
  }

  if (isError || !post) {
    const errorInfo = error
      ? extractApiErrorInfo(error, "Unable to load this listing.")
      : null;
    const isNotFound = !isError || errorInfo?.status === 404;

    return (
      <SafeAreaView style={styles.center} edges={["top", "bottom"]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={CAMPUS_HUB_COLORS.background}
        />
        <Feather
          name="alert-circle"
          size={36}
          color={CAMPUS_HUB_COLORS.dangerText}
        />
        <Text style={styles.errorText}>
          {isNotFound ? "Post not found" : "Could not load listing"}
        </Text>
        {!isNotFound && errorInfo?.message ? (
          <Text style={styles.errorSubtext}>{errorInfo.message}</Text>
        ) : null}
        <View style={styles.errorActionsRow}>
          {!isNotFound && (
            <Pressable
              onPress={() => refetch()}
              style={({ pressed }) => [
                styles.backBtn,
                pressed && { opacity: 0.85 },
              ]}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Retry loading post"
            >
              <Text style={styles.backBtnText}>Retry</Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              isNotFound ? styles.backBtn : styles.secondaryBackBtn,
              pressed && { opacity: 0.85 },
            ]}
            android_ripple={{
              color: isNotFound
                ? CAMPUS_HUB_COLORS.androidRippleLight
                : CAMPUS_HUB_COLORS.androidRipple,
            }}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text
              style={
                isNotFound ? styles.backBtnText : styles.secondaryBackBtnText
              }
            >
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const showDockedFooter = !isAuthor && !myClaim && post.status === "ACTIVE";

  return (
    <SafeAreaView
      style={styles.container}
      edges={showDockedFooter ? ["top"] : ["top", "bottom"]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={CAMPUS_HUB_COLORS.background}
      />
      <LFDetailHeader
        isLost={isLost}
        onBack={handleBack}
        onReport={!isAuthor ? handleOpenReport : undefined}
      />

      {isOffline && (
        <View style={styles.bannerOuter}>
          <View style={styles.offlineBanner}>
            <Feather
              name="wifi-off"
              size={13}
              color={CAMPUS_HUB_COLORS.lostFoundAccentText}
            />
            <Text style={styles.offlineBannerText}>
              You&apos;re offline — showing cached listing details
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (showDockedFooter ? 104 : 28) },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isManualRefreshing}
            onRefresh={handleManualRefresh}
            colors={[CAMPUS_HUB_COLORS.lostFoundAccentFill]}
            tintColor={CAMPUS_HUB_COLORS.lostFoundAccentFill}
          />
        }
      >
        <LFImageGallery
          images={post.images}
          selectedIndex={selectedImage}
          onSelectIndex={setSelectedImage}
          onOpenViewer={openPostImageViewer}
        />

        <LFInfoCard
          post={post}
          isAuthor={isAuthor}
          isAdmin={isAdmin}
          isEdited={isEdited}
          isUpdatingStatus={statusMutation.isPending}
          onViewAuthor={handleViewAuthor}
          onEdit={handleEditPress}
          onDelete={handleDeletePress}
          onChangeStatus={handleRequestStatusChange}
        />

        {isResolved && post.handoverData && (
          <View style={styles.handoverSection}>
            <HandoverCard
              counterpart={post.handoverData.counterpart}
              role={post.handoverData.role}
              onViewProfile={() =>
                setSelectedAuthor(
                  post.handoverData!.counterpart as AuthorProfileModalData,
                )
              }
            />
          </View>
        )}

        {canViewClaims && (
          <LFClaimsSection
            claims={claims}
            isLoading={isClaimsLoading}
            isError={isClaimsError}
            onRetry={() => refetchClaims()}
            claimToAcceptId={claimToAccept?.id}
            isAccepting={acceptClaimMutation.isPending}
            isRejecting={rejectClaimMutation.isPending}
            onAccept={handleOpenAcceptSheet}
            onReject={handleRejectClaim}
            onImagePress={openProofImageViewer}
            onViewClaimant={handleViewAuthor}
            isAuthor={isAuthor}
            postStatus={post.status}
          />
        )}

        {!isAuthor && myClaim && (
          <LFMyClaimCard
            claim={myClaim}
            isResolved={isResolved}
            postStatus={post.status}
            isWithdrawing={withdrawClaimMutation.isPending}
            onOpenProof={openProofImageViewer}
            onWithdraw={handleWithdrawClaim}
            onResubmit={handleClaimPress}
          />
        )}
      </ScrollView>

      {/* Docked claim CTA — only for active listings with no submitted claim */}
      {showDockedFooter && (
        <View
          style={[
            styles.dockedFooter,
            {
              paddingBottom: insets.bottom + (Platform.OS === "ios" ? 14 : 16),
            },
          ]}
        >
          <View style={styles.dockedFooterInner}>
            <Pressable
              style={({ pressed }) => [
                styles.claimCtaBtn,
                pressed && { opacity: 0.88 },
              ]}
              onPress={handleClaimPress}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
              accessible
              accessibilityRole="button"
              accessibilityLabel={claimButtonLabel}
            >
              <Feather
                name={isLost ? "check-square" : "user-check"}
                size={18}
                color={CAMPUS_HUB_COLORS.white}
                style={styles.claimCtaIcon}
              />
              <Text style={styles.claimCtaBtnText}>{claimButtonLabel}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Modals */}
      <EditLostFoundModal
        visible={modals.edit}
        onClose={() => closeModal("edit")}
        post={post}
        isAuthor={isAuthor}
      />

      <UgcReportModal
        visible={modals.report}
        targetType="LOST_FOUND_POST"
        targetTitle={post.title}
        onClose={() => closeModal("report")}
        onSubmit={handleSubmitReport}
        isSubmitting={reportMutation.isPending}
      />

      <Modal
        visible={Boolean(pendingConfirm)}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => !isConfirmPending && setPendingConfirm(null)}
      >
        <View style={styles.confirmBackdrop} accessibilityViewIsModal={true}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => !isConfirmPending && setPendingConfirm(null)}
            accessible={false}
          />
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle} maxFontSizeMultiplier={1.35}>
              {pendingConfirm?.title ?? ""}
            </Text>
            <Text style={styles.confirmMessage} maxFontSizeMultiplier={1.35}>
              {pendingConfirm?.message ?? ""}
            </Text>
            <View style={styles.confirmActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.confirmCancelBtn,
                  isConfirmPending && { opacity: 0.6 },
                  pressed && !isConfirmPending && { opacity: 0.85 },
                ]}
                disabled={isConfirmPending}
                onPress={() => setPendingConfirm(null)}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                accessible
                accessibilityRole="button"
                accessibilityState={{ disabled: isConfirmPending }}
                accessibilityLabel="Cancel confirmation"
              >
                <Text
                  style={styles.confirmCancelText}
                  maxFontSizeMultiplier={1.25}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.confirmActionBtn,
                  pendingConfirm?.tone === "danger"
                    ? styles.confirmDangerBtn
                    : styles.confirmPrimaryBtn,
                  isConfirmPending && styles.confirmActionBtnDisabled,
                  pressed && !isConfirmPending && { opacity: 0.88 },
                ]}
                disabled={isConfirmPending}
                onPress={handleExecutePendingConfirm}
                android_ripple={{
                  color: CAMPUS_HUB_COLORS.androidRippleLight,
                }}
                accessible
                accessibilityRole="button"
                accessibilityState={{
                  disabled: isConfirmPending,
                  busy: isConfirmPending,
                }}
                accessibilityLabel={
                  pendingConfirm?.confirmLabel ?? "Confirm action"
                }
              >
                {isConfirmPending ? (
                  <ActivityIndicator
                    size="small"
                    color={CAMPUS_HUB_COLORS.white}
                  />
                ) : (
                  <Text
                    style={styles.confirmActionText}
                    maxFontSizeMultiplier={1.25}
                  >
                    {pendingConfirm?.confirmLabel ?? "Confirm"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
      />

      <ImageViewerModal
        visible={modals.imageViewer}
        images={viewerImages}
        initialIndex={viewerInitialIndex}
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
    backgroundColor: CAMPUS_HUB_COLORS.background,
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
  errorSubtext: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    maxWidth: 280,
  },
  errorActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentFill,
    overflow: "hidden",
  },
  backBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.white,
  },
  secondaryBackBtn: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    overflow: "hidden",
  },
  secondaryBackBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 14,
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
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
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.cardBorder,
    ...CAMPUS_HUB_COLORS.footerShadow,
  },
  dockedFooterInner: {
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  claimCtaBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentFill,
    height: 50,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  claimCtaIcon: {
    marginRight: 8,
  },
  claimCtaBtnText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.white,
  },
  bannerOuter: {
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: 20,
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.semantic.amber.soft,
    borderWidth: 1,
    borderColor: colors.semantic.amber.border,
  },
  offlineBannerText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.lostFoundAccentText,
    flex: 1,
  },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: colors.scrimDark,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  confirmCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 22,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  confirmTitle: {
    fontFamily: titleFontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  confirmMessage: {
    fontFamily,
    fontSize: 13.5,
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 20,
  },
  confirmActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  confirmCancelBtn: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 12,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  confirmCancelText: {
    fontFamily,
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
    includeFontPadding: false,
  },
  confirmActionBtn: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 12,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  confirmActionBtnDisabled: {
    opacity: 0.6,
    elevation: 0,
    shadowOpacity: 0,
  },
  confirmDangerBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.dangerText,
  },
  confirmPrimaryBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentFill,
  },
  confirmActionText: {
    fontFamily,
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.white,
    includeFontPadding: false,
  },
});
