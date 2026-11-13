import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  timeAgo,
} from "@/screens/campus-hub/shared/design-tokens";
import {
  canResubmitRejectedClaim,
  getClaimStatusPresentation,
} from "@/features/campus-hub/lost-found-logic";
import type {
  LostFoundClaim,
  LostFoundStatus,
} from "@/services/lost-found-service";

interface LFMyClaimCardProps {
  claim: LostFoundClaim;
  isResolved: boolean;
  postStatus?: LostFoundStatus;
  isWithdrawing: boolean;
  onOpenProof: (url: string) => void;
  onWithdraw: (claimId: string) => void;
  onResubmit?: () => void;
}

const CLAIM_TONE_STYLES = {
  amber: {
    pillBg: colors.semantic.amber.soft,
    pillText: CAMPUS_HUB_COLORS.lostFoundAccentText,
    cardBg: CAMPUS_HUB_COLORS.white,
    cardBorder: CAMPUS_HUB_COLORS.cardBorder,
  },
  emerald: {
    pillBg: colors.semantic.emerald.border,
    pillText: colors.semantic.emerald.darker,
    cardBg: colors.semantic.emerald.tint,
    cardBorder: colors.semantic.emerald.accent,
  },
  rose: {
    pillBg: colors.semantic.rose.softBorder,
    pillText: colors.semantic.rose.deep,
    cardBg: colors.semantic.rose.tint,
    cardBorder: colors.semantic.rose.border,
  },
  slate: {
    pillBg: colors.slate100,
    pillText: CAMPUS_HUB_COLORS.mutedInk,
    cardBg: CAMPUS_HUB_COLORS.white,
    cardBorder: CAMPUS_HUB_COLORS.cardBorder,
  },
} as const;

export function LFMyClaimCard({
  claim,
  isResolved,
  postStatus,
  isWithdrawing,
  onOpenProof,
  onWithdraw,
  onResubmit,
}: LFMyClaimCardProps) {
  const [proofError, setProofError] = useState(false);

  useEffect(() => {
    setProofError(false);
  }, [claim.proofImage]);

  const statusInfo = getClaimStatusPresentation(claim.status);
  const toneStyle = CLAIM_TONE_STYLES[statusInfo.tone];
  const resolvedPostStatus: LostFoundStatus =
    postStatus ?? (isResolved ? "RESOLVED" : "ACTIVE");
  const canResubmit = canResubmitRejectedClaim({
    claimStatus: claim.status,
    attemptCount: claim.attemptCount,
    postStatus: resolvedPostStatus,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>YOUR SUBMITTED CLAIM</Text>
      <View
        style={[
          styles.card,
          {
            backgroundColor: toneStyle.cardBg,
            borderColor: toneStyle.cardBorder,
          },
        ]}
      >
        <View style={styles.topRow}>
          <View
            style={[styles.statusPill, { backgroundColor: toneStyle.pillBg }]}
          >
            <Text
              style={[styles.statusText, { color: toneStyle.pillText }]}
              maxFontSizeMultiplier={1.25}
            >
              STATUS: {claim.status}
            </Text>
          </View>
          <Text style={styles.time}>{timeAgo(claim.createdAt)}</Text>
        </View>

        <Text style={styles.statusHint}>{statusInfo.description}</Text>

        {!!claim.answer && (
          <View style={styles.answerBox}>
            <Text style={styles.answerLabel}>YOUR ANSWER:</Text>
            <Text style={styles.answerText}>{claim.answer}</Text>
          </View>
        )}

        <Text style={styles.message}>{claim.message}</Text>

        {!!claim.proofImage && (
          <Pressable
            style={({ pressed }) => [
              styles.proofBtn,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => onOpenProof(claim.proofImage!)}
            android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
            accessible
            accessibilityRole="button"
            accessibilityLabel="View your attached proof photo"
          >
            {proofError ? (
              <View style={[styles.proofImg, styles.proofFallback]}>
                <Feather
                  name="image"
                  size={16}
                  color={CAMPUS_HUB_COLORS.subtleText}
                />
              </View>
            ) : (
              <Image
                source={{ uri: claim.proofImage }}
                style={styles.proofImg}
                contentFit="cover"
                cachePolicy="memory-disk"
                onError={() => setProofError(true)}
              />
            )}
            <View style={styles.proofTextCol}>
              <Text style={styles.proofTitle}>Attached Proof Photo</Text>
              <Text style={styles.proofSub}>Tap to view in fullscreen</Text>
            </View>
            <Feather
              name="maximize-2"
              size={16}
              color={CAMPUS_HUB_COLORS.mutedInk}
            />
          </Pressable>
        )}

        {claim.status === "PENDING" && resolvedPostStatus === "ACTIVE" && (
          <Pressable
            style={({ pressed }) => [
              styles.withdrawBtn,
              isWithdrawing && { opacity: 0.65 },
              pressed && !isWithdrawing && { opacity: 0.85 },
            ]}
            onPress={() => onWithdraw(claim.id)}
            disabled={isWithdrawing}
            android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
            accessible
            accessibilityRole="button"
            accessibilityState={{
              disabled: isWithdrawing,
              busy: isWithdrawing,
            }}
            accessibilityLabel="Withdraw claim"
          >
            {isWithdrawing ? (
              <ActivityIndicator
                size="small"
                color={CAMPUS_HUB_COLORS.dangerText}
              />
            ) : (
              <>
                <Feather
                  name="x-circle"
                  size={13}
                  color={CAMPUS_HUB_COLORS.dangerText}
                />
                <Text style={styles.withdrawBtnText}>Withdraw Claim</Text>
              </>
            )}
          </Pressable>
        )}

        {canResubmit && !!onResubmit && (
          <Pressable
            style={({ pressed }) => [
              styles.resubmitBtn,
              pressed && { opacity: 0.88 },
            ]}
            onPress={onResubmit}
            android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Resubmit claim (1 retry available)"
          >
            <Feather name="refresh-cw" size={13} color="#ffffff" />
            <Feather
              name="refresh-cw"
              size={13}
              color={CAMPUS_HUB_COLORS.white}
            />
            <Text style={styles.resubmitBtnText}>
              Resubmit Claim (1 retry left)
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    ...CAMPUS_HUB_COLORS.shadow,
    gap: 10,
  },
  cardAccepted: {
    borderColor: colors.semantic.emerald.solid,
    backgroundColor: colors.semantic.emerald.tint,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: {
    backgroundColor: colors.semantic.amber.soft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  statusText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.lostFoundAccentText,
    includeFontPadding: false,
  },
  time: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  answerBox: {
    backgroundColor: CAMPUS_HUB_COLORS.skyTint,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.skyBorder,
    gap: 2,
  },
  answerLabel: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.skyAccentInk,
  },
  answerText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  message: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 18,
  },
  proofContainer: {
    gap: 8,
  },
  proofBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slate50,
    borderRadius: 12,
    padding: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.slate200,
    minHeight: 56,
    overflow: "hidden",
  },
  proofImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: CAMPUS_HUB_COLORS.deepNavy,
  },
  proofTextCol: {
    flex: 1,
  },
  proofTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  proofSub: {
    fontFamily,
    fontSize: 10,
    color: CAMPUS_HUB_COLORS.mutedInk,
  },
  withdrawBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 46,
    paddingVertical: 11,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    marginTop: 4,
    overflow: "hidden",
  },
  withdrawBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.dangerText,
  },
  statusHint: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.mutedInk,
    lineHeight: 16,
  },
  proofFallback: {
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  resubmitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 46,
    paddingVertical: 11,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentFill,
    marginTop: 4,
    overflow: "hidden",
  },
  resubmitBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.white,
  },
});
