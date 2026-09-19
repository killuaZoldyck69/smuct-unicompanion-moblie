import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  BackHandler,
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
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  timeAgo,
  formatDateTime,
} from "@/screens/campus-hub/shared/design-tokens";
import { AvatarChip } from "@/screens/campus-hub/shared/avatar-chip";
import {
  AuthorDetailsModal,
  type AuthorProfileModalData,
} from "@/screens/campus-hub/shared/author-modal";
import { ImageViewerModal } from "@/screens/campus-hub/shared/image-viewer-modal";
import { setCampusHubActiveSection } from "@/screens/campus-hub";
import { ClaimModal } from "@/screens/campus-hub/lost-found/components/claim-modal";
import { ClaimListItem } from "@/screens/campus-hub/lost-found/components/claim-list-item";
import { HandoverCard } from "@/screens/campus-hub/lost-found/components/handover-card";
import {
  TypeBadge,
  StatusBadge,
  CategoryBadge,
} from "@/screens/campus-hub/lost-found/components/status-badge";
import { OverflowMenuModal } from "@/screens/campus-hub/lost-found/components/overflow-menu-modal";
import { AcceptConfirmationSheet } from "@/screens/campus-hub/lost-found/components/accept-confirmation-sheet";
import type { LostFoundClaim } from "@/services/lost-found-service";

const ACCENT = CAMPUS_HUB_COLORS.lostFoundAccent;

export default function LostFoundDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: currentUser, role: currentUserRole } = useCurrentUser();
  const isAdmin = currentUserRole === "ADMIN";

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorProfileModalData | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);

  // Accept claim sheet state
  const [claimToAccept, setClaimToAccept] = useState<LostFoundClaim | null>(null);
  const [isAcceptSheetVisible, setIsAcceptSheetVisible] = useState(false);

  // Queries
  const { data: post, isLoading, isError, refetch } = useLostFoundPost(id);
  const { data: matches } = usePossibleMatches(id);
  const { data: claimsData, isLoading: isClaimsLoading } = useLostFoundClaims(id);

  // Mutations
  const deleteMutation = useDeleteLostFoundPost();
  const acceptClaimMutation = useAcceptLostFoundClaim(id);
  const rejectClaimMutation = useRejectLostFoundClaim(id);
  const withdrawClaimMutation = useWithdrawLostFoundClaim(id);

  const isAuthor = Boolean(currentUser?.id && currentUser?.id === post?.authorId);
  const canDelete = isAuthor || isAdmin;

  const handleBack = useCallback(() => {
    setCampusHubActiveSection("LOST_FOUND");
    router.replace({
      pathname: "/(tabs)/forum",
      params: { section: "LOST_FOUND" },
    });
  }, [router]);

  useEffect(() => {
    const onBackPress = () => {
      if (isImageViewerOpen) {
        setIsImageViewerOpen(false);
        return true;
      }
      if (selectedAuthor) {
        setSelectedAuthor(null);
        return true;
      }
      if (isClaimModalOpen) {
        setIsClaimModalOpen(false);
        return true;
      }
      if (isOverflowOpen) {
        setIsOverflowOpen(false);
        return true;
      }
      if (isAcceptSheetVisible) {
        setIsAcceptSheetVisible(false);
        return true;
      }
      handleBack();
      return true;
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => backHandlerSubscription.remove();
  }, [
    isImageViewerOpen,
    selectedAuthor,
    isClaimModalOpen,
    isOverflowOpen,
    isAcceptSheetVisible,
    handleBack,
  ]);

  const handleConfirmDelete = useCallback(() => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setIsOverflowOpen(false);
        Toast.show({ type: "info", text1: "Listing deleted" });
        handleBack();
      },
      onError: (err: any) => {
        Toast.show({
          type: "error",
          text1: "Failed to delete post",
          text2: err?.message || "Please try again.",
        });
      },
    });
  }, [id, deleteMutation, handleBack]);

  const handleOpenAcceptSheet = useCallback((claim: LostFoundClaim) => {
    setClaimToAccept(claim);
    setIsAcceptSheetVisible(true);
  }, []);

  const handleConfirmAcceptClaim = useCallback(() => {
    if (!claimToAccept) return;
    acceptClaimMutation.mutate(claimToAccept.id, {
      onSuccess: () => {
        setIsAcceptSheetVisible(false);
        setClaimToAccept(null);
        Toast.show({
          type: "success",
          text1: "Claim Accepted!",
          text2: "Item marked resolved. Mutual contact details are now revealed.",
        });
        refetch();
      },
      onError: (err: any) => {
        Toast.show({
          type: "error",
          text1: "Action failed",
          text2: err.response?.data?.message || err.message,
        });
      },
    });
  }, [claimToAccept, acceptClaimMutation, refetch]);

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
              onError: (err: any) => {
                Toast.show({
                  type: "error",
                  text1: "Failed to decline claim",
                  text2: err.response?.data?.message || err.message,
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
              onError: (err: any) => {
                Toast.show({
                  type: "error",
                  text1: "Withdraw failed",
                  text2: err.response?.data?.message || err.message,
                });
              },
            });
          },
        },
      ]);
    },
    [withdrawClaimMutation, refetch]
  );

  const openProofImageViewer = useCallback((imageUrl: string) => {
    setViewerImages([imageUrl]);
    setSelectedImage(0);
    setIsImageViewerOpen(true);
  }, []);

  const openPostImageViewer = useCallback(
    (initialIdx: number) => {
      if (!post?.images || post.images.length === 0) return;
      setViewerImages(post.images);
      setSelectedImage(initialIdx);
      setIsImageViewerOpen(true);
    },
    [post]
  );

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

  const isLost = post.type === "LOST";
  const isResolved = post.status === "RESOLVED" || post.status === "CLAIMED";
  const claims = claimsData ?? [];
  const myClaim = post.myClaim || claims.find((c) => c.claimantId === currentUser?.id);
  const claimButtonLabel = isLost ? "I Found This Item" : "This Item Is Mine";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header with Back Button and Overflow Menu (No direct red trash icon) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.iconBtn}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Go back to Lost & Found feed"
        >
          <Feather name="arrow-left" size={22} color={CAMPUS_HUB_COLORS.deepNavy} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {isLost ? "Lost Item Listing" : "Found Item Listing"}
        </Text>

        {canDelete ? (
          <TouchableOpacity
            onPress={() => setIsOverflowOpen(true)}
            style={styles.iconBtn}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Delete listing"
          >
            <Feather
              name="trash-2"
              size={20}
              color={CAMPUS_HUB_COLORS.dangerText}
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Framed 16:9 Carousel with soft backdrop (no dark letterboxing) */}
        {post.images && post.images.length > 0 && (
          <View style={styles.galleryContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => openPostImageViewer(selectedImage)}
              style={styles.mainImageWrapper}
              accessible
              accessibilityRole="imagebutton"
              accessibilityLabel="View photo in fullscreen"
            >
              <Image
                source={{ uri: post.images[selectedImage] }}
                style={styles.mainImage}
                resizeMode="cover"
              />
              <View style={styles.zoomPill}>
                <Feather name="maximize-2" size={11} color="#ffffff" />
                <Text style={styles.zoomPillText}>Tap to enlarge</Text>
              </View>
            </TouchableOpacity>

            {/* Thumbnail selector row if multiple images */}
            {post.images.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailRow}
              >
                {post.images.map((img, idx) => (
                  <TouchableOpacity
                    key={img}
                    onPress={() => setSelectedImage(idx)}
                    style={[
                      styles.thumbBtn,
                      selectedImage === idx && styles.thumbBtnActive,
                    ]}
                  >
                    <Image source={{ uri: img }} style={styles.thumbImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Bento Content Card */}
        <View style={styles.contentCard}>
          {/* Top Status Banner if resolved */}
          {isResolved && (
            <View style={styles.resolvedBannerTop}>
              <Feather name="check-circle" size={16} color="#047857" />
              <Text style={styles.resolvedBannerTopText}>Item Successfully Handed Over</Text>
            </View>
          )}

          {/* Badges Row */}
          <View style={styles.badgeRow}>
            <TypeBadge type={post.type} />
            {post.category && <CategoryBadge category={post.category} />}
            <StatusBadge status={post.status} />
          </View>

          {/* Post Title */}
          <Text style={styles.title}>{post.title}</Text>

          {/* Key Facts Row: Location, Date Lost/Found, Time Ago */}
          <View style={styles.factsRow}>
            <View style={styles.factItem}>
              <Feather name="map-pin" size={12} color={CAMPUS_HUB_COLORS.subtleText} />
              <Text style={styles.factText} numberOfLines={1}>{post.location}</Text>
            </View>
            <Text style={styles.factDot}>•</Text>
            <View style={styles.factItem}>
              <Feather name="calendar" size={12} color={CAMPUS_HUB_COLORS.subtleText} />
              <Text style={styles.factText}>
                {formatDateTime(post.createdAt)}
              </Text>
            </View>
            <Text style={styles.factDot}>•</Text>
            <Text style={styles.factText}>{timeAgo(post.createdAt)}</Text>
          </View>

          <View style={styles.divider} />

          {/* Author Profile Chip */}
          <AvatarChip
            name={post.author?.name ?? "SMUCT Member"}
            image={post.author?.image}
            subtitle={`${post.author?.studentProfile?.department || post.author?.teacherProfile?.department || "Campus Hub"} • Tap for details`}
            onPress={() => setSelectedAuthor(post.author as any)}
          />

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionHeaderLabel}>DESCRIPTION</Text>
          <Text style={styles.description}>{post.description}</Text>

          {/* Verification Question Card */}
          {!!post.verificationQuestion && (
            <View style={styles.verificationNoticeCard}>
              <View style={styles.verificationNoticeHeader}>
                <Feather name="shield" size={14} color="#0284c7" />
                <Text style={styles.verificationNoticeLabel}>
                  {isAuthor ? "YOUR VERIFICATION QUESTION" : "OWNERSHIP VERIFICATION QUESTION"}
                </Text>
              </View>
              <Text style={styles.verificationNoticeQuestion}>
                {post.verificationQuestion}
              </Text>
              {isAuthor && !!post.verificationAnswer && (
                <View style={styles.authorSecretAnswerBox}>
                  <Text style={styles.authorSecretLabel}>EXPECTED ANSWER (PRIVATE TO YOU):</Text>
                  <Text style={styles.authorSecretAnswer}>{post.verificationAnswer}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Possible Matches Section (Server-suggested counterpart items) */}
        {matches && matches.length > 0 && (
          <View style={styles.matchesCard}>
            <View style={styles.matchesHeader}>
              <View style={styles.matchesIconCircle}>
                <Feather name="zap" size={16} color="#d97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.matchesTitle}>Possible Matching Listings</Text>
                <Text style={styles.matchesSubtitle}>
                  Could this be the counterpart {isLost ? "found" : "lost"} on campus?
                </Text>
              </View>
            </View>

            <View style={styles.matchesList}>
              {matches.slice(0, 2).map((match) => (
                <TouchableOpacity
                  key={match.id}
                  style={styles.matchItem}
                  onPress={() => router.push(`/campus-hub/lost-found/${match.id}` as any)}
                  activeOpacity={0.8}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={`View possible match: ${match.title}`}
                >
                  {match.images?.[0] ? (
                    <Image source={{ uri: match.images[0] }} style={styles.matchThumb} />
                  ) : (
                    <View style={styles.matchPlaceholder}>
                      <Feather name="tag" size={16} color={CAMPUS_HUB_COLORS.subtleText} />
                    </View>
                  )}
                  <View style={styles.matchInfo}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <TypeBadge type={match.type} />
                      <Text style={styles.matchTime}>{timeAgo(match.createdAt)}</Text>
                    </View>
                    <Text style={styles.matchTitle} numberOfLines={1}>
                      {match.title}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Feather name="map-pin" size={10} color={CAMPUS_HUB_COLORS.subtleText} />
                      <Text style={styles.matchLoc} numberOfLines={1}>
                        {match.location}
                      </Text>
                    </View>
                  </View>
                  <Feather name="chevron-right" size={16} color={CAMPUS_HUB_COLORS.subtleText} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Handover Ready Banner (Mutual Contact Info for Author or Accepted Claimant) */}
        {isResolved && post.handoverData && (
          <View style={styles.handoverSection}>
            <HandoverCard
              counterpart={post.handoverData.counterpart}
              role={post.handoverData.role}
              onViewProfile={() => setSelectedAuthor(post.handoverData!.counterpart as any)}
            />
          </View>
        )}

        {/* Author Section: Submitted Claims */}
        {isAuthor && (
          <View style={styles.claimsSection}>
            <View style={styles.claimsHeaderRow}>
              <Feather name="inbox" size={18} color={CAMPUS_HUB_COLORS.deepNavy} />
              <Text style={styles.claimsHeaderTitle}>
                Submitted Claims ({claims.length})
              </Text>
            </View>

            {isClaimsLoading ? (
              <View style={styles.claimsCenter}>
                <ActivityIndicator size="small" color={ACCENT} />
              </View>
            ) : claims.length === 0 ? (
              <View style={styles.emptyClaimsCard}>
                <Feather name="inbox" size={32} color={CAMPUS_HUB_COLORS.subtleText} />
                <Text style={styles.emptyClaimsTitle}>No claims received yet</Text>
                <Text style={styles.emptyClaimsSubtitle}>
                  When someone claims this item with proof or answers, they'll appear here for your review.
                </Text>
              </View>
            ) : (
              claims.map((claim) => (
                <ClaimListItem
                  key={claim.id}
                  claim={claim}
                  onAccept={handleOpenAcceptSheet}
                  onReject={handleRejectClaim}
                  onImagePress={openProofImageViewer}
                  onViewClaimant={(cl) => setSelectedAuthor(cl as any)}
                  isAccepting={acceptClaimMutation.isPending && claimToAccept?.id === claim.id}
                  isRejecting={rejectClaimMutation.isPending}
                />
              ))
            )}
          </View>
        )}

        {/* Visitor Section: My Submitted Claim Card */}
        {!isAuthor && myClaim && (
          <View style={styles.myClaimContainer}>
            <Text style={styles.myClaimSectionTitle}>YOUR SUBMITTED CLAIM</Text>
            <View
              style={[
                styles.myClaimCard,
                myClaim.status === "ACCEPTED" && styles.myClaimCardAccepted,
              ]}
            >
              <View style={styles.myClaimTop}>
                <View style={styles.myClaimStatusPill}>
                  <Text style={styles.myClaimStatusText}>STATUS: {myClaim.status}</Text>
                </View>
                <Text style={styles.myClaimTime}>{timeAgo(myClaim.createdAt)}</Text>
              </View>

              {!!myClaim.answer && (
                <View style={styles.myClaimAnswerBox}>
                  <Text style={styles.myClaimAnswerLabel}>YOUR ANSWER:</Text>
                  <Text style={styles.myClaimAnswerText}>{myClaim.answer}</Text>
                </View>
              )}

              <Text style={styles.myClaimMessage}>{myClaim.message}</Text>

              {!!myClaim.proofImage && (
                <TouchableOpacity
                  style={styles.myClaimProofBtn}
                  onPress={() => openProofImageViewer(myClaim.proofImage!)}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="View your attached proof photo"
                >
                  <Image source={{ uri: myClaim.proofImage }} style={styles.myClaimProofImg} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.myClaimProofTitle}>Attached Proof Photo</Text>
                    <Text style={styles.myClaimProofSub}>Tap to view in fullscreen</Text>
                  </View>
                  <Feather name="maximize-2" size={16} color={CAMPUS_HUB_COLORS.subtleText} />
                </TouchableOpacity>
              )}

              {myClaim.status === "PENDING" && !isResolved && (
                <TouchableOpacity
                  style={styles.withdrawBtn}
                  onPress={() => handleWithdrawClaim(myClaim.id)}
                  disabled={withdrawClaimMutation.isPending}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Withdraw claim"
                >
                  {withdrawClaimMutation.isPending ? (
                    <ActivityIndicator size="small" color={CAMPUS_HUB_COLORS.dangerText} />
                  ) : (
                    <>
                      <Feather name="x-circle" size={13} color={CAMPUS_HUB_COLORS.dangerText} />
                      <Text style={styles.withdrawBtnText}>Withdraw Claim</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Docked Claim Button for Visitors who have not claimed yet */}
      {!isAuthor && !myClaim && !isResolved && (
        <View style={[styles.dockedFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={styles.claimCtaBtn}
            onPress={() => {
              if (!currentUser) {
                return Toast.show({ type: "error", text1: "Please log in first" });
              }
              setIsClaimModalOpen(true);
            }}
            activeOpacity={0.85}
            accessible
            accessibilityRole="button"
            accessibilityLabel={claimButtonLabel}
          >
            <Feather
              name={isLost ? "check-square" : "user-check"}
              size={18}
              color="#ffffff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.claimCtaBtnText}>{claimButtonLabel}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modals and Sheets */}
      <OverflowMenuModal
        visible={isOverflowOpen}
        onClose={() => setIsOverflowOpen(false)}
        isAuthor={canDelete}
        onDelete={handleConfirmDelete}
        postTitle={post.title}
        postType={post.type}
        postLocation={post.location}
        postImage={post.images?.[0]}
        isLoading={deleteMutation.isPending}
      />

      <AcceptConfirmationSheet
        visible={isAcceptSheetVisible}
        claim={claimToAccept}
        isLoading={acceptClaimMutation.isPending}
        onConfirm={handleConfirmAcceptClaim}
        onClose={() => {
          setIsAcceptSheetVisible(false);
          setClaimToAccept(null);
        }}
      />

      {post && (
        <ClaimModal
          visible={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          post={post}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      <ImageViewerModal
        visible={isImageViewerOpen}
        images={viewerImages}
        initialIndex={selectedImage}
        onClose={() => setIsImageViewerOpen(false)}
      />

      <AuthorDetailsModal
        visible={Boolean(selectedAuthor)}
        author={selectedAuthor}
        onClose={() => setSelectedAuthor(null)}
      />
    </SafeAreaView>
  );
}

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
    backgroundColor: ACCENT,
  },
  backBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  headerTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
  },

  // Gallery
  galleryContainer: {
    gap: 8,
  },
  mainImageWrapper: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#e2e8f0",
    position: "relative",
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  zoomPill: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  zoomPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  thumbnailRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  thumbBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#e2e8f0",
  },
  thumbBtnActive: {
    borderColor: ACCENT,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },

  // Bento Content Card
  contentCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  resolvedBannerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  resolvedBannerTopText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: "#047857",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    lineHeight: 26,
    marginBottom: 8,
  },
  factsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  factItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  factText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  factDot: {
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  divider: {
    height: 1,
    backgroundColor: CAMPUS_HUB_COLORS.subtleBorder,
    marginVertical: 12,
  },
  sectionHeaderLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  description: {
    fontFamily,
    fontSize: 14,
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 22,
    marginBottom: 10,
  },

  // Verification Question
  verificationNoticeCard: {
    backgroundColor: "#f0f9ff",
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#bae6fd",
    gap: 6,
  },
  verificationNoticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verificationNoticeLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#0284c7",
    letterSpacing: 0.5,
  },
  verificationNoticeQuestion: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 18,
  },
  authorSecretAnswerBox: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#e0f2fe",
  },
  authorSecretLabel: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: "#64748b",
    marginBottom: 2,
  },
  authorSecretAnswer: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0369a1",
  },

  // Possible Matches Section
  matchesCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  matchesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  matchesIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },
  matchesTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  matchesSubtitle: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  matchesList: {
    gap: 8,
  },
  matchItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderRadius: 14,
    padding: 10,
    gap: 10,
  },
  matchThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
  },
  matchPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  matchInfo: {
    flex: 1,
    gap: 2,
  },
  matchTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  matchLoc: {
    fontFamily,
    fontSize: 10,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  matchTime: {
    fontFamily,
    fontSize: 10,
    color: CAMPUS_HUB_COLORS.subtleText,
  },

  // Handover Section
  handoverSection: {
    marginTop: 4,
  },

  // Claims
  claimsSection: {
    marginTop: 6,
  },
  claimsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  claimsHeaderTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  claimsCenter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyClaimsCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  emptyClaimsTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  emptyClaimsSubtitle: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 17,
  },

  // My Claim
  myClaimContainer: {
    marginTop: 4,
  },
  myClaimSectionTitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  myClaimCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
    gap: 10,
  },
  myClaimCardAccepted: {
    borderColor: "#10b981",
    backgroundColor: "#f0fdf4",
  },
  myClaimTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  myClaimStatusPill: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  myClaimStatusText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#b45309",
  },
  myClaimTime: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  myClaimAnswerBox: {
    backgroundColor: "#f0f9ff",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#bae6fd",
    gap: 2,
  },
  myClaimAnswerLabel: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: "#0284c7",
  },
  myClaimAnswerText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  myClaimMessage: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 18,
  },
  myClaimProofBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  myClaimProofImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#0f172a",
  },
  myClaimProofTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  myClaimProofSub: {
    fontFamily,
    fontSize: 10,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  withdrawBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    marginTop: 4,
  },
  withdrawBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.dangerText,
  },

  // Docked CTA
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
    backgroundColor: ACCENT,
    height: 50,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  claimCtaBtnText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
});
