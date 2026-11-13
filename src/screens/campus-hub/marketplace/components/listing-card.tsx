import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import type {
  ListingType,
  MarketplacePost,
} from "@/services/marketplace-service";
import { getMarketplaceListingFlags } from "@/features/campus-hub/marketplace-logic";
import { colors } from "@/theme/colors";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  timeAgo,
} from "../../shared/design-tokens";
import { RichTextSnippet } from "../../shared/rich-text-snippet";

const CONDITION_STYLES: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  NEW: {
    label: "Brand New",
    bg: colors.semantic.emerald.softSurface,
    text: colors.semantic.emerald.darkText,
    border: colors.semantic.emerald.mintBorder,
  },
  LIKE_NEW: {
    label: "Like New",
    bg: colors.semantic.emerald.tint,
    text: colors.semantic.emerald.darker,
    border: colors.semantic.emerald.border,
  },
  GOOD: {
    label: "Good",
    bg: colors.semantic.blue.tint,
    text: colors.semantic.blue.deep,
    border: colors.semantic.blue.border,
  },
  FAIR: {
    label: "Fair",
    bg: colors.semantic.yellow.tint,
    text: colors.semantic.yellow.darkText,
    border: colors.semantic.amber.border,
  },
};

interface ListingCardProps {
  post: MarketplacePost;
  cardWidth?: number;
  onPress: () => void;
  isAdmin?: boolean;
  onDelete?: (
    id: string,
    title: string,
    price?: number | null,
    image?: string,
    type?: ListingType,
  ) => void;
}

export const ListingCard = React.memo(function ListingCard({
  post,
  cardWidth,
  onPress,
  isAdmin = false,
  onDelete,
}: ListingCardProps) {
  const [failedImage, setFailedImage] = useState(false);
  const [failedAvatar, setFailedAvatar] = useState(false);

  const coverUri = post.images?.[0];
  const avatarUri = post.author?.image;

  useEffect(() => {
    setFailedImage(false);
  }, [coverUri]);

  useEffect(() => {
    setFailedAvatar(false);
  }, [avatarUri]);

  const { isSelling, isSold, isClosed, isInactive } =
    getMarketplaceListingFlags(post);
  const statusOverlayLabel = isClosed ? "CLOSED" : isSold ? "SOLD" : null;
  const conditionInfo = post.condition
    ? CONDITION_STYLES[post.condition]
    : null;
  const commentCount = post._count?.comments ?? 0;

  const authorInitial = (post.author?.name ?? "U").charAt(0).toUpperCase();
  const authorFirstName = post.author?.name
    ? post.author.name.trim().split(" ")[0]
    : "Member";

  return (
    <View
      style={[
        styles.card,
        cardWidth ? { width: cardWidth } : null,
        isInactive && styles.cardInactiveFlat,
      ]}
    >
      <Pressable
        style={({ pressed }) => [
          styles.cardPressable,
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
        android_ripple={{
          color: CAMPUS_HUB_COLORS.androidRipple,
          foreground: true,
        }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${isSelling ? "For Sale" : "Wanted"}: ${post.title}${
          post.price != null ? `, ৳${post.price.toLocaleString()}` : ""
        }. Posted by ${authorFirstName}.`}
      >
        {/* Visual Anchor: 16:10 Photo Container */}
        <View style={styles.imageContainer}>
          {coverUri && !failedImage ? (
            <Image
              source={{ uri: coverUri }}
              style={styles.image}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
              onError={() => setFailedImage(true)}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <View style={styles.placeholderIconCircle}>
                <Feather
                  name={isSelling ? "shopping-bag" : "search"}
                  size={20}
                  color={CAMPUS_HUB_COLORS.subtleText}
                />
              </View>
              <Text style={styles.placeholderText} maxFontSizeMultiplier={1.2}>
                {coverUri
                  ? "Photo Unavailable"
                  : isSelling
                    ? "No Photo"
                    : "Wanted Item"}
              </Text>
            </View>
          )}

          {/* Top-Left Floating Status Pill */}
          <View
            style={[
              styles.typeOverlayBadge,
              isAdmin && styles.typeOverlayBadgeAdminSafe,
              isInactive
                ? styles.typeBadgeSold
                : isSelling
                  ? styles.typeBadgeSelling
                  : styles.typeBadgeWanted,
            ]}
          >
            <View
              style={[
                styles.typeBadgeDot,
                isInactive
                  ? styles.typeDotSold
                  : isSelling
                    ? styles.typeDotSelling
                    : styles.typeDotWanted,
              ]}
            />
            <Text
              style={[
                styles.typeBadgeText,
                isInactive
                  ? styles.typeTextSold
                  : isSelling
                    ? styles.typeTextSelling
                    : styles.typeTextWanted,
              ]}
              maxFontSizeMultiplier={1.15}
            >
              {statusOverlayLabel ?? (isSelling ? "FOR SALE" : "WANTED")}
            </Text>
          </View>

          {/* Bottom-Right Photo Counter */}
          {post.images && post.images.length > 1 && (
            <View style={styles.photoCountBadge}>
              <Feather
                name="camera"
                size={10}
                color={CAMPUS_HUB_COLORS.white}
              />
              <Text style={styles.photoCountText} maxFontSizeMultiplier={1.15}>
                {post.images.length}
              </Text>
            </View>
          )}

          {/* Sold / Closed Overlay Scrim */}
          {statusOverlayLabel && (
            <View style={styles.soldOverlay}>
              <View style={styles.soldBadge}>
                <Text style={styles.soldBadgeText} maxFontSizeMultiplier={1.2}>
                  {statusOverlayLabel}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Card Information Body (explicit muted ink preserves >= 4.5:1 contrast without opacity washout) */}
        <View style={styles.cardBody}>
          <View style={styles.priceRow}>
            {post.price != null ? (
              <View style={styles.priceContainer}>
                <Text
                  style={[
                    styles.currencySymbol,
                    isInactive && styles.textInactive,
                  ]}
                  maxFontSizeMultiplier={1.2}
                >
                  ৳
                </Text>
                <Text
                  style={[styles.priceAmount, isInactive && styles.textInactive]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  maxFontSizeMultiplier={1.2}
                >
                  {post.price.toLocaleString()}
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.priceNegotiable,
                  isInactive && styles.textInactive,
                ]}
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
              >
                {isSelling ? "Negotiable" : "Budget Open"}
              </Text>
            )}

            {conditionInfo && (
              <View
                style={[
                  styles.conditionPill,
                  {
                    backgroundColor: conditionInfo.bg,
                    borderColor: conditionInfo.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.conditionPillText,
                    { color: conditionInfo.text },
                  ]}
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.15}
                >
                  {conditionInfo.label}
                </Text>
              </View>
            )}
          </View>

          <Text
            style={[styles.title, isInactive && styles.textInactive]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {post.title}
          </Text>

          {post.description ? (
            <RichTextSnippet
              text={post.description}
              numberOfLines={2}
              style={styles.description}
            />
          ) : null}

          <View style={styles.cardDivider} />

          <View style={styles.footerRow}>
            <View style={styles.authorPeerCol}>
              {avatarUri && !failedAvatar ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.authorAvatar}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  onError={() => setFailedAvatar(true)}
                />
              ) : (
                <View style={styles.authorAvatarFallback}>
                  <Text
                    style={styles.authorAvatarInitial}
                    maxFontSizeMultiplier={1.15}
                  >
                    {authorInitial}
                  </Text>
                </View>
              )}
              <Text
                style={styles.authorName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {authorFirstName}
              </Text>
            </View>

            <View style={styles.footerRightMeta}>
              {commentCount > 0 ? (
                <View style={styles.commentMeta}>
                  <Feather
                    name="message-circle"
                    size={10.5}
                    color={CAMPUS_HUB_COLORS.subtleText}
                  />
                  <Text style={styles.commentCount} maxFontSizeMultiplier={1.2}>
                    {commentCount}
                  </Text>
                </View>
              ) : null}
              <Text
                style={styles.timeText}
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
              >
                {timeAgo(post.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>

      {/* Sibling overlay button (outside card Pressable for clean TalkBack & touch routing) */}
      {isAdmin && (
        <Pressable
          style={({ pressed }) => [
            styles.adminDeleteBtn,
            pressed && { opacity: 0.85 },
          ]}
          onPress={() =>
            onDelete?.(
              post.id,
              post.title,
              post.price,
              post.images?.[0],
              post.type,
            )
          }
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          android_ripple={{
            color: CAMPUS_HUB_COLORS.androidRippleLight,
            borderless: true,
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Delete listing: ${post.title}`}
        >
          <Feather name="trash-2" size={13} color={CAMPUS_HUB_COLORS.white} />
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  cardInactiveFlat: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: colors.slate50,
  },
  cardPressable: {
    width: "100%",
  },
  cardPressed: {
    opacity: 0.94,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 136,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.slate50,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  placeholderIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  placeholderText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
    includeFontPadding: false,
  },
  typeOverlayBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    maxWidth: "85%",
    flexDirection: "row",
    alignItems: "center",
    gap: 4.5,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeOverlayBadgeAdminSafe: {
    maxWidth: "66%",
  },
  typeBadgeSelling: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderColor: colors.semantic.emerald.mintBorder,
  },
  typeBadgeWanted: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderColor: colors.semantic.amber.border,
  },
  typeBadgeSold: {
    backgroundColor: CAMPUS_HUB_COLORS.deepNavy,
    borderColor: CAMPUS_HUB_COLORS.deepNavy,
  },
  typeBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  typeDotSelling: {
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentText,
  },
  typeDotWanted: {
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentText,
  },
  typeDotSold: {
    backgroundColor: colors.slate400,
  },
  typeBadgeText: {
    fontFamily,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  typeTextSelling: {
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
  },
  typeTextWanted: {
    color: CAMPUS_HUB_COLORS.lostFoundAccentText,
  },
  typeTextSold: {
    color: CAMPUS_HUB_COLORS.white,
  },
  photoCountBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.scrimDark,
    paddingHorizontal: 6.5,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  photoCountText: {
    fontFamily,
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.white,
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  adminDeleteBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.semantic.red.accent,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 4,
  },
  soldOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.scrimDark,
    alignItems: "center",
    justifyContent: "center",
  },
  soldBadge: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  soldBadgeText: {
    fontFamily,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: 1,
    includeFontPadding: false,
  },
  cardBody: {
    padding: 10,
    gap: 4,
  },
  textInactive: {
    color: CAMPUS_HUB_COLORS.mutedInk,
  },
  priceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 1.5,
    flexShrink: 1,
  },
  currencySymbol: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    includeFontPadding: false,
  },
  priceAmount: {
    fontFamily,
    fontSize: 15.5,
    lineHeight: 19,
    fontWeight: "900",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.3,
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
    flexShrink: 1,
  },
  priceNegotiable: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
    fontStyle: "italic",
    flexShrink: 1,
  },
  conditionPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    flexShrink: 0,
  },
  conditionPillText: {
    fontFamily,
    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: "700",
    includeFontPadding: false,
  },
  title: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    lineHeight: 18,
  },
  description: {
    fontFamily,
    fontSize: 11,
    fontWeight: "400",
    color: CAMPUS_HUB_COLORS.subtleText,
    lineHeight: 15,
  },
  cardDivider: {
    height: 1,
    backgroundColor: CAMPUS_HUB_COLORS.subtleBorder,
    marginTop: 2,
    marginBottom: 1,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 1,
  },
  authorPeerCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
    marginRight: 6,
  },
  authorAvatar: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  authorAvatarFallback: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  authorAvatarInitial: {
    fontFamily,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    includeFontPadding: false,
  },
  authorName: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
    flexShrink: 1,
  },
  footerRightMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  commentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2.5,
  },
  commentCount: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  timeText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
});
