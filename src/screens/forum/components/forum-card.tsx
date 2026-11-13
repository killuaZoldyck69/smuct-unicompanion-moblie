import React, { memo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { BENTO_COLORS, fontFamily, titleFontFamily } from "../constants";
import { RichTextSnippet } from "@/screens/campus-hub/shared/rich-text-snippet";
import type { ForumPostItem } from "../types";
import {
  timeAgo,
  getAuthorAcademicInfo,
  formatTimeOnly,
  isEdited,
} from "../utils";
import { ForumAuthorSubtitle, ForumAvatar } from "./forum-avatar";

interface ForumCardProps {
  item: ForumPostItem;
  onPress: (id: string) => void;
  isAdmin?: boolean;
  currentUserId?: string;
  onResolve?: (id: string, title: string, isResolved: boolean) => void;
  onDelete?: (id: string, title: string) => void;
  onReport?: (item: ForumPostItem) => void;
}

export const ForumCard = memo(function ForumCard({
  item,
  onPress,
  isAdmin = false,
  currentUserId,
  onResolve,
  onDelete,
  onReport,
}: ForumCardProps) {
  const isResolved = item.isResolved;
  const isAuthor = Boolean(currentUserId && currentUserId === item.authorId);
  const canManage = isAdmin || isAuthor;
  const canModerateOthers = !isAuthor && Boolean(onReport);
  const showMenu = canManage || canModerateOthers;
  const replyCount = item._count?.responses || item.responses?.length || 0;
  const authorName = item.author?.name || "University Member";
  const formattedTime = timeAgo(item.createdAt);
  const timeOnly = formatTimeOnly(item.createdAt);
  const academicInfo = getAuthorAcademicInfo(item.author);
  const academicSubtitle = academicInfo.fullText;
  const postEdited = isEdited(item.createdAt, item.updatedAt);

  const buttonRef = useRef<View>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 16 });

  const handleOpenMenu = () => {
    if (buttonRef.current) {
      buttonRef.current.measureInWindow((x, y, width, height) => {
        const windowWidth = Dimensions.get("window").width;
        const windowHeight = Dimensions.get("window").height;
        const right = Math.max(16, windowWidth - (x + width));
        // Flip menu upward when near bottom viewport edge (~95px menu height)
        const top =
          y + height + 100 > windowHeight - 40 ? Math.max(40, y - 95) : y + height + 4;
        setMenuPosition({ top, right });
        setMenuVisible(true);
      });
    } else {
      setMenuVisible(true);
    }
  };

  return (
    <View
      style={[
        styles.cardContainer,
        isResolved && styles.cardContainerResolved,
      ]}
    >
      <View style={styles.cardClip}>
        <Pressable
          style={({ pressed }) => [
            styles.cardPressable,
            pressed && Platform.OS === "ios" && { opacity: 0.85 },
          ]}
          android_ripple={{ color: colors.navyAlpha06 }}
          onPress={() => onPress(item.id)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Discussion: ${item.title}. Asked by ${authorName}, ${academicSubtitle}. Posted ${formattedTime} at ${timeOnly}. Status: ${
            isResolved ? "Resolved" : "Needs help"
          }. ${replyCount} ${replyCount === 1 ? "reply" : "replies"}.`}
        >
        <View style={[styles.headerRow, showMenu && styles.headerRowWithMenu]}>
          <View style={styles.authorRow}>
            <ForumAvatar
              uri={item.author?.image}
              name={authorName}
              size={36}
              fontSize={14}
              accessibilityLabel={`${authorName}'s avatar`}
              style={styles.authorAvatarSpacing}
            />
            <View style={styles.authorMeta}>
              <Text style={styles.authorName} numberOfLines={1}>
                {authorName}
              </Text>
              <ForumAuthorSubtitle
                academicInfo={academicInfo}
                style={styles.authorSubtitle}
              />
            </View>
          </View>
        </View>

        {item.isHiddenByModeration && (
          <View style={styles.moderationBanner}>
            <Feather name="shield" size={12} color={colors.semantic.amber.deep} />
            <Text style={styles.moderationBannerText}>
              Under moderator review — hidden from public feed
            </Text>
          </View>
        )}

        <Text style={styles.titleText} numberOfLines={2}>
          {item.title}
        </Text>

        {item.description ? (
          <RichTextSnippet
            text={item.description}
            numberOfLines={2}
            style={styles.descriptionText}
          />
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
            <Text
              style={styles.replyPillText}
              maxFontSizeMultiplier={1.3}
              numberOfLines={1}
            >
              {replyCount} {replyCount === 1 ? "Reply" : "Replies"}
            </Text>
          </View>

          <View style={styles.footerMetaGroup}>
            <View style={styles.activityBox}>
              <Feather
                name="clock"
                size={11}
                color={BENTO_COLORS.subtleText}
                style={styles.clockIcon}
              />
              <Text
                style={styles.timeText}
                maxFontSizeMultiplier={1.3}
                numberOfLines={1}
              >
                Posted {formattedTime} • {timeOnly}
              </Text>
            </View>
            {postEdited && (
              <Text style={styles.editedBadge} maxFontSizeMultiplier={1.3}>
                ✎ Edited
              </Text>
            )}
          </View>
        </View>
        </Pressable>
      </View>

      {showMenu && (
        <View ref={buttonRef} collapsable={false} style={styles.moreBtnWrapper}>
          <TouchableOpacity
            style={styles.moreBtn}
            onPress={handleOpenMenu}
            activeOpacity={0.65}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Discussion options"
          >
            <Feather name="more-vertical" size={18} color={BENTO_COLORS.subtleText} />
          </TouchableOpacity>
        </View>
      )}

      {/* Popover Dropdown for Authors, Admins & Community Safety Actions */}
      {showMenu && (
        <Modal
          visible={menuVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
          statusBarTranslucent={true}
        >
          <View style={styles.menuBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setMenuVisible(false)}
              accessible={false}
            />
            <View
              style={[
                styles.whatsappDropdown,
                { top: menuPosition.top, right: menuPosition.right },
              ]}
            >
              {canManage && !isResolved && (
                <>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setMenuVisible(false);
                      onResolve?.(item.id, item.title, false);
                    }}
                    activeOpacity={0.65}
                  >
                    <Feather name="check-circle" size={15} color={BENTO_COLORS.emerald} />
                    <Text style={styles.dropdownItemText}>Mark as Solved</Text>
                  </TouchableOpacity>
                  <View style={styles.dropdownDivider} />
                </>
              )}

              {canManage && isResolved && (
                <>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setMenuVisible(false);
                      onResolve?.(item.id, item.title, true);
                    }}
                    activeOpacity={0.65}
                  >
                    <Feather name="rotate-ccw" size={15} color={BENTO_COLORS.primaryBlue} />
                    <Text style={styles.dropdownItemText}>Reopen Discussion</Text>
                  </TouchableOpacity>
                  <View style={styles.dropdownDivider} />
                </>
              )}

              {canManage && (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setMenuVisible(false);
                    onDelete?.(item.id, item.title);
                  }}
                  activeOpacity={0.65}
                >
                  <Feather name="trash-2" size={15} color={BENTO_COLORS.danger} />
                  <Text style={[styles.dropdownItemText, styles.dropdownDeleteText]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              )}

              {!isAuthor && onReport && (
                <>
                  {canManage && <View style={styles.dropdownDivider} />}
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setMenuVisible(false);
                      onReport(item);
                    }}
                    activeOpacity={0.65}
                  >
                    <Feather name="flag" size={15} color={BENTO_COLORS.danger} />
                    <Text style={[styles.dropdownItemText, styles.dropdownDeleteText]}>
                      Report Post
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    position: "relative",
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    borderWidth: 1,
    borderColor: BENTO_COLORS.cardBorder,
    ...BENTO_COLORS.shadow,
  },
  cardContainerResolved: {
    backgroundColor: colors.semantic.emerald.softSurface,
    borderColor: colors.semantic.emerald.mintBorder,
    elevation: 0,
    shadowOpacity: 0,
  },
  cardClip: {
    borderRadius: BENTO_COLORS.cardRadius - 1,
    overflow: "hidden",
  },
  cardPressable: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerRowWithMenu: {
    paddingRight: 36,
  },
  moreBtnWrapper: {
    position: "absolute",
    top: 18,
    right: 16,
    zIndex: 2,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  authorAvatarSpacing: {
    marginRight: 10,
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
    fontFamily: titleFontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    lineHeight: 22,
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  moderationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.semantic.amber.soft,
    borderColor: colors.semantic.amber.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 8,
  },
  moderationBannerText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: colors.semantic.amber.deep,
    flex: 1,
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
    backgroundColor: colors.semantic.emerald.alpha15,
  },
  footerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    rowGap: 6,
    columnGap: 8,
  },
  footerMetaGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    flexShrink: 1,
    gap: 6,
  },
  replyPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slate100,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  replyPillResolved: {
    backgroundColor: BENTO_COLORS.white,
    borderWidth: 1,
    borderColor: colors.semantic.emerald.soft,
  },
  replyIcon: {
    marginRight: 5,
  },
  replyPillText: {
    fontFamily,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    includeFontPadding: false,
    fontVariant: ["tabular-nums"],
  },
  activityBox: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  clockIcon: {
    marginRight: 4,
  },
  timeText: {
    fontFamily,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    includeFontPadding: false,
    fontVariant: ["tabular-nums"],
    flexShrink: 1,
  },
  editedBadge: {
    fontFamily,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "600",
    color: colors.semantic.amber.darkText,
    includeFontPadding: false,
  },
  moreBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.slate50,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  whatsappDropdown: {
    position: "absolute",
    minWidth: 175,
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.inkAlpha08,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  dropdownItemText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "500",
    color: colors.slate800,
  },
  dropdownDeleteText: {
    color: colors.semantic.red.accent,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: colors.slate100,
    marginVertical: 2,
  },
});
