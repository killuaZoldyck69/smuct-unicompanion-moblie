import React, { memo } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../../constants";
import type { ForumPostItem, ForumAuthor } from "../../types";
import {
  timeAgo,
  getUserAcademicSubtitle,
  formatPostedTime,
  isEdited,
  formatEditedTime,
} from "../../utils";

interface DiscussionQuestionCardProps {
  thread: ForumPostItem;
  isAuthor: boolean;
  onAuthorPress: (author: ForumAuthor) => void;
  onResolvePress: () => void;
}

export const DiscussionQuestionCard = memo(function DiscussionQuestionCard({
  thread,
  isAuthor,
  onAuthorPress,
  onResolvePress,
}: DiscussionQuestionCardProps) {
  const authorName = thread.author?.name || "University Member";
  const authorInitial = authorName.charAt(0).toUpperCase() || "U";
  const authorSubtitle = getUserAcademicSubtitle(thread.author);
  const postTime = timeAgo(thread.createdAt);
  const fullPostedTime = formatPostedTime(thread.createdAt);
  const threadEdited = isEdited(thread.createdAt, thread.updatedAt);
  const editedTime = threadEdited ? formatEditedTime(thread.updatedAt) : null;
  const responsesCount = thread.responses?.length || 0;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>DISCUSSION</Text>
          </View>

          {thread.isResolved ? (
            <View style={styles.resolvedBadge}>
              <Feather
                name="check"
                size={11}
                color={BENTO_COLORS.emerald}
                style={styles.badgeIcon}
              />
              <Text style={styles.resolvedBadgeText}>RESOLVED</Text>
            </View>
          ) : (
            <View style={styles.needsHelpBadge}>
              <View style={styles.needsHelpDot} />
              <Text style={styles.needsHelpBadgeText}>NEEDS HELP</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{thread.title}</Text>

        <TouchableOpacity
          style={styles.authorRow}
          onPress={() => onAuthorPress(thread.author)}
          activeOpacity={0.75}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Author: ${authorName}, ${authorSubtitle}`}
        >
          {thread.author?.image ? (
            <Image
              source={{ uri: thread.author.image }}
              style={styles.avatar}
              accessible={true}
              accessibilityLabel={`${authorName}'s avatar`}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{authorInitial}</Text>
            </View>
          )}
          <View style={styles.authorMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.authorName} numberOfLines={1}>
                {authorName}
              </Text>
              <View style={styles.authorTag}>
                <Text style={styles.authorTagText}>Author</Text>
              </View>
            </View>
            <Text style={styles.authorSubtitle} numberOfLines={1}>
              {authorSubtitle}
            </Text>
            <Text style={styles.timestampText}>
              Posted on {fullPostedTime} ({postTime})
            </Text>
            {editedTime && (
              <Text style={styles.editedText}>
                ✎ Edited {editedTime}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        <Text style={styles.body}>{thread.description}</Text>

        {isAuthor && !thread.isResolved && (
          <TouchableOpacity
            style={styles.markResolvedBtn}
            onPress={onResolvePress}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Mark as Resolved"
          >
            <Feather
              name="check-circle"
              size={14}
              color="#ffffff"
              style={styles.resolveIcon}
            />
            <Text style={styles.markResolvedBtnText}>Mark as Resolved</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.responsesHeaderRow}>
        <Text style={styles.responsesTitle}>
          {responsesCount} {responsesCount === 1 ? "Response" : "Responses"}
        </Text>
        <Text style={styles.responsesSubtitle}>
          Community answers & insights
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 6,
  },
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    marginBottom: 16,
    ...BENTO_COLORS.shadow,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryPill: {
    backgroundColor: BENTO_COLORS.slateBg,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  categoryPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: 0.5,
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
    letterSpacing: 0.3,
  },
  needsHelpBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.skyBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
    gap: 4,
  },
  needsHelpDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BENTO_COLORS.sky,
  },
  needsHelpBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.sky,
    letterSpacing: 0.3,
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    lineHeight: 24,
    marginBottom: 14,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BENTO_COLORS.slateBg,
    marginRight: 10,
  },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BENTO_COLORS.slateBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  authorMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorName: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  authorTag: {
    marginLeft: 6,
    backgroundColor: "rgba(30, 58, 138, 0.08)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  authorTagText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "700",
    color: BENTO_COLORS.primaryBlue,
  },
  authorSubtitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },
  timestampText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "400",
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },
  editedText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "500",
    color: "#92400e",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: BENTO_COLORS.subtleBorder,
    marginBottom: 14,
  },
  body: {
    fontFamily,
    fontSize: 14,
    fontWeight: "400",
    color: BENTO_COLORS.neutralText,
    lineHeight: 22,
    marginBottom: 14,
  },
  markResolvedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.emerald,
    borderRadius: BENTO_COLORS.pillRadius,
    paddingVertical: 10,
    marginTop: 4,
  },
  resolveIcon: {
    marginRight: 6,
  },
  markResolvedBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  responsesHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  responsesTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  responsesSubtitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
  },
});
