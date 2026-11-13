import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { BENTO_COLORS, fontFamily, titleFontFamily } from "../../constants";
import { RichNoticeText } from "@/screens/notices/components/rich-notice-text";
import type { ForumPostItem, ForumAuthor } from "../../types";
import {
  getAuthorAcademicInfo,
  formatPostedTime,
  isEdited,
  countTotalThreadResponses,
} from "../../utils";
import { ForumAuthorSubtitle, ForumAvatar } from "../forum-avatar";

interface DiscussionQuestionCardProps {
  thread: ForumPostItem;
  isAuthor: boolean;
  isAdmin?: boolean;
  onAuthorPress: (author: ForumAuthor) => void;
  onResolvePress: () => void;
}

export const DiscussionQuestionCard = memo(function DiscussionQuestionCard({
  thread,
  isAuthor,
  isAdmin = false,
  onAuthorPress,
  onResolvePress,
}: DiscussionQuestionCardProps) {
  const canManage = isAuthor || isAdmin;
  const authorName = thread.author?.name || "University Member";
  const authorAcademic = getAuthorAcademicInfo(thread.author);
  const fullPostedTime = formatPostedTime(thread.createdAt);
  const threadEdited = isEdited(thread.createdAt, thread.updatedAt);
  const responsesCount =
    countTotalThreadResponses(thread.responses) ||
    thread._count?.responses ||
    0;

  return (
    <View style={styles.container}>
      <View style={[styles.card, thread.isResolved && styles.cardResolved]}>
        {thread.isHiddenByModeration && (
          <View style={styles.moderationBanner}>
            <Feather
              name="shield"
              size={13}
              color={colors.semantic.amber.deep}
            />
            <Text style={styles.moderationBannerText}>
              This post is currently under moderator review and hidden from public feeds.
            </Text>
          </View>
        )}

        <Text style={styles.title}>{thread.title}</Text>

        <TouchableOpacity
          style={styles.authorRow}
          onPress={() => onAuthorPress(thread.author)}
          activeOpacity={0.75}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Author: ${authorName}, ${authorAcademic.fullText}`}
        >
          <ForumAvatar
            uri={thread.author?.image}
            name={authorName}
            size={48}
            fontSize={18}
            accessibilityLabel={`${authorName}'s avatar`}
            style={styles.avatarSpacing}
          />
          <View style={styles.authorMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.authorName} numberOfLines={1}>
                {authorName}
              </Text>
              <View style={styles.authorTag}>
                <Text style={styles.authorTagText}>Author</Text>
              </View>
            </View>
            <ForumAuthorSubtitle
              academicInfo={authorAcademic}
              style={styles.authorSubtitle}
            />
            <Text style={styles.timestampText}>
              Posted on {fullPostedTime}
              {threadEdited && (
                <Text style={styles.editedInline}> (Edited)</Text>
              )}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.divider, thread.isResolved && styles.dividerResolved]} />

        <RichNoticeText
          content={thread.description}
          defaultJustified={false}
          style={styles.body}
        />

        {canManage && !thread.isResolved && (
          <TouchableOpacity
            style={styles.markResolvedBtn}
            onPress={onResolvePress}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Mark question as resolved"
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

        {thread.isResolved && (
          <View style={styles.resolvedStatusRow}>
            <View style={styles.resolvedBadge}>
              <Feather
                name="check-circle"
                size={13}
                color={BENTO_COLORS.emerald}
                style={styles.resolvedBadgeIcon}
              />
              <Text style={styles.resolvedBadgeText}>Resolved</Text>
            </View>
            {canManage && (
              <TouchableOpacity
                style={styles.reopenBtn}
                onPress={onResolvePress}
                hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Reopen this discussion"
              >
                <Feather
                  name="rotate-ccw"
                  size={12}
                  color={BENTO_COLORS.primaryBlue}
                  style={styles.reopenIcon}
                />
                <Text style={styles.reopenBtnText}>Reopen Discussion</Text>
              </TouchableOpacity>
            )}
          </View>
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
    borderColor: BENTO_COLORS.cardBorder,
    marginBottom: 16,
    ...BENTO_COLORS.shadow,
  },
  cardResolved: {
    backgroundColor: colors.semantic.emerald.softSurface,
    borderColor: colors.semantic.emerald.mintBorder,
    elevation: 0,
    shadowOpacity: 0,
  },
  title: {
    fontFamily: titleFontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    lineHeight: 26,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  moderationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.semantic.amber.soft,
    borderColor: colors.semantic.amber.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  moderationBannerText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: colors.semantic.amber.deep,
    flex: 1,
    lineHeight: 17,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarSpacing: {
    marginRight: 12,
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
    backgroundColor: colors.semantic.blue.alpha08,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  authorTagText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
    color: BENTO_COLORS.primaryBlue,
    includeFontPadding: false,
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
    fontVariant: ["tabular-nums"],
  },
  editedInline: {
    fontFamily,
    fontStyle: "italic",
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
  },
  divider: {
    height: 1,
    backgroundColor: BENTO_COLORS.subtleBorder,
    marginBottom: 14,
  },
  dividerResolved: {
    backgroundColor: colors.semantic.emerald.alpha15,
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
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  resolveIcon: {
    marginRight: 6,
  },
  markResolvedBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: colors.white,
    includeFontPadding: false,
  },
  resolvedStatusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 4,
    paddingTop: 8,
  },
  resolvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.semantic.emerald.alpha15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  resolvedBadgeIcon: {
    marginRight: 5,
  },
  resolvedBadgeText: {
    fontFamily,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700",
    color: BENTO_COLORS.emerald,
    includeFontPadding: false,
  },
  reopenBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.semantic.blue.alpha08,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  reopenIcon: {
    marginRight: 5,
  },
  reopenBtnText: {
    fontFamily,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700",
    color: BENTO_COLORS.primaryBlue,
    includeFontPadding: false,
  },
  responsesHeaderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  responsesTitle: {
    fontFamily: titleFontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    fontVariant: ["tabular-nums"],
  },
  responsesSubtitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
  },
});
