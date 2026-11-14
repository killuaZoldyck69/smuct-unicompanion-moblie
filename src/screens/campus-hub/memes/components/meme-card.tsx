import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import type { Meme, MemeAuthor } from "@/services/meme-service";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  formatMemePosterSubtitle,
  timeAgo,
} from "../../shared/design-tokens";

interface MemeCardProps {
  meme: Meme;
  currentUserId?: string;
  userRole?: string;
  onReact: (memeId: string, type: "LIKE" | "DISLIKE") => void;
  onOptions: (meme: Meme) => void;
  onDeleteDirect?: (memeId: string) => void;
  onPreviewImage: (imageUrl: string, caption?: string | null, authorName?: string) => void;
  onViewProfile?: (author: MemeAuthor) => void;
}

export const MemeCard = React.memo(function MemeCard({
  meme,
  currentUserId,
  userRole,
  onReact,
  onOptions,
  onDeleteDirect,
  onPreviewImage,
  onViewProfile,
}: MemeCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [meme.imageUrl]);

  useEffect(() => {
    setAvatarError(false);
  }, [meme.author?.image]);

  const isAuthor = currentUserId === meme.authorId;
  const isAdmin = userRole === "ADMIN";
  const isLiked = meme.userReaction === "LIKE";
  const isDisliked = meme.userReaction === "DISLIKE";
  const authorName = meme.author?.name || "Campus Peer";
  const authorInitials = authorName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const posterSubtitle = formatMemePosterSubtitle(meme.author);
  const isEdited =
    Boolean(meme.updatedAt && meme.createdAt) &&
    new Date(meme.updatedAt).getTime() - new Date(meme.createdAt).getTime() > 1000;

  const handleLike = useCallback(() => onReact(meme.id, "LIKE"), [meme.id, onReact]);
  const handleDislike = useCallback(() => onReact(meme.id, "DISLIKE"), [meme.id, onReact]);
  const handleProfilePress = useCallback(() => {
    if (onViewProfile && meme.author) onViewProfile(meme.author);
  }, [onViewProfile, meme.author]);

  const showAvatarImage = Boolean(meme.author?.image) && !avatarError;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.authorRow}
          onPress={handleProfilePress}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`View profile of ${authorName}`}
        >
          {showAvatarImage ? (
            <Image
              source={{ uri: meme.author.image! }}
              style={styles.avatar}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
              onError={() => setAvatarError(true)}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{authorInitials || "U"}</Text>
            </View>
          )}

          <View style={styles.authorMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.authorName} numberOfLines={1}>
                {authorName}
              </Text>
              {meme.author?.role === "ADMIN" && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>Admin</Text>
                </View>
              )}
            </View>
            <View style={styles.subMetaRow}>
              {posterSubtitle.isStudentWithSemester ? (
                <Text style={styles.authorSubText} numberOfLines={1}>
                  {posterSubtitle.semesterNum}
                  <Text style={styles.superscript}>{posterSubtitle.superSuffix}</Text>
                  {posterSubtitle.deptShort ? ` • ${posterSubtitle.deptShort}` : ""}
                </Text>
              ) : (
                <Text style={styles.authorSubText} numberOfLines={1}>
                  {posterSubtitle.text}
                </Text>
              )}
              {isEdited && (
                <>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={styles.editedText}>Edited</Text>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          {isAdmin && !isAuthor && (
            <TouchableOpacity
              style={styles.adminDeleteBtn}
              onPress={() => (onDeleteDirect ? onDeleteDirect(meme.id) : onOptions(meme))}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Delete meme by ${authorName}`}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
            >
              <Feather name="trash-2" size={13} color={colors.semantic.red.accent} />
              <Text style={styles.adminDeleteBtnText}>Delete</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.moreBtn}
            onPress={() => onOptions(meme)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              isAuthor ? "Meme options" : `More options for meme by ${authorName}`
            }
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="more-vertical" size={18} color={CAMPUS_HUB_COLORS.subtleText} />
          </TouchableOpacity>
        </View>
      </View>

      {meme.caption ? <Text style={styles.captionText}>{meme.caption}</Text> : null}

      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => onPreviewImage(meme.imageUrl, meme.caption, authorName)}
        activeOpacity={0.92}
        accessible={true}
        accessibilityRole="imagebutton"
        accessibilityLabel="View full size meme image"
      >
        {imageLoading && !imageError && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={CAMPUS_HUB_COLORS.memeAccent} />
          </View>
        )}
        {!imageError ? (
          <Image
            source={{ uri: meme.imageUrl }}
            style={styles.memeImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
            recyclingKey={meme.id}
            onLoadStart={() => setImageLoading(true)}
            onLoad={() => setImageLoading(false)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        ) : (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={28} color={colors.slate400} />
            <Text style={styles.errorText}>Could not load image</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <View style={styles.reactionGroup}>
          <TouchableOpacity
            style={[styles.reactionPill, isLiked && styles.reactionPillLiked]}
            onPress={handleLike}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityState={{ selected: isLiked }}
            accessibilityLabel={`Like meme. Current count: ${meme.likesCount}`}
            activeOpacity={0.75}
          >
            <Feather
              name="thumbs-up"
              size={15}
              color={isLiked ? CAMPUS_HUB_COLORS.memeAccent : CAMPUS_HUB_COLORS.subtleText}
            />
            <Text style={[styles.reactionCount, isLiked && styles.reactionCountLiked]}>
              {meme.likesCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.reactionPill, isDisliked && styles.reactionPillDisliked]}
            onPress={handleDislike}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityState={{ selected: isDisliked }}
            accessibilityLabel={`Dislike meme. Current count: ${meme.dislikesCount}`}
            activeOpacity={0.75}
          >
            <Feather
              name="thumbs-down"
              size={15}
              color={isDisliked ? colors.semantic.rose.solid : CAMPUS_HUB_COLORS.subtleText}
            />
            <Text style={[styles.reactionCount, isDisliked && styles.reactionCountDisliked]}>
              {meme.dislikesCount}
            </Text>
          </TouchableOpacity>
        </View>

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
    marginBottom: 12,
    ...CAMPUS_HUB_COLORS.shadow,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8 },
  authorRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: CAMPUS_HUB_COLORS.memeAccentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { fontFamily, fontSize: 13, fontWeight: "800", color: CAMPUS_HUB_COLORS.memeAccentText },
  authorMeta: { marginLeft: 10, flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  authorName: { fontFamily, fontSize: 14, fontWeight: "700", color: CAMPUS_HUB_COLORS.deepNavy },
  adminBadge: { backgroundColor: CAMPUS_HUB_COLORS.complaintAccentLight, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  adminBadgeText: { fontFamily, fontSize: 10, fontWeight: "800", color: colors.semantic.violet.deep },
  subMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  authorSubText: { fontFamily, fontSize: 11, color: CAMPUS_HUB_COLORS.subtleText, fontWeight: "500", flexShrink: 1 },
  superscript: { fontFamily, fontSize: 9, lineHeight: 12, fontWeight: "700", color: CAMPUS_HUB_COLORS.subtleText },
  dotSeparator: { marginHorizontal: 5, fontSize: 11, color: CAMPUS_HUB_COLORS.subtleText },
  timeText: { fontFamily, fontSize: 11, color: CAMPUS_HUB_COLORS.subtleText, fontVariant: ["tabular-nums"] },
  moreBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.slate50, alignItems: "center", justifyContent: "center" },
  adminDeleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.semantic.red.softBorder,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.semantic.red.border,
    gap: 4,
  },
  adminDeleteBtnText: { fontFamily, fontSize: 11, fontWeight: "700", color: colors.semantic.red.accent },
  editedText: { fontFamily, fontSize: 10, fontWeight: "600", color: colors.semantic.amber.deep },
  captionText: { fontFamily, fontSize: 14, fontWeight: "600", color: CAMPUS_HUB_COLORS.neutralText, lineHeight: 20, marginBottom: 12 },
  imageContainer: {
    width: "100%",
    height: 280,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    position: "relative",
  },
  loadingBox: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center", backgroundColor: colors.slate50 },
  memeImage: { width: "100%", height: "100%" },
  errorBox: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center", gap: 6 },
  errorText: { fontFamily, fontSize: 12, color: colors.slate400 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  reactionGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  reactionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  reactionPillLiked: { backgroundColor: CAMPUS_HUB_COLORS.memeAccentLight, borderColor: CAMPUS_HUB_COLORS.memeAccentBorderLiked },
  reactionPillDisliked: { backgroundColor: colors.semantic.rose.tint, borderColor: CAMPUS_HUB_COLORS.memeDislikeBorder },
  reactionCount: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.mutedInk,
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  reactionCountLiked: { color: CAMPUS_HUB_COLORS.memeAccentText },
  reactionCountDisliked: { color: colors.semantic.rose.deep },
  timelineRow: { flexDirection: "row", alignItems: "center", gap: 4.5, paddingHorizontal: 4, paddingVertical: 4 },
});
