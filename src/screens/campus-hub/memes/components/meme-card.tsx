import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CAMPUS_HUB_COLORS, fontFamily, timeAgo } from "../../shared/design-tokens";
import type { Meme } from "@/services/meme-service";

interface MemeCardProps {
  meme: Meme;
  currentUserId?: string;
  userRole?: string;
  onReact: (memeId: string, type: "LIKE" | "DISLIKE") => void;
  onOptions: (meme: Meme) => void;
  onPreviewImage: (imageUrl: string, caption?: string | null, authorName?: string) => void;
  onViewProfile?: (author: any) => void;
  isReacting?: boolean;
}

export const MemeCard = React.memo(function MemeCard({
  meme,
  currentUserId,
  userRole,
  onReact,
  onOptions,
  onPreviewImage,
  onViewProfile,
  isReacting,
}: MemeCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const isAuthor = currentUserId === meme.authorId;
  const isAdmin = userRole === "ADMIN";
  const canManage = isAuthor || isAdmin;

  const isLiked = meme.userReaction === "LIKE";
  const isDisliked = meme.userReaction === "DISLIKE";

  const authorName = meme.author?.name || "Campus Peer";
  const authorInitials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const authorSubtitle =
    meme.author?.studentProfile?.department ||
    meme.author?.teacherProfile?.department ||
    (meme.author?.role === "ADMIN" ? "Staff" : "Student");

  const isEdited =
    Boolean(meme.updatedAt && meme.createdAt) &&
    new Date(meme.updatedAt).getTime() - new Date(meme.createdAt).getTime() > 1000;

  const handleLike = useCallback(() => {
    onReact(meme.id, "LIKE");
  }, [meme.id, onReact]);

  const handleDislike = useCallback(() => {
    onReact(meme.id, "DISLIKE");
  }, [meme.id, onReact]);

  const handleProfilePress = useCallback(() => {
    if (onViewProfile && meme.author) {
      onViewProfile(meme.author);
    }
  }, [onViewProfile, meme.author]);

  return (
    <View style={styles.card}>
      {/* 1. Header: Author Info (Clickable for Profile Modal) & Delete Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.authorRow}
          onPress={handleProfilePress}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`View profile of ${authorName}`}
        >
          {meme.author?.image ? (
            <Image
              source={{ uri: meme.author.image }}
              style={styles.avatar}
              fadeDuration={200}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{authorInitials}</Text>
            </View>
          )}

          <View style={styles.authorMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.authorName} numberOfLines={1}>
                {authorName}
              </Text>
              {meme.author?.role === "ADMIN" && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>Staff</Text>
                </View>
              )}
            </View>
            <View style={styles.subMetaRow}>
              <Text style={styles.authorSubText}>{authorSubtitle}</Text>
              {isEdited && (
                <>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={styles.editedText}>Edited</Text>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {canManage && (
          <TouchableOpacity
            style={styles.moreBtn}
            onPress={() => onOptions(meme)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Meme options"
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="more-vertical" size={18} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Caption (Optional) */}
      {meme.caption ? (
        <Text style={styles.captionText}>{meme.caption}</Text>
      ) : null}

      {/* 3. Meme Image */}
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => onPreviewImage(meme.imageUrl, meme.caption, authorName)}
        activeOpacity={0.92}
        accessible={true}
        accessibilityRole="imagebutton"
        accessibilityLabel="View full size meme image"
      >
        {imageLoading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={CAMPUS_HUB_COLORS.memeAccent} />
          </View>
        )}
        <Image
          source={{ uri: meme.imageUrl }}
          style={[styles.memeImage, imageError && { display: "none" }]}
          resizeMode="cover"
          fadeDuration={250}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
        />
        {imageError && (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={28} color="#94a3b8" />
            <Text style={styles.errorText}>Could not load image</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* 4. Footer Actions (Like, Dislike, Share) */}
      <View style={styles.footer}>
        <View style={styles.reactionGroup}>
          {/* Like Button */}
          <TouchableOpacity
            style={[
              styles.reactionPill,
              isLiked && styles.reactionPillLiked,
            ]}
            onPress={handleLike}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Like meme. Current count: ${meme.likesCount}`}
            activeOpacity={0.75}
          >
            <Feather
              name="thumbs-up"
              size={15}
              color={isLiked ? CAMPUS_HUB_COLORS.memeAccent : "#64748b"}
            />
            <Text
              style={[
                styles.reactionCount,
                isLiked && styles.reactionCountLiked,
              ]}
            >
              {meme.likesCount}
            </Text>
          </TouchableOpacity>

          {/* Dislike Button */}
          <TouchableOpacity
            style={[
              styles.reactionPill,
              isDisliked && styles.reactionPillDisliked,
            ]}
            onPress={handleDislike}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Dislike meme. Current count: ${meme.dislikesCount}`}
            activeOpacity={0.75}
          >
            <Feather
              name="thumbs-down"
              size={15}
              color={isDisliked ? "#e11d48" : "#64748b"}
            />
            <Text
              style={[
                styles.reactionCount,
                isDisliked && styles.reactionCountDisliked,
              ]}
            >
              {meme.dislikesCount}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Posted Timeline */}
        <View style={styles.timelineRow}>
          <Feather name="clock" size={12} color={CAMPUS_HUB_COLORS.subtleText} />
          <Text style={styles.timeText}>{timeAgo(meme.createdAt)}</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 16,
    marginBottom: 14,
    ...CAMPUS_HUB_COLORS.shadow,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.04)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#e2e8f0",
  },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: CAMPUS_HUB_COLORS.memeAccentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.memeAccentText,
  },
  authorMeta: {
    marginLeft: 10,
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  authorName: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  adminBadge: {
    backgroundColor: "#ede9fe",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  adminBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#6d28d9",
  },
  subMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  authorSubText: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
    fontWeight: "500",
  },
  dotSeparator: {
    marginHorizontal: 5,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  timeText: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  moreBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  editedText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "600",
    color: "#b45309",
  },
  captionText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 20,
    marginBottom: 12,
  },
  imageContainer: {
    width: "100%",
    height: 280,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
    position: "relative",
  },
  loadingBox: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  memeImage: {
    width: "100%",
    height: "100%",
  },
  errorBox: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  errorText: {
    fontFamily,
    fontSize: 12,
    color: "#94a3b8",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(19, 27, 46, 0.04)",
  },
  reactionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reactionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  reactionPillLiked: {
    backgroundColor: CAMPUS_HUB_COLORS.memeAccentLight,
    borderColor: "rgba(236, 72, 153, 0.3)",
  },
  reactionPillDisliked: {
    backgroundColor: "#fff1f2",
    borderColor: "rgba(225, 29, 72, 0.3)",
  },
  reactionCount: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  reactionCountLiked: {
    color: CAMPUS_HUB_COLORS.memeAccentText,
  },
  reactionCountDisliked: {
    color: "#be123c",
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4.5,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});
