import React, { memo } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";
import type { ForumPostItem } from "../types";
import { timeAgo, getUserAcademicSubtitle, formatTimeOnly, isEdited } from "../utils";

interface ForumCardProps {
  item: ForumPostItem;
  onPress: (id: string) => void;
}

export const ForumCard = memo(function ForumCard({
  item,
  onPress,
}: ForumCardProps) {
  const isResolved = item.isResolved;
  const replyCount = item._count?.responses || item.responses?.length || 0;
  const authorName = item.author?.name || "University Member";
  const authorInitial = authorName.charAt(0).toUpperCase() || "U";
  const formattedTime = timeAgo(item.createdAt);
  const timeOnly = formatTimeOnly(item.createdAt);
  const academicSubtitle = getUserAcademicSubtitle(item.author);
  const postEdited = isEdited(item.createdAt, item.updatedAt);

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        isResolved && styles.cardContainerResolved,
      ]}
      onPress={() => onPress(item.id)}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Discussion: ${item.title}. Asked by ${authorName}, ${academicSubtitle}. Posted ${formattedTime} at ${timeOnly}. Status: ${
        isResolved ? "Resolved" : "Needs help"
      }. ${replyCount} ${replyCount === 1 ? "reply" : "replies"}.`}
    >
      <View style={styles.headerRow}>
        <View style={styles.authorRow}>
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
          <View style={styles.authorMeta}>
            <Text style={styles.authorName} numberOfLines={1}>
              {authorName}
            </Text>
            <Text style={styles.authorSubtitle} numberOfLines={1}>
              {academicSubtitle}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.titleText} numberOfLines={2}>
        {item.title}
      </Text>

      {item.description ? (
        <Text style={styles.descriptionText} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}

      <View style={[styles.divider, isResolved && styles.dividerResolved]} />

      <View style={styles.footerRow}>
        <View style={[styles.replyPill, isResolved && styles.replyPillResolved]}>
          <Feather
            name="message-square"
            size={12}
            color={BENTO_COLORS.primaryBlue}
            style={styles.replyIcon}
          />
          <Text style={styles.replyPillText}>
            {replyCount} {replyCount === 1 ? "Reply" : "Replies"}
          </Text>
        </View>

        <View style={styles.activityBox}>
          <Feather
            name="clock"
            size={11}
            color={BENTO_COLORS.subtleText}
            style={styles.clockIcon}
          />
          <Text style={styles.timeText}>
            Posted {formattedTime} • {timeOnly}
          </Text>
        </View>
        {postEdited && (
          <Text style={styles.editedBadge}>✎ Edited</Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  cardContainerResolved: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: BENTO_COLORS.slateBg,
  },
  authorAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BENTO_COLORS.slateBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  authorAvatarText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  authorSubtitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },
  titleText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    lineHeight: 22,
    marginBottom: 6,
  },
  descriptionText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "400",
    color: BENTO_COLORS.subtleText,
    lineHeight: 19,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: BENTO_COLORS.subtleBorder,
    marginBottom: 10,
  },
  dividerResolved: {
    backgroundColor: "rgba(16, 185, 129, 0.16)",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  replyPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  replyPillResolved: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  replyIcon: {
    marginRight: 5,
  },
  replyPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  activityBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  clockIcon: {
    marginRight: 4,
  },
  timeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
  },
  editedBadge: {
    fontFamily,
    fontSize: 10,
    fontWeight: "600",
    color: "#92400e",
    marginLeft: 6,
  },
});
