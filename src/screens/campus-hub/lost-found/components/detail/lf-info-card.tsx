import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  titleFontFamily,
  timeAgo,
  formatDateTime,
  formatCampusUserSubtitle,
} from "@/screens/campus-hub/shared/design-tokens";
import { AvatarChip } from "@/screens/campus-hub/shared/avatar-chip";
import {
  TypeBadge,
  StatusBadge,
  CategoryBadge,
} from "@/screens/campus-hub/lost-found/components/status-badge";
import type {
  LostFoundPost,
  LostFoundStatus,
} from "@/services/lost-found-service";
import type { AuthorProfileModalData } from "@/screens/campus-hub/shared/author-modal";

interface LFInfoCardProps {
  post: LostFoundPost;
  isAuthor: boolean;
  isAdmin?: boolean;
  isEdited: boolean;
  isUpdatingStatus?: boolean;
  onViewAuthor: (author: AuthorProfileModalData) => void;
  onEdit: () => void;
  onDelete: () => void;
  onChangeStatus?: (status: LostFoundStatus) => void;
}

export function LFInfoCard({
  post,
  isAuthor,
  isAdmin = false,
  isEdited,
  isUpdatingStatus = false,
  onViewAuthor,
  onEdit,
  onDelete,
  onChangeStatus,
}: LFInfoCardProps) {
  const isResolved = post.status === "RESOLVED" || post.status === "CLAIMED";
  const isClosed = post.status === "CLOSED";
  const canManage = isAuthor || isAdmin;

  return (
    <View style={styles.card}>
      {/* Resolved or Closed banner */}
      {isResolved && (
        <View style={styles.resolvedBanner}>
          <Feather
            name="check-circle"
            size={16}
            color={CAMPUS_HUB_COLORS.resolvedGreenText}
          />
          <Text style={styles.resolvedBannerText}>
            Item Successfully Handed Over
          </Text>
        </View>
      )}
      {isClosed && (
        <View style={styles.closedBanner}>
          <Feather
            name="slash"
            size={16}
            color={CAMPUS_HUB_COLORS.subtleText}
          />
          <Text style={styles.closedBannerText}>
            Listing Closed — Claims Disabled
          </Text>
        </View>
      )}

      {/* Badges */}
      <View style={styles.badgeRow}>
        <TypeBadge type={post.type} />
        {post.category && <CategoryBadge category={post.category} />}
        <StatusBadge status={post.status} />
      </View>

      {/* Title */}
      <Text style={styles.title}>{post.title}</Text>

      {/* Key Facts & Timestamps */}
      <View style={styles.metaCard}>
        {/* Dedicated Single Row for Location without trailing dot */}
        {!!post.location && (
          <View style={styles.locationRow}>
            <Feather
              name="map-pin"
              size={13}
              color={colors.semantic.red.accent}
            />
            <Text
              style={styles.locationText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {post.location}
            </Text>
          </View>
        )}

        {/* Date & Time Row */}
        <View style={styles.dateTimeRow}>
          <View style={styles.factItem}>
            <Feather
              name="calendar"
              size={12}
              color={CAMPUS_HUB_COLORS.subtleText}
            />
            <Text style={styles.factText}>
              {formatDateTime(post.createdAt)}
            </Text>
          </View>
          <Text style={styles.factDot}>•</Text>
          <Text style={styles.factText}>{timeAgo(post.createdAt)}</Text>
        </View>

        {isEdited && post.updatedAt && (
          <View style={styles.editedRow}>
            <View style={styles.editedPill}>
              <Feather
                name="edit-2"
                size={9.5}
                color={CAMPUS_HUB_COLORS.lostFoundAccentText}
              />
              <Text style={styles.editedPillText} maxFontSizeMultiplier={1.25}>
                EDITED
              </Text>
            </View>
            <Text style={styles.editedDate}>
              Last edited {formatDateTime(post.updatedAt)} (
              {timeAgo(post.updatedAt)})
            </Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Author chip */}
      <AvatarChip
        name={post.author?.name ?? "SMUCT Member"}
        image={post.author?.image}
        subtitle={formatCampusUserSubtitle(post.author, "Campus Hub")}
        onPress={() => onViewAuthor(post.author as AuthorProfileModalData)}
      />

      <View style={styles.divider} />

      {/* Description */}
      {!!post.description?.trim() && (
        <>
          <Text style={styles.sectionLabel}>DESCRIPTION</Text>
          <Text style={styles.description}>{post.description}</Text>
        </>
      )}

      {/* Verification question */}
      {!!post.verificationQuestion && (
        <View style={styles.verificationCard}>
          <View style={styles.verificationHeader}>
            <Feather
              name="shield"
              size={14}
              color={CAMPUS_HUB_COLORS.skyAccentInk}
            />
            <Text style={styles.verificationLabel}>
              {isAuthor
                ? "YOUR VERIFICATION QUESTION"
                : "OWNERSHIP VERIFICATION QUESTION"}
            </Text>
          </View>
          <Text style={styles.verificationQuestion}>
            {post.verificationQuestion}
          </Text>
          {isAuthor && !!post.verificationAnswer && (
            <View style={styles.secretAnswerBox}>
              <Text style={styles.secretAnswerLabel}>
                EXPECTED ANSWER (PRIVATE TO YOU):
              </Text>
              <Text style={styles.secretAnswer}>{post.verificationAnswer}</Text>
            </View>
          )}
        </View>
      )}

      {/* Owner / Admin Management Section */}
      {canManage && (
        <View style={styles.managementContainer}>
          {isAdmin && !isAuthor && (
            <View style={styles.adminIndicator}>
              <Feather
                name="shield"
                size={12}
                color={colors.semantic.indigo.deep}
              />
              <Text
                style={styles.adminIndicatorText}
                maxFontSizeMultiplier={1.25}
              >
                ADMIN MODERATION CONTROLS
              </Text>
            </View>
          )}

          <View style={styles.ownerActions}>
            {post.status === "ACTIVE" && (
              <Pressable
                style={({ pressed }) => [
                  styles.editBtn,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={onEdit}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Edit listing"
              >
                <Feather
                  name="edit-3"
                  size={14}
                  color={CAMPUS_HUB_COLORS.deepNavy}
                />
                <Text style={styles.editBtnText}>Edit</Text>
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.deleteBtn,
                pressed && { opacity: 0.8 },
              ]}
              onPress={onDelete}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Delete listing"
            >
              <Feather
                name="trash-2"
                size={14}
                color={CAMPUS_HUB_COLORS.dangerText}
              />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </Pressable>
          </View>

          {!!onChangeStatus && (
            <View style={styles.ownerActions}>
              {post.status === "ACTIVE" ? (
                <>
                  {isAuthor && (
                    <Pressable
                      style={({ pressed }) => [
                        styles.statusActionBtn,
                        styles.resolveActionBtn,
                        isUpdatingStatus && styles.actionDisabled,
                        pressed && !isUpdatingStatus && { opacity: 0.8 },
                      ]}
                      onPress={() => onChangeStatus("RESOLVED")}
                      disabled={isUpdatingStatus}
                      android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                      accessible
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled: isUpdatingStatus,
                        busy: isUpdatingStatus,
                      }}
                      accessibilityLabel="Mark listing resolved"
                    >
                      {isUpdatingStatus ? (
                        <ActivityIndicator
                          size="small"
                          color={CAMPUS_HUB_COLORS.emeraldFill}
                        />
                      ) : (
                        <Feather
                          name="check-circle"
                          size={14}
                          color={CAMPUS_HUB_COLORS.emeraldFill}
                        />
                      )}
                      <Text style={styles.resolveActionText}>
                        Mark Resolved
                      </Text>
                    </Pressable>
                  )}
                  <Pressable
                    style={({ pressed }) => [
                      styles.statusActionBtn,
                      styles.closeActionBtn,
                      isUpdatingStatus && styles.actionDisabled,
                      pressed && !isUpdatingStatus && { opacity: 0.8 },
                    ]}
                    onPress={() => onChangeStatus("CLOSED")}
                    disabled={isUpdatingStatus}
                    android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                    accessible
                    accessibilityRole="button"
                    accessibilityState={{
                      disabled: isUpdatingStatus,
                      busy: isUpdatingStatus,
                    }}
                    accessibilityLabel="Close listing"
                  >
                    {isUpdatingStatus ? (
                      <ActivityIndicator
                        size="small"
                        color={CAMPUS_HUB_COLORS.neutralText}
                      />
                    ) : (
                      <Feather
                        name="slash"
                        size={14}
                        color={CAMPUS_HUB_COLORS.neutralText}
                      />
                    )}
                    <Text style={styles.closeActionText}>Close Listing</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.statusActionBtn,
                    styles.reopenActionBtn,
                    isUpdatingStatus && styles.actionDisabled,
                    pressed && !isUpdatingStatus && { opacity: 0.8 },
                  ]}
                  onPress={() => onChangeStatus("ACTIVE")}
                  disabled={isUpdatingStatus}
                  android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                  accessible
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled: isUpdatingStatus,
                    busy: isUpdatingStatus,
                  }}
                  accessibilityLabel="Reopen listing"
                >
                  {isUpdatingStatus ? (
                    <ActivityIndicator
                      size="small"
                      color={CAMPUS_HUB_COLORS.lostFoundAccentText}
                    />
                  ) : (
                    <Feather
                      name="refresh-cw"
                      size={14}
                      color={CAMPUS_HUB_COLORS.lostFoundAccentText}
                    />
                  )}
                  <Text style={styles.reopenActionText}>Reopen Listing</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 18,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  resolvedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.semantic.emerald.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  resolvedBannerText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: colors.semantic.emerald.darker,
    flexShrink: 1,
  },
  closedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  closedBannerText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.neutralText,
    flexShrink: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontFamily: titleFontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    lineHeight: 26,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  metaCard: {
    backgroundColor: colors.slate50,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 7,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "700",
    color: colors.slate800,
    flex: 1,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  editedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexWrap: "wrap",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  editedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentLight,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  editedPillText: {
    fontFamily,
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.lostFoundAccentText,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  editedDate: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  factItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  factText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  factDot: {
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  divider: {
    height: 1,
    backgroundColor: CAMPUS_HUB_COLORS.subtleBorder,
    marginVertical: 12,
  },
  sectionLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  description: {
    fontFamily,
    fontSize: 14,
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 22,
    marginBottom: 10,
  },
  verificationCard: {
    backgroundColor: CAMPUS_HUB_COLORS.skyTint,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.skyBorder,
    gap: 6,
  },
  verificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verificationLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.skyAccentInk,
    letterSpacing: 0.5,
  },
  verificationQuestion: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    lineHeight: 18,
  },
  secretAnswerBox: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.skyBorder,
  },
  secretAnswerLabel: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.mutedInk,
    marginBottom: 2,
    includeFontPadding: false,
  },
  secretAnswer: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.skyAccentInk,
  },
  managementContainer: {
    marginTop: 14,
    gap: 8,
  },
  adminIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.semantic.indigo.tint,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  adminIndicatorText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: colors.semantic.indigo.deep,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  ownerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
    columnGap: 8,
    marginTop: 2,
  },
  editBtn: {
    flex: 1,
    minWidth: 120,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    backgroundColor: colors.slate100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    overflow: "hidden",
  },
  editBtnText: {
    fontFamily,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    includeFontPadding: false,
  },
  deleteBtn: {
    flex: 1,
    minWidth: 120,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    backgroundColor: CAMPUS_HUB_COLORS.dangerBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.semantic.rose.border,
    overflow: "hidden",
  },
  deleteBtnText: {
    fontFamily,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.dangerText,
    includeFontPadding: false,
  },
  statusActionBtn: {
    flex: 1,
    minWidth: 130,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  actionDisabled: {
    opacity: 0.6,
  },
  resolveActionBtn: {
    backgroundColor: colors.semantic.emerald.tint,
    borderColor: colors.semantic.emerald.border,
  },
  resolveActionText: {
    fontFamily,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.emeraldFill,
    includeFontPadding: false,
  },
  closeActionBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  closeActionText: {
    fontFamily,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
    includeFontPadding: false,
  },
  reopenActionBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentLight,
    borderColor: colors.semantic.amber.border,
  },
  reopenActionText: {
    fontFamily,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.lostFoundAccentText,
    includeFontPadding: false,
  },
});
