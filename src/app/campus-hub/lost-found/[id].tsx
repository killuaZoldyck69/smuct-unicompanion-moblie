import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
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
import { CommentSheet } from "@/screens/campus-hub/shared/comment-sheet";
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
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);

  const { data: post, isLoading, isError } = useLostFoundPost(id);
  const deleteMutation = useDeleteLostFoundPost();
  const claimMutation = useMarkLostFoundClaimed();
  const addCommentMutation = useAddLostFoundComment(id);
  const deleteCommentMutation = useDeleteLostFoundComment(id);

  const isAuthor = currentUser?.id === post?.authorId;

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
              router.back();
            },
            onError: () =>
              Toast.show({ type: "error", text1: "Failed to delete post" }),
          }),
      },
    ]);
  }, [id, deleteMutation, router]);

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
    (content: string) => {
      addCommentMutation.mutate(content, {
        onError: () =>
          Toast.show({ type: "error", text1: "Failed to post comment" }),
      });
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isLost = post.type === "LOST";
  const comments = (post.comments ?? []) as LostFoundComment[];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
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
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {post.images?.length > 0 && (
          <View style={styles.imageGallery}>
            <Image source={{ uri: post.images[selectedImage] }} style={styles.mainImage} />
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
            subtitle={timeAgo(post.createdAt)}
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
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <TouchableOpacity
          style={styles.commentBarBtn}
          onPress={() => setIsCommentSheetOpen(true)}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`View ${comments.length} comments`}
        >
          <Feather name="message-circle" size={18} color={ACCENT} />
          <Text style={[styles.commentBarText, { color: ACCENT }]}>
            {comments.length} Comment{comments.length !== 1 ? "s" : ""}
          </Text>
        </TouchableOpacity>
      </View>

      <CommentSheet
        visible={isCommentSheetOpen}
        onClose={() => setIsCommentSheetOpen(false)}
        comments={comments}
        currentUserId={currentUser?.id}
        accent={ACCENT}
        isSubmitting={addCommentMutation.isPending}
        onSubmit={handleAddComment}
        onDelete={handleDeleteComment}
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
    backgroundColor: CAMPUS_HUB_COLORS.white,
  },
  mainImage: {
    width: "100%",
    height: 260,
    resizeMode: "cover",
  },
  thumbnailRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  bottomBar: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  commentBarBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: "#fef3c7",
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  commentBarText: {
    fontFamily,
    fontSize: 14,
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
