import React, { memo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";
import { RichTextSnippet } from "@/screens/campus-hub/shared/rich-text-snippet";
import type { ForumPostItem } from "../types";
import {
  timeAgo,
  getUserAcademicSubtitle,
  getAuthorAcademicInfo,
  formatTimeOnly,
  isEdited,
} from "../utils";

interface ForumCardProps {
  item: ForumPostItem;
  onPress: (id: string) => void;
  isAdmin?: boolean;
  currentUserId?: string;
  onResolve?: (id: string, title: string, isResolved: boolean) => void;
  onDelete?: (id: string, title: string) => void;
}

export const ForumCard = memo(function ForumCard({
  item,
  onPress,
  isAdmin = false,
  currentUserId,
  onResolve,
  onDelete,
}: ForumCardProps) {
  const isResolved = item.isResolved;
  const isAuthor = Boolean(currentUserId && currentUserId === item.authorId);
  const canManage = isAdmin || isAuthor;
  const replyCount = item._count?.responses || item.responses?.length || 0;
  const authorName = item.author?.name || "University Member";
  const authorInitial = authorName.charAt(0).toUpperCase() || "U";
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
        // Dropdown menu height is ~95px. If too close to bottom, open upward
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
            {academicInfo.isStudent && academicInfo.semesterNum ? (
              <Text style={styles.authorSubtitle} numberOfLines={1}>
                {academicInfo.semesterNum}
                <Text style={styles.superscript}>
                  {academicInfo.superSuffix}
                </Text>
                {` Semester • ${academicInfo.deptShort}`}
              </Text>
            ) : (
              <Text style={styles.authorSubtitle} numberOfLines={1}>
                {academicSubtitle}
              </Text>
            )}
          </View>
        </View>

        {canManage && (
          <View ref={buttonRef} collapsable={false}>
            <TouchableOpacity
              style={styles.moreBtn}
              onPress={(e) => {
                e.stopPropagation?.();
                handleOpenMenu();
              }}
              activeOpacity={0.65}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Discussion options"
            >
              <Feather name="more-vertical" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Popover Dropdown for Authors and Admins */}
      {canManage && (
        <Modal
          visible={menuVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
          statusBarTranslucent={true}
        >
          <TouchableOpacity
            style={styles.menuBackdrop}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View
              style={[
                styles.whatsappDropdown,
                { top: menuPosition.top, right: menuPosition.right },
              ]}
              onStartShouldSetResponder={() => true}
            >
              {!isResolved ? (
                <>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setMenuVisible(false);
                      onResolve?.(item.id, item.title, false);
                    }}
                    activeOpacity={0.65}
                  >
                    <Feather name="check-circle" size={15} color="#16a34a" />
                    <Text style={styles.dropdownItemText}>Mark as Solved</Text>
                  </TouchableOpacity>
                  <View style={styles.dropdownDivider} />
                </>
              ) : (
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

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setMenuVisible(false);
                  onDelete?.(item.id, item.title);
                }}
                activeOpacity={0.65}
              >
                <Feather name="trash-2" size={15} color="#dc2626" />
                <Text style={[styles.dropdownItemText, styles.dropdownDeleteText]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
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
  superscript: {
    fontFamily,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
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
  moreBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  whatsappDropdown: {
    position: "absolute",
    minWidth: 175,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  dropdownItemText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "500",
    color: "#1e293b",
  },
  dropdownDeleteText: {
    color: "#dc2626",
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 2,
  },
});
