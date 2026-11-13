import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import type { ListingType, MarketplacePost } from "@/services/marketplace-service";
import { colors } from "@/theme/colors";
import { CAMPUS_HUB_COLORS, fontFamily, timeAgo } from "../../shared/design-tokens";
import { RichTextSnippet } from "../../shared/rich-text-snippet";

const CONDITION_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  NEW: {
    label: "Brand New",
    bg: colors.semantic.emerald.softSurface,
    text: colors.semantic.emerald.darkText,
    border: "rgba(6, 95, 70, 0.14)",
  },
  LIKE_NEW: {
    label: "Like New",
    bg: colors.semantic.emerald.tint,
    text: colors.semantic.emerald.darker,
    border: "rgba(4, 120, 87, 0.14)",
  },
  GOOD: {
    label: "Good",
    bg: colors.semantic.blue.tint,
    text: colors.semantic.blue.deep,
    border: "rgba(30, 58, 138, 0.14)",
  },
  FAIR: {
    label: "Fair",
    bg: colors.semantic.yellow.tint,
    text: colors.semantic.yellow.darkText,
    border: "rgba(133, 77, 14, 0.14)",
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

  const isSelling = post.type === "SELLING";
  const isSold = post.status === "SOLD";
  const isClosed = post.status === "CLOSED";
  const isInactive = isSold || isClosed;
  const statusOverlayLabel = isClosed ? "CLOSED" : isSold ? "SOLD" : null;

  const conditionInfo = post.condition ? CONDITION_STYLES[post.condition] : null;

  // Author peer identity display
  const authorInitial = (post.author?.name ?? "U").charAt(0).toUpperCase();
  const authorFirstName = post.author?.name
    ? post.author.name.trim().split(" ")[0]
    : "Member";

  return (
    <TouchableOpacity
      style={[
        styles.card,
        cardWidth ? { width: cardWidth } : null,
        isInactive && styles.cardSold,
      ]}
      onPress={onPress}
      activeOpacity={0.88}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${isSelling ? "For Sale" : "Wanted"}: ${post.title}${
        post.price != null ? `, ৳${post.price.toLocaleString()}` : ""
      }. Posted by ${authorFirstName}.`}
    >
      {/* Visual Anchor: 16:10 Ratio Photo Container */}
      <View style={styles.imageContainer}>
        {coverUri && !failedImage ? (
          <Image
            source={{ uri: coverUri }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
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
            <Text style={styles.placeholderText}>
              {coverUri ? "Photo Unavailable" : isSelling ? "No Photo" : "Wanted Item"}
            </Text>
          </View>
        )}

        {/* Top-Left Floating Status Pill */}
        <View
          style={[
            styles.typeOverlayBadge,
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
          >
            {statusOverlayLabel ?? (isSelling ? "FOR SALE" : "WANTED")}
          </Text>
        </View>

        {/* Bottom-Right Photo Counter (Multiple Photos) */}
        {post.images && post.images.length > 1 && (
          <View style={styles.photoCountBadge}>
            <Feather name="camera" size={10} color={CAMPUS_HUB_COLORS.white} />
            <Text style={styles.photoCountText}>{post.images.length}</Text>
          </View>
        )}

        {/* Admin Floating Delete Button */}
        {isAdmin && (
          <TouchableOpacity
            style={styles.adminDeleteBtn}
            onPress={(e) => {
              e.stopPropagation?.();
              onDelete?.(
                post.id,
                post.title,
                post.price,
                post.images?.[0],
                post.type,
              );
            }}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Delete listing: ${post.title}`}
          >
            <Feather name="trash-2" size={13} color={CAMPUS_HUB_COLORS.white} />
          </TouchableOpacity>
        )}

        {/* Sold / Closed Overlay Scrim */}
        {statusOverlayLabel && (
          <View style={styles.soldOverlay}>
            <View style={styles.soldBadge}>
              <Text style={styles.soldBadgeText}>{statusOverlayLabel}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Card Information Body */}
      <View style={styles.cardBody}>
        {/* Prominent Price Anchor */}
        <View style={styles.priceRow}>
          {post.price != null ? (
            <View style={styles.priceContainer}>
              <Text style={styles.currencySymbol}>৳</Text>
              <Text style={styles.priceAmount}>
                {post.price.toLocaleString()}
              </Text>
            </View>
          ) : (
            <Text style={styles.priceNegotiable}>
              {isSelling ? "Negotiable" : "Budget Open"}
            </Text>
          )}

          {/* Condition Micro Pill */}
          {conditionInfo && (
            <View
              style={[
                styles.conditionPill,
                { backgroundColor: conditionInfo.bg, borderColor: conditionInfo.border },
              ]}
            >
              <Text style={[styles.conditionPillText, { color: conditionInfo.text }]}>
                {conditionInfo.label}
              </Text>
            </View>
          )}
        </View>

        {/* Listing Title */}
        <Text style={styles.title} numberOfLines={1}>
          {post.title}
        </Text>

        {/* Description Snippet */}
        {post.description ? (
          <RichTextSnippet
            text={post.description}
            numberOfLines={2}
            style={styles.description}
          />
        ) : null}

        {/* Hairline Divider */}
        <View style={styles.cardDivider} />

        {/* Card Footer: Seller Peer Identity + Relative Timestamp & Inquiries */}
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
                <Text style={styles.authorAvatarInitial}>
                  {authorInitial}
                </Text>
              </View>
            )}
            <Text style={styles.authorName} numberOfLines={1}>
              {authorFirstName}
            </Text>
          </View>

          <View style={styles.footerRightMeta}>
            {post._count?.comments && post._count.comments > 0 ? (
              <View style={styles.commentMeta}>
                <Feather
                  name="message-circle"
                  size={10.5}
                  color={CAMPUS_HUB_COLORS.subtleText}
                />
                <Text style={styles.commentCount}>
                  {post._count.comments}
                </Text>
              </View>
            ) : null}
            <Text style={styles.timeText} numberOfLines={1}>
              {timeAgo(post.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  cardSold: {
    opacity: 0.76,
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
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  placeholderText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  typeOverlayBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4.5,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeBadgeSelling: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderColor: "rgba(22, 163, 74, 0.2)",
  },
  typeBadgeWanted: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderColor: "rgba(217, 119, 6, 0.2)",
  },
  typeBadgeSold: {
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    borderColor: "transparent",
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
    fontWeight: "800",
    letterSpacing: 0.5,
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
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    paddingHorizontal: 6.5,
    paddingVertical: 2.5,
    borderRadius: 6,
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
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  photoCountText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.white,
  },
  soldOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  soldBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  soldBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "900",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: 1,
  },
  cardBody: {
    padding: 10,
    gap: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 1.5,
  },
  currencySymbol: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  priceAmount: {
    fontFamily,
    fontSize: 15.5,
    fontWeight: "900",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  priceNegotiable: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
    fontStyle: "italic",
  },
  conditionPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  conditionPillText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "700",
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
    backgroundColor: "rgba(0, 0, 0, 0.04)",
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
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
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
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  timeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
});
