import React, { memo } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";
import type { ForumPostItem } from "../types";
import { timeAgo } from "../utils";

interface ForumCardProps {
  item: ForumPostItem;
  onPress: (id: string) => void;
}

export const ForumCard = memo(function ForumCard({
  item,
  onPress,
}: ForumCardProps) {
  const isResolved = item.isResolved;
  const replyCount = item._count?.responses || 0;
  const authorName = item.author?.name || "University Member";
  const authorInitial = authorName.charAt(0).toUpperCase() || "U";
  const formattedTime = timeAgo(item.createdAt);

  return (
    <TouchableOpacity
      style={[
        styles.forumBentoCard,
        isResolved && styles.forumBentoCardResolved,
      ]}
      onPress={() => onPress(item.id)}
      activeOpacity={0.85}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Post by ${authorName}: ${item.title}. ${
        isResolved ? "Resolved." : "Needs help."
      } ${replyCount} replies. Tap to view.`}
    >
      <View style={styles.cardHeaderRow}>
        <View style={styles.authorBox}>
          {item.author?.image ? (
            <Image
              source={{ uri: item.author.image }}
              style={styles.authorAvatar}
              accessible={true}
              accessibilityLabel={`${authorName}'s avatar`}
            />
          ) : (
            <View style={styles.authorAvatarFallback}>
              <Text style={styles.authorAvatarText}>{authorInitial}</Text>
            </View>
          )}
          <View style={styles.authorInfoCol}>
            <Text style={styles.authorNameText} numberOfLines={1}>
              {authorName}
            </Text>
            <Text style={styles.timeAgoText}>{formattedTime}</Text>
          </View>
        </View>

        {isResolved ? (
          <View style={styles.resolvedBadge}>
            <Feather
              name="check-circle"
              size={11}
              color={BENTO_COLORS.emerald}
              style={styles.badgeIcon}
            />
            <Text style={styles.resolvedBadgeText}>RESOLVED</Text>
          </View>
        ) : (
          <View style={styles.needsHelpBadge}>
            <Text style={styles.needsHelpBadgeText}>NEEDS HELP</Text>
          </View>
        )}
      </View>

      <Text style={styles.postTitleText} numberOfLines={2}>
        {item.title}
      </Text>

      <Text style={styles.postDescText} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.cardDivider} />

      <View style={styles.cardFooterRow}>
        <View style={styles.replyCountPill}>
          <Feather
            name="message-square"
            size={12}
            color={BENTO_COLORS.deepNavy}
            style={styles.replyIcon}
          />
          <Text style={styles.replyCountPillText}>
            {replyCount} {replyCount === 1 ? "Reply" : "Replies"}
          </Text>
        </View>

        <View style={styles.cardActionCircle}>
          <Feather
            name="arrow-up-right"
            size={14}
            color={BENTO_COLORS.deepNavy}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  forumBentoCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    ...BENTO_COLORS.shadow,
  },
  forumBentoCardResolved: {
    borderLeftWidth: 3,
    borderLeftColor: "#10b981",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  authorBox: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  authorAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#edf2f7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  authorAvatarText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  authorInfoCol: {
    flex: 1,
  },
  authorNameText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  timeAgoText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },
  resolvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.emeraldBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  badgeIcon: {
    marginRight: 4,
  },
  resolvedBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.emerald,
    letterSpacing: 0.4,
  },
  needsHelpBadge: {
    backgroundColor: BENTO_COLORS.skyBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  needsHelpBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.sky,
    letterSpacing: 0.4,
  },
  postTitleText: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    lineHeight: 23,
    marginBottom: 6,
  },
  postDescText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    lineHeight: 19,
    marginBottom: 14,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginBottom: 12,
  },
  cardFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  replyCountPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  replyIcon: {
    marginRight: 5,
  },
  replyCountPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  cardActionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
});
