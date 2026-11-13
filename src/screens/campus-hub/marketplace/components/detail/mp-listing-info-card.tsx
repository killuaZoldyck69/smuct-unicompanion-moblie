import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import { colors } from "@/theme/colors";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  timeAgo,
  formatDateTime,
  formatCampusUserSubtitle,
} from "@/screens/campus-hub/shared/design-tokens";
import type { MarketplacePost } from "@/services/marketplace-service";
import type { AuthorProfileModalData } from "@/screens/campus-hub/shared/author-modal";
import { MARKETPLACE_CATEGORY_LABELS } from "../../marketplace-constants";
import { MarketplaceRichTextDisplay } from "../marketplace-rich-editor";

// ---------------------------------------------------------------------------
// Label maps — defined once, shared across the component
// ---------------------------------------------------------------------------
const CONDITION_LABELS: Readonly<Record<string, string>> = {
  NEW: "Brand New",
  LIKE_NEW: "Like New",
  GOOD: "Good Condition",
  FAIR: "Fair Condition",
};

const CATEGORY_LABELS = MARKETPLACE_CATEGORY_LABELS;

const ACCENT = CAMPUS_HUB_COLORS.marketplaceAccent;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface MPListingInfoCardProps {
  post: MarketplacePost;
  isAuthor: boolean;
  isAdmin?: boolean;
  isEdited: boolean;
  authorDept?: string;
  authorSubtitle?: string;
  authorInitial: string;
  isUpdatingStatus?: boolean;
  onViewAuthor: (author: AuthorProfileModalData) => void;
  onContact: () => void;
  onEdit: () => void;
  onMarkSold: () => void;
  onCloseListing?: () => void;
  onReopenListing?: () => void;
  onDelete: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function MPListingInfoCard({
  post,
  isAuthor,
  isAdmin = false,
  isEdited,
  authorDept,
  authorSubtitle,
  authorInitial,
  isUpdatingStatus = false,
  onViewAuthor,
  onContact,
  onEdit,
  onMarkSold,
  onCloseListing,
  onReopenListing,
  onDelete,
}: MPListingInfoCardProps) {
  const [failedAvatar, setFailedAvatar] = useState(false);

  useEffect(() => {
    setFailedAvatar(false);
  }, [post.author?.image]);

  const isSelling = post.type === "SELLING";
  const isSold = post.status === "SOLD";
  const isClosed = post.status === "CLOSED";
  const isInactive = isSold || isClosed;
  const sellerSubtitle =
    authorSubtitle || formatCampusUserSubtitle(post.author, "") || authorDept;

  const handleCopyPhone = useCallback(async () => {
    if (!post.contactPhone) return;
    try {
      await Clipboard.setStringAsync(post.contactPhone);
      Toast.show({
        type: "success",
        text1: "Number Copied!",
        text2: `${post.contactPhone} copied to clipboard.`,
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Failed to Copy",
        text2: "Could not copy phone number to clipboard.",
      });
    }
  }, [post.contactPhone]);

  return (
    <View style={styles.card}>
      {/* Status badges */}
      <View style={styles.badgeRow}>
        <View
          style={[
            styles.typeBadge,
            isInactive
              ? styles.typeBadgeSold
              : isSelling
                ? styles.typeBadgeSelling
                : styles.typeBadgeWanted,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              isInactive
                ? styles.statusDotSold
                : isSelling
                  ? styles.statusDotSelling
                  : styles.statusDotWanted,
            ]}
          />
          <Text
            style={[
              styles.typeBadgeText,
              isInactive
                ? styles.typeBadgeTextSold
                : isSelling
                  ? styles.typeBadgeTextSelling
                  : styles.typeBadgeTextWanted,
            ]}
          >
            {isClosed
              ? "CLOSED"
              : isSold
                ? isSelling
                  ? "SOLD"
                  : "FULFILLED"
                : isSelling
                  ? "SELLING"
                  : "WANTED"}
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
          <Feather
            name="calendar"
            size={13}
            color={CAMPUS_HUB_COLORS.subtleText}
          />
          <Text style={styles.postedDate}>
            Posted {formatDateTime(post.createdAt)}
          </Text>
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
              Last edited {formatDateTime(post.updatedAt)} (
              {timeAgo(post.updatedAt)})
            </Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Seller identity row */}
      <Pressable
        style={({ pressed }) => [
          styles.sellerRow,
          pressed && { opacity: 0.78 },
        ]}
        onPress={() => onViewAuthor(post.author as AuthorProfileModalData)}
        android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`View ${post.author?.name ?? "seller"}'s profile`}
      >
        {post.author?.image && !failedAvatar ? (
          <Image
            source={{ uri: post.author.image }}
            style={styles.sellerAvatar}
            contentFit="cover"
            cachePolicy="memory-disk"
            onError={() => setFailedAvatar(true)}
          />
        ) : (
          <View style={styles.sellerAvatarFallback}>
            <Text style={styles.sellerAvatarFallbackText}>{authorInitial}</Text>
          </View>
        )}

        <View style={styles.sellerTextCol}>
          <Text style={styles.sellerName} numberOfLines={1}>
            {post.author?.name ?? "University Member"}
          </Text>
          {!!sellerSubtitle && (
            <Text style={styles.sellerMeta} numberOfLines={1}>
              {sellerSubtitle}
            </Text>
          )}
        </View>

        <Feather
          name="chevron-right"
          size={18}
          color={CAMPUS_HUB_COLORS.subtleText}
        />
      </Pressable>

      <View style={styles.divider} />

      {/* Description with Rich Text rendering */}
      <View style={styles.descSection}>
        <Text style={styles.sectionLabel}>DESCRIPTION</Text>
        <MarketplaceRichTextDisplay text={post.description} />
      </View>

      {/* Contact CTA & Copy Button — non-owners */}
      {post.contactPhone && !isAuthor && (
        <View style={styles.contactActionRow}>
          <Pressable
            style={({ pressed }) => [
              styles.contactBtn,
              pressed && { opacity: 0.88 },
            ]}
            onPress={onContact}
            android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`${isSelling ? "Call seller" : "Call contact"} at ${post.contactPhone}`}
          >
            <Feather
              name="phone-call"
              size={16}
              color={CAMPUS_HUB_COLORS.white}
            />
            <Text
              style={styles.contactBtnText}
              numberOfLines={1}
              ellipsizeMode="tail"
              maxFontSizeMultiplier={1.2}
            >
              {isSelling ? "Call Seller" : "Call Contact"} ({post.contactPhone})
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.copyPhoneBtn,
              pressed && { opacity: 0.82 },
            ]}
            onPress={handleCopyPhone}
            android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Copy contact phone number ${post.contactPhone}`}
          >
            <Feather name="copy" size={16} color={CAMPUS_HUB_COLORS.deepNavy} />
          </Pressable>
        </View>
      )}

      {/* Author contact display with copy button */}
      {post.contactPhone && isAuthor && (
        <View style={styles.authorContactBox}>
          <View style={styles.authorContactLeft}>
            <View style={styles.authorPhoneIconWrap}>
              <Feather
                name="phone"
                size={13}
                color={CAMPUS_HUB_COLORS.marketplaceAccentText}
              />
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text
                style={styles.authorContactSubtext}
                maxFontSizeMultiplier={1.2}
              >
                YOUR CONTACT PHONE
              </Text>
              <Text style={styles.authorContactNumber} numberOfLines={1}>
                {post.contactPhone}
              </Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.authorCopyBtn,
              pressed && { opacity: 0.78 },
            ]}
            onPress={handleCopyPhone}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Copy contact phone number"
          >
            <Feather name="copy" size={12} color={CAMPUS_HUB_COLORS.deepNavy} />
            <Text style={styles.authorCopyBtnText} maxFontSizeMultiplier={1.2}>
              Copy
            </Text>
          </Pressable>
        </View>
      )}

      {/* Owner management actions */}
      {isAuthor && (
        <View style={styles.ownerActionsStack}>
          {!isInactive ? (
            <>
              <View style={styles.ownerActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.editBtn,
                    pressed && { opacity: 0.82 },
                  ]}
                  onPress={onEdit}
                  disabled={isUpdatingStatus}
                  android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                  accessible
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isUpdatingStatus }}
                  accessibilityLabel="Edit listing"
                >
                  <Feather
                    name="edit-3"
                    size={14}
                    color={CAMPUS_HUB_COLORS.deepNavy}
                  />
                  <Text style={styles.editBtnText} maxFontSizeMultiplier={1.2}>
                    Edit
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.markSoldBtn,
                    pressed && { opacity: 0.82 },
                  ]}
                  onPress={onMarkSold}
                  disabled={isUpdatingStatus}
                  android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                  accessible
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isUpdatingStatus }}
                  accessibilityLabel={
                    isSelling
                      ? "Mark listing as sold"
                      : "Mark request as fulfilled"
                  }
                >
                  <Feather
                    name="check-circle"
                    size={14}
                    color={CAMPUS_HUB_COLORS.marketplaceAccentText}
                  />
                  <Text
                    style={styles.markSoldBtnText}
                    maxFontSizeMultiplier={1.2}
                  >
                    {isSelling ? "Mark Sold" : "Mark Fulfilled"}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.ownerActions}>
                {onCloseListing && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.closeListingBtn,
                      pressed && { opacity: 0.82 },
                    ]}
                    onPress={onCloseListing}
                    disabled={isUpdatingStatus}
                    android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                    accessible
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isUpdatingStatus }}
                    accessibilityLabel="Close listing"
                  >
                    <Feather
                      name="slash"
                      size={14}
                      color={CAMPUS_HUB_COLORS.mutedInk}
                    />
                    <Text
                      style={styles.closeListingBtnText}
                      maxFontSizeMultiplier={1.2}
                    >
                      Close Listing
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  style={({ pressed }) => [
                    styles.deleteBtn,
                    pressed && { opacity: 0.82 },
                  ]}
                  onPress={onDelete}
                  disabled={isUpdatingStatus}
                  android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                  accessible
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isUpdatingStatus }}
                  accessibilityLabel="Delete listing"
                >
                  <Feather
                    name="trash-2"
                    size={14}
                    color={CAMPUS_HUB_COLORS.dangerText}
                  />
                  <Text
                    style={styles.deleteBtnText}
                    maxFontSizeMultiplier={1.2}
                  >
                    Delete
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.ownerActions}>
              {onReopenListing && (
                <Pressable
                  style={({ pressed }) => [
                    styles.markSoldBtn,
                    pressed && { opacity: 0.82 },
                  ]}
                  onPress={onReopenListing}
                  disabled={isUpdatingStatus}
                  android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                  accessible
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isUpdatingStatus }}
                  accessibilityLabel="Reopen listing"
                >
                  <Feather
                    name="refresh-cw"
                    size={14}
                    color={CAMPUS_HUB_COLORS.marketplaceAccentText}
                  />
                  <Text
                    style={styles.markSoldBtnText}
                    maxFontSizeMultiplier={1.2}
                  >
                    Reopen Listing
                  </Text>
                </Pressable>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.deleteBtn,
                  pressed && { opacity: 0.82 },
                ]}
                onPress={onDelete}
                disabled={isUpdatingStatus}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                accessible
                accessibilityRole="button"
                accessibilityState={{ disabled: isUpdatingStatus }}
                accessibilityLabel="Delete listing"
              >
                <Feather
                  name="trash-2"
                  size={14}
                  color={CAMPUS_HUB_COLORS.dangerText}
                />
                <Text style={styles.deleteBtnText} maxFontSizeMultiplier={1.2}>
                  Delete
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {/* Admin delete action (when not author) */}
      {isAdmin && !isAuthor && (
        <View style={styles.ownerActions}>
          <Pressable
            style={({ pressed }) => [
              styles.deleteBtn,
              { flex: 1 },
              pressed && { opacity: 0.82 },
            ]}
            onPress={onDelete}
            android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Delete listing"
          >
            <Feather
              name="trash-2"
              size={14}
              color={CAMPUS_HUB_COLORS.dangerText}
            />
            <Text style={styles.deleteBtnText} maxFontSizeMultiplier={1.2}>
              Delete Listing (Admin)
            </Text>
          </Pressable>
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
  typeBadgeSelling: {
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight,
  },
  typeBadgeWanted: { backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentLight },
  typeBadgeSold: { backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusDotSelling: {
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentText,
  },
  statusDotWanted: { backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentText },
  statusDotSold: { backgroundColor: CAMPUS_HUB_COLORS.subtleText },
  typeBadgeText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  typeBadgeTextSelling: { color: CAMPUS_HUB_COLORS.marketplaceAccentText },
  typeBadgeTextWanted: { color: CAMPUS_HUB_COLORS.lostFoundAccentText },
  typeBadgeTextSold: { color: CAMPUS_HUB_COLORS.subtleText },
  categoryBadge: {
    backgroundColor: colors.slate50,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  categoryBadgeText: {
    fontFamily,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
    includeFontPadding: false,
  },
  conditionBadge: {
    backgroundColor: CAMPUS_HUB_COLORS.resolvedGreenBg,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: colors.semantic.emerald.mintBorder,
  },
  conditionBadgeText: {
    fontFamily,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
    includeFontPadding: false,
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
    lineHeight: 27,
    fontWeight: "800",
    color: ACCENT,
    letterSpacing: -0.4,
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  priceNegotiable: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
    fontStyle: "italic",
  },
  metaCard: {
    backgroundColor: colors.slate50,
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
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  sellerAvatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
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
  contactActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  contactBtn: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: ACCENT,
    borderRadius: 14,
    overflow: "hidden",
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  contactBtnText: {
    fontFamily,
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.white,
    flexShrink: 1,
    includeFontPadding: false,
  },
  copyPhoneBtn: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  authorContactBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.slate50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    marginTop: 6,
    marginBottom: 2,
  },
  authorContactLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  authorPhoneIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  authorContactSubtext: {
    fontFamily,
    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  authorContactNumber: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    fontVariant: ["tabular-nums"],
  },
  authorCopyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 38,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  authorCopyBtnText: {
    fontFamily,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.deepNavy,
    includeFontPadding: false,
  },
  ownerActionsStack: {
    gap: 8,
    marginTop: 4,
  },
  ownerActions: {
    flexDirection: "row",
    gap: 8,
  },
  editBtn: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 10,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  editBtnText: {
    fontFamily,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    includeFontPadding: false,
  },
  closeListingBtn: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 10,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  closeListingBtnText: {
    fontFamily,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.mutedInk,
    includeFontPadding: false,
  },
  markSoldBtn: {
    flex: 1.15,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 10,
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.semantic.emerald.mintBorder,
  },
  markSoldBtnText: {
    fontFamily,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
    includeFontPadding: false,
  },
  deleteBtn: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 10,
    backgroundColor: CAMPUS_HUB_COLORS.dangerBg,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.semantic.rose.softBorder,
  },
  deleteBtnText: {
    fontFamily,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.dangerText,
    includeFontPadding: false,
  },
});
