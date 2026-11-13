import React, { memo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { BENTO_COLORS, fontFamily } from "../../constants";
import type {
  ForumAuthor,
  ForumResponseItem,
  ForumResponseReactionType,
} from "../../types";
import {
  formatTimeOnly,
  getAuthorAcademicInfo,
  isEdited,
  timeAgo,
} from "../../utils";
import { ForumAuthorSubtitle, ForumAvatar } from "../forum-avatar";

interface DiscussionReplyItemProps {
  item: ForumResponseItem;
  threadAuthorId?: string;
  currentUserId?: string;
  isAdmin?: boolean;
  isResolved?: boolean;
  onResponderPress: (responder: ForumAuthor) => void;
  onStartReply?: (targetId: string, authorName: string) => void;
  onEditPress?: (item: ForumResponseItem) => void;
  onDeletePress?: (item: ForumResponseItem) => void;
  onReactPress?: (
    item: ForumResponseItem,
    type: ForumResponseReactionType,
  ) => void;
  onReportPress?: (item: ForumResponseItem) => void;
}

interface ReactionPillGroupProps {
  item: ForumResponseItem;
  compact: boolean;
  onReact: (item: ForumResponseItem, type: ForumResponseReactionType) => void;
}

const ReactionPillGroup = memo(function ReactionPillGroup({
  item,
  compact,
  onReact,
}: ReactionPillGroupProps) {
  const likesCount = item.likesCount ?? 0;
  const dislikesCount = item.dislikesCount ?? 0;
  const userReaction = item.userReaction ?? null;
  const iconSize = compact ? 11 : 12;
  const subject = compact ? "reply" : "response";

  return (
    <View style={styles.reactionGroup}>
      <TouchableOpacity
        style={[
          styles.reactionPill,
          compact && styles.reactionPillSmall,
          userReaction === "LIKE" && styles.reactionPillLiked,
        ]}
        onPress={() => onReact(item, "LIKE")}
        activeOpacity={0.75}
        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        accessible={true}
        accessibilityRole="button"
        accessibilityState={{ selected: userReaction === "LIKE" }}
        accessibilityLabel={`Like ${subject}, ${likesCount} likes`}
      >
        <Feather
          name="thumbs-up"
          size={iconSize}
          color={
            userReaction === "LIKE"
              ? BENTO_COLORS.primaryBlue
              : BENTO_COLORS.subtleText
          }
        />
        {likesCount > 0 && (
          <Text
            style={[
              styles.reactionCount,
              userReaction === "LIKE" && styles.reactionCountLiked,
            ]}
          >
            {likesCount}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.reactionPill,
          compact && styles.reactionPillSmall,
          userReaction === "DISLIKE" && styles.reactionPillDisliked,
        ]}
        onPress={() => onReact(item, "DISLIKE")}
        activeOpacity={0.75}
        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        accessible={true}
        accessibilityRole="button"
        accessibilityState={{ selected: userReaction === "DISLIKE" }}
        accessibilityLabel={`Dislike ${subject}, ${dislikesCount} dislikes`}
      >
        <Feather
          name="thumbs-down"
          size={iconSize}
          color={
            userReaction === "DISLIKE"
              ? BENTO_COLORS.danger
              : BENTO_COLORS.subtleText
          }
        />
        {dislikesCount > 0 && (
          <Text
            style={[
              styles.reactionCount,
              userReaction === "DISLIKE" && styles.reactionCountDisliked,
            ]}
          >
            {dislikesCount}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
});

interface ResponseRowContentProps {
  entry: ForumResponseItem;
  parentIdForReply: string;
  compact: boolean;
  threadAuthorId?: string;
  currentUserId?: string;
  isAdmin?: boolean;
  isResolved?: boolean;
  replyCount?: number;
  isRepliesExpanded?: boolean;
  onToggleReplies?: () => void;
  onExpandReplies?: () => void;
  onResponderPress: (responder: ForumAuthor) => void;
  onStartReply?: (targetId: string, authorName: string) => void;
  onEditPress?: (item: ForumResponseItem) => void;
  onDeletePress?: (item: ForumResponseItem) => void;
  onReactPress?: (
    item: ForumResponseItem,
    type: ForumResponseReactionType,
  ) => void;
  onReportPress?: (item: ForumResponseItem) => void;
  children?: React.ReactNode;
}

const ResponseRowContent = memo(function ResponseRowContent({
  entry,
  parentIdForReply,
  compact,
  threadAuthorId,
  currentUserId,
  isAdmin,
  isResolved,
  replyCount = 0,
  isRepliesExpanded = false,
  onToggleReplies,
  onExpandReplies,
  onResponderPress,
  onStartReply,
  onEditPress,
  onDeletePress,
  onReactPress,
  onReportPress,
  children,
}: ResponseRowContentProps) {
  const responderName = entry.responder?.name || "University Member";
  const academicInfo = getAuthorAcademicInfo(entry.responder);
  const isThreadAuthor = Boolean(
    threadAuthorId && entry.responderId === threadAuthorId,
  );
  const isMine = Boolean(currentUserId && entry.responderId === currentUserId);
  const canEdit = isMine && !isResolved;
  const canDelete = Boolean(isMine || isAdmin);
  const canReport = !isMine && Boolean(onReportPress);
  const hasRightActions = Boolean(
    (canEdit && onEditPress) ||
      (canDelete && onDeletePress) ||
      (canReport && onReportPress),
  );
  const showActionsBar =
    compact ||
    Boolean(
      onReactPress ||
        (!isResolved && onStartReply) ||
        replyCount > 0 ||
        hasRightActions,
    );
  const noun = compact ? "reply" : "response";

  return (
    <View style={compact ? styles.replyRow : styles.replyCard}>
      <TouchableOpacity
        onPress={() => onResponderPress(entry.responder)}
        activeOpacity={0.75}
        hitSlop={
          compact
            ? { top: 11, bottom: 11, left: 11, right: 11 }
            : { top: 8, bottom: 8, left: 8, right: 8 }
        }
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`View profile of ${responderName}`}
      >
        <ForumAvatar
          uri={entry.responder?.image}
          name={responderName}
          size={compact ? 26 : 32}
          fontSize={compact ? 10 : 13}
          style={compact ? styles.avatarMarginSmall : styles.avatarMarginRegular}
        />
      </TouchableOpacity>

      <View style={styles.replyContent}>
        <View style={styles.replyHeader}>
          <View style={styles.replyMetaCol}>
            <View style={styles.nameTagRow}>
              <Text
                style={compact ? styles.replyNameSmall : styles.replyName}
                numberOfLines={1}
              >
                {responderName}
              </Text>
              {isThreadAuthor && (
                <View style={styles.replyAuthorBadge}>
                  <Text style={styles.replyAuthorBadgeText}>Author</Text>
                </View>
              )}
            </View>
            <ForumAuthorSubtitle
              academicInfo={academicInfo}
              style={styles.replySubtitle}
              superscriptStyle={styles.superscript}
            />
          </View>
        </View>

        <Text style={compact ? styles.replyBodySmall : styles.replyBody}>
          {entry.content}
        </Text>

        <View style={styles.commentTimeWrap}>
          <Text
            style={
              compact ? styles.commentTimeTextSmall : styles.commentTimeText
            }
          >
            {timeAgo(entry.createdAt)} • {formatTimeOnly(entry.createdAt)}
            {isEdited(entry.createdAt, entry.updatedAt) && (
              <Text style={compact ? styles.editedTextSmall : styles.editedText}>
                {" "}
                (Edited)
              </Text>
            )}
          </Text>
        </View>

        {showActionsBar && (
          <View style={styles.actionsRow}>
            <View style={styles.leftActions}>
              {onReactPress && (
                <ReactionPillGroup
                  item={entry}
                  compact={compact}
                  onReact={onReactPress}
                />
              )}

              {!isResolved && onStartReply && (
                <TouchableOpacity
                  style={styles.actionReplyBtn}
                  onPress={() => {
                    onExpandReplies?.();
                    onStartReply(parentIdForReply, responderName);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                  activeOpacity={0.75}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Reply to ${responderName}`}
                >
                  <Feather
                    name="corner-down-right"
                    size={compact ? 11 : 12}
                    color={BENTO_COLORS.primaryBlue}
                  />
                  <Text style={styles.actionReplyText}>Reply</Text>
                </TouchableOpacity>
              )}

              {!compact && replyCount > 0 && onToggleReplies && (
                <TouchableOpacity
                  style={styles.toggleRepliesBtn}
                  onPress={onToggleReplies}
                  hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isRepliesExpanded }}
                  accessibilityLabel={
                    isRepliesExpanded
                      ? `Hide ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
                      : `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
                  }
                >
                  <View style={styles.toggleRepliesLine} />
                  <Feather
                    name={isRepliesExpanded ? "chevron-up" : "chevron-down"}
                    size={12}
                    color={BENTO_COLORS.primaryBlue}
                  />
                  <Text style={styles.toggleRepliesText}>
                    {isRepliesExpanded
                      ? `Hide ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
                      : `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {hasRightActions && (
              <View style={styles.rightActions}>
                {canReport && onReportPress && (
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => onReportPress(entry)}
                    activeOpacity={0.75}
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Report ${noun}`}
                  >
                    <Feather
                      name="flag"
                      size={compact ? 11 : 12}
                      color={BENTO_COLORS.subtleText}
                    />
                  </TouchableOpacity>
                )}

                {canEdit && onEditPress && (
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => onEditPress(entry)}
                    activeOpacity={0.75}
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${noun}`}
                  >
                    <Feather
                      name="edit-2"
                      size={compact ? 12 : 13}
                      color={BENTO_COLORS.primaryBlue}
                    />
                  </TouchableOpacity>
                )}

                {canDelete && onDeletePress && (
                  <TouchableOpacity
                    style={[styles.actionIconBtn, styles.actionIconBtnDanger]}
                    onPress={() => onDeletePress(entry)}
                    activeOpacity={0.75}
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${noun}`}
                  >
                    <Feather
                      name="trash-2"
                      size={compact ? 12 : 13}
                      color={BENTO_COLORS.danger}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {children}
      </View>
    </View>
  );
});

export const DiscussionReplyItem = memo(function DiscussionReplyItem({
  item,
  threadAuthorId,
  currentUserId,
  isAdmin,
  isResolved,
  onResponderPress,
  onStartReply,
  onEditPress,
  onDeletePress,
  onReactPress,
  onReportPress,
}: DiscussionReplyItemProps) {
  const [isRepliesExpanded, setIsRepliesExpanded] = useState(false);
  const replyCount = item.replies?.length ?? 0;

  return (
    <ResponseRowContent
      entry={item}
      parentIdForReply={item.id}
      compact={false}
      threadAuthorId={threadAuthorId}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
      isResolved={isResolved}
      replyCount={replyCount}
      isRepliesExpanded={isRepliesExpanded}
      onToggleReplies={() => setIsRepliesExpanded((v) => !v)}
      onExpandReplies={() => setIsRepliesExpanded(true)}
      onResponderPress={onResponderPress}
      onStartReply={onStartReply}
      onEditPress={onEditPress}
      onDeletePress={onDeletePress}
      onReactPress={onReactPress}
      onReportPress={onReportPress}
    >
      {replyCount > 0 && isRepliesExpanded && (
        <View style={styles.repliesBlock}>
          {(item.replies || []).map((reply) => (
            <ResponseRowContent
              key={reply.id}
              entry={reply}
              parentIdForReply={item.id}
              compact={true}
              threadAuthorId={threadAuthorId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              isResolved={isResolved}
              onResponderPress={onResponderPress}
              onStartReply={onStartReply}
              onEditPress={onEditPress}
              onDeletePress={onDeletePress}
              onReactPress={onReactPress}
              onReportPress={onReportPress}
            />
          ))}
        </View>
      )}
    </ResponseRowContent>
  );
});

const styles = StyleSheet.create({
  replyCard: {
    flexDirection: "row",
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 14,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    marginBottom: 10,
    ...BENTO_COLORS.shadow,
  },
  avatarMarginRegular: {
    marginRight: 10,
  },
  avatarMarginSmall: {
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  replyMetaCol: {
    flex: 1,
    marginRight: 8,
  },
  nameTagRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  replyName: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  replyNameSmall: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  replyAuthorBadge: {
    marginLeft: 6,
    backgroundColor: colors.semantic.blue.alpha08,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  replyAuthorBadgeText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
    color: BENTO_COLORS.primaryBlue,
    includeFontPadding: false,
  },
  replySubtitle: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },
  replyBody: {
    fontFamily,
    fontSize: 13,
    fontWeight: "400",
    color: BENTO_COLORS.neutralText,
    lineHeight: 19,
  },
  replyBodySmall: {
    fontFamily,
    fontSize: 12,
    fontWeight: "400",
    color: BENTO_COLORS.neutralText,
    lineHeight: 18,
  },
  commentTimeWrap: {
    alignSelf: "flex-end",
    marginTop: 4,
    marginBottom: 2,
  },
  commentTimeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    includeFontPadding: false,
    fontVariant: ["tabular-nums"],
  },
  editedText: {
    fontFamily,
    fontStyle: "italic",
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
  },
  commentTimeTextSmall: {
    fontFamily,
    fontSize: 10,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    includeFontPadding: false,
    fontVariant: ["tabular-nums"],
  },
  editedTextSmall: {
    fontFamily,
    fontStyle: "italic",
    fontSize: 10,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
  },
  superscript: {
    fontFamily,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
    includeFontPadding: false,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: BENTO_COLORS.subtleBorder,
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: 8,
  },
  actionReplyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(30, 58, 138, 0.05)",
    borderRadius: BENTO_COLORS.pillRadius,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(30, 58, 138, 0.1)",
  },
  actionReplyText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.primaryBlue,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(30, 58, 138, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(30, 58, 138, 0.08)",
  },
  actionIconBtnDanger: {
    backgroundColor: BENTO_COLORS.dangerBg,
    borderColor: "rgba(190, 18, 60, 0.12)",
  },
  toggleRepliesBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 4,
    gap: 5,
  },
  toggleRepliesLine: {
    width: 14,
    height: 1.5,
    backgroundColor: "rgba(30, 58, 138, 0.3)",
    borderRadius: 1,
  },
  toggleRepliesText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.primaryBlue,
  },
  repliesBlock: {
    marginTop: 8,
    paddingTop: 2,
  },
  replyRow: {
    flexDirection: "row",
    marginTop: 8,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(30, 58, 138, 0.15)",
  },
  reactionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reactionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: BENTO_COLORS.slateBg,
    borderWidth: 1,
    borderColor: "transparent",
  },
  reactionPillSmall: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  reactionPillLiked: {
    backgroundColor: colors.semantic.blue.tint,
    borderColor: colors.semantic.blue.border,
  },
  reactionPillDisliked: {
    backgroundColor: BENTO_COLORS.dangerBg,
    borderColor: colors.semantic.rose.border,
  },
  reactionCount: {
    fontFamily,
    fontSize: 11.5,
    lineHeight: 14,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
    includeFontPadding: false,
    fontVariant: ["tabular-nums"],
  },
  reactionCountLiked: {
    color: BENTO_COLORS.primaryBlue,
  },
  reactionCountDisliked: {
    color: BENTO_COLORS.danger,
  },
});
