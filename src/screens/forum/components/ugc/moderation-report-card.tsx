import React, { memo } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { ForumAuthor } from "@/features/forum/types";
import type {
  AdminForumReportItem,
  AdminModerationAction,
  UgcReportTargetType,
} from "@/services/ugc-service";
import { colors } from "@/theme/colors";
import { BENTO_COLORS, fontFamily } from "../../constants";
import { getAuthorAcademicInfo, timeAgo } from "../../utils";
import { ForumAvatar } from "../forum-avatar";

interface ModerationReportCardProps {
  report: AdminForumReportItem;
  currentUserId?: string;
  adminNote: string;
  isSubmitting: boolean;
  onChangeNote: (reportId: string, note: string) => void;
  onSelectAuthor: (author: ForumAuthor) => void;
  onOpenPost: (postId: string, targetType: UgcReportTargetType) => void;
  onExecuteAction: (
    report: AdminForumReportItem,
    action: AdminModerationAction,
    confirmTitle: string,
    confirmMessage: string,
  ) => void;
}

export const ModerationReportCard = memo(function ModerationReportCard({
  report,
  currentUserId,
  adminNote,
  isSubmitting,
  onChangeNote,
  onSelectAuthor,
  onOpenPost,
  onExecuteAction,
}: ModerationReportCardProps) {
  const isPendingReport = report.status === "PENDING";
  const live = report.targetLive;
  const snapshot = report.targetSnapshot;
  const author = report.targetAuthor;
  const authorName = author?.name || "Deleted User";
  const authorAcademic = author ? getAuthorAcademicInfo(author).fullText : "";
  const previewTitle =
    live?.title || snapshot?.title || live?.postTitle || null;
  const previewBody = live?.contentPreview || snapshot?.contentPreview || "";
  const isDeleted = report.targetExists === false;
  const resolvedPostId =
    report.targetType === "LOST_FOUND_POST"
      ? report.targetId || live?.id || null
      : report.postId || live?.postId || snapshot?.postId || null;
  const canOpenThread = Boolean(resolvedPostId && !isDeleted);
  const canRestrictAuthor = Boolean(
    author &&
    author.role !== "ADMIN" &&
    !author.isRestricted &&
    author.id !== currentUserId,
  );
  const multiReportCount = report.uniquePendingReportCount ?? 0;
  const hideDisabled = isSubmitting || isDeleted;
  const deleteDisabled = isSubmitting || isDeleted;
  const restrictDisabled = isSubmitting || !canRestrictAuthor;

  return (
    <View style={styles.reportCard}>
      <View style={styles.cardTop}>
        <View style={styles.badgesRow}>
          <View style={styles.reasonPill}>
            <Text style={styles.reasonPillText} maxFontSizeMultiplier={1.25}>
              {report.reason.replace(/_/g, " ")}
            </Text>
          </View>
          <View style={styles.typePill}>
            <Text style={styles.typePillText} maxFontSizeMultiplier={1.25}>
              {report.targetType === "FORUM_POST"
                ? "POST"
                : report.targetType === "LOST_FOUND_POST"
                  ? "LOST & FOUND"
                  : "RESPONSE"}
            </Text>
          </View>
          {multiReportCount > 1 && (
            <View style={styles.countPill}>
              <Text style={styles.countPillText} maxFontSizeMultiplier={1.25}>
                {multiReportCount} reports
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.timeText} maxFontSizeMultiplier={1.25}>
          {timeAgo(report.createdAt)}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.authorCard,
          pressed && Platform.OS === "ios" && { opacity: 0.78 },
        ]}
        android_ripple={author ? { color: colors.navyAlpha08 } : undefined}
        onPress={() => author && onSelectAuthor(author)}
        disabled={!author}
        accessible={true}
        accessibilityRole={author ? "button" : "text"}
        accessibilityState={{ disabled: !author }}
        accessibilityLabel={`Content owner ${authorName}`}
      >
        <ForumAvatar
          uri={author?.image}
          name={authorName}
          size={36}
          backgroundColor={colors.semantic.blue.soft}
          textColor={BENTO_COLORS.primaryBlue}
          fontSize={14}
          fontWeight="800"
        />
        <View style={styles.authorMeta}>
          <View style={styles.authorNameRow}>
            <Text style={styles.authorName} numberOfLines={1}>
              {authorName}
            </Text>
            {author?.role && (
              <View style={styles.roleChip}>
                <Text style={styles.roleChipText} maxFontSizeMultiplier={1.2}>
                  {author.role}
                </Text>
              </View>
            )}
            {author?.isRestricted && (
              <View style={styles.restrictedChip}>
                <Text
                  style={styles.restrictedChipText}
                  maxFontSizeMultiplier={1.2}
                >
                  Restricted
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.authorSub} numberOfLines={1}>
            Content Owner
            {authorAcademic ? ` • ${authorAcademic}` : ""}
          </Text>
        </View>
        {author && (
          <Feather
            name="chevron-right"
            size={15}
            color={BENTO_COLORS.subtleText}
          />
        )}
      </Pressable>

      <Text style={styles.metaText}>
        Reported by {report.reporter?.name || "Community Member"}
      </Text>

      {report.details ? (
        <Text style={styles.reportDetails}>
          Report note: &ldquo;{report.details}&rdquo;
        </Text>
      ) : null}

      <View style={styles.previewBox}>
        {isDeleted && (
          <Text style={styles.deletedNote}>
            Content deleted from live feed (archived snapshot):
          </Text>
        )}
        {previewTitle ? (
          <Text style={styles.previewTitle} numberOfLines={2}>
            {report.targetType === "FORUM_RESPONSE"
              ? `Thread: ${previewTitle}`
              : previewTitle}
          </Text>
        ) : null}
        {previewBody ? (
          <Text style={styles.previewBody} numberOfLines={6}>
            {previewBody}
          </Text>
        ) : !isDeleted ? (
          <Text style={styles.deletedNote}>No text preview available.</Text>
        ) : null}

        <View style={styles.previewFooter}>
          {live?.isHiddenByModeration && (
            <Text style={styles.hiddenNotice}>Hidden from public feed</Text>
          )}
          {canOpenThread && resolvedPostId && (
            <Pressable
              style={({ pressed }) => [
                styles.viewThreadBtn,
                pressed && Platform.OS === "ios" && { opacity: 0.75 },
              ]}
              android_ripple={{ color: colors.semantic.blue.alpha14 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => onOpenPost(resolvedPostId, report.targetType)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={
                report.targetType === "LOST_FOUND_POST"
                  ? "Open reported listing"
                  : "Open reported thread"
              }
            >
              <Feather
                name="external-link"
                size={12}
                color={BENTO_COLORS.primaryBlue}
              />
              <Text style={styles.viewThreadText} maxFontSizeMultiplier={1.25}>
                {report.targetType === "LOST_FOUND_POST"
                  ? "Open Listing"
                  : "Open Thread"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {isPendingReport ? (
        <>
          <TextInput
            style={styles.noteInput}
            placeholder="Optional admin note..."
            placeholderTextColor={BENTO_COLORS.subtleText}
            value={adminNote}
            onChangeText={(txt) => onChangeNote(report.id, txt)}
            maxLength={300}
            accessible={true}
            accessibilityLabel="Optional moderation note"
          />
          <View style={styles.actionsGrid}>
            <Pressable
              style={({ pressed }) => [
                styles.modBtn,
                styles.dismissBtn,
                isSubmitting && styles.modBtnDisabled,
                pressed && Platform.OS === "ios" && { opacity: 0.8 },
              ]}
              android_ripple={{ color: colors.navyAlpha08 }}
              disabled={isSubmitting}
              onPress={() => onExecuteAction(report, "DISMISS", "", "")}
              accessible={true}
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting }}
              accessibilityLabel="Dismiss report"
            >
              <Feather name="x-circle" size={14} color={colors.slate700} />
              <Text
                style={styles.dismissBtnText}
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
              >
                Dismiss
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.modBtn,
                styles.hideBtn,
                hideDisabled && styles.modBtnDisabled,
                pressed && Platform.OS === "ios" && { opacity: 0.8 },
              ]}
              android_ripple={{ color: colors.semantic.amber.brownAlpha14 }}
              disabled={hideDisabled}
              onPress={() =>
                onExecuteAction(
                  report,
                  "HIDE_CONTENT",
                  "Hide Content?",
                  "This removes the content from public feeds while preserving the record.",
                )
              }
              accessible={true}
              accessibilityRole="button"
              accessibilityState={{ disabled: hideDisabled }}
              accessibilityLabel="Hide reported content"
            >
              <Feather
                name="eye-off"
                size={14}
                color={colors.semantic.amber.deep}
              />
              <Text
                style={styles.hideBtnText}
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
              >
                Hide
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.modBtn,
                styles.deleteBtn,
                deleteDisabled && styles.modBtnDisabled,
                pressed && Platform.OS === "ios" && { opacity: 0.8 },
              ]}
              android_ripple={{ color: colors.semantic.rose.alpha14 }}
              disabled={deleteDisabled}
              onPress={() =>
                onExecuteAction(
                  report,
                  "DELETE_CONTENT",
                  "Delete Content?",
                  "Permanently delete this reported post or response?",
                )
              }
              accessible={true}
              accessibilityRole="button"
              accessibilityState={{ disabled: deleteDisabled }}
              accessibilityLabel="Delete reported content"
            >
              <Feather name="trash-2" size={14} color={BENTO_COLORS.danger} />
              <Text
                style={styles.deleteBtnText}
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
              >
                Delete
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.modBtn,
                styles.restrictBtn,
                restrictDisabled && styles.modBtnDisabled,
                pressed && Platform.OS === "ios" && { opacity: 0.8 },
              ]}
              android_ripple={{ color: colors.whiteAlpha20 }}
              disabled={restrictDisabled}
              onPress={() =>
                onExecuteAction(
                  report,
                  "RESTRICT_USER",
                  "Restrict Author?",
                  `Hide this content and restrict ${authorName}'s account?`,
                )
              }
              accessible={true}
              accessibilityRole="button"
              accessibilityState={{ disabled: restrictDisabled }}
              accessibilityLabel={
                author?.isRestricted
                  ? "Author already restricted"
                  : `Restrict ${authorName}`
              }
            >
              <Feather name="slash" size={14} color={colors.white} />
              <Text
                style={styles.restrictBtnText}
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
              >
                {author?.isRestricted ? "Restricted" : "Restrict"}
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.reviewedFooter}>
          <Text style={styles.reviewedText}>
            Status: {report.status}
            {report.adminNote ? ` • Note: ${report.adminNote}` : ""}
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  reportCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    gap: 10,
    ...BENTO_COLORS.shadow,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
  },
  reasonPill: {
    backgroundColor: BENTO_COLORS.dangerBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reasonPillText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: BENTO_COLORS.danger,
    includeFontPadding: false,
  },
  typePill: {
    backgroundColor: colors.semantic.indigo.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typePillText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: colors.semantic.indigo.darker,
    includeFontPadding: false,
  },
  countPill: {
    backgroundColor: colors.semantic.amber.soft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countPillText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: colors.semantic.amber.deep,
    includeFontPadding: false,
    fontVariant: ["tabular-nums"],
  },
  timeText: {
    fontFamily,
    fontSize: 11,
    lineHeight: 15,
    color: BENTO_COLORS.subtleText,
    includeFontPadding: false,
    fontVariant: ["tabular-nums"],
  },
  authorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 54,
    backgroundColor: colors.slate50,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.slate200,
    overflow: "hidden",
  },
  authorMeta: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  authorName: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  roleChip: {
    backgroundColor: colors.slate100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleChipText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
    color: colors.slate600,
    includeFontPadding: false,
  },
  restrictedChip: {
    backgroundColor: BENTO_COLORS.dangerBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  restrictedChipText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: BENTO_COLORS.danger,
    includeFontPadding: false,
  },
  authorSub: {
    fontFamily,
    fontSize: 11.5,
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  metaText: {
    fontFamily,
    fontSize: 12,
    color: colors.slate600,
  },
  reportDetails: {
    fontFamily,
    fontSize: 12,
    fontStyle: "italic",
    color: BENTO_COLORS.deepNavy,
  },
  previewBox: {
    backgroundColor: colors.slate50,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
    gap: 6,
  },
  previewTitle: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  previewBody: {
    fontFamily,
    fontSize: 12.5,
    color: colors.slate700,
    lineHeight: 18,
  },
  previewFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    gap: 8,
  },
  hiddenNotice: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.semantic.amber.deep,
  },
  viewThreadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginLeft: "auto",
    minHeight: 34,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.semantic.blue.tint,
    borderWidth: 1,
    borderColor: colors.semantic.blue.border,
    overflow: "hidden",
  },
  viewThreadText: {
    fontFamily,
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "700",
    color: BENTO_COLORS.primaryBlue,
    includeFontPadding: false,
  },
  deletedNote: {
    fontFamily,
    fontSize: 12,
    color: colors.semantic.amber.deep,
    fontStyle: "italic",
  },
  noteInput: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate300,
    backgroundColor: colors.slate50,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.neutralText,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modBtn: {
    flexDirection: "row",
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 0,
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 10,
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  modBtnDisabled: {
    opacity: 0.45,
  },
  dismissBtn: {
    backgroundColor: colors.slate200,
  },
  dismissBtnText: {
    fontFamily,
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: "700",
    color: colors.slate700,
    includeFontPadding: false,
  },
  hideBtn: {
    backgroundColor: colors.semantic.amber.soft,
    borderWidth: 1,
    borderColor: colors.semantic.amber.border,
  },
  hideBtnText: {
    fontFamily,
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: "700",
    color: colors.semantic.amber.deep,
    includeFontPadding: false,
  },
  deleteBtn: {
    backgroundColor: BENTO_COLORS.dangerBg,
    borderWidth: 1,
    borderColor: colors.semantic.rose.border,
  },
  deleteBtnText: {
    fontFamily,
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: "700",
    color: BENTO_COLORS.danger,
    includeFontPadding: false,
  },
  restrictBtn: {
    backgroundColor: colors.semantic.red.darkText,
  },
  restrictBtnText: {
    fontFamily,
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: "700",
    color: colors.white,
    includeFontPadding: false,
  },
  reviewedFooter: {
    paddingTop: 2,
  },
  reviewedText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
});
