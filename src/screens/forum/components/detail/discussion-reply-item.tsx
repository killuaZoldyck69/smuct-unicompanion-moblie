import React, { memo, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../../constants";
import type { ForumResponseItem, ForumAuthor } from "../../types";
import {
  timeAgo,
  getUserAcademicSubtitle,
  formatTimeOnly,
  isEdited,
  formatEditedTime,
} from "../../utils";

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
}

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
}: DiscussionReplyItemProps) {
  const [actionsVisible, setActionsVisible] = useState(false);
  const [isRepliesExpanded, setIsRepliesExpanded] = useState(false);
  const replyCount = item.replies?.length ?? 0;

  const responderName = item.responder?.name || "University Member";
  const responderInitial = responderName.charAt(0).toUpperCase() || "U";
  const responderSubtitle = getUserAcademicSubtitle(item.responder);
  const isReplyAuthor = Boolean(threadAuthorId && item.responderId === threadAuthorId);
  const isMyReply = Boolean(currentUserId && item.responderId === currentUserId);
  const canEdit = isMyReply && !isResolved;
  const canDelete = Boolean(isMyReply || isAdmin);
  const canManageReply = canEdit || canDelete;

  const replyTime = timeAgo(item.createdAt);
  const replyTimeOnly = formatTimeOnly(item.createdAt);
  const responseEdited = isEdited(item.createdAt, item.updatedAt);
  const editedLabel = responseEdited ? formatEditedTime(item.updatedAt) : null;

  return (
    <View style={styles.replyCard}>
      <TouchableOpacity
        onPress={() => onResponderPress(item.responder)}
        activeOpacity={0.75}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Responder: ${responderName}`}
      >
        {item.responder?.image ? (
          <Image
            source={{ uri: item.responder.image }}
            style={styles.replyAvatar}
          />
        ) : (
          <View style={styles.replyAvatarFallback}>
            <Text style={styles.replyAvatarText}>{responderInitial}</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.replyContent}>
        <View style={styles.replyHeader}>
          <View style={styles.replyMetaCol}>
            <View style={styles.nameTagRow}>
              <Text style={styles.replyName} numberOfLines={1}>
                {responderName}
              </Text>
              {isReplyAuthor && (
                <View style={styles.replyAuthorBadge}>
                  <Text style={styles.replyAuthorBadgeText}>Author</Text>
                </View>
              )}
            </View>
            <Text style={styles.replySubtitle} numberOfLines={1}>
              {responderSubtitle}
            </Text>
          </View>

          <View style={styles.replyHeaderRight}>
            <Text style={styles.replyTime}>
              {replyTime} • {replyTimeOnly}
            </Text>
            {canManageReply && (
              <TouchableOpacity
                onPress={() => setActionsVisible((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Response options"
                style={styles.moreBtn}
              >
                <Feather
                  name={actionsVisible ? "chevron-up" : "more-horizontal"}
                  size={15}
                  color={BENTO_COLORS.subtleText}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.replyBody}>{item.content}</Text>

        {editedLabel && (
          <Text style={styles.editedLabel}>✎ Edited {editedLabel}</Text>
        )}

        {/* Action Row */}
        {((!isResolved && onStartReply) ||
          (actionsVisible && canManageReply) ||
          replyCount > 0) && (
          <View style={styles.actionsRow}>
            {!isResolved && onStartReply && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  setIsRepliesExpanded(true);
                  onStartReply(item.id, responderName);
                }}
                activeOpacity={0.75}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Reply to ${responderName}`}
              >
                <Feather
                  name="corner-down-right"
                  size={12}
                  color={BENTO_COLORS.primaryBlue}
                />
                <Text style={styles.actionBtnText}>Reply</Text>
              </TouchableOpacity>
            )}

            {/* View replies button beside the right side of the Reply button */}
            {replyCount > 0 && (
              <TouchableOpacity
                style={styles.toggleRepliesBtn}
                onPress={() => setIsRepliesExpanded((v) => !v)}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
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
                    ? `Hide ${replyCount === 1 ? "reply" : "replies"}`
                    : `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
                </Text>
              </TouchableOpacity>
            )}

            {actionsVisible && canManageReply && (
              <>
                {canEdit && onEditPress && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => {
                      setActionsVisible(false);
                      onEditPress(item);
                    }}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel="Edit response"
                  >
                    <Feather
                      name="edit-2"
                      size={12}
                      color={BENTO_COLORS.primaryBlue}
                    />
                    <Text style={styles.actionBtnText}>Edit</Text>
                  </TouchableOpacity>
                )}
                {canDelete && onDeletePress && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnDanger]}
                    onPress={() => {
                      setActionsVisible(false);
                      onDeletePress(item);
                    }}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel="Delete response"
                  >
                    <Feather
                      name="trash-2"
                      size={12}
                      color={BENTO_COLORS.danger}
                    />
                    <Text
                      style={[
                        styles.actionBtnText,
                        styles.actionBtnTextDanger,
                      ]}
                    >
                      Delete
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {/* Collapsable Nested Replies */}
        {replyCount > 0 && isRepliesExpanded && (
          <View style={styles.repliesBlock}>
            {(item.replies || []).map((reply) => {
              const replyResponderName =
                reply.responder?.name || "University Member";
              const replyResponderInitial =
                replyResponderName.charAt(0).toUpperCase() || "U";
              const replyResponderSubtitle = getUserAcademicSubtitle(
                reply.responder
              );
              const isReplyFromThreadAuthor = Boolean(
                threadAuthorId && reply.responderId === threadAuthorId
              );
              const isMyNestedReply = Boolean(
                currentUserId && reply.responderId === currentUserId
              );
              const canEditReply = isMyNestedReply && !isResolved;
              const canDeleteReply = Boolean(isMyNestedReply || isAdmin);
              const replyEdited = isEdited(reply.createdAt, reply.updatedAt);
              const nestedEditedLabel = replyEdited
                ? formatEditedTime(reply.updatedAt)
                : null;

              return (
                <View key={reply.id} style={styles.replyRow}>
                  <TouchableOpacity
                    onPress={() => onResponderPress(reply.responder)}
                    activeOpacity={0.75}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Responder: ${replyResponderName}`}
                  >
                    {reply.responder?.image ? (
                      <Image
                        source={{ uri: reply.responder.image }}
                        style={styles.replyAvatarSmall}
                      />
                    ) : (
                      <View style={styles.replyAvatarFallbackSmall}>
                        <Text style={styles.replyAvatarTextSmall}>
                          {replyResponderInitial}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={styles.replyContentSmall}>
                    <View style={styles.replyHeader}>
                      <View style={styles.replyMetaCol}>
                        <View style={styles.nameTagRow}>
                          <Text style={styles.replyNameSmall} numberOfLines={1}>
                            {replyResponderName}
                          </Text>
                          {isReplyFromThreadAuthor && (
                            <View style={styles.replyAuthorBadge}>
                              <Text style={styles.replyAuthorBadgeText}>
                                Author
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.replySubtitle} numberOfLines={1}>
                          {replyResponderSubtitle}
                        </Text>
                      </View>

                      <Text style={styles.replyTime}>
                        {timeAgo(reply.createdAt)}
                      </Text>
                    </View>

                    <Text style={styles.replyBodySmall}>{reply.content}</Text>

                    {nestedEditedLabel && (
                      <Text style={styles.editedLabel}>
                        ✎ Edited {nestedEditedLabel}
                      </Text>
                    )}

                    <View style={styles.actionsRow}>
                      {!isResolved && onStartReply && (
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() =>
                            onStartReply(item.id, replyResponderName)
                          }
                          activeOpacity={0.75}
                          accessibilityRole="button"
                          accessibilityLabel={`Reply to ${replyResponderName}`}
                        >
                          <Feather
                            name="corner-down-right"
                            size={11}
                            color={BENTO_COLORS.primaryBlue}
                          />
                          <Text style={styles.actionBtnText}>Reply</Text>
                        </TouchableOpacity>
                      )}

                      {canEditReply && onEditPress && (
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => onEditPress(reply)}
                          activeOpacity={0.75}
                          accessibilityRole="button"
                          accessibilityLabel="Edit reply"
                        >
                          <Feather
                            name="edit-2"
                            size={11}
                            color={BENTO_COLORS.primaryBlue}
                          />
                          <Text style={styles.actionBtnText}>Edit</Text>
                        </TouchableOpacity>
                      )}

                      {canDeleteReply && onDeletePress && (
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.actionBtnDanger]}
                          onPress={() => onDeletePress(reply)}
                          activeOpacity={0.75}
                          accessibilityRole="button"
                          accessibilityLabel="Delete reply"
                        >
                          <Feather
                            name="trash-2"
                            size={11}
                            color={BENTO_COLORS.danger}
                          />
                          <Text
                            style={[
                              styles.actionBtnText,
                              styles.actionBtnTextDanger,
                            ]}
                          >
                            Delete
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
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
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BENTO_COLORS.slateBg,
    marginRight: 10,
  },
  replyAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BENTO_COLORS.slateBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  replyAvatarText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
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
  replyAuthorBadge: {
    marginLeft: 6,
    backgroundColor: "rgba(30, 58, 138, 0.08)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  replyAuthorBadgeText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "700",
    color: BENTO_COLORS.primaryBlue,
  },
  replySubtitle: {
    fontFamily,
    fontSize: 10,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },
  replyTime: {
    fontFamily,
    fontSize: 11,
    fontWeight: "400",
    color: BENTO_COLORS.subtleText,
  },
  replyHeaderRight: {
    alignItems: "flex-end",
  },
  moreBtn: {
    padding: 2,
    marginTop: 4,
  },
  replyBody: {
    fontFamily,
    fontSize: 13,
    fontWeight: "400",
    color: BENTO_COLORS.neutralText,
    lineHeight: 19,
  },
  editedLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "500",
    color: "#92400e",
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: BENTO_COLORS.subtleBorder,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(30, 58, 138, 0.06)",
    borderRadius: BENTO_COLORS.pillRadius,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(30, 58, 138, 0.12)",
  },
  actionBtnDanger: {
    backgroundColor: BENTO_COLORS.dangerBg,
    borderColor: "rgba(190, 18, 60, 0.12)",
  },
  actionBtnText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.primaryBlue,
  },
  actionBtnTextDanger: {
    color: BENTO_COLORS.danger,
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
  replyAvatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: BENTO_COLORS.slateBg,
    marginRight: 8,
  },
  replyAvatarFallbackSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: BENTO_COLORS.slateBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  replyAvatarTextSmall: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  replyContentSmall: {
    flex: 1,
  },
  replyNameSmall: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  replyBodySmall: {
    fontFamily,
    fontSize: 12,
    fontWeight: "400",
    color: BENTO_COLORS.neutralText,
    lineHeight: 18,
  },
});
