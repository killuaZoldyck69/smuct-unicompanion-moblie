import React, { memo } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../../constants";
import { RichNoticeText } from "@/screens/notices/components/rich-notice-text";
import type { ForumPostItem, ForumAuthor } from "../../types";
import {
  getUserAcademicSubtitle,
  getAuthorAcademicInfo,
  formatPostedTime,
  isEdited,
} from "../../utils";

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
  const authorInitial = authorName.charAt(0).toUpperCase() || "U";
  const authorAcademic = getAuthorAcademicInfo(thread.author);
  const authorSubtitle = authorAcademic.fullText;
  const fullPostedTime = formatPostedTime(thread.createdAt);
  const threadEdited = isEdited(thread.createdAt, thread.updatedAt);
  const responsesCount = thread.responses?.length || 0;

  return (
    <View style={styles.container}>
      <View style={[styles.card, thread.isResolved && styles.cardResolved]}>
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
            {authorAcademic.isStudent && authorAcademic.semesterNum ? (
              <Text style={styles.authorSubtitle} numberOfLines={1}>
                {authorAcademic.semesterNum}
                <Text style={styles.superscript}>
                  {authorAcademic.superSuffix}
                </Text>
                {` Semester • ${authorAcademic.deptShort}`}
              </Text>
            ) : (
              <Text style={styles.authorSubtitle} numberOfLines={1}>
                {authorSubtitle}
              </Text>
            )}
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
    borderColor: BENTO_COLORS.subtleBorder,
    marginBottom: 16,
    ...BENTO_COLORS.shadow,
  },
  cardResolved: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BENTO_COLORS.slateBg,
    marginRight: 12,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BENTO_COLORS.slateBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontFamily,
    fontSize: 18,
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
  superscript: {
    fontFamily,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
  },
  timestampText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "400",
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
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
    backgroundColor: "rgba(16, 185, 129, 0.16)",
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
  resolvedStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 8,
  },
  resolvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
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
    fontWeight: "700",
    color: BENTO_COLORS.emerald,
  },
  reopenBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 58, 138, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  reopenIcon: {
    marginRight: 5,
  },
  reopenBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.primaryBlue,
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
