import React, { memo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  formatCampusUserSubtitle,
  formatCommentDateTime,
} from "./design-tokens";
import { AuthorProfileModalData } from "./author-modal";

export interface CommentAuthor extends AuthorProfileModalData {
  id: string;
  name: string;
  image?: string | null;
}

export interface Comment<TAuthor extends CommentAuthor = CommentAuthor> {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  author: TAuthor;
  parentId?: string | null;
  replies?: Comment<TAuthor>[];
}

export interface ReplyTarget {
  id: string;
  authorName: string;
}

function getAuthorAcademicSubtitle(author?: CommentAuthor): string | null {
  if (!author) return null;
  const subtitle = formatCampusUserSubtitle(author, "");
  return subtitle || null;
}

function isCommentEdited(createdAt?: string, updatedAt?: string): boolean {
  if (!createdAt || !updatedAt) return false;
  const created = new Date(createdAt).getTime();
  const updated = new Date(updatedAt).getTime();
  return !isNaN(created) && !isNaN(updated) && updated - created > 1000;
}

interface InlineCommentCardProps<
  TAuthor extends CommentAuthor = CommentAuthor,
> {
  comment: Comment<TAuthor>;
  currentUserId?: string;
  listingAuthorId?: string;
  accent: string;
  onStartReply: (targetId: string, authorName: string) => void;
  onStartEdit?: (comment: Comment<TAuthor>) => void;
  onDeleteComment: (comment: Comment<TAuthor>) => void;
  onReportComment?: (comment: Comment<TAuthor>) => void;
  onViewAuthorProfile?: (author: TAuthor) => void;
}

function InlineCommentCardInner<TAuthor extends CommentAuthor = CommentAuthor>({
  comment,
  currentUserId,
  listingAuthorId,
  accent,
  onStartReply,
  onStartEdit,
  onDeleteComment,
  onReportComment,
  onViewAuthorProfile,
}: InlineCommentCardProps<TAuthor>) {
  const [isRepliesExpanded, setIsRepliesExpanded] = useState(false);
  const [failedAvatarUrls, setFailedAvatarUrls] = useState<
    Record<string, boolean>
  >({});
  const replyCount = comment.replies?.length ?? 0;
  const isOwn = comment.author.id === currentUserId;
  const isListingAuthor = Boolean(
    listingAuthorId && comment.author.id === listingAuthorId,
  );
  const authorInitial = (comment.author.name ?? "U").charAt(0).toUpperCase();
  const authorSubtitle = getAuthorAcademicSubtitle(comment.author);
  const edited = isCommentEdited(comment.createdAt, comment.updatedAt);

  return (
    <View style={styles.commentCard}>
      {/* Avatar on the left */}
      <Pressable
        onPress={() => onViewAuthorProfile?.(comment.author)}
        disabled={!onViewAuthorProfile}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={({ pressed }) => [pressed && onViewAuthorProfile && { opacity: 0.75 }]}
        accessible={Boolean(onViewAuthorProfile)}
        accessibilityRole={onViewAuthorProfile ? "button" : undefined}
        accessibilityLabel={
          onViewAuthorProfile
            ? `View ${comment.author.name}'s profile`
            : undefined
        }
      >
        {comment.author.image && !failedAvatarUrls[comment.author.image] ? (
          <Image
            source={{ uri: comment.author.image }}
            style={styles.avatar}
            contentFit="cover"
            cachePolicy="memory-disk"
            onError={() => {
              const uri = comment.author.image;
              if (uri)
                setFailedAvatarUrls((prev) => ({ ...prev, [uri]: true }));
            }}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>{authorInitial}</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.commentContent}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.authorMetaCol}>
            <View style={styles.nameRow}>
              <Pressable
                onPress={() => onViewAuthorProfile?.(comment.author)}
                disabled={!onViewAuthorProfile}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                style={({ pressed }) => [pressed && onViewAuthorProfile && { opacity: 0.75 }]}
                accessible={Boolean(onViewAuthorProfile)}
                accessibilityRole={onViewAuthorProfile ? "button" : undefined}
                accessibilityLabel={
                  onViewAuthorProfile
                    ? `View ${comment.author.name}'s profile`
                    : undefined
                }
              >
                <Text style={styles.authorName} numberOfLines={1}>
                  {comment.author.name}
                </Text>
              </Pressable>
              {isListingAuthor && (
                <View
                  style={[
                    styles.sellerBadge,
                    { backgroundColor: `${accent}14` },
                  ]}
                >
                  <Text style={[styles.sellerBadgeText, { color: accent }]}>
                    Seller
                  </Text>
                </View>
              )}
            </View>
            {authorSubtitle && (
              <Text style={styles.academicSubtitle} numberOfLines={1}>
                {authorSubtitle}
              </Text>
            )}
          </View>
        </View>

        {/* Body Content */}
        <Text style={styles.commentBody}>{comment.content}</Text>

        {/* Bottom-right date-time & edited indicator */}
        <View style={styles.commentMetaBottom}>
          <Text style={styles.bottomTimeText}>
            {formatCommentDateTime(comment.createdAt)}
          </Text>
          {edited && <Text style={styles.editedTag}>(Edited)</Text>}
        </View>

        {/* Actions Row */}
        <View style={styles.actionsRow}>
          <View style={styles.leftActions}>
            {/* 3. Reply with icon and text */}
            <Pressable
              style={({ pressed }) => [
                styles.actionReplyBtn,
                { backgroundColor: `${accent}10`, borderColor: `${accent}25` },
                pressed && { opacity: 0.75 },
              ]}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
              onPress={() => {
                setIsRepliesExpanded(true);
                onStartReply(comment.id, comment.author.name);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Reply to ${comment.author.name}`}
            >
              <Feather name="corner-down-right" size={11.5} color={accent} />
              <Text style={[styles.actionReplyText, { color: accent }]}>
                Reply
              </Text>
            </Pressable>

            {/* 4. View replies with icon, text and count number */}
            {replyCount > 0 && (
              <Pressable
                style={({ pressed }) => [
                  styles.toggleRepliesBtn,
                  pressed && { opacity: 0.7 },
                ]}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                onPress={() => setIsRepliesExpanded((v) => !v)}
                hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={
                  isRepliesExpanded
                    ? `Hide ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
                    : `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
                }
              >
                <View
                  style={[
                    styles.toggleRepliesLine,
                    { backgroundColor: `${accent}40` },
                  ]}
                />
                <Feather
                  name={isRepliesExpanded ? "chevron-up" : "chevron-down"}
                  size={11.5}
                  color={accent}
                />
                <Text style={[styles.toggleRepliesText, { color: accent }]}>
                  {isRepliesExpanded
                    ? `Hide ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
                    : `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
                </Text>
              </Pressable>
            )}
          </View>

          {isOwn ? (
            <View style={styles.rightActions}>
              {/* 1. Edit (just icon) */}
              {onStartEdit && (
                <Pressable
                  style={({ pressed }) => [
                    styles.actionIconBtn,
                    {
                      backgroundColor: `${accent}12`,
                      borderColor: `${accent}25`,
                    },
                    pressed && { opacity: 0.75 },
                  ]}
                  android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                  onPress={() => onStartEdit(comment)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Edit comment"
                >
                  <Feather name="edit-2" size={12.5} color={accent} />
                </Pressable>
              )}

              {/* 2. Delete (just icon) */}
              <Pressable
                style={({ pressed }) => [
                  styles.actionIconBtn,
                  styles.actionIconBtnDanger,
                  pressed && { opacity: 0.75 },
                ]}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                onPress={() => onDeleteComment(comment)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Delete comment"
              >
                <Feather
                  name="trash-2"
                  size={12.5}
                  color={CAMPUS_HUB_COLORS.dangerText}
                />
              </Pressable>
            </View>
          ) : onReportComment ? (
            <View style={styles.rightActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionIconBtn,
                  styles.actionIconBtnReport,
                  pressed && { opacity: 0.75 },
                ]}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                onPress={() => onReportComment(comment)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Report comment"
              >
                <Feather
                  name="flag"
                  size={12}
                  color={CAMPUS_HUB_COLORS.mutedInk}
                />
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* Collapsable Nested Replies */}
        {replyCount > 0 && isRepliesExpanded && (
          <View style={styles.repliesBlock}>
            {(comment.replies || []).map((reply) => {
              const isReplyOwn = reply.author.id === currentUserId;
              const isReplySeller = Boolean(
                listingAuthorId && reply.author.id === listingAuthorId,
              );
              const replyInitial = (reply.author.name ?? "U")
                .charAt(0)
                .toUpperCase();
              const replySubtitle = getAuthorAcademicSubtitle(reply.author);
              const replyEdited = isCommentEdited(
                reply.createdAt,
                reply.updatedAt,
              );

              return (
                <View
                  key={reply.id}
                  style={[styles.replyRow, { borderLeftColor: `${accent}25` }]}
                >
                  <Pressable
                    onPress={() => onViewAuthorProfile?.(reply.author)}
                    disabled={!onViewAuthorProfile}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={({ pressed }) => [
                      pressed && onViewAuthorProfile && { opacity: 0.75 },
                    ]}
                    accessible={Boolean(onViewAuthorProfile)}
                    accessibilityRole={onViewAuthorProfile ? "button" : undefined}
                    accessibilityLabel={
                      onViewAuthorProfile
                        ? `View ${reply.author.name}'s profile`
                        : undefined
                    }
                  >
                    {reply.author.image &&
                    !failedAvatarUrls[reply.author.image] ? (
                      <Image
                        source={{ uri: reply.author.image }}
                        style={styles.replyAvatarSmall}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        onError={() => {
                          const uri = reply.author.image;
                          if (uri)
                            setFailedAvatarUrls((prev) => ({
                              ...prev,
                              [uri]: true,
                            }));
                        }}
                      />
                    ) : (
                      <View style={styles.replyAvatarFallbackSmall}>
                        <Text style={styles.replyAvatarTextSmall}>
                          {replyInitial}
                        </Text>
                      </View>
                    )}
                  </Pressable>

                  <View style={styles.replyContentSmall}>
                    <View style={styles.cardHeader}>
                      <View style={styles.authorMetaCol}>
                        <View style={styles.nameRow}>
                          <Pressable
                            onPress={() => onViewAuthorProfile?.(reply.author)}
                            disabled={!onViewAuthorProfile}
                            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                            style={({ pressed }) => [
                              pressed &&
                                onViewAuthorProfile && { opacity: 0.75 },
                            ]}
                            accessible={Boolean(onViewAuthorProfile)}
                            accessibilityRole={
                              onViewAuthorProfile ? "button" : undefined
                            }
                            accessibilityLabel={
                              onViewAuthorProfile
                                ? `View ${reply.author.name}'s profile`
                                : undefined
                            }
                          >
                            <Text
                              style={styles.replyNameSmall}
                              numberOfLines={1}
                            >
                              {reply.author.name}
                            </Text>
                          </Pressable>
                          {isReplySeller && (
                            <View
                              style={[
                                styles.sellerBadge,
                                { backgroundColor: `${accent}14` },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.sellerBadgeText,
                                  { color: accent },
                                ]}
                              >
                                Seller
                              </Text>
                            </View>
                          )}
                        </View>
                        {replySubtitle && (
                          <Text
                            style={styles.academicSubtitle}
                            numberOfLines={1}
                          >
                            {replySubtitle}
                          </Text>
                        )}
                      </View>
                    </View>

                    <Text style={styles.replyBodySmall}>{reply.content}</Text>

                    {/* Bottom-right date-time & edited indicator */}
                    <View style={styles.commentMetaBottom}>
                      <Text style={styles.bottomTimeText}>
                        {formatCommentDateTime(reply.createdAt)}
                      </Text>
                      {replyEdited && (
                        <Text style={styles.editedTag}>(Edited)</Text>
                      )}
                    </View>

                    <View style={styles.actionsRow}>
                      <View style={styles.leftActions}>
                        {/* 3. Reply with icon and text */}
                        <Pressable
                          style={({ pressed }) => [
                            styles.actionReplyBtn,
                            {
                              backgroundColor: `${accent}10`,
                              borderColor: `${accent}25`,
                            },
                            pressed && { opacity: 0.75 },
                          ]}
                          android_ripple={{
                            color: CAMPUS_HUB_COLORS.androidRipple,
                          }}
                          onPress={() =>
                            onStartReply(comment.id, reply.author.name)
                          }
                          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={`Reply to ${reply.author.name}`}
                        >
                          <Feather
                            name="corner-down-right"
                            size={11}
                            color={accent}
                          />
                          <Text
                            style={[styles.actionReplyText, { color: accent }]}
                          >
                            Reply
                          </Text>
                        </Pressable>
                      </View>

                      {isReplyOwn ? (
                        <View style={styles.rightActions}>
                          {/* 1. Edit (just icon) */}
                          {onStartEdit && (
                            <Pressable
                              style={({ pressed }) => [
                                styles.actionIconBtn,
                                {
                                  backgroundColor: `${accent}12`,
                                  borderColor: `${accent}25`,
                                },
                                pressed && { opacity: 0.75 },
                              ]}
                              android_ripple={{
                                color: CAMPUS_HUB_COLORS.androidRipple,
                              }}
                              onPress={() => onStartEdit(reply)}
                              hitSlop={{
                                top: 10,
                                bottom: 10,
                                left: 10,
                                right: 10,
                              }}
                              accessible={true}
                              accessibilityRole="button"
                              accessibilityLabel="Edit reply"
                            >
                              <Feather name="edit-2" size={12} color={accent} />
                            </Pressable>
                          )}

                          {/* 2. Delete (just icon) */}
                          <Pressable
                            style={({ pressed }) => [
                              styles.actionIconBtn,
                              styles.actionIconBtnDanger,
                              pressed && { opacity: 0.75 },
                            ]}
                            android_ripple={{
                              color: CAMPUS_HUB_COLORS.androidRipple,
                            }}
                            onPress={() => onDeleteComment(reply)}
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel="Delete reply"
                          >
                            <Feather
                              name="trash-2"
                              size={12}
                              color={CAMPUS_HUB_COLORS.dangerText}
                            />
                          </Pressable>
                        </View>
                      ) : onReportComment ? (
                        <View style={styles.rightActions}>
                          <Pressable
                            style={({ pressed }) => [
                              styles.actionIconBtn,
                              styles.actionIconBtnReport,
                              pressed && { opacity: 0.75 },
                            ]}
                            android_ripple={{
                              color: CAMPUS_HUB_COLORS.androidRipple,
                            }}
                            onPress={() => onReportComment(reply)}
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel="Report reply"
                          >
                            <Feather
                              name="flag"
                              size={11.5}
                              color={CAMPUS_HUB_COLORS.mutedInk}
                            />
                          </Pressable>
                        </View>
                      ) : null}
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
}

const InlineCommentCard = memo(InlineCommentCardInner) as <
  TAuthor extends CommentAuthor = CommentAuthor,
>(
  props: InlineCommentCardProps<TAuthor>,
) => React.ReactElement | null;

interface InlineCommentsProps<TAuthor extends CommentAuthor = CommentAuthor> {
  comments: Comment<TAuthor>[];
  currentUserId?: string;
  listingAuthorId?: string;
  accent?: string;
  onStartReply: (targetId: string, authorName: string) => void;
  onStartEdit?: (comment: Comment<TAuthor>) => void;
  onDeleteComment: (commentId: string) => void;
  onReportComment?: (comment: Comment<TAuthor>) => void;
  onViewAuthorProfile?: (author: TAuthor) => void;
}

function InlineCommentsInner<TAuthor extends CommentAuthor = CommentAuthor>({
  comments,
  currentUserId,
  listingAuthorId,
  accent = CAMPUS_HUB_COLORS.deepNavy,
  onStartReply,
  onStartEdit,
  onDeleteComment,
  onReportComment,
  onViewAuthorProfile,
}: InlineCommentsProps<TAuthor>) {
  const handleDeletePrompt = (comment: Comment<TAuthor>) => {
    Alert.alert("Delete Comment", "Remove this comment permanently?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDeleteComment(comment.id),
      },
    ]);
  };

  return (
    <View style={styles.outerContainer}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View
            style={[
              styles.sectionIconBadge,
              { backgroundColor: `${accent}18` },
            ]}
          >
            <Feather name="message-circle" size={15} color={accent} />
          </View>
          <Text style={styles.sectionTitle}>Comments</Text>
          <View style={styles.counterPill}>
            <Text style={styles.counterPillText}>{comments.length}</Text>
          </View>
        </View>
      </View>

      {/* Empty State */}
      {comments.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <Feather
              name="message-square"
              size={18}
              color={CAMPUS_HUB_COLORS.subtleText}
            />
          </View>
          <Text style={styles.emptyTitle}>No comments yet</Text>
          <Text style={styles.emptySubtext}>
            Be the first to ask or share about this listing.
          </Text>
        </View>
      ) : (
        <View style={styles.cardsList}>
          {comments.map((comment) => (
            <InlineCommentCard
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              listingAuthorId={listingAuthorId}
              accent={accent}
              onStartReply={onStartReply}
              onStartEdit={onStartEdit}
              onDeleteComment={handleDeletePrompt}
              onReportComment={onReportComment}
              onViewAuthorProfile={onViewAuthorProfile}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export const InlineComments = memo(InlineCommentsInner) as <
  TAuthor extends CommentAuthor = CommentAuthor,
>(
  props: InlineCommentsProps<TAuthor>,
) => React.ReactElement | null;

// ---------------------------------------------------------------------------
// Comment Input Bar Component
// ---------------------------------------------------------------------------
interface CommentInputBarProps {
  replyTarget: ReplyTarget | null;
  onCancelReply: () => void;
  isEditMode?: boolean;
  onCancelEdit?: () => void;
  text: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  accent?: string;
  inputRef?: React.RefObject<TextInput | null>;
  isLocked?: boolean;
  lockedMessage?: string;
}

export const CommentInputBar = memo(function CommentInputBar({
  replyTarget,
  onCancelReply,
  isEditMode = false,
  onCancelEdit,
  text,
  onChangeText,
  onSubmit,
  isSubmitting,
  accent = CAMPUS_HUB_COLORS.deepNavy,
  inputRef,
  isLocked = false,
  lockedMessage = "Comments are closed for this listing.",
}: CommentInputBarProps) {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setIsKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setIsKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (isEditMode || replyTarget) {
      setTimeout(() => inputRef?.current?.focus(), 100);
    }
  }, [isEditMode, replyTarget, inputRef]);

  const canSend = Boolean(text.trim()) && !isSubmitting;
  const idleBottomPadding = insets.bottom + (Platform.OS === "ios" ? 14 : 16);
  const bottomPadding = isKeyboardVisible ? 10 : idleBottomPadding;

  const placeholderText = isEditMode
    ? "Edit your comment..."
    : replyTarget
      ? `Reply to @${replyTarget.authorName}...`
      : "Write a comment...";

  if (isLocked && !isEditMode) {
    return (
      <View style={[styles.inputBarWrapper, { paddingBottom: bottomPadding }]}>
        <View style={styles.lockedBanner}>
          <Feather name="lock" size={14} color={CAMPUS_HUB_COLORS.subtleText} />
          <Text style={styles.lockedBannerText}>{lockedMessage}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.inputBarWrapper, { paddingBottom: bottomPadding }]}>
      {/* Editing banner */}
      {isEditMode && (
        <View style={styles.editBanner}>
          <View style={styles.bannerLeft}>
            <Feather
              name="edit-2"
              size={12}
              color={CAMPUS_HUB_COLORS.lostFoundAccentInk}
              style={styles.bannerIcon}
            />
            <Text style={styles.editBannerText}>Editing comment</Text>
          </View>
          <Pressable
            onPress={onCancelEdit}
            hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cancel edit"
          >
            <Text style={styles.editCancelText}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {/* Replying banner */}
      {!isEditMode && replyTarget && (
        <View
          style={[
            styles.replyingBanner,
            { borderColor: `${accent}30`, backgroundColor: `${accent}0c` },
          ]}
        >
          <View style={styles.bannerLeft}>
            <Feather
              name="corner-down-right"
              size={13}
              color={accent}
              style={styles.bannerIcon}
            />
            <Text style={[styles.replyingText, { color: accent }]}>
              Replying to{" "}
              <Text style={{ fontWeight: "800", color: accent }}>
                @{replyTarget.authorName}
              </Text>
            </Text>
          </View>
          <Pressable
            onPress={onCancelReply}
            style={({ pressed }) => [
              styles.cancelReplyBtn,
              pressed && { opacity: 0.7 },
            ]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cancel reply"
          >
            <Feather name="x" size={14} color={CAMPUS_HUB_COLORS.mutedInk} />
          </Pressable>
        </View>
      )}

      {/* Input Row */}
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholderText}
          placeholderTextColor={colors.slate400}
          value={text}
          onChangeText={onChangeText}
          multiline={true}
          maxLength={1000}
          editable={!isSubmitting}
          accessibilityLabel={placeholderText}
        />

        <Pressable
          style={({ pressed }) => [
            styles.sendBtn,
            canSend ? { backgroundColor: accent } : styles.sendBtnDisabled,
            pressed && canSend && { opacity: 0.85 },
          ]}
          android_ripple={
            canSend
              ? { color: CAMPUS_HUB_COLORS.androidRippleLight }
              : undefined
          }
          onPress={onSubmit}
          disabled={!canSend}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={isEditMode ? "Save edit" : "Send comment"}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={CAMPUS_HUB_COLORS.white} />
          ) : (
            <Feather
              name={isEditMode ? "check" : "send"}
              size={16}
              color={canSend ? CAMPUS_HUB_COLORS.white : colors.slate400}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
});

// ---------------------------------------------------------------------------
// Stylesheet
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  counterPill: {
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  counterPillText: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.mutedInk,
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  emptyCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.slate50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    marginBottom: 4,
  },
  emptySubtext: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
  },
  cardsList: {
    gap: 10,
  },
  commentCard: {
    flexDirection: "row",
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 14,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  commentContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    marginRight: 10,
  },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarFallbackText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  authorMetaCol: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorName: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  sellerBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  sellerBadgeText: {
    fontFamily,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "700",
    includeFontPadding: false,
  },
  academicSubtitle: {
    fontFamily,
    fontSize: 10,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 1,
  },
  commentBody: {
    fontFamily,
    fontSize: 13,
    fontWeight: "400",
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 19,
  },
  commentMetaBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
    marginTop: 4,
    marginBottom: 2,
  },
  editedTag: {
    fontFamily,
    fontSize: 10,
    fontStyle: "italic",
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  bottomTimeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "400",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
    marginLeft: 6,
  },
  actionReplyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4.5,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    borderWidth: 1,
    overflow: "hidden",
  },
  actionReplyText: {
    fontFamily,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    includeFontPadding: false,
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  actionIconBtnDanger: {
    backgroundColor: CAMPUS_HUB_COLORS.dangerBg,
    borderColor: "rgba(190, 18, 60, 0.15)",
  },
  actionIconBtnReport: {
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  lockedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  lockedBannerText: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.mutedInk,
  },
  toggleRepliesBtn: {
    flexDirection: "row",
    alignItems: "center",
    height: 28,
    paddingHorizontal: 4,
    gap: 4.5,
    borderRadius: 8,
    overflow: "hidden",
  },
  toggleRepliesLine: {
    width: 12,
    height: 1.5,
    borderRadius: 1,
  },
  toggleRepliesText: {
    fontFamily,
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "700",
    includeFontPadding: false,
  },
  repliesBlock: {
    marginTop: 10,
    paddingTop: 2,
  },
  replyRow: {
    flexDirection: "row",
    marginTop: 8,
    paddingLeft: 10,
    borderLeftWidth: 2,
  },
  replyAvatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    marginRight: 8,
  },
  replyAvatarFallbackSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  replyAvatarTextSmall: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  replyContentSmall: {
    flex: 1,
  },
  replyNameSmall: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  replyBodySmall: {
    fontFamily,
    fontSize: 12,
    fontWeight: "400",
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 18,
  },
  inputBarWrapper: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.cardBorder,
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
  },
  editBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
  },
  bannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  bannerIcon: {
    marginRight: 2,
  },
  editBannerText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.lostFoundAccentInk,
    flex: 1,
    includeFontPadding: false,
  },
  editCancelText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.dangerText,
    includeFontPadding: false,
  },
  replyingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
    borderWidth: 1,
  },
  replyingText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  cancelReplyBtn: {
    padding: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily,
    fontSize: 14,
    color: CAMPUS_HUB_COLORS.neutralText,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 10 : 12,
    paddingBottom: Platform.OS === "android" ? 10 : 12,
    minHeight: 48,
    maxHeight: 120,
    textAlignVertical: "center",
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  sendBtnDisabled: {
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
});
