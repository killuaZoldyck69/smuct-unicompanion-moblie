import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { MarketplacePost } from "@/services/marketplace-service";
import { CAMPUS_HUB_COLORS, fontFamily, timeAgo } from "../../shared/design-tokens";

const CONDITION_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  NEW: { label: "Brand New", bg: "#f0fdf4", text: "#166534", border: "rgba(22, 101, 52, 0.12)" },
  LIKE_NEW: { label: "Like New", bg: "#ecfdf5", text: "#065f46", border: "rgba(6, 95, 70, 0.12)" },
  GOOD: { label: "Good", bg: "#eff6ff", text: "#1e40af", border: "rgba(30, 64, 175, 0.12)" },
  FAIR: { label: "Fair", bg: "#fefce8", text: "#854d0e", border: "rgba(133, 77, 14, 0.12)" },
};

interface ListingCardProps {
  post: MarketplacePost;
  cardWidth?: number;
  onPress: () => void;
}

export const ListingCard = React.memo(function ListingCard({
  post,
  cardWidth,
  onPress,
}: ListingCardProps) {
  const isSelling = post.type === "SELLING";
  const isSold = post.status === "SOLD";
  const isEdited =
    !!post.updatedAt &&
    !!post.createdAt &&
    new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() > 10000;

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
        isSold && styles.cardSold,
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
        {post.images?.[0] ? (
          <Image source={{ uri: post.images[0] }} style={styles.image} />
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
              {isSelling ? "No Photo" : "Wanted Item"}
            </Text>
          </View>
        )}

        {/* Top-Left Floating Status Pill */}
        <View
          style={[
            styles.typeOverlayBadge,
            isSold
              ? styles.typeBadgeSold
              : isSelling
              ? styles.typeBadgeSelling
              : styles.typeBadgeWanted,
          ]}
        >
          <View
            style={[
              styles.typeBadgeDot,
              isSold
                ? styles.typeDotSold
                : isSelling
                ? styles.typeDotSelling
                : styles.typeDotWanted,
            ]}
          />
          <Text
            style={[
              styles.typeBadgeText,
              isSold
                ? styles.typeTextSold
                : isSelling
                ? styles.typeTextSelling
                : styles.typeTextWanted,
            ]}
          >
            {isSold ? "SOLD" : isSelling ? "FOR SALE" : "WANTED"}
          </Text>
        </View>

        {/* Bottom-Right Photo Counter (Multiple Photos) */}
        {post.images && post.images.length > 1 && (
          <View style={styles.photoCountBadge}>
            <Feather name="camera" size={10} color="#ffffff" />
            <Text style={styles.photoCountText}>{post.images.length}</Text>
          </View>
        )}

        {/* Sold Overlay Scrim */}
        {isSold && (
          <View style={styles.soldOverlay}>
            <View style={styles.soldBadge}>
              <Text style={styles.soldBadgeText}>SOLD</Text>
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
          <Text style={styles.description} numberOfLines={2}>
            {post.description}
          </Text>
        ) : null}

        {/* Hairline Divider */}
        <View style={styles.cardDivider} />

        {/* Card Footer: Seller Peer Identity + Relative Timestamp & Inquiries */}
        <View style={styles.footerRow}>
          <View style={styles.authorPeerCol}>
            {post.author?.image ? (
              <Image
                source={{ uri: post.author.image }}
                style={styles.authorAvatar}
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
    backgroundColor: "#f1f5f9",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  placeholderIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
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
    backgroundColor: "#94a3b8",
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
    color: "#ffffff",
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
  photoCountText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "700",
    color: "#ffffff",
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
    borderColor: "#e2e8f0",
  },
  authorAvatarFallback: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
