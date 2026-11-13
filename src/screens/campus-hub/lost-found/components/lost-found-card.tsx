import React, { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import type { LostFoundPost } from "@/services/lost-found-service";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  timeAgo,
  titleFontFamily,
} from "../../shared/design-tokens";
import {
  CATEGORY_LABELS,
  CategoryBadge,
  LocationBadge,
  StatusBadge,
  TypeBadge,
} from "./status-badge";

interface LostFoundCardProps {
  post: LostFoundPost;
  onPress: () => void;
  currentUserId?: string;
  isAdmin?: boolean;
  onDelete?: (post: LostFoundPost) => void;
}

export const LostFoundCard = React.memo(function LostFoundCard({
  post,
  onPress,
  currentUserId,
  isAdmin = false,
  onDelete,
}: LostFoundCardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const thumbSize = windowWidth < 380 ? 72 : 84;
  const isOwner = currentUserId === post.authorId;
  const isResolved = post.status === "RESOLVED" || post.status === "CLAIMED";
  const isInactive = isResolved || post.status === "CLOSED";
  const claimCount = post._count?.claims ?? 0;
  const imageUri = post.images?.[0];
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [imageUri]);

  const hasImage = Boolean(imageUri && !imgError);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isInactive && styles.cardResolved,
        pressed && { opacity: 0.92 },
      ]}
      onPress={onPress}
      android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${post.type === "LOST" ? "Lost" : "Found"} item (${post.status.toLowerCase()}): ${post.title}.${post.category ? ` Category: ${CATEGORY_LABELS[post.category] || post.category}.` : ""}${post.location ? ` Location: ${post.location}.` : ""}`}
    >
      <View style={styles.cardLeft}>
        <View style={styles.cardTopRow}>
          <View style={styles.badgeGroup}>
            <TypeBadge type={post.type} />
            {post.category && <CategoryBadge category={post.category} />}
            {isInactive && <StatusBadge status={post.status} />}
          </View>
        </View>

        <Text
          style={[styles.cardTitle, isInactive && styles.cardTitleResolved]}
          numberOfLines={2}
        >
          {post.title}
        </Text>

        {!!post.description?.trim() && (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {post.description}
          </Text>
        )}

        {!!post.location && (
          <View style={styles.cardFooter}>
            <LocationBadge location={post.location} />
          </View>
        )}

        {isOwner && claimCount > 0 && !isInactive && (
          <View style={styles.claimBadge}>
            <Feather
              name="inbox"
              size={11}
              color={CAMPUS_HUB_COLORS.skyAccentInk}
            />
            <Text style={styles.claimBadgeText} maxFontSizeMultiplier={1.25}>
              {claimCount}{" "}
              {claimCount === 1 ? "claim received" : "claims received"}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.cardRightCol, { width: thumbSize }]}>
        <View
          style={[
            styles.thumbWrapper,
            { width: thumbSize, height: thumbSize },
          ]}
        >
          {hasImage ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.cardThumb}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
              onError={() => setImgError(true)}
            />
          ) : (
            <View style={styles.thumbPlaceholder}>
              <Feather
                name={post.type === "LOST" ? "search" : "gift"}
                size={22}
                color={CAMPUS_HUB_COLORS.subtleText}
              />
            </View>
          )}
        </View>

        <View style={styles.imageTimeRow}>
          <Feather
            name="clock"
            size={10}
            color={CAMPUS_HUB_COLORS.mutedInk}
          />
          <Text
            style={styles.imageTimeText}
            numberOfLines={1}
            maxFontSizeMultiplier={1.25}
          >
            {timeAgo(post.createdAt)}
          </Text>
        </View>

        {isAdmin && (
          <Pressable
            style={({ pressed }) => [
              styles.adminDeleteBtn,
              pressed && { opacity: 0.78 },
            ]}
            onPress={(e) => {
              e.stopPropagation?.();
              onDelete?.(post);
            }}
            android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Delete listing: ${post.title}`}
          >
            <Feather
              name="trash-2"
              size={11}
              color={colors.semantic.red.accent}
            />
            <Text
              style={styles.adminDeleteBtnText}
              maxFontSizeMultiplier={1.25}
            >
              Delete
            </Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
    overflow: "hidden",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  cardResolved: {
    backgroundColor: colors.slate50,
    borderColor: colors.slate200,
  },
  cardLeft: {
    flex: 1,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    marginBottom: 2,
  },
  badgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
  },
  cardTitle: {
    fontFamily: titleFontFamily,
    fontSize: 15.5,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  cardTitleResolved: {
    color: CAMPUS_HUB_COLORS.mutedInk,
  },
  cardDesc: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.mutedInk,
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  claimBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: CAMPUS_HUB_COLORS.skyTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    alignSelf: "flex-start",
    marginTop: 4,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.skyBorder,
  },
  claimBadgeText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.skyAccentInk,
    includeFontPadding: false,
    fontVariant: ["tabular-nums"],
  },
  cardRightCol: {
    alignItems: "center",
    width: 84,
  },
  thumbWrapper: {
    width: 84,
    height: 84,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  cardThumb: {
    width: "100%",
    height: "100%",
  },
  thumbPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  imageTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    marginTop: 6,
    width: "100%",
  },
  imageTimeText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    includeFontPadding: false,
  },
  adminDeleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.semantic.red.softBorder,
    width: "100%",
    minHeight: 36,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.semantic.red.border,
    gap: 4,
    marginTop: 6,
    overflow: "hidden",
  },
  adminDeleteBtnText: {
    fontFamily,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "700",
    color: colors.semantic.red.accent,
    letterSpacing: 0.1,
    includeFontPadding: false,
  },
});
