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
  Linking,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
import { CAMPUS_HUB_COLORS, fontFamily, timeAgo } from "@/screens/campus-hub/shared/design-tokens";
import { AvatarChip } from "@/screens/campus-hub/shared/avatar-chip";
import { CommentSheet } from "@/screens/campus-hub/shared/comment-sheet";
import type { MarketplaceComment } from "@/services/marketplace-service";

const ACCENT = CAMPUS_HUB_COLORS.marketplaceAccent;

const CONDITION_LABELS: Record<string, string> = {
  NEW: "Brand New",
  LIKE_NEW: "Like New",
  GOOD: "Good Condition",
  FAIR: "Fair Condition",
};

const CATEGORY_LABELS: Record<string, string> = {
  TEXTBOOKS: "Textbooks",
  ELECTRONICS: "Electronics",
  STATIONERY: "Stationery",
  CLOTHING: "Clothing",
  OTHER: "Other",
};

export default function MarketplaceDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useCurrentUser();

  const [selectedImage, setSelectedImage] = useState(0);
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);

  const { data: post, isLoading, isError } = useMarketplacePost(id);
  const deleteMutation = useDeleteMarketplacePost();
  const soldMutation = useMarkMarketplaceSold();
  const addCommentMutation = useAddMarketplaceComment(id);
  const deleteCommentMutation = useDeleteMarketplaceComment(id);

  const isAuthor = currentUser?.id === post?.authorId;

  const handleDelete = useCallback(() => {
    Alert.alert("Delete Listing", "Permanently remove this listing?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteMutation.mutate(id, {
            onSuccess: () => {
              Toast.show({ type: "info", text1: "Listing deleted" });
              router.back();
            },
            onError: () =>
              Toast.show({ type: "error", text1: "Failed to delete" }),
          }),
      },
    ]);
  }, [id, deleteMutation, router]);

  const handleMarkSold = useCallback(() => {
    Alert.alert("Mark as Sold", "Mark this item as sold?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: () =>
          soldMutation.mutate(id, {
            onSuccess: () =>
              Toast.show({ type: "success", text1: "Marked as Sold!" }),
            onError: () =>
              Toast.show({ type: "error", text1: "Failed to update" }),
          }),
      },
    ]);
  }, [id, soldMutation]);

  const handleContact = useCallback(() => {
    if (!post?.contactPhone) return;
    const phone = post.contactPhone.replace(/\s+/g, "");
    Linking.openURL(`tel:${phone}`).catch(() =>
      Toast.show({ type: "error", text1: "Cannot open dialer" })
    );
  }, [post]);

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
        <Text style={styles.errorText}>Listing not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isSelling = post.type === "SELLING";
  const isSold = post.status === "SOLD";
  const comments = (post.comments ?? []) as MarketplaceComment[];

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
          {isSelling ? "For Sale" : "Wanted"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {post.images?.length > 0 ? (
          <View style={styles.imageGallery}>
            <Image source={{ uri: post.images[selectedImage] }} style={styles.mainImage} />
            {isSold && (
              <View style={styles.soldOverlay}>
                <Text style={styles.soldOverlayText}>SOLD</Text>
              </View>
            )}
            {post.images.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.thumbnailRow}
              >
                {post.images.map((img, idx) => (
                  <TouchableOpacity key={img} onPress={() => setSelectedImage(idx)}>
                    <Image
                      source={{ uri: img }}
                      style={[
                        styles.thumbnail,
                        selectedImage === idx && styles.thumbnailActive,
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        ) : null}

        <View style={styles.contentCard}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor: isSelling
                    ? CAMPUS_HUB_COLORS.marketplaceAccentLight
                    : CAMPUS_HUB_COLORS.lostFoundAccentLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.typeBadgeText,
                  {
                    color: isSelling
                      ? CAMPUS_HUB_COLORS.marketplaceAccentText
                      : CAMPUS_HUB_COLORS.lostFoundAccentText,
                  },
                ]}
              >
                {isSelling ? "SELLING" : "WANTED"}
              </Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {CATEGORY_LABELS[post.category] ?? post.category}
              </Text>
            </View>
            {post.condition && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {CONDITION_LABELS[post.condition] ?? post.condition}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{post.title}</Text>

          {post.price != null && (
            <Text style={styles.price}>৳{post.price.toLocaleString()}</Text>
          )}

          <View style={styles.divider} />

          <AvatarChip
            name={post.author?.name ?? ""}
            image={post.author?.image}
            subtitle={`Posted ${timeAgo(post.createdAt)}`}
          />

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>DESCRIPTION</Text>
          <Text style={styles.description}>{post.description}</Text>

          {isAuthor && !isSold && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight }]}
                onPress={handleMarkSold}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Mark as sold"
              >
                <Feather name="check-circle" size={14} color={CAMPUS_HUB_COLORS.marketplaceAccentText} />
                <Text style={[styles.actionBtnText, { color: CAMPUS_HUB_COLORS.marketplaceAccentText }]}>
                  Mark Sold
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: CAMPUS_HUB_COLORS.dangerBg }]}
                onPress={handleDelete}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Delete listing"
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
          accessibilityLabel={`${comments.length} comments`}
        >
          <Feather name="message-circle" size={18} color={CAMPUS_HUB_COLORS.subtleText} />
          <Text style={styles.commentBarLabel}>{comments.length} Comments</Text>
        </TouchableOpacity>

        {post.contactPhone && !isAuthor && (
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={handleContact}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Call seller"
          >
            <Feather name="phone" size={16} color="#ffffff" />
            <Text style={styles.contactBtnText}>Contact</Text>
          </TouchableOpacity>
        )}
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
  scroll: {},
  imageGallery: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
  },
  mainImage: {
    width: "100%",
    height: 280,
    resizeMode: "cover",
  },
  soldOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  soldOverlayText: {
    fontFamily,
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 2,
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
  price: {
    fontFamily,
    fontSize: 22,
    fontWeight: "800",
    color: ACCENT,
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
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
    flexDirection: "row",
    gap: 10,
  },
  commentBarBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  commentBarLabel: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
    backgroundColor: ACCENT,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  contactBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
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
