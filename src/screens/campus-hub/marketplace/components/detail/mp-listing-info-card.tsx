import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  timeAgo,
  formatDateTime,
} from "@/screens/campus-hub/shared/design-tokens";
import type { MarketplacePost } from "@/services/marketplace-service";
import type { AuthorProfileModalData } from "@/screens/campus-hub/shared/author-modal";

// ---------------------------------------------------------------------------
// Label maps — defined once, shared across the component
// ---------------------------------------------------------------------------
const CONDITION_LABELS: Readonly<Record<string, string>> = {
  NEW: "Brand New",
  LIKE_NEW: "Like New",
  GOOD: "Good Condition",
  FAIR: "Fair Condition",
};

const CATEGORY_LABELS: Readonly<Record<string, string>> = {
  TEXTBOOKS: "Textbooks",
  ELECTRONICS: "Electronics",
  STATIONERY: "Stationery",
  CLOTHING: "Clothing",
  OTHER: "Other",
};

const EDIT_THRESHOLD_MS = 10_000;

const ACCENT = CAMPUS_HUB_COLORS.marketplaceAccent;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface MPListingInfoCardProps {
  post: MarketplacePost;
  isAuthor: boolean;
  isEdited: boolean;
  authorDept: string;
  authorInitial: string;
  onViewAuthor: (author: AuthorProfileModalData) => void;
  onContact: () => void;
  onEdit: () => void;
  onMarkSold: () => void;
  onDelete: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function MPListingInfoCard({
  post,
  isAuthor,
  isEdited,
  authorDept,
  authorInitial,
  onViewAuthor,
  onContact,
  onEdit,
  onMarkSold,
  onDelete,
}: MPListingInfoCardProps) {
  const isSelling = post.type === "SELLING";
  const isSold = post.status === "SOLD";

  return (
    <View style={styles.card}>
      {/* Status badges */}
      <View style={styles.badgeRow}>
        <View
          style={[
            styles.typeBadge,
            isSold
              ? styles.typeBadgeSold
              : isSelling
              ? styles.typeBadgeSelling
              : styles.typeBadgeWanted,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              isSold
                ? styles.statusDotSold
                : isSelling
                ? styles.statusDotSelling
                : styles.statusDotWanted,
            ]}
          />
          <Text
            style={[
              styles.typeBadgeText,
              isSold
                ? styles.typeBadgeTextSold
                : isSelling
                ? styles.typeBadgeTextSelling
                : styles.typeBadgeTextWanted,
            ]}
          >
            {isSold ? "SOLD" : isSelling ? "SELLING" : "WANTED"}
          </Text>
        </View>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {CATEGORY_LABELS[post.category] ?? post.category}
          </Text>
        </View>

        {post.condition && (
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionBadgeText}>
              {CONDITION_LABELS[post.condition] ?? post.condition}
            </Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title}>{post.title}</Text>

      {/* Price */}
      {post.price != null ? (
        <Text style={styles.price}>৳{post.price.toLocaleString()}</Text>
      ) : (
        <Text style={styles.priceNegotiable}>
          {isSelling ? "Price negotiable" : "Budget open"}
        </Text>
      )}

      {/* Timestamp + Edit badge */}
      <View style={styles.metaCard}>
        <View style={styles.metaRow}>
          <Feather name="calendar" size={13} color={CAMPUS_HUB_COLORS.subtleText} />
          <Text style={styles.postedDate}>Posted {formatDateTime(post.createdAt)}</Text>
          <Text style={styles.relativeTime}>• {timeAgo(post.createdAt)}</Text>
        </View>

        {isEdited && post.updatedAt && (
          <View style={styles.editedRow}>
            <View style={styles.editedPill}>
              <Feather
                name="edit-2"
                size={9.5}
                color={CAMPUS_HUB_COLORS.marketplaceAccentText}
              />
              <Text style={styles.editedPillText}>EDITED</Text>
            </View>
            <Text style={styles.editedDate}>
              Last edited {formatDateTime(post.updatedAt)} ({timeAgo(post.updatedAt)})
            </Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Seller identity row */}
      <TouchableOpacity
        style={styles.sellerRow}
        onPress={() => onViewAuthor(post.author as AuthorProfileModalData)}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`View ${post.author?.name}'s profile`}
      >
        {post.author?.image ? (
          <Image source={{ uri: post.author.image }} style={styles.sellerAvatar} />
        ) : (
          <View style={styles.sellerAvatarFallback}>
            <Text style={styles.sellerAvatarFallbackText}>{authorInitial}</Text>
          </View>
        )}

        <View style={styles.sellerTextCol}>
          <Text style={styles.sellerName} numberOfLines={1}>
            {post.author?.name ?? "University Member"}
          </Text>
          {!!authorDept && (
            <Text style={styles.sellerMeta} numberOfLines={1}>
              {authorDept}
            </Text>
          )}
        </View>

        <Feather name="chevron-right" size={18} color={CAMPUS_HUB_COLORS.subtleText} />
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Description */}
      <View style={styles.descSection}>
        <Text style={styles.sectionLabel}>DESCRIPTION</Text>
        <Text style={styles.description}>{post.description}</Text>
      </View>

      {/* Contact CTA — non-owners only */}
      {post.contactPhone && !isAuthor && (
        <TouchableOpacity
          style={styles.contactBtn}
          onPress={onContact}
          activeOpacity={0.85}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Call seller at ${post.contactPhone}`}
        >
          <Feather name="phone-call" size={16} color="#ffffff" />
          <Text style={styles.contactBtnText}>Call Seller ({post.contactPhone})</Text>
        </TouchableOpacity>
      )}

      {/* Owner management actions */}
      {isAuthor && !isSold && (
        <View style={styles.ownerActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={onEdit}
            activeOpacity={0.8}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Edit listing"
          >
            <Feather name="edit-3" size={14} color={CAMPUS_HUB_COLORS.deepNavy} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.markSoldBtn}
            onPress={onMarkSold}
            activeOpacity={0.8}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Mark listing as sold"
          >
            <Feather
              name="check-circle"
              size={14}
              color={CAMPUS_HUB_COLORS.marketplaceAccentText}
            />
            <Text style={styles.markSoldBtnText}>Mark Sold</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={onDelete}
            activeOpacity={0.8}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Delete listing"
          >
            <Feather name="trash-2" size={14} color={CAMPUS_HUB_COLORS.dangerText} />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  card: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 22,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  typeBadgeSelling: { backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight },
  typeBadgeWanted: { backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentLight },
  typeBadgeSold: { backgroundColor: "#f1f5f9" },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusDotSelling: { backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentText },
  statusDotWanted: { backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentText },
  statusDotSold: { backgroundColor: CAMPUS_HUB_COLORS.subtleText },
  typeBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  typeBadgeTextSelling: { color: CAMPUS_HUB_COLORS.marketplaceAccentText },
  typeBadgeTextWanted: { color: CAMPUS_HUB_COLORS.lostFoundAccentText },
  typeBadgeTextSold: { color: CAMPUS_HUB_COLORS.subtleText },
  categoryBadge: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  categoryBadgeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  conditionBadge: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.12)",
  },
  conditionBadgeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
    color: "#15803d",
  },
  title: {
    fontFamily,
    fontSize: 21,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    lineHeight: 27,
    letterSpacing: -0.3,
  },
  price: {
    fontFamily,
    fontSize: 22,
    fontWeight: "800",
    color: ACCENT,
    letterSpacing: -0.4,
  },
  priceNegotiable: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
    fontStyle: "italic",
  },
  metaCard: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  postedDate: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  relativeTime: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  editedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexWrap: "wrap",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.04)",
  },
  editedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  editedPillText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
    letterSpacing: 0.4,
  },
  editedDate: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    marginVertical: 2,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
    gap: 12,
  },
  sellerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  sellerAvatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  sellerAvatarFallbackText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  sellerTextCol: { flex: 1 },
  sellerName: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  sellerMeta: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 2,
  },
  descSection: { gap: 6 },
  sectionLabel: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.6,
  },
  description: {
    fontFamily,
    fontSize: 14,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 22,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    backgroundColor: ACCENT,
    borderRadius: 14,
    marginTop: 6,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  contactBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#ffffff",
  },
  ownerActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 11,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  editBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  markSoldBtn: {
    flex: 1.15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 11,
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  markSoldBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 11,
    backgroundColor: CAMPUS_HUB_COLORS.dangerBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.15)",
  },
  deleteBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.dangerText,
  },
});
