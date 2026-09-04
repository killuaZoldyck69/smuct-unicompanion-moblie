import React, { useState, useCallback, useEffect, useRef } from "react";
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
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useLostFoundPost,
  useDeleteLostFoundPost,
  useMarkLostFoundClaimed,
  useAddLostFoundComment,
  useDeleteLostFoundComment,
} from "@/features/campus-hub/useLostFound";
import { CAMPUS_HUB_COLORS, fontFamily, timeAgo } from "@/screens/campus-hub/shared/design-tokens";
import { AvatarChip } from "@/screens/campus-hub/shared/avatar-chip";
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
import { setCampusHubActiveSection } from "@/screens/campus-hub";
import type { LostFoundComment } from "@/services/lost-found-service";

const ACCENT = CAMPUS_HUB_COLORS.lostFoundAccent;

const CATEGORY_LABELS: Record<string, string> = {
  BOOKS: "Books",
  ELECTRONICS: "Electronics",
  ID_CARD: "ID Card",
  KEYS: "Keys",
  CLOTHING: "Clothing",
  OTHER: "Other",
};

export default function LostFoundDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useCurrentUser();

  const [selectedImage, setSelectedImage] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorProfileModalData | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const { data: post, isLoading, isError } = useLostFoundPost(id);
  const deleteMutation = useDeleteLostFoundPost();
  const claimMutation = useMarkLostFoundClaimed();
  const addCommentMutation = useAddLostFoundComment(id);
  const deleteCommentMutation = useDeleteLostFoundComment(id);

  const isAuthor = currentUser?.id === post?.authorId;

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
      if (replyTarget) {
        setReplyTarget(null);
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
  }, [isImageViewerOpen, selectedAuthor, replyTarget, handleBack]);

  const handleDelete = useCallback(() => {
    Alert.alert("Delete Post", "Permanently remove this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteMutation.mutate(id, {
            onSuccess: () => {
              Toast.show({ type: "info", text1: "Post deleted" });
              handleBack();
            },
            onError: () =>
              Toast.show({ type: "error", text1: "Failed to delete post" }),
          }),
      },
    ]);
  }, [id, deleteMutation, handleBack]);

  const handleClaim = useCallback(() => {
    Alert.alert("Mark as Claimed", "Mark this item as claimed/resolved?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: () =>
          claimMutation.mutate(id, {
            onSuccess: () =>
              Toast.show({ type: "success", text1: "Marked as Claimed" }),
            onError: () =>
              Toast.show({ type: "error", text1: "Failed to update status" }),
          }),
      },
    ]);
  }, [id, claimMutation]);

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
  const comments = (post.comments ?? []) as LostFoundComment[];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.iconBtn}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={22} color={CAMPUS_HUB_COLORS.deepNavy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isLost ? "Lost Item" : "Found Item"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: 48 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {post.images?.length > 0 && (
            <View style={styles.imageGallery}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setIsImageViewerOpen(true)}
                style={styles.mainImageTouchable}
              >
                <Image
                  source={{ uri: post.images[selectedImage] }}
                  style={styles.mainImage}
                  resizeMode="contain"
                />
                <View style={styles.zoomBadge}>
                  <Feather name="maximize-2" size={12} color="#ffffff" />
                  <Text style={styles.zoomBadgeText}>Tap to enlarge</Text>
                </View>
              </TouchableOpacity>

              {post.images.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailRow}>
                  {post.images.map((img, idx) => (
                    <TouchableOpacity key={img} onPress={() => setSelectedImage(idx)}>
                      <Image
                        source={{ uri: img }}
                        style={[styles.thumbnail, selectedImage === idx && styles.thumbnailActive]}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          <View style={styles.contentCard}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor: isLost
                      ? CAMPUS_HUB_COLORS.dangerBg
                      : CAMPUS_HUB_COLORS.marketplaceAccentLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.typeBadgeText,
                    {
                      color: isLost
                        ? CAMPUS_HUB_COLORS.dangerText
                        : CAMPUS_HUB_COLORS.marketplaceAccentText,
                    },
                  ]}
                >
                  {isLost ? "LOST" : "FOUND"}
                </Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {CATEGORY_LABELS[post.category] ?? post.category}
                </Text>
              </View>
              {post.status === "CLAIMED" && (
                <View style={[styles.typeBadge, { backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight }]}>
                  <Text style={[styles.typeBadgeText, { color: CAMPUS_HUB_COLORS.marketplaceAccentText }]}>
                    CLAIMED
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.title}>{post.title}</Text>

            <View style={styles.locationRow}>
              <Feather name="map-pin" size={13} color={CAMPUS_HUB_COLORS.subtleText} />
              <Text style={styles.locationText}>{post.location}</Text>
            </View>

            <View style={styles.divider} />

            <AvatarChip
              name={post.author?.name ?? ""}
              image={post.author?.image}
              subtitle={`${timeAgo(post.createdAt)} • View Profile`}
              onPress={() => setSelectedAuthor(post.author as any)}
            />

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>DETAILS</Text>
            <Text style={styles.description}>{post.description}</Text>

            {isAuthor && post.status === "ACTIVE" && (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight }]}
                  onPress={handleClaim}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Mark as claimed"
                >
                  <Feather name="check-circle" size={14} color={CAMPUS_HUB_COLORS.marketplaceAccentText} />
                  <Text style={[styles.actionBtnText, { color: CAMPUS_HUB_COLORS.marketplaceAccentText }]}>
                    Mark Claimed
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: CAMPUS_HUB_COLORS.dangerBg }]}
                  onPress={handleDelete}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Delete post"
                >
                  <Feather name="trash-2" size={14} color={CAMPUS_HUB_COLORS.dangerText} />
                  <Text style={[styles.actionBtnText, { color: CAMPUS_HUB_COLORS.dangerText }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Inline Comments & Replies Section directly under post details */}
          <InlineComments
            comments={comments as any}
            currentUserId={currentUser?.id}
            accent={ACCENT}
            onStartReply={handleStartReply}
            onDeleteComment={handleDeleteComment}
            onViewAuthorProfile={(author) => setSelectedAuthor(author as any)}
          />
        </ScrollView>

        {/* Sticky Comment Composer at Bottom */}
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
      </KeyboardAvoidingView>

      {/* Author Details Modal */}
      <AuthorDetailsModal
        visible={!!selectedAuthor}
        onClose={() => setSelectedAuthor(null)}
        author={selectedAuthor}
      />

      {/* Fullscreen Image Viewer Modal */}
      <ImageViewerModal
        visible={isImageViewerOpen}
        images={post.images}
        initialIndex={selectedImage}
        onClose={() => setIsImageViewerOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  headerTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingBottom: 80,
  },
  imageGallery: {
    backgroundColor: "#0f172a",
  },
  mainImageTouchable: {
    position: "relative",
    width: "100%",
    height: 300,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  zoomBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  zoomBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  thumbnailRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#1e293b",
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 8,
    opacity: 0.6,
  },
  thumbnailActive: {
    opacity: 1,
    borderWidth: 2,
    borderColor: ACCENT,
  },
  contentCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    margin: 16,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 20,
    gap: 12,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  typeBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  categoryBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  categoryBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  title: {
    fontFamily,
    fontSize: 22,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    lineHeight: 28,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  divider: {
    height: 1,
    backgroundColor: CAMPUS_HUB_COLORS.subtleBorder,
    marginVertical: 4,
  },
  sectionLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.4,
  },
  description: {
    fontFamily,
    fontSize: 14,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 21,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
  },
  errorText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  backBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.deepNavy,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  backBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
