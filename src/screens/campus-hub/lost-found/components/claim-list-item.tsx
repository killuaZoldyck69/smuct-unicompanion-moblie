import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";

import type {
  LostFoundClaim,
  LostFoundAuthor,
  LostFoundStatus,
} from "@/services/lost-found-service";
import { canAuthorReviewClaim } from "@/features/campus-hub/lost-found-logic";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  timeAgo,
  formatCampusUserSubtitle,
} from "../../shared/design-tokens";

interface ClaimListItemProps {
  claim: LostFoundClaim;
  onAccept: (claim: LostFoundClaim) => void;
  onReject: (claimId: string) => void;
  onImagePress: (imageUrl: string) => void;
  onViewClaimant: (claimant: LostFoundAuthor) => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
  isAuthor?: boolean;
  postStatus?: LostFoundStatus;
}

export const ClaimListItem = React.memo(function ClaimListItem({
  claim,
  onAccept,
  onReject,
  onImagePress,
  onViewClaimant,
  isAccepting = false,
  isRejecting = false,
  isAuthor = true,
  postStatus = "ACTIVE",
}: ClaimListItemProps) {
  const claimant = claim.claimant;
  const isPending = claim.status === "PENDING";
  const isAccepted = claim.status === "ACCEPTED";
  const isRejected = claim.status === "REJECTED";
  const canReview = canAuthorReviewClaim({
    isAuthor,
    claimStatus: claim.status,
    postStatus,
  });
  const [avatarError, setAvatarError] = useState(false);
  const [proofError, setProofError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [claimant?.image]);

  useEffect(() => {
    setProofError(false);
  }, [claim.proofImage]);

  const claimantSubtitle = formatCampusUserSubtitle(claimant, "SMUCT Member");

  return (
    <View style={[styles.card, isAccepted && styles.cardAccepted]}>
      <View style={styles.topRow}>
        <Pressable
          style={({ pressed }) => [
            styles.claimantInfo,
            pressed && { opacity: 0.78 },
          ]}
          onPress={() => onViewClaimant(claimant)}
          android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`View profile of ${claimant?.name ?? "claimant"}`}
        >
          {claimant?.image && !avatarError ? (
            <Image
              source={{ uri: claimant.image }}
              style={styles.avatar}
              contentFit="cover"
              cachePolicy="memory-disk"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {claimant?.name ? claimant.name.charAt(0).toUpperCase() : "?"}
              </Text>
            </View>
          )}
          <View style={styles.nameCol}>
            <Text style={styles.name} numberOfLines={1}>
              {claimant?.name ?? "Unknown User"}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {claimantSubtitle}
            </Text>
          </View>
        </Pressable>

        <View
          style={[
            styles.statusBadge,
            isPending && styles.badgePending,
            isAccepted && styles.badgeAccepted,
            isRejected && styles.badgeRejected,
          ]}
          accessible
          accessibilityRole="text"
          accessibilityLabel={`Claim status: ${claim.status}`}
        >
          <Feather
            name={
              isAccepted ? "check-circle" : isRejected ? "x-circle" : "clock"
            }
            size={11}
            color={
              isAccepted
                ? colors.semantic.emerald.darker
                : isRejected
                  ? CAMPUS_HUB_COLORS.mutedInk
                  : colors.semantic.amber.deep
            }
            style={{ marginRight: 3 }}
          />
          <Text
            style={[
              styles.statusText,
              isPending && styles.textPending,
              isAccepted && styles.textAccepted,
              isRejected && styles.textRejected,
            ]}
            maxFontSizeMultiplier={1.25}
          >
            {claim.status}
          </Text>
        </View>
      </View>

      {!!claim.answer && (
        <View style={styles.answerBox}>
          <View style={styles.answerLabelRow}>
            <Feather
              name="shield"
              size={12}
              color={CAMPUS_HUB_COLORS.skyAccentInk}
            />
            <Text style={styles.answerLabel} maxFontSizeMultiplier={1.25}>
              VERIFICATION ANSWER GIVEN:
            </Text>
          </View>
          <Text style={styles.answerText}>{claim.answer}</Text>
        </View>
      )}

      <Text style={styles.messageText}>{claim.message}</Text>

      {!!claim.proofImage && (
        <Pressable
          style={({ pressed }) => [
            styles.proofAttachmentCard,
            pressed && { opacity: 0.85 },
          ]}
          onPress={() => onImagePress(claim.proofImage!)}
          android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
          accessible
          accessibilityRole="button"
          accessibilityLabel="View attached proof photo in fullscreen"
        >
          <View style={styles.proofThumbWrapper}>
            {proofError ? (
              <View style={styles.proofFallback}>
                <Feather
                  name="image"
                  size={16}
                  color={CAMPUS_HUB_COLORS.subtleText}
                />
              </View>
            ) : (
              <Image
                source={{ uri: claim.proofImage }}
                style={styles.proofThumb}
                contentFit="cover"
                cachePolicy="memory-disk"
                onError={() => setProofError(true)}
              />
            )}
            <View style={styles.proofOverlay}>
              <Feather name="maximize-2" size={12} color={CAMPUS_HUB_COLORS.white} />
            </View>
          </View>
          <View style={styles.proofTextCol}>
            <View style={styles.proofBadgeRow}>
              <Feather
                name="image"
                size={12}
                color={CAMPUS_HUB_COLORS.skyAccentInk}
              />
              <Text style={styles.proofBadgeTitle} maxFontSizeMultiplier={1.25}>
                PROOF ATTACHMENT
              </Text>
            </View>
            <Text style={styles.proofInstructionText}>
              Tap to open full proof image
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={16}
            color={CAMPUS_HUB_COLORS.subtleText}
          />
        </Pressable>
      )}

      {/* Time & Action Footer */}
      <View style={styles.footerRow}>
        <Text style={styles.timeText}>
          Submitted {timeAgo(claim.createdAt)}
        </Text>

        {canReview && (
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                styles.rejectBtn,
                (isAccepting || isRejecting) && styles.actionBtnDisabled,
                pressed && !isAccepting && !isRejecting && { opacity: 0.8 },
              ]}
              onPress={() => onReject(claim.id)}
              disabled={isAccepting || isRejecting}
              hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
              accessible
              accessibilityRole="button"
              accessibilityState={{
                disabled: isAccepting || isRejecting,
                busy: isRejecting,
              }}
              accessibilityLabel="Decline claim"
            >
              {isRejecting ? (
                <ActivityIndicator
                  size="small"
                  color={CAMPUS_HUB_COLORS.mutedInk}
                />
              ) : (
                <Text style={styles.rejectBtnText}>Decline</Text>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                styles.acceptBtn,
                (isAccepting || isRejecting) && styles.actionBtnDisabled,
                pressed && !isAccepting && !isRejecting && { opacity: 0.88 },
              ]}
              onPress={() => onAccept(claim)}
              disabled={isAccepting || isRejecting}
              hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
              accessible
              accessibilityRole="button"
              accessibilityState={{
                disabled: isAccepting || isRejecting,
                busy: isAccepting,
              }}
              accessibilityLabel="Accept claim and verify owner"
            >
              {isAccepting ? (
                <ActivityIndicator
                  size="small"
                  color={CAMPUS_HUB_COLORS.white}
                />
              ) : (
                <>
                  <Feather
                    name="check"
                    size={13}
                    color={CAMPUS_HUB_COLORS.white}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.acceptBtnText}>Accept Claim</Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    ...CAMPUS_HUB_COLORS.shadow,
    gap: 12,
  },
  cardAccepted: {
    borderColor: colors.semantic.emerald.accent,
    backgroundColor: colors.semantic.emerald.tint,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  claimantInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minHeight: 48,
    marginRight: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.slate200,
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.slate200,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  nameCol: {
    flex: 1,
  },
  name: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  subtitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    overflow: "hidden",
  },
  badgePending: {
    backgroundColor: colors.semantic.amber.soft,
  },
  textPending: {
    color: CAMPUS_HUB_COLORS.lostFoundAccentText,
  },
  badgeAccepted: {
    backgroundColor: colors.semantic.emerald.border,
  },
  textAccepted: {
    color: colors.semantic.emerald.darker,
  },
  badgeRejected: {
    backgroundColor: colors.slate100,
  },
  textRejected: {
    color: CAMPUS_HUB_COLORS.mutedInk,
  },
  statusText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  answerBox: {
    backgroundColor: CAMPUS_HUB_COLORS.skyTint,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.skyBorder,
    gap: 4,
  },
  answerLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  answerLabel: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.skyAccentInk,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  answerText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  messageText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 19,
  },
  proofAttachmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slate50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 10,
    gap: 12,
    overflow: "hidden",
  },
  proofThumbWrapper: {
    position: "relative",
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
  },
  proofThumb: {
    width: "100%",
    height: "100%",
  },
  proofFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  proofOverlay: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: colors.scrimDark,
    padding: 3,
    borderRadius: 4,
  },
  proofTextCol: {
    flex: 1,
    gap: 2,
  },
  proofBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  proofBadgeTitle: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.skyAccentInk,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  proofInstructionText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  footerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    rowGap: 8,
    columnGap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  timeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    overflow: "hidden",
  },
  actionBtnDisabled: {
    opacity: 0.6,
    elevation: 0,
    shadowOpacity: 0,
  },
  rejectBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
  },
  rejectBtnText: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.mutedInk,
    includeFontPadding: false,
  },
  acceptBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.emeraldFill,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  acceptBtnText: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.white,
    includeFontPadding: false,
  },
});
